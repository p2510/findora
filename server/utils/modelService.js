// server/utils/modelService.js
import OpenAI from "openai";

export class ModelService {
  constructor(agentConfig) {
    this.provider = agentConfig.model_provider || 'openai';
    this.modelName = agentConfig.model_name || 'gpt-4o';
    this.agentConfig = agentConfig;
    
    if (this.provider === 'openai') {
      this.client = new OpenAI({
        apiKey: useRuntimeConfig().openai_api_key || "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",
      });
    }
  }

  async createOrUpdateAssistant(prompt, assistantId = null) {
    if (this.provider === 'openai') {
      if (assistantId) {
        return await this.client.beta.assistants.update(assistantId, {
          instructions: prompt,
          model: this.modelName,
        });
      } else {
        return await this.client.beta.assistants.create({
          instructions: prompt,
          name: this.agentConfig.user_id,
          temperature: 0.7,
          model: this.modelName,
        });
      }
    } else if (this.provider === 'huggingface') {
      // Pour Hugging Face, on stocke juste le prompt
      // Le traitement sera fait lors de l'envoi des messages
      return {
        id: `hf_${Date.now()}_${this.agentConfig.user_id}`,
        provider: 'huggingface',
        model: this.modelName,
        endpoint: this.agentConfig.huggingface_endpoint
      };
    }
  }

  async sendMessage(message, context = {}) {
    if (this.provider === 'openai') {
      // Utiliser l'API Threads d'OpenAI (existant)
      return await this.sendOpenAIMessage(message, context);
    } else if (this.provider === 'huggingface') {
      return await this.sendHuggingFaceMessage(message, context);
    }
  }

  async sendOpenAIMessage(message, context) {
    // Logique existante pour OpenAI
    const { threadId, assistantId } = context;
    
    // Créer ou récupérer le thread
    let thread;
    if (threadId) {
      thread = await this.client.beta.threads.retrieve(threadId);
    } else {
      thread = await this.client.beta.threads.create();
    }

    // Ajouter le message au thread
    await this.client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
    });

    // Exécuter l'assistant avec les limites de tokens
    const run = await this.client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      max_completion_tokens: 7000,
      max_prompt_tokens: 5000
    });

    // Attendre la réponse
    let runStatus = await this.client.beta.threads.runs.retrieve(thread.id, run.id);
    const maxAttempts = 60; // 60 secondes max
    let attempts = 0;
    
    while ((runStatus.status === 'in_progress' || runStatus.status === 'queued') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await this.client.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
    }

    // Gérer les différents statuts
    if (runStatus.status === 'completed') {
      const messages = await this.client.beta.threads.messages.list(thread.id);
      const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
      
      if (assistantMessages.length > 0) {
        const latestMessage = assistantMessages[0];
        return {
          response: latestMessage.content[0].text.value,
          threadId: thread.id
        };
      }
    } else if (runStatus.status === 'incomplete') {
      console.warn("Run incomplet:", runStatus.incomplete_details);
      return {
        response: "Désolé, je n'ai pas pu traiter complètement votre demande en raison de limitations techniques.",
        threadId: thread.id,
        incomplete: true
      };
    } else if (runStatus.status === 'failed') {
      console.error("Run échoué:", runStatus.last_error);
      throw new Error(`OpenAI run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
    }

    throw new Error(`OpenAI run status unexpected: ${runStatus.status}`);
  }

  async sendHuggingFaceMessage(message, context) {
    const { prompt, conversationHistory = [] } = context;
    
    // Construire le contexte complet
    let fullContext = prompt + "\n\n";
    
    // Ajouter l'historique de conversation
    conversationHistory.forEach(msg => {
      fullContext += `User: ${msg.content}\n`;
      if (msg.response) {
        fullContext += `Assistant: ${msg.response}\n`;
      }
    });
    
    fullContext += `User: ${message}\nAssistant:`;

    // Appeler l'endpoint Hugging Face
    const endpoint = this.agentConfig.huggingface_endpoint || `https://api-inference.huggingface.co/models/${this.modelName}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.agentConfig.huggingface_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullContext,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extraire la réponse
    let assistantResponse = data[0]?.generated_text || data.generated_text || "";
    
    // Nettoyer la réponse (enlever le contexte)
    if (assistantResponse.includes("Assistant:")) {
      assistantResponse = assistantResponse.split("Assistant:").pop().trim();
    }

    return {
      response: assistantResponse,
      threadId: null // Pas de thread pour HF
    };
  }
}

export default ModelService;