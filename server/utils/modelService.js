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
    
    // Utiliser les nouveaux Inference Providers
    const provider = this.agentConfig.hf_provider || 'HF-Inference'; // Par défaut HF Inference
    
    // Construire les messages au format OpenAI pour les nouveaux providers
    const messages = [
      { role: "system", content: prompt }
    ];
    
    // Ajouter l'historique de conversation
    conversationHistory.forEach(msg => {
      messages.push({ role: "user", content: msg.content });
      if (msg.response) {
        messages.push({ role: "assistant", content: msg.response });
      }
    });
    
    messages.push({ role: "user", content: message });

    // Mapping des providers vers leurs endpoints
    const providerEndpoints = {
      'cerebras': 'https://router.huggingface.co/cerebras/v3/openai/chat/completions',
      'cohere': 'https://router.huggingface.co/cohere/v3/openai/chat/completions',
      'fireworks': 'https://router.huggingface.co/fireworks/v3/openai/chat/completions',
      'HF-Inference': 'https://router.huggingface.co/HF-Inference/v3/openai/chat/completions',
      'hyperbolic': 'https://router.huggingface.co/hyperbolic/v3/openai/chat/completions',
      'nebius': 'https://router.huggingface.co/nebius/v3/openai/chat/completions',
      'novita': 'https://router.huggingface.co/novita/v3/openai/chat/completions',
      'nscale': 'https://router.huggingface.co/nscale/v3/openai/chat/completions',
      'sambanova': 'https://router.huggingface.co/sambanova/v3/openai/chat/completions',
      'together': 'https://router.huggingface.co/together/v3/openai/chat/completions'
    };

    // Si un endpoint personnalisé est fourni, l'utiliser
    const endpoint = this.agentConfig.huggingface_endpoint || providerEndpoints[provider] || providerEndpoints['HF-Inference'];
    
    console.log('Hugging Face Inference Provider request:', {
      endpoint,
      provider,
      model: this.modelName,
      hasToken: !!this.agentConfig.huggingface_token
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.agentConfig.huggingface_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages,
          stream: false,
          temperature: 0.7,
          max_tokens: 200
        })
      });

      const responseText = await response.text();
      console.log('HF Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Hugging Face API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          console.log('HF Error details:', errorData);
          
          if (errorData.error) {
            errorMessage = `HF Error: ${errorData.error}`;
          }
          if (errorData.message) {
            errorMessage = `HF Error: ${errorData.message}`;
          }
        } catch (e) {
          console.log('HF Response text:', responseText.substring(0, 200));
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log('HF Success response:', data.choices ? 'OpenAI format' : 'Unknown format');
      
      // Le nouveau format suit la structure OpenAI
      if (data.choices && data.choices.length > 0) {
        return {
          response: data.choices[0].message.content,
          threadId: null
        };
      }

      // Fallback pour d'autres formats possibles
      let assistantResponse = "";
      
      if (data.generated_text) {
        assistantResponse = data.generated_text;
      } else if (data.text) {
        assistantResponse = data.text;
      } else if (data.output) {
        assistantResponse = data.output;
      }

      if (!assistantResponse) {
        console.error('No response found in HF data:', JSON.stringify(data).substring(0, 200));
        assistantResponse = "Je suis désolé, je n'ai pas pu générer une réponse appropriée.";
      }

      return {
        response: assistantResponse,
        threadId: null
      };
    } catch (error) {
      console.error('Hugging Face API Error:', error);
      
      // Si l'erreur est liée au modèle, suggérer d'utiliser un modèle différent
      if (error.message.includes('404') || error.message.includes('Not Found') || error.message.includes('Model not found')) {
        console.log(`Le modèle '${this.modelName}' n'est pas disponible sur le provider ${provider}`);
        
        // Liste de modèles recommandés par provider
        const recommendedModels = {
          'HF-Inference': ['meta-llama/Llama-3.2-1B-Instruct', 'microsoft/Phi-3.5-mini-instruct'],
          'novita': ['deepseek-ai/DeepSeek-V3-0324', 'Qwen/Qwen2.5-72B-Instruct'],
          'together': ['meta-llama/Llama-3.2-3B-Instruct', 'Qwen/Qwen2.5-7B-Instruct'],
          'cerebras': ['meta-llama/Llama-3.3-70B-Instruct'],
          'hyperbolic': ['Qwen/Qwen2.5-72B-Instruct', 'meta-llama/Llama-3.1-70B-Instruct']
        };
        
        const suggested = recommendedModels[provider] || recommendedModels['HF-Inference'];
        throw new Error(`Le modèle '${this.modelName}' n'est pas disponible sur ${provider}. Essayez avec : ${suggested.join(' ou ')}`);
      }
      
      throw error;
    }
  }
}

export default ModelService;