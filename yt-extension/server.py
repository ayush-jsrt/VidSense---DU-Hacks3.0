from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # CORS configuration

# Get the API key from environment variables
API_KEY = os.getenv('GEMINI_API_KEY')

def extract_video_id(youtube_url):
    parsed_url = urlparse(youtube_url)
    query_params = parse_qs(parsed_url.query)
    video_id = query_params.get('v', [])[0] if 'v' in query_params else None
    return video_id

def get_video_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = ' '.join(item['text'] for item in transcript)
        return transcript_text
    except Exception as e:
        return f"Error fetching transcript: {str(e)}"

def call_gemini_api(prompt):
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"API request failed with status code {response.status_code}")

@app.route("/captions")
def get_video_transcript_route():
    youtube_url = request.args.get('youtube_url', '')
    video_id = extract_video_id(youtube_url)

    if video_id:
        transcript_text = get_video_transcript(video_id)
        transcript_text = transcript_text.replace('\n',' ')
        transcript_text = transcript_text.replace('\"', '')
        return {"t": transcript_text}
    else:
        return "Invalid YouTube URL"

@app.route("/summary")
def summarize():
    transcript = request.args.get('transcript', '')
    prompt = f"Summarize the following:\n\n{transcript}"

    try:
        data = call_gemini_api(prompt)
        summary = data['candidates'][0]['content']['parts'][0]['text']
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/qa")
def answer_question():
    transcript = request.args.get('transcript', '')
    question = request.args.get('question', '')
    prompt = f"Based on the following transcript, answer this question: {question}\n\nTranscript:\n{transcript}"

    try:
        data = call_gemini_api(prompt)
        answer = data['candidates'][0]['content']['parts'][0]['text']
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

if __name__ == "__main__":
    app.run(debug=True)
