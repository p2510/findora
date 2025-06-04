const testMediaMessage = async () => {
  const url = 'https://gate.whapi.cloud/messages/image';
  const token = '0OGU62wv8BnMBeRyKtHTaetHbyidNsk3'; // Remplacez par votre token
  const mediaUrl = 'https://puxvccwmxfpgyocglioe.supabase.co/storage/v1/object/public/whatsapp-media/campaigns/1749049501384-image1.png';
  const body = {
    to: '2250500145177', // Remplacez par un numéro de test
    media: mediaUrl,
    caption: 'Test d\'envoi d\'image'
  };

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  };

  try {
    const response = await fetch(url, options);
    const jsonResponse = await response.json();
    if (!response.ok) {
      console.error('❌ Erreur API WhatsApp:', jsonResponse);
      return { success: false, error: jsonResponse.error?.message || jsonResponse.message };
    }
    console.log('✅ Succès:', jsonResponse);
    return { success: true, response: jsonResponse };
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    return { success: false, error: err.message };
  }
};

testMediaMessage().then(console.log);