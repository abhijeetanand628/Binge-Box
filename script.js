const search = document.querySelector('#search-btn');
const input = document.querySelector('#search-box');
const moviesContainer = document.querySelector('#movies-container');
const home = document.querySelector('#home-link');
const favorite = document.querySelector('#favorites-link');
const logo = document.querySelector('.logo');

// TMDB API
const apiKey = '1d61ff71090b794ac049506ada6d922b';

logo.addEventListener('click', function(){
    home.click();
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
})

favorite.addEventListener('click', function(){
    home.classList.remove('active');
    favorite.classList.add('active');
})

async function displayMovies(movies) {
    try 
    {
        moviesContainer.innerHTML = ''
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
            moviesContainer.appendChild(movieCard);
        });
    } catch (error) {
        alert('Failed to fetch movie data. Please check your internet connection or check your movie name.')
    }
}

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


function saveData()
{
    localStorage.setItem("favorites", JSON.stringify(array))
}

function loadData()
{
    favorite.innerHTML = localStorage.getItem("favorites") || "";
}