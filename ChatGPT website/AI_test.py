import openai
import json
from flask import Flask, render_template, request, jsonify

file_path = '/Users/haydn/Documents/GitHub/AI-website-integration-api-key/key.txt'  
try:
    with open(file_path, 'r') as file:
        api_key = file.read()
except FileNotFoundError:
    print(f"The file '{file_path}' was not found.")

openai.api_key = api_key

chat_history = []

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('Index.html')

@app.route('/AI_test.py', methods=['GET', 'POST'])
def run_python_code():
    if request.method == 'POST':
        # Get the user's input from the JSON request
        user_input = request.json.get('prompt', '')

        chat_history.append(f"You: {user_input}")
        chat_history.append("\n")

        # Include the user's input in the conversation with GPT-3
        messages = [
            {"role": "system", "content": "You are a helpful assistant from Bradford college that provides career advice to college students. Keep responses relevant and informative, and try not to repeat yourself, you would like to help students pick the right course and will help them with any issues."},
            {"role": "user", "content": user_input}
        ]

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0613",
            messages=messages,
        )
        print(response)

        # Extract the content of the assistant's message as a string
        response_content = response["choices"][0]["message"]["content"]

        chat_history.append(f"Career chat: {response_content}")
        chat_history.append("\n")

        # Join the chat_history list into a single string with newlines
        chat_history_text = "\n".join(chat_history)

        # Return the response content as JSON
        return jsonify({"chat_history": chat_history_text})
    else:
        # Handle GET request (render HTML template)
        return render_template('your_template.html')




if __name__ == '__main__':
    app.run(debug=True)
