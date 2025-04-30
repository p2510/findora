import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const openai = new OpenAI({
    apiKey: useRuntimeConfig().openai_api_key,
  });

  try {
    // Récupérer le champ `content` du body
    const requestBody = await readBody(event);
    const { content } = JSON.parse(requestBody);


    if (!content) {
      return { success: false, message: "Champ 'content' manquant" };
    }

    // Créer un thread avec le contenu de l'utilisateur
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_pVai1dPMhnh35kWbDSu7syNd",
      max_completion_tokens: 500,
    });

    const finalRun = await waitForRunCompletion(openai, thread.id, run.id);

    const messagesResponse = await openai.beta.threads.messages.list(thread.id);

    // Récupérer le dernier message de l'assistant
    const assistantMessage = messagesResponse.data
      .filter((msg) => msg.role === "assistant")
      .sort((a, b) => b.created_at - a.created_at)[0];

    const contentBlock = assistantMessage?.content?.find(
      (c) => c.type === "text"
    );

    return {
      success: true,
      response: contentBlock?.text?.value || "Aucune réponse trouvée.",
    };
  } catch (error) {
    console.error("Erreur globale:", error);
    return {
      success: false,
      message: "Erreur lors de l’appel à OpenAI",
      error: error.message,
    };
  }
});

// Fonction utilitaire pour attendre la fin d’un run
async function waitForRunCompletion(openai, threadId, runId) {
  let run = await openai.beta.threads.runs.retrieve(threadId, runId);

  while (["in_progress", "queued"].includes(run.status)) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
  }

  return run;
}
