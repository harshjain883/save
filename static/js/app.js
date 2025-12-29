// Global state
let currentQueue = [];
let currentSongIndex = 0;

// Utility functions
function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// API Functions
async function fetchHomeData() {
    try {
        console.log('Fetching home data...');
        showLoading('trendingGrid');
        showLoading('chartsGrid');
        showLoading('recommendedGrid');
        
        const response = await fetch('/api/modules');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Modules data:', result);
        
        if (result.success && result.data) {
            const modules = result.data;
            
            // Display different sections
            if (modules.trending) {
                displayCards('trendingGrid', modules.trending.albums || modules.trending);
            } else if (modules.albums) {
                displayCards('trendingGrid', modules.albums.slice(0, 6));
            }
            
            if (modules.charts) {
                displayCards('chartsGrid', modules.charts.slice(0, 6));
            } else if (modules.playlists) {
                displayCards('chartsGrid', modules.playlists.slice(0, 6));
            }
            
            if (modules.playlists) {
                displayCards('recommendedGrid', modules.playlists.slice(6, 12));
            } else if (modules.albums) {
                displayCards('recommendedGrid', modules.albums.slice(6, 12));
            }
        } else {
            throw new Error('No data received');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('trendingGrid', 'Failed to load. Please refresh.');
        showError('chartsGrid', 'Failed to load. Please refresh.');
        showError('recommendedGrid', 'Failed to load. Please refresh.');
    }
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading...</p>
            </div>
        `;
    }
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

function displayCards(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-music"></i>
                <p>No items available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(item => createCard(item)).join('');
}

function createCard(item) {
    let image = 'https://via.placeholder.com/300';
    
    if (item.image) {
        if (Array.isArray(item.image)) {
            image = item.image[2]?.url || item.image[2]?.link || 
                   item.image[1]?.url || item.image[1]?.link || 
                   item.image[0]?.url || item.image[0]?.link || image;
        } else if (typeof item.image === 'string') {
            image = item.image;
        } else if (item.image.url) {
            image = item.image.url;
        }
    }
    
    const title = item.name || item.title || 'Unknown';
    const subtitle = item.description || item.subtitle || item.artistMap?.artists?.map(a => a.name).join(', ') || '';
    const type = item.type || 'album';
    const id = item.id;
    
    let link = '#';
    if (type === 'album') link = `/album/${id}`;
    else if (type === 'artist') link = `/artist/${id}`;
    else if (type === 'playlist') link = `/playlist/${id}`;
    else if (type === 'song') link = `javascript:playSongById('${id}')`;
    
    return `
        <div class="card" onclick="handleCardClick('${type}', '${id}', '${link.replace(/'/g, "\\'")}')">
            <img src="${image}" alt="${title}" class="card-image" onerror="this.src='https://via.placeholder.com/300'">
            <div class="card-title">${title}</div>
            <div class="card-subtitle">${subtitle}</div>
            ${type === 'song' ? `
                <button class="play-button" onclick="event.stopPropagation(); playSongById('${id}')">
                    <i class="fas fa-play"></i>
                </button>
            ` : ''}
        </div>
    `;
}

function handleCardClick(type, id, link) {
    if (type === 'song') {
        playSongById(id);
    } else if (link && link !== '#' && !link.startsWith('javascript:')) {
        window.location.href = link;
    }
}

// Play song
async function playSongById(songId) {
    try {
        console.log('Fetching song:', songId);
        
        const response = await fetch(`/api/songs/${songId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const result = await response.json();
        console.log('Song data:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            playSong(result.data[0]);
        } else {
            alert('Failed to load song');
        }
    } catch (error) {
        console.error('Error playing song:', error);
        alert('Error playing song: ' + error.message);
    }
}

function playSong(song) {
    console.log('Playing:', song);
    
    // Get audio URL
    let audioUrl = null;
    if (song.downloadUrl) {
        if (Array.isArray(song.downloadUrl)) {
            const quality = song.downloadUrl.find(q => q.quality === '320kbps') || 
                          song.downloadUrl.find(q => q.quality === '160kbps') || 
                          song.downloadUrl[song.downloadUrl.length - 1];
            audioUrl = quality?.url || quality?.link;
        } else if (typeof song.downloadUrl === 'string') {
            audioUrl = song.downloadUrl;
        }
    }
    
    if (!audioUrl && song.url) audioUrl = song.url;
    
    if (!audioUrl) {
        console.error('No audio URL found');
        alert('No playable audio found for this song');
        return;
    }
    
    console.log('Audio URL:', audioUrl);
    
    // Get image
    let imageUrl = 'https://via.placeholder.com/300';
    if (song.image) {
        if (Array.isArray(song.image)) {
            imageUrl = song.image[2]?.url || song.image[2]?.link || 
                      song.image[1]?.url || song.image[0]?.url || imageUrl;
        } else if (typeof song.image === 'string') {
            imageUrl = song.image;
        }
    }
    
    // Update player
    document.getElementById('playerImage').src = imageUrl;
    document.getElementById('playerTitle').textContent = song.name || song.title || 'Unknown';
    document.getElementById('playerArtist').textContent = 
        song.artistMap?.artists?.map(a => a.name).join(', ') || 
        song.artists || 'Unknown Artist';
    
    // Play
    const audio = document.getElementById('audioPlayer');
    audio.src = audioUrl;
    audio.play().catch(err => {
        console.error('Play error:', err);
        alert('Failed to play audio. Browser may have blocked it.');
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    if (window.location.pathname === '/') {
        fetchHomeData();
    }
});
