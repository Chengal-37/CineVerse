CineVerse
A Dynamic Movie Browsing Application
MovieHub is a responsive, single-page web application for exploring movies and user reviews. Built with plain HTML, CSS, and JavaScript, it connects to The Movie Database (TMDB) API to provide a seamless and interactive browsing experience without the need for a backend.

✨ Features
Dynamic Home Page: Displays trending movies in a horizontal slider and categorized lists (e.g., Action, Comedy).

Search and Advanced Filtering: Easily find movies by title or use advanced filters to narrow down results by genre, rating, language, and release year.

Detailed Movie Pages: Click on any movie to view comprehensive details, including the plot, director, top cast members, and runtime.

User Reviews: Leave your own reviews and ratings for any movie. Your reviews are saved locally in the browser's storage.

Responsive UI: The layout adapts smoothly to different screen sizes, from desktops to mobile phones.

Interactive Design: Includes visual feedback such as a dynamic loading spinner and a movie reel icon for movies without a poster image.

Pagination: Navigate through long lists of search and filter results with intuitive pagination controls.

💻 Technologies Used
HTML5: For the semantic structure of the application.

CSS3: For all styling, including modern layouts and animations.

JavaScript (ES6+): Powers all dynamic functionality, API requests, and DOM manipulation.

The Movie Database (TMDB) API: The primary source for all movie data.

Font Awesome: For scalable vector icons, such as the movie reel and loading spinner.

🚀 How to Run the Project
Clone the repository:

Bash

git clone [your-repository-url]
cd [your-project-folder]
Get a TMDB API Key:

Sign up for a free account on The Movie Database.

Go to your account settings and create a new API key (v3).

Update the API Key in the code:

Open the script.js file.

Replace the placeholder value for TMDB_API_KEY with your newly generated key:

JavaScript

const TMDB_API_KEY = 'YOUR_API_KEY_GOES_HERE';
Open in Browser:

Simply open the index.html file in your preferred web browser.

🗺️ Future Enhancements
Movie Trailers: Embed YouTube trailers directly on the movie details page.

User Watchlist: Add functionality for users to save movies to a personal watchlist.

Improved Search: Implement a more robust search with live suggestions.

Persistent Reviews: Store user reviews in a database (e.g., Firebase) to make them accessible to all users.

🙏 Acknowledgments
The Movie Database (TMDB) for providing the comprehensive movie data API.
