// Function to execute qa functionality
async function executeQaFunctionality(question, video_url) {
  const url = 'https://vidsense.onrender.com/captions?youtube_url=' + video_url;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    let transcript = data.t;

    const qaUrl = 'https://vidsense.onrender.com/qa?transcript=' + encodeURIComponent(transcript) + '&question=' + encodeURIComponent(question);
    const qaResponse = await fetch(qaUrl);

    if (!qaResponse.ok) {
      throw new Error(`HTTP error! Status: ${qaResponse.status}`);
    }

    const qaResult = await qaResponse.json();

    if (qaResult.error) {
      chrome.runtime.sendMessage({ output: qaResult.error });
    } else {
      chrome.runtime.sendMessage({ output: `${qaResult.answer}` });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to execute summary functionality
async function executeSummaryFunctionality(video_url) {
  const url = 'https://vidsense.onrender.com/captions?youtube_url=' + video_url;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    let transcript = data.t;

    const summaryUrl = 'https://vidsense.onrender.com/summary?transcript=' + encodeURIComponent(transcript);
    const summaryResponse = await fetch(summaryUrl);

    if (!summaryResponse.ok) {
      throw new Error(`HTTP error! Status: ${summaryResponse.status}`);
    }

    const summaryResult = await summaryResponse.json();

    if (summaryResult.error) {
      chrome.runtime.sendMessage({ output: summaryResult.error });
    } else {
      chrome.runtime.sendMessage({ output: summaryResult.summary });
    }
  } catch (error) {
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
