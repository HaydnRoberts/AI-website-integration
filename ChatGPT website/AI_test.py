import openai
import json
from flask import Flask, render_template, request, jsonify

openai.api_key = "****"

def get_career_advice(college):
    """Provide career advice based on the college attended."""
    # You can implement your own logic to provide career advice based on the college
    if college.lower() == "bradford college":
        advice = "Bradford College offers a variety of programs in fields like business, technology, and healthcare. Consider exploring majors related to your interests and career goals. Don't hesitate to network with professors and fellow students to build connections."
    else:
        advice = "It's essential to research the programs and resources available at your chosen college. Focus on gaining relevant skills and experience in your field of interest, and seek guidance from career advisors to help you achieve your goals."

    return advice

def run_conversation():
    # Step 1: send the conversation to GPT
    messages = [{"role": "system", "content": "You are a helpful assistant that provides career advice to college students. Keep responses short and to the point unless otherwise specified"}, {"role": "user", "content": "What could Bradford College provide me if I were to study there?"}]
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0613",
        messages=messages,
    )
    response_message = response["choices"][0]["message"]

    # Step 2: Extract the assistant's response
    assistant_response = response_message["content"]

    # Step 3: Call the get_career_advice function based on the user's query
    user_message = messages[-1]["content"]
    college_name = user_message.split("Bradford College")[0].strip()  # Extract college name if mentioned
    career_advice = get_career_advice(college_name)

    # Step 4: Extend the conversation with the assistant's career advice
    messages.append(
        {
            "role": "assistant",
            "content": career_advice,
        }
    )

    # Step 5: Send the extended conversation back to GPT
    second_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0613",
        messages=messages,
    )
    
    return second_response


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('Index.html')


@app.route('/AI_test.py', methods=['POST'])
def run_python_code():
    response = run_conversation()

    # Extract the content of the assistant's message as a string
    response_content = response["choices"][0]["message"]["content"]

    # Return the response content as a plain string
    return response_content



if __name__ == '__main__':
    app.run(debug=True)
