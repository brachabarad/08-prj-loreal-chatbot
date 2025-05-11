/* DOM Elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Cloudflare Worker URL */
const WORKER_URL = "https://loreal-worker.brachabarad.workers.dev/";

/* Handle Form Submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const userMessage = userInput.value.trim();

  // Check if input is not empty
  if (userMessage) {
    // Display user message
    appendMessage(userMessage, "user");

    // Clear input field
    userInput.value = "";

    // Display placeholder for AI response
    const aiMessageElement = appendMessage("🤖 I'm thinking...", "ai");

    // Send request to Cloudflare Worker
    try {
      const aiResponse = await getAIResponse(userMessage);
      aiMessageElement.textContent = aiResponse; // Update AI response
    } catch (error) {
      aiMessageElement.textContent =
        "❌ Sorry, something went wrong. Please try again.";
      console.error("Error:", error);
    }

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

/* Function to Append Message to Chat Window */
function appendMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg", sender);
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  return messageElement;
}

/* Function to Send Request to Cloudflare Worker */
async function getAIResponse(userMessage) {
  const requestBody = {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: userMessage },
    ],
  };

  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
