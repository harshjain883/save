// Search functionality
let searchTimeout;
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const searchResults = document.getElementById('searchResults');
const filterTabs = document.querySelectorAll('.filter-tab');

let currentFilter = 'all';
let currentSearchQuery = '';

// Event Listeners
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query.length > 0) {
            clearSearchBtn.style.display = 'block';
            
            // Debounce search
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 500);
        } else {
            clearSearchBtn.style.display = 'none';
            showBrowseCategories();
        }
    });
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        showBrowseCategories();
    });
}

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        currentFilter = tab.dataset.filter;
        
        if (currentSearchQuery) {
            performSearch(currentSearchQuery);
        }
    });
});

// Search function
async function performSearch(query) {
    currentSearchQuery = query;
    
    let endpoint = '/api/search/all';
    
    switch(currentFilter) {
        case 'songs':
            endpoint = '/api/search/songs';
            break;
        case 'albums':
            endpoint = '/api/search/albums';
            break;
        case 'artists':
            endpoint = '/api/search/artists';
            break;
        case 'playlists':
            endpoint = '/api/search/playlists';
            break;
    }
    
    try {
        console.log('Searching:', query, 'Filter:', currentFilter);
        
        searchResults.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Searching...</p>
            </div>
        `;
        
        const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Search results:', data);
        
        if (data.success && data.data) {
            displaySearchResults(data.data);
        } else {
            searchResults.innerHTML = `
                <div class="loading">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error searching. Please try again.</p>
            </div>
        `;
    }
}

function displaySearchResults(data) {
    searchResults.innerHTML = '';
    
    if (currentFilter === 'all') {
        // Display all categories
        let hasResults = false;
        
        if (data.songs && data.songs.results && data.songs.results.length > 0) {
            addResultSection('Top Songs', data.songs.results);
            hasResults = true;
        }
        if (data.albums && data.albums.results && data.albums.results.length > 0) {
            addResultSection('Albums', data.albums.results);
            hasResults = true;
        }
        if (data.artists && data.artists.results && data.artists.results.length > 0) {
            addResultSection('Artists', data.artists.results);
            hasResults = true;
        }
        if (data.playlists && data.playlists.results && data.playlists.results.length > 0) {
            addResultSection('Playlists', data.playlists.results);
            hasResults = true;
        }
        
        if (!hasResults) {
            searchResults.innerHTML = `
                <div class="loading">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                </div>
            `;
        }
    } else {
        // Display specific category
        const results = data.results || data;
        if (results && results.length > 0) {
            addResultSection('Results', results);
        } else {
            searchResults.innerHTML = `
                <div class="loading">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                </div>
            `;
        }
    }
}

function addResultSection(title, items) {
    const section = document.createElement('section');
    section.className = 'content-section';
    
    const titleEl = document.createElement('h2');
    titleEl.className = 'section-title';
    titleEl.textContent = title;
    section.appendChild(titleEl);
    
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    grid.innerHTML = items.slice(0, 6).map(item => createCard(item)).join('');
    section.appendChild(grid);
    
    searchResults.appendChild(section);
}

function showBrowseCategories() {
    searchResults.innerHTML = `
        <div class="browse-categories">
            <h2 class="section-title">Browse All</h2>
            <div class="categories-grid">
                <div class="category-card" style="background: linear-gradient(135deg, #1db954, #191414);" onclick="searchCategory('Bollywood')">
                    <h3>Bollywood</h3>
                    <i class="fas fa-music"></i>
                </div>
                <div class="category-card" style="background: linear-gradient(135deg, #e61e32, #1e3264);" onclick="searchCategory('Punjabi')">
                    <h3>Punjabi</h3>
                    <i class="fas fa-music"></i>
                </div>
                <div class="category-card" style="background: linear-gradient(135deg, #f59b23, #8d67ab);" onclick="searchCategory('Pop')">
                    <h3>Pop</h3>
                    <i class="fas fa-music"></i>
                </div>
                <div class="category-card" style="background: linear-gradient(135deg, #dc148c, #e8161f);" onclick="searchCategory('Rock')">
                    <h3>Rock</h3>
                    <i class="fas fa-guitar"></i>
                </div>
                <div class="category-card" style="background: linear-gradient(135deg, #1e3264, #376996);" onclick="searchCategory('Hip Hop')">
                    <h3>Hip Hop</h3>
                    <i class="fas fa-music"></i>
                </div>
                <div class="category-card" style="background: linear-gradient(135deg, #8d67ab, #8d1b3d);" onclick="searchCategory('Electronic')">
                    <h3>Electronic</h3>
                    <i class="fas fa-headphones"></i>
                </div>
            </div>
        </div>
    `;
}

function searchCategory(category) {
    searchInput.value = category;
    clearSearchBtn.style.display = 'block';
    performSearch(category);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showBrowseCategories();
});
