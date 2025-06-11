import OpenAI from "openai";

// Simulation d'un stockage en mémoire (remplacez par MongoDB, Redis, etc.)
const conversationStore = new Map(); // Clé: threadId, Valeur: conversationHistory

export class ModelService {
  constructor(agentConfig) {
    this.provider = agentConfig.model_provider || "openai";
    this.modelName = agentConfig.model_name || "gpt-4o";
    this.agentConfig = agentConfig;

    if (this.provider === "openai") {
      this.client = new OpenAI({
        apiKey:
          useRuntimeConfig().openai_api_key ||
          "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",
      });
    }
  }

  async createOrUpdateAssistant(prompt, assistantId = null) {
    if (this.provider === "openai") {
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
    } else if (this.provider === "huggingface") {
      // Créer un thread_id unique pour Hugging Face si non fourni
      const threadId = `hf_${Date.now()}_${this.agentConfig.user_id}`;
      // Initialiser l'historique vide pour ce thread
      conversationStore.set(threadId, []);
      return {
        id: threadId,
        provider: "huggingface",
        model: this.modelName,
        endpoint: this.agentConfig.huggingface_endpoint,
        prompt, // Stocker le prompt pour l'utiliser dans sendMessage
      };
    }
  }

  async sendMessage(message, context = {}) {
    if (this.provider === "openai") {
      return await this.sendOpenAIMessage(message, context);
    } else if (this.provider === "huggingface") {
      // Gérer le contexte pour Hugging Face
      const { threadId, prompt } = context;
      if (!threadId) {
        throw new Error("threadId requis pour Hugging Face");
      }
      // Récupérer l'historique depuis le stockage
      let conversationHistory = conversationStore.get(threadId) || [];
      const result = await this.sendHuggingFaceMessage(message, {
        prompt,
        conversationHistory,
      });
      // Mettre à jour l'historique
      conversationHistory.push({ content: message, response: result.response });
      conversationStore.set(threadId, conversationHistory);
      return { ...result, threadId };
    }
    throw new Error(`Fournisseur non supporté : ${this.provider}`);
  }

  async sendOpenAIMessage(message, context) {
    // [Logique OpenAI inchangée]
    const { threadId, assistantId } = context;
    let thread;
    if (threadId) {
      thread = await this.client.beta.threads.retrieve(threadId);
    } else {
      thread = await this.client.beta.threads.create();
    }
    await this.client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });
    const run = await this.client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      max_completion_tokens: 7000,
      max_prompt_tokens: 5000,
    });
    let runStatus = await this.client.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
    const maxAttempts = 60;
    let attempts = 0;
    while (
      (runStatus.status === "in_progress" || runStatus.status === "queued") &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await this.client.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
      attempts++;
    }
    if (runStatus.status === "completed") {
      const messages = await this.client.beta.threads.messages.list(thread.id);
      const assistantMessages = messages.data.filter(
        (msg) => msg.role === "assistant"
      );
      if (assistantMessages.length > 0) {
        return {
          response: assistantMessages[0].content[0].text.value,
          threadId: thread.id,
        };
      }
    } else if (runStatus.status === "incomplete") {
      console.warn("Run incomplet:", runStatus.incomplete_details);
      return {
        response:
          "Désolé, je n'ai pas pu traiter complètement votre demande en raison de limitations techniques.",
        threadId: thread.id,
        incomplete: true,
      };
    } else if (runStatus.status === "failed") {
      console.error("Run échoué:", runStatus.last_error);
      throw new Error(
        `OpenAI run failed: ${runStatus.last_error?.message || "Unknown error"}`
      );
    }
    throw new Error(`OpenAI run status unexpected: ${runStatus.status}`);
  }

  async sendHuggingFaceMessage(message, context) {
    const { prompt, conversationHistory = [] } = context;
    const provider = this.agentConfig.hf_provider || "hf-inference";

    if (provider === "hf-inference" || provider === "HF-Inference") {
      return await this.sendHFInferenceMessage(
        message,
        prompt,
        conversationHistory
      );
    }

    const messages = [{ role: "system", content: prompt }];
    conversationHistory.forEach((msg) => {
      messages.push({ role: "user", content: msg.content });
      if (msg.response) {
        messages.push({ role: "assistant", content: msg.response });
      }
    });
    messages.push({ role: "user", content: message });

    const providerEndpoints = {
      cerebras:
        "https://router.huggingface.co/cerebras/v3/openai/chat/completions",
      cohere: "https://router.huggingface.co/cohere/v3/openai/chat/completions",
      fireworks:
        "https://router.huggingface.co/fireworks/v3/openai/chat/completions",
      hyperbolic:
        "https://router.huggingface.co/hyperbolic/v3/openai/chat/completions",
      nebius: "https://router.huggingface.co/nebius/v3/openai/chat/completions",
      novita: "https://router.huggingface.co/novita/v3/openai/chat/completions",
      nscale: "https://router.huggingface.co/nscale/v3/openai/chat/completions",
      sambanova:
        "https://router.huggingface.co/sambanova/v3/openai/chat/completions",
      together:
        "https://router.huggingface.co/together/v3/openai/chat/completions",
    };

    const endpoint =
      this.agentConfig.huggingface_endpoint || providerEndpoints[provider];
    if (!endpoint) {
      throw new Error(
        `Fournisseur ${provider} non supporté. Utilisez: novita, together, sambanova, etc.`
      );
    }

    console.log("Hugging Face Inference Provider request:", {
      endpoint,
      provider,
      model: this.modelName,
      hasToken: !!this.agentConfig.huggingface_token,
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.agentConfig.huggingface_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages,
          stream: false,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const responseText = await response.text();
      console.log("HF Response status:", response.status);

      if (!response.ok) {
        let errorMessage = `Hugging Face API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          console.log("HF Error details:", errorData);
          if (errorData.error) errorMessage = `HF Error: ${errorData.error}`;
          if (errorData.message)
            errorMessage = `HF Error: ${errorData.message}`;
        } catch (e) {
          console.log("HF Response text:", responseText.substring(0, 200));
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log(
        "HF Success response:",
        data.choices ? "OpenAI format" : "Unknown format"
      );

      if (data.choices && data.choices.length > 0) {
        return {
          response: data.choices[0].message.content,
          threadId: null,
        };
      }

      throw new Error("Format de réponse inattendu");
    } catch (error) {
      console.error("Hugging Face API Error:", error);
      if (
        error.message.includes("404") ||
        error.message.includes("Not Found") ||
        error.message.includes("Model not found")
      ) {
        console.log(
          `Le modèle '${this.modelName}' n'est pas disponible sur le fournisseur ${provider}`
        );
        const recommendedModels = {
          novita: ["deepseek-ai/DeepSeek-V3-0324", "Qwen/Qwen2.5-72B-Instruct"],
          together: [
            "meta-llama/Llama-3.2-3B-Instruct",
            "Qwen/Qwen2.5-7B-Instruct",
          ],
          cerebras: ["meta-llama/Llama-3.3-70B-Instruct"],
          hyperbolic: [
            "Qwen/Qwen2.5-72B-Instruct",
            "meta-llama/Llama-3.1-70B-Instruct",
          ],
        };
        const suggested = recommendedModels[provider] || [
          "mistralai/Mistral-7B-Instruct-v0.3",
        ];
        throw new Error(
          `Le modèle '${
            this.modelName
          }' n'est pas disponible sur ${provider}. Essayez : ${suggested.join(
            " ou "
          )}`
        );
      }
      throw error;
    }
  }

  async sendHFInferenceMessage(message, prompt, conversationHistory) {
    let fullContext = prompt + "\n\n";
    conversationHistory.forEach((msg) => {
      fullContext += `Human: ${msg.content}\n`;
      if (msg.response) fullContext += `Assistant: ${msg.response}\n`;
    });
    fullContext += `Human: ${message}\nAssistant:`;

    const endpoint = `https://api-inference.huggingface.co/models/${this.modelName}`;
    console.log("HF-Inference request:", {
      endpoint,
      model: this.modelName,
      hasToken: !!this.agentConfig.huggingface_token,
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.agentConfig.huggingface_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: fullContext,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false,
            stop_sequences: ["\nHuman:", "\n\nHuman:"],
          },
        }),
      });

      const responseText = await response.text();
      console.log("HF-Inference Response status:", response.status);

      if (!response.ok) {
        if (response.status === 503) {
          return {
            response:
              "Le modèle est en cours de chargement. Veuillez réessayer dans quelques secondes.",
            threadId: null,
          };
        }
        let errorMessage = `HF-Inference API error: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) errorMessage = errorData.error;
        } catch (e) {
          console.log("Response:", responseText.substring(0, 200));
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      let assistantResponse = "";
      if (Array.isArray(data)) {
        assistantResponse = data[0]?.generated_text || "";
      } else if (data.generated_text) {
        assistantResponse = data.generated_text;
      } else if (data[0]?.generated_text) {
        assistantResponse = data[0].generated_text;
      }
      if (assistantResponse.includes("Assistant:")) {
        assistantResponse = assistantResponse.split("Assistant:").pop().trim();
      }
      if (!assistantResponse) {
        assistantResponse = "Désolé, je n'ai pas pu générer une réponse.";
      }
      return {
        response: assistantResponse,
      };
    } catch (error) {
      console.error("HF-Inference Error:", error);
      throw error;
    }
  }
}

export default ModelService;
