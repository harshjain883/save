from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import requests
import os
import sys

app = Flask(__name__, 
            template_folder='../templates',
            static_folder='../static')

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# JioSaavn API Base URL
API_BASE_URL = "https://jiosaavnapi-nu.vercel.app"

# Add logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# ==================== HELPER FUNCTIONS ====================

def make_api_request(endpoint, params=None):
    """Make request to JioSaavn API with better error handling"""
    try:
        url = f"{API_BASE_URL}{endpoint}"
        logger.info(f"Making request to: {url} with params: {params}")
        
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        logger.info(f"Response received: {data.get('success', False)}")
        return data
        
    except requests.exceptions.Timeout:
        logger.error("Request timeout")
        return {"success": False, "error": "Request timeout"}
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return {"success": False, "error": str(e)}
    except ValueError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return {"success": False, "error": "Invalid JSON response"}
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"success": False, "error": str(e)}

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

@app.route('/api/test')
def test_api():
    """Test endpoint to check if API is working"""
    try:
        data = make_api_request('/modules')
        return jsonify({
            "status": "ok",
            "api_response": data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route('/api/search/all')
def search_all():
    """Search for songs, albums, artists, and playlists"""
    query = request.args.get('query', '')
    if not query:
        return jsonify({"success": False, "error": "Query parameter is required"}), 400
    
    data = make_api_request('/search/all', {'query': query})
    return jsonify(data)

@app.route('/api/search/songs')
def search_songs():
    """Search for songs only"""
    query = request.args.get('query', '')
    page = request.args.get('page', '1')
    limit = request.args.get('limit', '20')
    
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
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
    data = make_api_request(f'/songs', {'id': song_id})
    return jsonify(data)

@app.route('/api/albums/<album_id>')
def get_album(album_id):
    """Get album details by ID"""
    data = make_api_request(f'/albums', {'id': album_id})
    return jsonify(data)

@app.route('/api/artists/<artist_id>')
def get_artist(artist_id):
    """Get artist details by ID"""
    data = make_api_request(f'/artists', {'id': artist_id})
    return jsonify(data)

@app.route('/api/playlists/<playlist_id>')
def get_playlist(playlist_id):
    """Get playlist details by ID"""
    data = make_api_request(f'/playlists', {'id': playlist_id})
    return jsonify(data)

@app.route('/api/modules')
def get_home_data():
    """Get home page data (trending, top charts, etc.)"""
    data = make_api_request('/modules')
    return jsonify(data)

@app.route('/api/trending')
def get_trending():
    """Get trending songs"""
    # Try albums endpoint instead as trending might not exist
    data = make_api_request('/modules')
    return jsonify(data)

@app.route('/api/charts')
def get_charts():
    """Get top charts"""
    data = make_api_request('/modules')
    return jsonify(data)

@app.route('/api/lyrics/<song_id>')
def get_lyrics(song_id):
    """Get song lyrics"""
    data = make_api_request(f'/songs/{song_id}/lyrics')
    return jsonify(data)

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"success": False, "error": "Endpoint not found"}), 404
    return render_template('index.html'), 404

@app.errorhandler(500)
def server_error(e):
    logger.error(f"Server error: {str(e)}")
    return jsonify({"success": False, "error": "Internal server error"}), 500

# Vercel serverless function handler
def handler(event, context):
    return app(event, context)

# For local development
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
