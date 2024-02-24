from flask import Flask, request
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def extract_video_id(youtube_url):
    parsed_url = urlparse(youtube_url)
    query_params = parse_qs(parsed_url.query)
    video_id = query_params.get('v', [])[0] if 'v' in query_params else None
    return video_id

def get_video_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        # Concatenate the text of each item in the transcript with a space
        transcript_text = ' '.join(item['text'] for item in transcript)
        return transcript_text
    except Exception as e:
        return f"Error fetching transcript: {str(e)}"

@app.route("/")
def get_video_transcript_route():
    youtube_url = request.args.get('youtube_url', '')
    video_id = extract_video_id(youtube_url)

    if video_id:
        transcript_text = get_video_transcript(video_id)
        transcript_text = transcript_text.replace('\n',' ')
        transcript_text = transcript_text.replace('\"', '')
        return {"t": transcript_text.replace('\n',' ')}
    else:
        return "Invalid YouTube URL"

if __name__ == "__main__":
    app.run()
