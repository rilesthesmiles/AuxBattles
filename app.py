import base64
import requests
from flask import Flask, request, jsonify, render_template

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


@app.route('/')
def serve_index_page():
    return render_template('index.html')

# Serve the spotify.html file from templates
@app.route('/spotify')
def serve_spotify_page():
    return render_template('spotify.html')

# Add a new route to serve the choose_prompt.html
@app.route('/choose_prompt')
def serve_choose_prompt_page():
    return render_template('choose_prompt.html')

# Serve the person_one.html file from templates
@app.route('/person_one')
def serve_person_one_page():
    return render_template('person_one.html')

@app.route('/person_two')
def serve_person_two_page():
    return render_template('person_two.html')

# Serve the voting.html file for the voting page
@app.route('/voting')
def serve_voting_page():
    return render_template('voting.html')

@app.route('/loading')
def serve_loading_page():
    return render_template('loading_screen.html')

@app.route('/score_results')
def serve_score_results():
    return render_template('score_results.html')

@app.route('/final_results')
def serve_final_results():
    return render_template('final_results.html')




#Figma
@app.route('/display')
def display_screen():
    return render_template('figma_screens/display_screen.html')

@app.route('/game_mode')
def game_mode_select_screen():
    return render_template('figma_screens/game_mode_selection.html')

@app.route('/host_game')
def host_game_screen():
    return render_template('figma_screens/host_game.html')

@app.route('/game_loading_host')
def game_loading_host_screen():
    return render_template('figma_screens/game_loading_host.html')

@app.route('/join_game')
def join_game_screen():
    return render_template('figma_screens/join_game.html')

@app.route('/tutorial')
def tutorial_screen():
    return render_template('figma_screens/tutorial.html')

@app.route('/song_list')
def song_list_screen():
    return render_template('figma_screens/song_list.html')

if __name__ == '__main__':
    app.run(debug=True, port=5001)

