from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import requests
import os

# Get absolute paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')

app = Flask(__name__,
            template_folder=TEMPLATE_DIR,
            static_folder=STATIC_DIR,
            static_url_path='/static')

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# JioSaavn API
API_BASE_URL = "https://saavn-api-ecru.vercel.app"

def make_api_request(endpoint, params=None):
    """Make API request with error handling"""
    try:
        url = f"{API_BASE_URL}/api{endpoint}"
        print(f"Requesting: {url} with params: {params}")
        
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        print(f"Response success: {data.get('success', False)}")
        return data
    except Exception as e:
        print(f"API Error: {str(e)}")
        return {"success": False, "error": str(e), "data": None}

# ==================== STATIC FILES ====================
@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory(STATIC_DIR, filename)

# ==================== PAGES ====================
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search')
def search_page():
    return render_template('search.html')

@app.route('/album/<album_id>')
def album_page(album_id):
    return render_template('album.html', album_id=album_id)

@app.route('/artist/<artist_id>')
def artist_page(artist_id):
    return render_template('artist.html', artist_id=artist_id)

@app.route('/playlist/<playlist_id>')
def playlist_page(playlist_id):
    return render_template('playlist.html', playlist_id=playlist_id)

# ==================== API ENDPOINTS ====================
@app.route('/api/test')
def test():
    """Test endpoint"""
    return jsonify({
        "success": True,
        "message": "API is working",
        "base_dir": BASE_DIR,
        "template_dir": TEMPLATE_DIR,
        "static_dir": STATIC_DIR
    })

@app.route('/api/modules')
def get_modules():
    """Get home modules"""
    data = make_api_request('/modules')
    return jsonify(data)

@app.route('/api/search/all')
def search_all():
    """Search all"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    data = make_api_request('/search/all', {'query': query})
    return jsonify(data)

@app.route('/api/search/songs')
def search_songs():
    """Search songs"""
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
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
    """Search albums"""
    query = request.args.get('query', '').strip()
    data = make_api_request('/search/albums', {'query': query})
    return jsonify(data)

@app.route('/api/search/artists')
def search_artists():
    """Search artists"""
    query = request.args.get('query', '').strip()
    data = make_api_request('/search/artists', {'query': query})
    return jsonify(data)

@app.route('/api/search/playlists')
def search_playlists():
    """Search playlists"""
    query = request.args.get('query', '').strip()
    data = make_api_request('/search/playlists', {'query': query})
    return jsonify(data)

@app.route('/api/songs/<song_id>')
def get_song(song_id):
    """Get song by ID"""
    data = make_api_request(f'/songs/{song_id}')
    return jsonify(data)

@app.route('/api/albums/<album_id>')
def get_album(album_id):
    """Get album by ID"""
    data = make_api_request(f'/albums', {'id': album_id})
    return jsonify(data)

@app.route('/api/playlists/<playlist_id>')
def get_playlist(playlist_id):
    """Get playlist by ID"""
    data = make_api_request(f'/playlists', {'id': playlist_id})
    return jsonify(data)

@app.route('/api/artists/<artist_id>')
def get_artist(artist_id):
    """Get artist by ID"""
    data = make_api_request(f'/artists', {'id': artist_id})
    return jsonify(data)

# ==================== ERROR HANDLERS ====================
@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"success": False, "error": "Endpoint not found"}), 404
    return render_template('index.html')

@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "error": "Internal server error"}), 500

# For local testing
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
