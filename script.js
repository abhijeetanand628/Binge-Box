const search = document.querySelector('#search-btn');
const input = document.querySelector('#search-box');
const moviesContainer = document.querySelector('#movies-container');
const home = document.querySelector('#home-link');
const favorite = document.querySelector('#favorites-link');
const logo = document.querySelector('.logo');
const h2 = document.querySelector('.section-title');
const favSection = document.querySelector('#favorites-section');
const favContainer = document.querySelector('#favorites-container');
const mainSection = document.querySelector('main');
const detailSection = document.querySelector('#details-section');
const detailContainer = document.querySelector('#details-container');
const back = document.querySelector('#back-btn');



// TMDB API
const apiKey = '1d61ff71090b794ac049506ada6d922b';
let lastSection;


logo.addEventListener('click', function(){
    home.click();
    getPopularMovies();
})

search.addEventListener('click', function(){
    if(input.value === '')
    {
        alert("Please enter a movie name")
    }
    else
    {
        getMovies(input.value);
    }
    input.value = '';
});

input.addEventListener('keyup', function(){
    if(event.key === 'Enter')
    {
        if(input.value === '')
        {
            alert("Please enter a movie name")
        }
        else
        {
            getMovies(input.value);
        }
        input.value = '';
    }
})


back.addEventListener('click', function(){
    detailSection.classList.add('hidden');
    if(lastSection === 'home')
    {
        mainSection.classList.remove('hidden');
    }
    else if(lastSection === 'favorites')
    {
        favSection.classList.remove('hidden');
    }
})



home.addEventListener('click', function(){
    home.classList.add('active');
    favorite.classList.remove('active');
    mainSection.classList.remove('hidden');
    favSection.classList.add('hidden');
})

favorite.addEventListener('click', function(){
    home.classList.remove('active');
    favorite.classList.add('active');
    mainSection.classList.add('hidden');
    favSection.classList.remove('hidden');
    showFav();
})


async function displayMovies(movies, container = moviesContainer) {
    try 
    {
        container.innerHTML = ''
        movies.forEach(movie => {
            const poster = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : `https://placehold.co/500x750/1c1c1c/aaa?text=No+Image`
            const movieCard = document.createElement('div')
            movieCard.classList.add('movie-card');
            movieCard.dataset.movieId = movie.id;
            movieCard.innerHTML = `
            <img src="${poster}" alt="${movie.title}" />
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-rating">⭐ ${movie.vote_average}</p>
            </div>
            <button class="favorite-btn">⭐</button>
            `;

            
            
            movieCard.addEventListener('click', function(e){
                // e.currentTarget is the specific movieCard that was clicked.
                const card = e.currentTarget;

                // Now, we can access the dataset property of that specific card.
                const movieId = card.dataset.movieId;
                
                if (container === moviesContainer) {
                    lastSection = "home";
                } else if (container === favContainer) {
                    lastSection = "favorites";
                }

                getMovieDetails(movieId);
                // console.log('Movie ID: ', movieId);
            })


            const favBtn = movieCard.querySelector('.favorite-btn');
            
            const isFav = favorites.some(fav => fav.id === movie.id)
            if(isFav) {
                favBtn.classList.add('active');
            }
            
            favBtn.addEventListener('click', function(e){
                e.stopPropagation();

                // save/remove from favorites
                toggleFav(movie);

                // optional: visually show selected
                favBtn.classList.toggle('active');

                if (container === favContainer) {
                    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
                    displayMovies(favs, favContainer);
                }

            });
            container.appendChild(movieCard);
        });
    } catch (error) {
        alert('Failed to fetch movie data. Please check your internet connection or check your movie name.')
    }
}


async function getPopularMovies()
{
    try 
    {
        let url =  `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
        let response = await fetch(url);
        let data = await response.json();
        displayMovies(data.results)
    }catch (error) {
        alert("Failed to fetch movie data. Please check your internet connection.");
    }
}

// Code runs automatically right when the page opens
window.addEventListener('DOMContentLoaded', () => {
    getPopularMovies();
});


async function getMovies(Movie)
{
    try 
    {
        let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${Movie}`;    
        let response = await fetch(url);
        let data = await response.json();
        displayMovies(data.results);
    } catch(error){
        alert("Failed to fetch movie data. Please check your internet connection.");
    }
}


async function getMovieDetails(movieId)
{
    try 
    {
        // Fectch movie details
        let url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`;
        let response = await fetch(url);
        let movie = await response.json();


        // Fetch credits (cast & crew)
        let creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=en-US`;
        let creditsRes = await fetch(creditsUrl);
        let credits = await creditsRes.json();

        const poster = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : `https://placehold.co/500x750/1c1c1c/aaa?text=No+Image`;

        
        // Genres
        const genres = movie.genres.map(g => g.name).join(', ') || "N/A";

        // Languages
        const languages = movie.spoken_languages.map(l => l.english_name).join(', ') || "N/A";

        // Production Companies
        const companies = movie.production_companies.map(c => c.name).join(', ') || "N/A";

        // Cast (top 5 actors)
        const cast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ') || "N/A";


        detailContainer.innerHTML = `
        <div class = "details-card">
            <img src="${poster}" alt="${movie.title}" />
            <div class="details-info">
                <h2>${movie.title}</h2>
                <p class="tagline"><em>${movie.tagline || ""}</em></p>
                <p><strong>Genres:</strong> ${genres}</p>
                <p><strong>Runtime:</strong> ${movie.runtime ? movie.runtime + " min" : "N/A"}</p>
                <p><strong>Languages:</strong> ${languages}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Rating:</strong> ⭐ ${movie.vote_average}</p>
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Cast:</strong> ${cast}</p>
                <p><strong>Production:</strong> ${companies}</p>
                <p><strong>Budget:</strong> $${movie.budget.toLocaleString()}</p>
                <p><strong>Revenue:</strong> $${movie.revenue.toLocaleString()}</p>
                ${movie.homepage ? `<p><a href="${movie.homepage}" target="_blank">Official Website</a></p>` : ""}
            </div>
        </div>
        `;

        mainSection.classList.add('hidden');
        favSection.classList.add('hidden');
        detailSection.classList.remove('hidden')

    } catch (error) {
        alert("Failed to fetch movie data. Please check your internet connection.");
    }
}


let favorites = JSON.parse(localStorage.getItem("favorites")) || [];


function toggleFav(movie)
{
    const index = favorites.findIndex(fav => fav.id === movie.id);
    if(index === -1)
    {
        // Add to favorites
        favorites.push(movie);
        console.log("ADDED");
    }
    else
    {
        // Remove from favorites
        favorites.splice(index, 1); // Remove 1 item at position "index"
        console.log("REMOVED");
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function showFav()
{
    // Always reload from localStorage to keep it fresh
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    displayMovies(favs, favContainer);
}

