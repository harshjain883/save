// Global state
let currentQueue = [];
let currentSongIndex = 0;

// Utility functions
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// API Functions
async function fetchHomeData() {
    try {
        showLoading('trendingGrid');
        showLoading('chartsGrid');
        
        // Fetch trending songs
        const trendingResponse = await fetch('/api/trending');
        const trendingData = await trendingResponse.json();
        
        if (trendingData.success) {
            displayCards('trendingGrid', trendingData.data.songs || trendingData.data);
        }
        
        // Fetch charts
        const chartsResponse = await fetch('/api/charts');
        const chartsData = await chartsResponse.json();
        
        if (chartsData.success) {
            displayCards('chartsGrid', chartsData.data);
        }
        
        // Fetch modules for recommended
        const modulesResponse = await fetch('/api/modules');
        const modulesData = await modulesResponse.json();
        
        if (modulesData.success && modulesData.data.albums) {
            displayCards('recommendedGrid', modulesData.data.albums.slice(0, 6));
        }
        
    } catch (error) {
        console.error('Error fetching home data:', error);
        showError('trendingGrid', 'Failed to load content');
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
    if (!container || !items) return;
    
    container.innerHTML = items.map(item => createCard(item)).join('');
}

function createCard(item) {
    const image = item.image?.[2]?.link || item.image || 'https://via.placeholder.com/300';
    const title = item.name || item.title || 'Unknown';
    const subtitle = item.primaryArtists || item.artist || item.description || '';
    const type = item.type || 'song';
    const id = item.id;
    
    let link = '#';
    if (type === 'album') {
        link = `/album/${id}`;
    } else if (type === 'artist') {
        link = `/artist/${id}`;
    } else if (type === 'playlist') {
        link = `/playlist/${id}`;
    }
    
    return `
        <div class="card" onclick="window.location.href='${link}'">
            <img src="${image}" alt="${title}" class="card-image">
            <div class="card-title">${title}</div>
            <div class="card-subtitle">${subtitle}</div>
            ${type === 'song' ? `<button class="play-button" onclick="event.stopPropagation(); playSongById('${id}')">
                <i class="fas fa-play"></i>
            </button>` : ''}
        </div>
    `;
}

// Play song by ID
async function playSongById(songId) {
    try {
        const response = await fetch(`/api/songs/${songId}`);
        const data = await response.json();
        
        if (data.success) {
            const song = data.data[0];
            playSong(song);
        }
    } catch (error) {
        console.error('Error playing song:', error);
    }
}

function playSong(song) {
    const audioUrl = song.downloadUrl?.[4]?.link || song.downloadUrl?.[0]?.link || song.url;
    
    if (!audioUrl) {
        console.error('No audio URL found');
        return;
    }
    
    // Update player UI
    document.getElementById('playerImage').src = song.image?.[2]?.link || song.image;
    document.getElementById('playerTitle').textContent = song.name || song.title;
    document.getElementById('playerArtist').textContent = song.primaryArtists || song.artist;
    
    // Play audio
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = audioUrl;
    audioPlayer.play();
    
    // Update play button
    const playBtn = document.getElementById('playBtn');
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/') {
        fetchHomeData();
    }
});
