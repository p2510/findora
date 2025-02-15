// utils/smsUtils.js

export async function sendSMS(smsBacklogs, customers, content, userId) {
  const url = "https://app.myfindora.com/api/send-campaign-sms";
  //const url = "http://localhost:3000/api/send-campaign-sms";
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        smsbacklogs: smsBacklogs,
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
