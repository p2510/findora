export async function sendWhatsapp(
  instanceId,
  apiToken,
  customers,
  content,
  userId
) {
  const url = "https://app.myfindora.com/api/send-campaign-whatsapp";
 
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        instanceIds: instanceId,
        apiToken: apiToken,
        customers: customers,
        content: content,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    if (json) {
      return json;
    }
  } catch (error) {
    return error;
  }
}
