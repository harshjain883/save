from flask import Flask, render_template, jsonify, request
import requests
import os

# Get the parent directory path
basedir = os.path.abspath(os.path.dirname(__file__))
parent_dir = os.path.dirname(basedir)

app = Flask(__name__,
            template_folder=os.path.join(parent_dir, 'templates'),
            static_folder=os.path.join(parent_dir, 'static'))


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
    except Exception as e:
        return {"success": False, "error": str(e)}

# ==================== ROUTES - PAGES ====================

@app.route('/')
def home():
    """Home page"""
    return render_template('index.html')

@app.route('/search')
def search_page():
    """Search page"""
    return render_template('search.html')

@app.route('/album/<album_id>')
def album_page(album_id):
    """Album page"""
    return render_template('album.html', album_id=album_id)

@app.route('/artist/<artist_id>')
def artist_page(artist_id):
    """Artist page"""
    return render_template('artist.html', artist_id=artist_id)

@app.route('/playlist/<playlist_id>')
def playlist_page(playlist_id):
    """Playlist page"""
    return render_template('playlist.html', playlist_id=playlist_id)

# ==================== API ROUTES ====================

@app.route('/api/search/all')
def search_all():
    """Search all"""
    query = request.args.get('query', '')
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    data = make_api_request('/search/all', {'query': query})
    return jsonify(data)

@app.route('/api/search/songs')
def search_songs():
    """Search songs"""
    query = request.args.get('query', '')
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    data = make_api_request('/search/songs', {'query': query})
    return jsonify(data)

@app.route('/api/search/albums')
def search_albums():
    """Search albums"""
    query = request.args.get('query', '')
    data = make_api_request('/search/albums', {'query': query})
    return jsonify(data)

@app.route('/api/search/artists')
def search_artists():
    """Search artists"""
    query = request.args.get('query', '')
    data = make_api_request('/search/artists', {'query': query})
    return jsonify(data)

@app.route('/api/search/playlists')
def search_playlists():
    """Search playlists"""
    query = request.args.get('query', '')
    data = make_api_request('/search/playlists', {'query': query})
    return jsonify(data)

@app.route('/api/songs/<song_id>')
def get_song(song_id):
    """Get song"""
    data = make_api_request('/songs', {'id': song_id})
    return jsonify(data)

@app.route('/api/albums/<album_id>')
def get_album(album_id):
    """Get album"""
    data = make_api_request('/albums', {'id': album_id})
    return jsonify(data)

@app.route('/api/artists/<artist_id>')
def get_artist(artist_id):
    """Get artist"""
    data = make_api_request('/artists', {'id': artist_id})
    return jsonify(data)

@app.route('/api/playlists/<playlist_id>')
def get_playlist(playlist_id):
    """Get playlist"""
    data = make_api_request('/playlists', {'id': playlist_id})
    return jsonify(data)

@app.route('/api/modules')
def get_modules():
    """Get modules"""
    data = make_api_request('/modules')
    return jsonify(data)

@app.route('/api/trending')
def get_trending():
    """Get trending"""
    data = make_api_request('/modules')
    return jsonify(data)

@app.route('/api/charts')
def get_charts():
    """Get charts"""
    data = make_api_request('/modules')
    return jsonify(data)

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"success": False, "error": "Not found"}), 404
    return render_template('index.html')

@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "error": "Server error"}), 500

# For local development
if __name__ == '__main__':
    app.run(debug=True)
