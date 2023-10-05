const functions = require('firebase-functions');
require('dotenv').config()
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const cors = require('cors')({origin: "https://career-coach-brad-online.web.app, https://career-coach-brad-online.firebaseapp.com"});

let chatHistory = [];

const getChatCompletion = async (userInput, chatMemory) => {
  chatMemory = parseInt(chatMemory, 10) * 4 + 2;
  
  chatHistory.push(`You: ${userInput}`);
  chatHistory.push("\n");

  const conversationForModel = chatHistory.slice(-chatMemory).join('');

  const messages = [
    {
      "role": "system",
      "content": "You are a helpful careers advisor from Bradford college that provides career advice to college students. Keep responses relevant and informative, and try not to repeat yourself, you would like to help students pick the right course and will help them with any issues. The past interactions yourself and the user will be sent alongside the question. start all your responses with 'Career Coach Brad:'."
    },
    {
      "role": "user",
      "content": conversationForModel
    }
  ];
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    messages: messages,
    max_tokens: 1000
  });

  const responseContent = response.data.choices[0].message.content;
  chatHistory.push(responseContent);
  chatHistory.push("\n");

  return chatHistory.join("\n");
};

exports.chatWithGpt3 = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      res.set("Access-Control-Allow-Origin", "https://career-coach-brad-online.web.app, https://career-coach-brad-online.firebaseapp.com");
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, HEAD, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'application/json');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('Access Granted');
    } else {
      res.send('Access Denied');
    }
    console.log("Function started");
    if (req.method === "POST") {
      const { prompt, chat_memory } = req.body;
      try {
        const chatHistoryText = await getChatCompletion(prompt, chat_memory);
        console.log("openai request successful");
        // Send the chat history as JSON
        res.status(200).json({ chat_history: chatHistoryText });
      } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("openai request failed");
      }
    } else if (req.method === "DELETE") {
      chatHistory = [];
      console.log("Chat history cleared.");
      res.status(200).send("Chat history cleared.");
    } else {
      console.log("res.status(405).send('Method not allowed')")
      res.status(405).send("Method not allowed");
    }
  })
});