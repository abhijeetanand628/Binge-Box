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

// TMDB API
const apiKey = '1d61ff71090b794ac049506ada6d922b';

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
            movieCard.innerHTML = `
            <img src="${poster}" alt="${movie.title}" />
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-rating">⭐ ${movie.vote_average}</p>
            </div>
            <button class="favorite-btn">⭐</button>
            `;

            movieCard.dataset.movieId = movie.id;
            
            movieCard.addEventListener('click', function(e){
                // e.currentTarget is the specific movieCard that was clicked.
                const card = e.currentTarget;

                // Now, we can access the dataset property of that specific card.
                const movieId = card.dataset.movieId;

                console.log('Movie ID: ', movieId);
                getMovieDetails(movieId);
            })


            const favBtn = movieCard.querySelector('.favorite-btn');
            
            const isFav = favorites.some(fav => fav.id === movie.id)
            if(isFav) {
                favBtn.classList.add('active');
            }
            
            favBtn.addEventListener('click', function(){
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
        let url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
        let response = await fetch(url);
        let data = await response.json();
        console.log(data);
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

