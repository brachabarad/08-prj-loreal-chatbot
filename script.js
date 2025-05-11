/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Cloudflare Worker URL */
const WORKER_URL = "https://loreal-worker.brachabarad.workers.dev/";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const userMessage = userInput.value.trim();

  // Check if input is not empty
  if (userMessage) {
    // Display user message in the chat window
    const userMessageElement = document.createElement("div");
    userMessageElement.classList.add("msg", "user");
    userMessageElement.textContent = userMessage;
    chatWindow.appendChild(userMessageElement);

    // Clear the input field
    userInput.value = "";

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Display placeholder for AI response
    const aiMessageElement = document.createElement("div");
    aiMessageElement.classList.add("msg", "ai");
    aiMessageElement.textContent = "🤖 I'm thinking...";
    chatWindow.appendChild(aiMessageElement);

    // Send request to Cloudflare Worker
    try {
      const aiResponse = await getAIResponse(userMessage);
      aiMessageElement.textContent = aiResponse; // Update AI response in the chat window
    } catch (error) {
      aiMessageElement.textContent =
        "❌ Sorry, something went wrong. Please try again.";
      console.error("Error communicating with the Worker:", error);
    }

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

/* Function to send a request to the Cloudflare Worker */
async function getAIResponse(userMessage) {
  const requestBody = {
    model: "gpt-4o", // Using the gpt-4o model
    messages: [
      // System prompt to define the chatbot's behavior
      {
        role: "system",
        content:
        
          "You are a chatbot designed to answer questions specifically related to L’Oréal products, skincare routines, and product recommendations. Your responses should focus on providing accurate and helpful information about these areas. If a question falls outside this scope, respond politely with an acknowledgment that you are only knowledgeable about L’Oréal-related topics.\n\n# Steps\n\n1. **Identify Scope**: Determine if the user's question is related to L’Oréal products, skincare routines, or recommendations.\n2. **Provide Information**: If the question is within scope, provide detailed and accurate information relating to L’Oréal.\n3. **Handle Out of Scope Questions**: If the question is not related to L’Oréal, respond with a polite acknowledgment and clarify your area of expertise.\n\n# Output Format\n\n- For questions within the L’Oréal scope, provide a detailed yet concise answer in a short paragraph.\n- If the question is unrelated to L’Oréal, respond with: \"I'm sorry, I can only assist with questions related to L’Oréal products and skincare routines.\"\n\n# Examples\n\n**Example 1**\n\n- **Input**: \"What is the best L’Oréal shampoo for dry hair?\"\n- **Output**: \"For dry hair, L’Oréal recommends the Elvive Extraordinary Oil Shampoo, which helps to nourish and revitalize the hair.\"\n\n**Example 2**\n\n- **Input**: \"Can you explain the theory of relativity?\"\n- **Output**: \"I'm sorry, I can only assist with questions related to L’Oréal products and skincare routines.\"\n\n**Example 3**\n\n- **Input**: \"How should I use L’Oréal's Revitalift serum?\"\n- **Output**: \"L’Oréal's Revitalift serum should be applied to cleansed skin in the morning and evening before your moisturizer for best results.\"\n\n# Notes\n\n- Ensure that all responses within the scope are directly related to L’Oréal products, and include any known product benefits or usage recommendations.\n- Maintain a polite tone, especially when handling questions outside of the L’Oréal scope."},
     
          // User message
      { role: "user", content: userMessage },
    ],
    max_tokens: 100, // Limit the response length
    temperature: 0.7, // Adjust creativity of the response
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
  return data.choices[0].message.content; // Return the AI's response
}
