// Define the query function used in qa.js
async function query(data) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
      {
        headers: { Authorization: `Bearer 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` },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result;
  }
  
  // Function to execute qa.js functionality
  async function executeQaFunctionality(question, video_url) {
    const url = 'http://127.0.0.1:5000/?youtube_url=' + video_url;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      let transcript = data.t;
  
      const qaResponse = await query({ inputs: { question: question, context: transcript } });
  
      // Send the answer to the popup
      chrome.runtime.sendMessage({ output: `${qaResponse.answer} (Confidence: ${Math.round(qaResponse.score * 100)}%)` });
    } catch (error) {
      // Log any errors that occurred during the fetch or query
      console.error('Error:', error);
    }
  }
  
  // Define the query function used in summary.js
  async function querySummary(data) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer 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`,
        },
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result;
  }
  
  // Function to execute summary.js functionality
  async function executeSummaryFunctionality(video_url) {
    const url = 'http://127.0.0.1:5000/?youtube_url=' + video_url;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const transcript = (await response.json()).t;
  
      const summaryResponse = await querySummary({
        inputs: `${transcript}`,
      });
  
      // Send the summary to the popup
      chrome.runtime.sendMessage({ output: summaryResponse[0].summary_text });
    } catch (error) {
      // Log any errors that occurred during the fetch or query
      console.error('Error:', error);
    }
  }
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.action === "answer") {
        executeQaFunctionality(request.question, request.video_url);
      } else if (request.action === "summarize") {
        executeSummaryFunctionality(request.video_url);
      }
    }
  );
  