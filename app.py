import base64
import requests
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

# Your Spotify client ID and client secret
client_id = ''
client_secret = ''

# Step 1: Get Access Token using Client Credentials Flow
def get_access_token(client_id, client_secret):
    client_creds = f"{client_id}:{client_secret}"
    client_creds_b64 = base64.b64encode(client_creds.encode()).decode()

    token_url = 'https://accounts.spotify.com/api/token'
    response = requests.post(token_url,
                             headers={
                                 "Authorization": f"Basic {client_creds_b64}",
                                 "Content-Type": "application/x-www-form-urlencoded"
                             },
                             data={"grant_type": "client_credentials"})

    token_response_data = response.json()
    return token_response_data.get('access_token')


def get_song_embed_url(song_name, artist_name, access_token):
    search_url = 'https://api.spotify.com/v1/search'
    
    # Build the search query: If artist is provided, include it in the search query
    if artist_name:
        query = f"track:{song_name} artist:{artist_name}"
    else:
        query = f"track:{song_name}"
    
    # Make a request to search for the song by name (and artist if available)
    response = requests.get(search_url,
                            headers={
                                "Authorization": f"Bearer {access_token}"
                            },
                            params={"q": query, "type": "track", "limit": 1})
    
    # Extract the track information from the API response
    tracks = response.json().get('tracks', {}).get('items', [])
    if tracks:
        track = tracks[0]
        track_id = track.get('id')
        return f"https://open.spotify.com/embed/track/{track_id}?utm_source=generator"
    else:
        return None


# Flask route to handle the request and return the embed URL
@app.route('/get_embed_url', methods=['POST'])
def get_embed_url():
    data = request.json
    song_name = data.get('song_name')
    artist_name = data.get('artist_name')
    
    access_token = get_access_token(client_id, client_secret)
    if access_token:
        embed_url = get_song_embed_url(song_name, artist_name, access_token)
        if embed_url:
            return jsonify({"embed_url": embed_url}), 200
        else:
            return jsonify({"error": "Song not found"}), 404
    else:
        return jsonify({"error": "Failed to retrieve access token"}), 500

# Serve the static HTML file
@app.route('/')
def serve_spotify_page():
    return send_from_directory('static', 'spotify.html')

# Serve the pics directory for images
@app.route('/pics/<path:filename>')
def serve_pics(filename):
    return send_from_directory('pics', filename)

if __name__ == '__main__':
    app.run(debug=True)
