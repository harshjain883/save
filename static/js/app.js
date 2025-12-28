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

// API Functions with better error handling
async function fetchHomeData() {
    try {
        console.log('Fetching home data...');
        showLoading('trendingGrid');
        showLoading('chartsGrid');
        showLoading('recommendedGrid');
        
        // Fetch modules for all sections
        const modulesResponse = await fetch('/api/modules');
        console.log('Modules response status:', modulesResponse.status);
        
        if (!modulesResponse.ok) {
            throw new Error(`HTTP error! status: ${modulesResponse.status}`);
        }
        
        const modulesData = await modulesResponse.json();
        console.log('Modules data:', modulesData);
        
        if (modulesData.success && modulesData.data) {
            // Display trending (use albums or playlists)
            if (modulesData.data.trending) {
                displayCards('trendingGrid', modulesData.data.trending.slice(0, 6));
            } else if (modulesData.data.albums) {
                displayCards('trendingGrid', modulesData.data.albums.slice(0, 6));
            }
            
            // Display charts (use playlists or charts)
            if (modulesData.data.charts) {
                displayCards('chartsGrid', modulesData.data.charts.slice(0, 6));
            } else if (modulesData.data.playlists) {
                displayCards('chartsGrid', modulesData.data.playlists.slice(0, 6));
            }
            
            // Display recommended
            if (modulesData.data.albums) {
                displayCards('recommendedGrid', modulesData.data.albums.slice(6, 12));
            } else if (modulesData.data.playlists) {
                displayCards('recommendedGrid', modulesData.data.playlists.slice(6, 12));
            }
        } else {
            console.error('No data in response:', modulesData);
            showError('trendingGrid', 'No content available');
            showError('chartsGrid', 'No content available');
            showError('recommendedGrid', 'No content available');
        }
        
    } catch (error) {
        console.error('Error fetching home data:', error);
        showError('trendingGrid', 'Failed to load content. Please refresh.');
        showError('chartsGrid', 'Failed to load content. Please refresh.');
        showError('recommendedGrid', 'Failed to load content. Please refresh.');
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
    if (!container || !items || items.length === 0) {
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <i class="fas fa-music"></i>
                    <p>No items to display</p>
                </div>
            `;
        }
        return;
    }
    
    container.innerHTML = items.map(item => createCard(item)).join('');
}

function createCard(item) {
    // Handle different image formats
    let image = 'https://via.placeholder.com/300';
    if (item.image) {
        if (Array.isArray(item.image)) {
            image = item.image[2]?.link || item.image[1]?.link || item.image[0]?.link || image;
        } else if (typeof item.image === 'string') {
            image = item.image;
        }
    }
    
    const title = item.name || item.title || 'Unknown';
    const subtitle = item.primaryArtists || item.artist || item.description || item.subtitle || '';
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
        <div class="card" onclick="handleCardClick('${type}', '${id}', '${link}')">
            <img src="${image}" alt="${title}" class="card-image" onerror="this.src='https://via.placeholder.com/300'">
            <div class="card-title">${title}</div>
            <div class="card-subtitle">${subtitle}</div>
            ${type === 'song' ? `<button class="play-button" onclick="event.stopPropagation(); playSongById('${id}')">
                <i class="fas fa-play"></i>
            </button>` : ''}
        </div>
    `;
}

function handleCardClick(type, id, link) {
    if (type === 'song') {
        playSongById(id);
    } else {
        window.location.href = link;
    }
}

// Play song by ID with better error handling
async function playSongById(songId) {
    try {
        console.log('Fetching song:', songId);
        const response = await fetch(`/api/songs/${songId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Song data:', data);
        
        if (data.success && data.data) {
            const song = Array.isArray(data.data) ? data.data[0] : data.data;
            playSong(song);
        } else {
            console.error('Failed to load song:', data);
            alert('Failed to load song. Please try again.');
        }
    } catch (error) {
        console.error('Error playing song:', error);
        alert('Error playing song. Please try again.');
    }
}

function playSong(song) {
    console.log('Playing song:', song);
    
    // Handle different download URL formats
    let audioUrl = null;
    if (song.downloadUrl) {
        if (Array.isArray(song.downloadUrl)) {
            // Try to get highest quality
            audioUrl = song.downloadUrl[song.downloadUrl.length - 1]?.link || 
                       song.downloadUrl[0]?.link;
        } else if (typeof song.downloadUrl === 'string') {
            audioUrl = song.downloadUrl;
        }
    }
    
    // Fallback to url field
    if (!audioUrl && song.url) {
        audioUrl = song.url;
    }
    
    if (!audioUrl) {
        console.error('No audio URL found in song data:', song);
        alert('Unable to play this song. No audio URL available.');
        return;
    }
    
    console.log('Audio URL:', audioUrl);
    
    // Get image URL
    let imageUrl = 'https://via.placeholder.com/300';
    if (song.image) {
        if (Array.isArray(song.image)) {
            imageUrl = song.image[2]?.link || song.image[1]?.link || song.image[0]?.link || imageUrl;
        } else if (typeof song.image === 'string') {
            imageUrl = song.image;
        }
    }
    
    // Update player UI
    document.getElementById('playerImage').src = imageUrl;
    document.getElementById('playerTitle').textContent = song.name || song.title || 'Unknown';
    document.getElementById('playerArtist').textContent = song.primaryArtists || song.artist || 'Unknown Artist';
    
    // Play audio
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = audioUrl;
    
    audioPlayer.play().then(() => {
        console.log('Playing audio successfully');
    }).catch(error => {
        console.error('Error playing audio:', error);
        alert('Failed to play audio. The audio format might not be supported.');
    });
    
    // Update play button
    const playBtn = document.getElementById('playBtn');
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, pathname:', window.location.pathname);
    if (window.location.pathname === '/') {
        fetchHomeData();
    }
});
