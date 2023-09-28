//const file_path = '/path/to/your/api-key/file.txt';
//const api_key = fs.existsSync(file_path)
//  ? fs.readFileSync(file_path, 'utf-8').trim()
//  : process.env.KEY;
const api_key = "NO key, it got disabled"

// Chat history array
const chatHistory = [];

// Function to run the chatbot logic
function runCode() {
    const userPrompt = document.getElementById("prompt").value;
    const selectBox = document.getElementById("options");
    document.getElementById("prompt").value = "";

    var chatMemory = parseInt(selectBox.value);
    console.log("memory", chatMemory)

    // Simulate chat history (replace with your logic)
    chatHistory.push(`You: ${userPrompt}`);

    // Adjust chatMemory as needed
    chatMemory *= 4;
    console.log("memory", chatMemory)
    chatMemory += 2;
    console.log("memory", chatMemory)

    const conversationForModel = toString(chatHistory.slice(-chatMemory).join('\n'));

    // Define messages for OpenAI API
    const messages = [
        {
            role: 'system',
            content:
                "You are a helpful careers advisor from Bradford college that provides career advice to college students. Keep responses relevant and informative, and try not to repeat yourself, you would like to help students pick the right course and will help them with any issues. The past interactions yourself and the user will be sent alongside the question. Start all your responses with 'Career Coach Brad:'.",
        },
        {
            role: 'user',
            content: conversationForModel,
        },
    ];
    

    // Make a request to the OpenAI API
    fetch('https://api.openai.com/v1/engines/gpt-3.5-turbo/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
        },        
        body: JSON.stringify({
            messages,
        }),
    })
    .then(response => response.json())
    .then(data => {
        const responseContent = data.choices[0].message.content;
        chatHistory.push(responseContent);

        // Update the chat history in the HTML
        const chatHistoryText = chatHistory.join('\n');
        document.getElementById("chat_history").innerText = chatHistoryText;
        window.scrollTo(0, document.body.scrollHeight);
    })
    .catch(error => {
        console.error("Error: could not fetch data from openAI");
    });
}

// Event listeners
document.getElementById("runButton").addEventListener("click", function() {
    console.log("run button pressed")
    runCode();
});

document.getElementById("prompt").addEventListener("keydown", function(event) {
    console.log("key entered")
    if (event.key === "Enter" && !event.shiftKey) {
        console.log("enter")
        event.preventDefault();
        runCode();
    }
});

document.getElementById("refreshButton").addEventListener("click", function() {
    console.log("refresh")
    const selectBox = document.getElementById("options");
    const chatMemory = selectBox.value;
    document.getElementById("chat_history").innerText = "";
    chatHistory.length = 0; // Clear chat history
});
