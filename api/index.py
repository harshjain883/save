from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import requests
import os

app = Flask(__name__, 
            template_folder='../templates',
            static_folder='../static')
CORS(app)

# JioSaavn API Base URL
API_BASE_URL = "https://jiosaavnapi-nu.vercel.app"

# ==================== HELPER FUNCTIONS ====================

def make_api_request(endpoint, params=None):
    """Make request to JioSaavn API"""
    try:
        url = f"{API_BASE_URL}{endpoint}"
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# ==================== ROUTES - PAGES ====================

@app.route('/')
def home():
    """Home page with trending songs"""
    return render_template('index.html')

@app.route('/search')
def search_page():
    """Search page"""
    return render_template('search.html')

@app.route('/album/<album_id>')
def album_page(album_id):
    """Album details page"""
    return render_template('album.html', album_id=album_id)

@app.route('/artist/<artist_id>')
def artist_page(artist_id):
    """Artist details page"""
    return render_template('artist.html', artist_id=artist_id)

@app.route('/playlist/<playlist_id>')
def playlist_page(playlist_id):
    """Playlist details page"""
    return render_template('playlist.html', playlist_id=playlist_id)

# ==================== API ROUTES ====================

@app.route('/api/search/all')
def search_all():
    """Search for songs, albums, artists, and playlists"""
    query = request.args.get('query', '')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    
    data = make_api_request('/search/all', {'query': query})
    return jsonify(data)

@app.route('/api/search/songs')
def search_songs():
    """Search for songs only"""
    query = request.args.get('query', '')
    page = request.args.get('page', '1')
    limit = request.args.get('limit', '20')
    
    data = make_api_request('/search/songs', {
        'query': query,
        'page': page,
        'limit': limit
    })
    return jsonify(data)

@app.route('/api/search/albums')
def search_albums():
    """Search for albums"""
    query = request.args.get('query', '')
    page = request.args.get('page', '1')
    limit = request.args.get('limit', '20')
    
    data = make_api_request('/search/albums', {
        'query': query,
        'page': page,
        'limit': limit
    })
    return jsonify(data)

@app.route('/api/search/artists')
def search_artists():
    """Search for artists"""
    query = request.args.get('query', '')
    page = request.args.get('page', '1')
    limit = request.args.get('limit', '20')
    
    data = make_api_request('/search/artists', {
        'query': query,
        'page': page,
        'limit': limit
    })
    return jsonify(data)

@app.route('/api/search/playlists')
def search_playlists():
    """Search for playlists"""
    query = request.args.get('query', '')
    page = request.args.get('page', '1')
    limit = request.args.get('limit', '20')
    
    data = make_api_request('/search/playlists', {
        'query': query,
        'page': page,
        'limit': limit
    })
    return jsonify(data)

@app.route('/api/songs/<song_id>')
def get_song(song_id):
    """Get song details by ID"""
    data = make_api_request(f'/songs/{song_id}')
    return jsonify(data)

@app.route('/api/albums/<album_id>')
def get_album(album_id):
    """Get album details by ID"""
    data = make_api_request(f'/albums/{album_id}')
    return jsonify(data)

@app.route('/api/artists/<artist_id>')
def get_artist(artist_id):
    """Get artist details by ID"""
    data = make_api_request(f'/artists/{artist_id}')
    return jsonify(data)

@app.route('/api/playlists/<playlist_id>')
def get_playlist(playlist_id):
    """Get playlist details by ID"""
    data = make_api_request(f'/playlists/{playlist_id}')
    return jsonify(data)

@app.route('/api/modules')
def get_home_data():
    """Get home page data (trending, top charts, etc.)"""
    data = make_api_request('/modules')
    return jsonify(data)

@app.route('/api/trending')
def get_trending():
    """Get trending songs"""
    data = make_api_request('/trending')
    return jsonify(data)

@app.route('/api/charts')
def get_charts():
    """Get top charts"""
    data = make_api_request('/charts')
    return jsonify(data)

@app.route('/api/lyrics/<song_id>')
def get_lyrics(song_id):
    """Get song lyrics"""
    data = make_api_request(f'/songs/{song_id}/lyrics')
    return jsonify(data)

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(e):
    return render_template('index.html'), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

# For local development
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
