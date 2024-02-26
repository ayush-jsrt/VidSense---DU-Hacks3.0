function handleSummary() {
    const transcriptInput = document.getElementById('transcriptInput').value;
    console.log('Performing summary operation with transcript:');

    async function querySummary(data) {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            {
                headers: { Authorization: "Bearer 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" },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    }

    querySummary({"inputs": transcriptInput}).then((response) => {
        const summaryOutput = response[0].summary_text; // Get the generated summary
        console.log(summaryOutput); // Log the summary to console
        displaySummary(summaryOutput); // Call function to display summary on the website
    });
}

async function handleQA() {
    const transcriptInput = document.getElementById('transcriptInput').value;
    const questionInput = document.getElementById('questionInput').value;
    console.log('Performing QA operation with transcript and question:');

    async function queryQA(data) {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
            {
                headers: { Authorization: "Bearer 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" },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    }

    queryQA({"inputs": {
        "question": questionInput,
        "context": transcriptInput
    }}).then((response) => {
        if (response[0].answers && response[0].answers.length > 0) {
            const answer = response[0].answers[0].answer; // Get the generated answer
            console.log(answer); // Log the answer to console
            displayAnswer(answer); // Call function to display answer on the website
        } else {
            console.log("No answer found.");
            displayAnswer("No answer found.");
        }
    }).catch((error) => {
        console.error("Error fetching QA:", error);
        displayAnswer("Error fetching answer.");
    });
}

function displaySummary(summary) {
    const summaryOutputDiv = document.getElementById('summaryOutput');
    summaryOutputDiv.innerHTML = ''; // Clear previous content
    const summaryText = document.createElement('p');
    summaryText.textContent = summary;
    summaryOutputDiv.appendChild(summaryText);
}

function displayAnswer(answer) {
    const qaOutputDiv = document.getElementById('qaOutput');
    qaOutputDiv.innerHTML = ''; // Clear previous content
    const answerText = document.createElement('p');
    answerText.textContent = answer;
    qaOutputDiv.appendChild(answerText);
}

// Adding event listeners to the buttons
document.querySelector('.summary-btn').addEventListener('click', handleSummary);
document.querySelector('.qa-btn').addEventListener('click', handleQA);
