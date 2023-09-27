import openai
from flask import Flask, render_template, request, jsonify

file_path = '/Users/haydn/Documents/GitHub/AI-website-integration-api-key/key.txt'  
try:
    with open(file_path, 'r') as file:
        api_key = file.read()
except FileNotFoundError:
    print(f"The file '{file_path}' was not found.")

openai.api_key = api_key

chat_history = []

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return render_template('Index.html')

@app.route('/AI_test.py', methods=['GET', 'POST'])
def run_python_code():
    if request.method == 'POST':
        # Get the user's input from the JSON request
        user_input = request.json.get('prompt', '')
        chat_memory = request.json.get('chat_memory','')
        #These values are strange as the history includes \n and both the user and coach's responses
        #this means that the value 2 includes just the last input from the user and every 4 added includes a input and response
        #the algorithm for this is n4 + 2
        chat_memory = int(chat_memory)
        print(chat_memory)
        chat_memory *= 4
        chat_memory += 2
        print(chat_memory)
        

        chat_history.append(f"You: {user_input}")
        chat_history.append("\n")

        # prints out the chat history to be sent to openAI for debugging purposes
        print(str(chat_history[-chat_memory:]))
        
        try:
            conversation_for_model = str(chat_history[-chat_memory:])
        except:
            conversation_for_model = str(chat_history[-4:])
            print('Invalid option')

        # Include the user's input in the conversation with GPT-3
        messages = [
            {"role": "system", "content": "You are a helpful careers advisor from Bradford college that provides career advice to college students. Keep responses relevant and informative, and try not to repeat yourself, you would like to help students pick the right course and will help them with any issues. The past interactions yourself and the user will be sent alongside the question. start all your responses with 'Career Coach Brad:'."},
            {"role": "user", "content": conversation_for_model}
        ]

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0613",
            messages=messages,
        )
        print(response)

        # Extract the content of the assistant's message as a string
        response_content = response["choices"][0]["message"]["content"]

        chat_history.append(response_content)
        chat_history.append("\n")

        # Join the chat_history list into a single string with newlines
        chat_history_text = "\n".join(chat_history)

        # Return the response content as JSON
        return jsonify({"chat_history": chat_history_text})
    else:
        # Handle GET request (render HTML template)
        return render_template('your_template.html')

@app.route('/refresh_chat_history', methods=['POST'])
def refresh_chat_history():
    if request.method == 'POST':
        global chat_history
        chat_history = []
    return ''

if __name__ == '__main__':
    app.run(debug=True)
