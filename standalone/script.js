async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-small",
        {
            headers: { Authorization: "Bearer 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" },
            method: "POST",
            body: JSON.stringify({ inputs: data }),
        }
    );
    const result = await response.json();
    return result;
  }
  
  function displayFileName() {
    const fileInput = document.getElementById('audioFile');
    const fileNameSpan = document.getElementById('fileName');
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        fileNameSpan.textContent = `File: ${fileName}`;
        fileNameSpan.style.display = 'inline';
    } else {
        fileNameSpan.style.display = 'none';
    }
  }
  
  function handleUpload() {
    const fileInput = document.getElementById('audioFile');
    const file = fileInput.files[0];
  
    if (file) {
        const reader = new FileReader();
        reader.onloadstart = () => {
            document.getElementById('loading').style.display = 'block';
        };
        reader.onload = async (event) => {
            const data = event.target.result.split(',')[1]; // Extracting base64 data
            const result = await query(data);
  
            if (result && result.text) {
              transcript = result.text;
                document.getElementById('transcript').innerText = transcript;
            } else {
                document.getElementById('transcript').innerText = "Model isn't loaded yet. Try again in ~10 seconds";
            }
  
            document.getElementById('loading').style.display = 'none';
        };
        reader.readAsDataURL(file);
  
        // Display audio player
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.innerHTML = `
            <audio controls>
                <source src="${URL.createObjectURL(file)}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        `;
    } else {
        alert('Please select a file.');
    }
  }