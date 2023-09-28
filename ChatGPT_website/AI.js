const express = require('express');
const { OpenAIApi } = require('openai');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const file_path = '/path/to/your/api-key/file.txt'; // Update this path
const api_key = fs.existsSync(file_path)
  ? fs.readFileSync(file_path, 'utf-8').trim()
  : process.env.KEY;

const openai = new OpenAIApi({ key: api_key });

const chat_history = [];

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/AI_test', async (req, res) => {
  try {
    const user_input = req.body.prompt || '';
    const chat_memory = parseInt(req.body.chat_memory) || 0;

    // Adjust chat_memory as needed
    chat_memory *= 4;
    chat_memory += 2;

    chat_history.push(`You: ${user_input}`);

    const conversation_for_model = chat_history.slice(-chat_memory).join('\n');

    const messages = [
      {
        role: 'system',
        content:
          "You are a helpful careers advisor from Bradford college that provides career advice to college students. Keep responses relevant and informative, and try not to repeat yourself, you would like to help students pick the right course and will help them with any issues. The past interactions yourself and the user will be sent alongside the question. start all your responses with 'Career Coach Brad:'.",
      },
      {
        role: 'user',
        content: conversation_for_model,
      },
    ];

    const response = await openai.createCompletion({
      model: 'gpt-3.5-turbo-0613',
      messages,
    });

    const response_content = response.choices[0].message.content;

    chat_history.push(response_content);

    const chat_history_text = chat_history.join('\n');

    res.json({ chat_history: chat_history_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/refresh_chat_history', (req, res) => {
  chat_history.length = 0;
  res.send('');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
