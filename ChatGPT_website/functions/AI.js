const functions = require('firebase-functions');
const { OpenAIAPI } = require('openai');
const openai = new OpenAIAPI({ key: process.env.api_key });

let chatHistory = [];

const getChatCompletion = async (userInput, chatMemory) => {
  chatMemory = parseInt(chatMemory, 10) * 4 + 2;
  
  chatHistory.push(`You: ${userInput}`);
  chatHistory.push("\n");

  const conversationForModel = chatHistory.slice(-chatMemory).join('');

  const messages = [
    {
      "role": "system",
      "content": "You are a helpful careers advisor from Bradford college that provides career advice to college students. ..."
    },
    {
      "role": "user",
      "content": conversationForModel
    }
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: messages
  });

  const responseContent = response.data.choices[0].message.content;

  chatHistory.push(responseContent);
  chatHistory.push("\n");

  return chatHistory.join("\n");
};

exports.chatWithGpt3 = functions.https.onRequest(async (req, res) => {
  if (req.method === "POST") {
    const { prompt, chat_memory } = req.body;

    try {
      const chatHistoryText = await getChatCompletion(prompt, chat_memory);
      res.status(200).json({ chat_history: chatHistoryText });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "DELETE") {
    chatHistory = [];
    res.status(200).send("Chat history cleared.");
  } else {
    res.status(405).send("Method not allowed");
  }
});
