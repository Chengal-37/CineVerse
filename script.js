// A. API Key and Base URLs
const TMDB_API_KEY = '42e01560a185b6cbe4368e3d4ce100a5';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// B. DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const contentArea = document.getElementById('content-area');
const movieSlider = document.getElementById('movie-slider');
const categorySections = document.getElementById('category-sections');
const prevButton = document.getElementById('prev-slide');
const nextButton = document.getElementById('next-slide');
const advancedSearchBtn = document.getElementById('advanced-search-btn');
const advancedSearchForm = document.getElementById('advanced-search-form');
const genreSelect = document.getElementById('genre-select');
const ratingInput = document.getElementById('rating-input');
const languageSelect = document.getElementById('language-select');
const yearInput = document.getElementById('year-input');

// C. API Endpoints
const ENDPOINTS = {
    trending: `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`,
    genreList: `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`,
    languageList: `${TMDB_BASE_URL}/configuration/languages?api_key=${TMDB_API_KEY}`,
    search: `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=`,
    discover: `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc`,
    movieDetails: (id) => `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
};

// D. Initial Page Load and Setup
// New: State management for pagination
let currentState = {
    currentPage: 1,
    lastSearchQuery: '',
    lastSearchUrl: ''
};

document.addEventListener('DOMContentLoaded', async () => {
    addCardClickListeners();
    populateGenres();
    populateLanguages();
    renderHomePage();
});

async function renderHomePage() {
    contentArea.innerHTML = `
        <section class="slider-section">
            <h2>Trending Movies</h2>
            <div class="slider-container">
                <button id="prev-slide" class="slide-button">&lt;</button>
                <div id="movie-slider" class="movie-slider"></div>
                <button id="next-slide" class="slide-button">&gt;</button>
            </div>
        </section>
        <section id="category-sections"></section>
    `;
    const trendingMovies = await fetchFromTMDB(ENDPOINTS.trending);
    const movieSliderElement = document.getElementById('movie-slider');
    const prevButtonElement = document.getElementById('prev-slide');
    const nextButtonElement = document.getElementById('next-slide');
    renderMovieSlider(trendingMovies.results, movieSliderElement);
    setupSliderControls(movieSliderElement, prevButtonElement, nextButtonElement);
    setupMouseDragging(movieSliderElement);
    await renderCategorizedMovies();
}

// E. Search Functionality (Now handles both simple and advanced)
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        currentState.lastSearchQuery = query;
        currentState.lastSearchUrl = ENDPOINTS.search + query;
        searchMovies(currentState.lastSearchUrl, 1, `Search Results for "${query}"`);
    }
});

advancedSearchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedGenreId = genreSelect.value;
    const minRating = ratingInput.value;
    const selectedLanguage = languageSelect.value;
    const releaseYear = yearInput.value;
    let url = ENDPOINTS.discover;

    if (selectedGenreId) {
        url += `&with_genres=${selectedGenreId}`;
    }
    if (minRating && minRating >= 0 && minRating <= 10) {
        url += `&vote_average.gte=${minRating}`;
    }
    if (selectedLanguage) {
        url += `&with_original_language=${selectedLanguage}`;
    }
    if (releaseYear) {
        url += `&primary_release_year=${releaseYear}`;
    }

    if (selectedGenreId || minRating || selectedLanguage || releaseYear) {
        currentState.lastSearchQuery = '';
        currentState.lastSearchUrl = url;
        searchMovies(url, 1, 'Filtered Results');
    } else {
        alert('Please select at least one filter option.');
    }
});

// New: Centralized function for all searches
async function searchMovies(url, page, title) {
    currentState.currentPage = page;
    const fullUrl = `${url}&page=${page}`;
    
    contentArea.innerHTML = `<div class="loading-spinner"></div>`;

    const searchResults = await fetchFromTMDB(fullUrl);
    renderMovieGrid(searchResults.results, title, searchResults.total_pages);
}

// F. Core API Fetching Function
async function fetchFromTMDB(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return { results: [], total_pages: 0 };
    }
}

// G. Rendering Functions
function renderMovieSlider(movies, sliderElement) {
    const movieCardsHtml = movies.map(movie => {
        if (movie.poster_path) {
            return `
                <div class="movie-card" data-movie-id="${movie.id}">
                    <img src="${TMDB_IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title} poster">
                    <div class="card-info">
                        <h3>${movie.title}</h3>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="movie-card no-image" data-movie-id="${movie.id}">
                    <i class="fa-solid fa-film"></i>
                    <div class="card-info">
                        <h3>${movie.title}</h3>
                    </div>
                </div>
            `;
        }
    }).join('');
    sliderElement.innerHTML = movieCardsHtml;
}

// Updated to include pagination
function renderMovieGrid(movies, title, totalPages) {
    contentArea.innerHTML = '';
    
    const backBtn = document.createElement('button');
    backBtn.classList.add('back-btn');
    backBtn.textContent = '← Back to Home';
    backBtn.addEventListener('click', renderHomePage);
    contentArea.appendChild(backBtn);
    
    const gridContainer = document.createElement('div');
    gridContainer.innerHTML = `<div class="loading-spinner"></div>`;
    contentArea.appendChild(gridContainer);
    
    if (movies.length === 0) {
        gridContainer.innerHTML = `<div class="not-found">No movies found for "${title}".<br><br><a href="#" onclick="renderHomePage(); return false;">Go back to the homepage.</a></div>`;
        return;
    }
    
    const section = document.createElement('section');
    section.classList.add('movie-grid-section');
    section.innerHTML = `<h2>${title}</h2><div class="movie-grid"></div>`;
    
    const innerGrid = section.querySelector('.movie-grid');
    const movieCardsHtml = movies.map(movie => {
        if (movie.poster_path) {
            return `
                <div class="movie-card" data-movie-id="${movie.id}">
                    <img src="${TMDB_IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title} poster">
                    <div class="card-info">
                        <h3>${movie.title}</h3>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="movie-card no-image" data-movie-id="${movie.id}">
                    <i class="fa-solid fa-film"></i>
                    <div class="card-info">
                        <h3>${movie.title}</h3>
                    </div>
                </div>
            `;
        }
    }).join('');

    innerGrid.innerHTML = movieCardsHtml;
    gridContainer.innerHTML = ''; 
    gridContainer.appendChild(section);

    if (totalPages > 1) {
        renderPaginationControls(totalPages);
    }
}

function renderPaginationControls(totalPages) {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');

    const prevBtn = document.createElement('button');
    prevBtn.id = 'prev-page';
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentState.currentPage === 1;
    prevBtn.addEventListener('click', () => {
        searchMovies(currentState.lastSearchUrl, currentState.currentPage - 1, `Page ${currentState.currentPage - 1}`);
    });

    const pageNumber = document.createElement('span');
    pageNumber.classList.add('page-number');
    pageNumber.textContent = `${currentState.currentPage} / ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.id = 'next-page';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentState.currentPage >= totalPages;
    nextBtn.addEventListener('click', () => {
        searchMovies(currentState.lastSearchUrl, currentState.currentPage + 1, `Page ${currentState.currentPage + 1}`);
    });

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageNumber);
    paginationContainer.appendChild(nextBtn);
    contentArea.appendChild(paginationContainer);
}


async function renderCategorizedMovies() {
    const genres = await fetchFromTMDB(ENDPOINTS.genreList);
    const categorySections = document.getElementById('category-sections');
    if (!categorySections) return;
    
    categorySections.innerHTML = '';

    for (const genre of genres.genres) {
        const genreMoviesUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genre.id}`;
        const genreMovies = await fetchFromTMDB(genreMoviesUrl);

        if (genreMovies.results.length > 0) {
            const movieCardsHtml = genreMovies.results.map(movie => {
                if (movie.poster_path) {
                    return `
                        <div class="movie-card" data-movie-id="${movie.id}">
                            <img src="${TMDB_IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title} poster">
                            <div class="card-info">
                                <h3>${movie.title}</h3>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="movie-card no-image" data-movie-id="${movie.id}">
                            <i class="fa-solid fa-film"></i>
                            <div class="card-info">
                                <h3>${movie.title}</h3>
                            </div>
                        </div>
                    `;
                }
            }).join('');

            categorySections.innerHTML += `
                <section class="category-section">
                    <h2>${genre.name} Movies</h2>
                    <div class="movie-grid">
                        ${movieCardsHtml}
                    </div>
                </section>
            `;
        }
    }
}

// H. Event Listeners for Movie Cards (Refactored for delegation)
function addCardClickListeners() {
    contentArea.addEventListener('click', (event) => {
        const movieCard = event.target.closest('.movie-card');
        if (movieCard) {
            const movieId = movieCard.dataset.movieId;
            if (movieId) {
                renderMovieDetails(movieId);
            }
        }
    });
}

// I. Advanced Search Functionality
advancedSearchBtn.addEventListener('click', () => {
    advancedSearchForm.classList.toggle('hidden');
});

async function populateGenres() {
    const data = await fetchFromTMDB(ENDPOINTS.genreList);
    genreSelect.innerHTML = '<option value="">All Genres</option>';
    data.genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.name;
        genreSelect.appendChild(option);
    });
}

async function populateLanguages() {
    const data = await fetchFromTMDB(ENDPOINTS.languageList);
    
    data.sort((a, b) => {
        if (a.english_name < b.english_name) return -1;
        if (a.english_name > b.english_name) return 1;
        return 0;
    });

    languageSelect.innerHTML = '<option value="">All Languages</option>';
    data.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.iso_639_1;
        option.textContent = lang.english_name;
        languageSelect.appendChild(option);
    });
}

// J. Slider Functionality
function setupSliderControls(sliderElement, prevButton, nextButton) {
    if (sliderElement.firstElementChild) {
        const movieCardWidth = sliderElement.firstElementChild.getBoundingClientRect().width + 24;
        
        prevButton.addEventListener('click', () => {
            sliderElement.scrollBy({
                left: -movieCardWidth,
                behavior: 'smooth'
            });
        });

        nextButton.addEventListener('click', () => {
            sliderElement.scrollBy({
                left: movieCardWidth,
                behavior: 'smooth'
            });
        });
    }
}

function setupMouseDragging(sliderElement) {
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleStart = (e) => {
        isDragging = true;
        const pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
        startX = pageX - sliderElement.offsetLeft;
        scrollLeft = sliderElement.scrollLeft;
        sliderElement.style.cursor = 'grabbing';
    };

    const handleEnd = () => {
        isDragging = false;
        sliderElement.style.cursor = 'grab';
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
        const x = pageX - sliderElement.offsetLeft;
        const walk = (x - startX) * 1.5;
        sliderElement.scrollLeft = scrollLeft - walk;
    };

    sliderElement.addEventListener('mousedown', handleStart);
    sliderElement.addEventListener('mouseleave', handleEnd);
    sliderElement.addEventListener('mouseup', handleEnd);
    sliderElement.addEventListener('mousemove', handleMove);

    sliderElement.addEventListener('touchstart', handleStart);
    sliderElement.addEventListener('touchend', handleEnd);
    sliderElement.addEventListener('touchcancel', handleEnd);
    sliderElement.addEventListener('touchmove', handleMove);
}

// K. Movie Details & Reviews
async function renderMovieDetails(movieId) {
    contentArea.innerHTML = '';
    
    const backBtn = document.createElement('button');
    backBtn.classList.add('back-btn');
    backBtn.textContent = '← Back to Home';
    backBtn.addEventListener('click', renderHomePage);
    contentArea.appendChild(backBtn);
    
    const detailsContainer = document.createElement('div');
    detailsContainer.innerHTML = `<div class="loading-spinner"></div>`;
    contentArea.appendChild(detailsContainer);

    try {
        const movie = await fetchFromTMDB(ENDPOINTS.movieDetails(movieId));
        
        const posterHtml = movie.poster_path ? `<img src="${TMDB_IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title} poster" class="details-poster">` : `<div class="details-poster-fallback"><i class="fa-solid fa-film"></i></div>`;

        // New: Extracting detailed information
        const director = movie.credits.crew.find(person => person.job === 'Director');
        const cast = movie.credits.cast.slice(0, 5); // Get top 5 actors
        const runtimeMinutes = movie.runtime;
        const runtimeFormatted = `${Math.floor(runtimeMinutes / 60)}h ${runtimeMinutes % 60}m`;
        
        const castList = cast.map(actor => `<li>${actor.name}</li>`).join('');

        let detailsHTML = `
            <div class="movie-details-container">
                ${posterHtml}
                <div class="details-content">
                    <h2 class="movie-title">${movie.title} (${movie.release_date.substring(0, 4)})</h2>
                    <p><strong>Genre:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
                    <p><strong>Runtime:</strong> ${runtimeFormatted}</p>
                    <p><strong>Director:</strong> ${director ? director.name : 'N/A'}</p>
                    <p><strong>Plot:</strong> ${movie.overview}</p>
                    <p><strong>IMDB Rating:</strong> ${movie.vote_average.toFixed(1)} / 10</p>
                    <h4>Starring:</h4>
                    <ul>${castList}</ul>
                    <div class="user-reviews-section">
                        <h3>User Reviews</h3>
                        <div id="reviews-list" class="reviews-list"></div>
                        <form id="review-form" class="review-form">
                            <h4>Leave a Review</h4>
                            <textarea id="review-text" placeholder="Your review..." required></textarea>
                            <div class="rating-container">
                                <span class="rating-label">Rate this movie:</span>
                                <div id="star-rating-container"></div>
                            </div>
                            <button type="submit">Submit Review</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        detailsContainer.innerHTML = detailsHTML;
        
        const starRatingContainer = document.getElementById('star-rating-container');
        const starTemplate = document.getElementById('rating-stars-template').content.cloneNode(true);
        starRatingContainer.appendChild(starTemplate);

        setupReviewForm(movieId);
        loadReviews(movieId);

    } catch (error) {
        detailsContainer.innerHTML = `<div class="error-message">Could not load movie details.</div>`;
        console.error(error);
    }
}

function setupStarRating() {
    const reviewForm = document.getElementById('review-form');
    reviewForm.querySelector('#star-rating-container').addEventListener('click', (event) => {
        const star = event.target.closest('.star');
        if (star) {
            const ratingValue = star.dataset.value;
            const stars = reviewForm.querySelectorAll('.star');
            stars.forEach(s => {
                if (s.dataset.value <= ratingValue) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            reviewForm.dataset.rating = ratingValue;
        }
    });
}

function setupReviewForm(movieId) {
    const reviewForm = document.getElementById('review-form');
    setupStarRating(); 
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const reviewText = document.getElementById('review-text').value;
        const rating = reviewForm.dataset.rating;

        if (reviewText && rating) {
            const newReview = { text: reviewText, rating: parseInt(rating) };
            saveReview(movieId, newReview);
            reviewForm.reset();
            delete reviewForm.dataset.rating;
        } else {
            alert('Please provide both a review and a rating.');
        }
    });
}

function saveReview(movieId, newReview) {
    const key = `reviews_${movieId}`;
    const existingReviews = JSON.parse(localStorage.getItem(key)) || [];
    existingReviews.push(newReview);
    localStorage.setItem(key, JSON.stringify(existingReviews));
    loadReviews(movieId);
}

function loadReviews(movieId) {
    const reviewsList = document.getElementById('reviews-list');
    const key = `reviews_${movieId}`;
    const reviews = JSON.parse(localStorage.getItem(key)) || [];

    reviewsList.innerHTML = '';
    if (reviews.length > 0) {
        const reviewsHtml = reviews.map(review => {
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                starsHTML += `<span class="star-display ${i <= review.rating ? 'active' : ''}">&#9733;</span>`;
            }

            return `
                <div class="review-item">
                    <div class="review-header">
                        <div class="rating-display">${starsHTML}</div>
                    </div>
                    <p class="review-text">${review.text}</p>
                </div>
            `;
        }).join('');
        reviewsList.innerHTML = reviewsHtml;
    } else {
        reviewsList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to share your thoughts!</p>';
    }
}