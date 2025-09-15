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
        alert("Please enter a movie/series name")
    }
    else
    {
        getMoviesSeries(input.value);
    }
    input.value = '';
});

input.addEventListener('keyup', function(){
    if(event.key === 'Enter')
    {
        if(input.value === '')
        {
            alert("Please enter a movie/series name")
        }
        else
        {
            getMoviesSeries(input.value);
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
        container.innerHTML = '';
        movies.forEach(movie => {

            // TMDB returns title for movies, name for TV shows
            const title = movie.title || movie.name || "Untitled";

            // release_date (movies) OR first_air_date (TV shows)
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

            const poster = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : `https://placehold.co/500x750/1c1c1c/aaa?text=No+Image`

            const movieCard = document.createElement('div')
            movieCard.classList.add('movie-card');
            movieCard.dataset.movieId = movie.id;

            // Store BOTH id & media_type (important for details + favorites)
            movieCard.dataset.mediaType = movie.media_type || (movie.title ? "movie" : "tv"); // default = movie

            movieCard.innerHTML = `
            <img src="${poster}" alt="${title}" />
            <div class="movie-info">
                <h3 class="movie-title">${title}</h3>
                <p class="movie-rating">⭐ ${rating || "N/A"}</p>
            </div>
            <button class="favorite-btn">⭐</button>
            `;

            
            movieCard.addEventListener('click', function(e){
                // e.currentTarget is the specific movieCard that was clicked.
                const card = e.currentTarget;

                // Now, we can access the dataset property of that specific card.
                const movieId = card.dataset.movieId;

                const mediaType = card.dataset.mediaType;
                
                if (container === moviesContainer) {
                    lastSection = "home";
                } else if (container === favContainer) {
                    lastSection = "favorites";
                }

                getMovieDetails(movieId, mediaType);
                // console.log('Movie ID: ', movieId);
            })

            // Favorite button
            const favBtn = movieCard.querySelector('.favorite-btn');
            
            const isFav = favorites.some(
                 fav => fav.id === movie.id && fav.media_type === (movie.media_type || (movie.title ? "movie" : "tv"))
            )
            if(isFav) {
                favBtn.classList.add('active');
            }
            
            favBtn.addEventListener('click', function(e){
                e.stopPropagation();

                // Save id + media_type in favorites
                const action = toggleFav({
                    id: movie.id,
                    media_type: movie.media_type || (movie.title ? "movie" : "tv"),
                    title: title,
                    poster_path: movie.poster_path,
                    vote_average: movie.vote_average,
                    release_date: movie.release_date,
                    first_air_date: movie.first_air_date
                });

                // optional: visually show selected
                if (action === "added") 
                {
                    favBtn.classList.add('active');
                } 
                else 
                {
                    favBtn.classList.remove('active');
                }

                if (container === favContainer) {
                    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
                    displayMovies(favs, favContainer);
                }

            });
            container.appendChild(movieCard);
        });
    } catch (error) {
        alert('Failed to fetch movie/series data. Please check your internet connection or check your movie name.')
    }
}


async function getPopularMovies()
{
    try 
    {
        // MOVIES
        let movieUrl =  `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
        let movieRes = await fetch(movieUrl);
        let movie = await movieRes.json();

        // TV SERIES
        let seriesUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}`;
        let seriesRes = await fetch(seriesUrl);
        let series = await seriesRes.json();

        // COMBINE THEM
        let combined = [...movie.results, ...series.results];
        displayMovies(combined);
    }catch (error) {
        alert("Failed to fetch movie/series data. Please check your internet connection.");
    }
}

// Code runs automatically right when the page opens
window.addEventListener('DOMContentLoaded', () => {
    getPopularMovies();
});


async function getMoviesSeries(Movie)
{
    try 
    {
        let url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${Movie}`;    
        let response = await fetch(url);
        let data = await response.json();
        displayMovies(data.results);
    } catch(error){
        alert("Failed to fetch movie/series data. Please check your internet connection.");
    }
}


async function getMovieDetails(movieId, mediaType = "movie")
{
    try 
    {
        // Dynamically pick endpoint based on mediaType (movie or tv)
        let url = `https://api.themoviedb.org/3/${mediaType}/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=credits,videos`;
        let response = await fetch(url);
        let movie = await response.json();


        // // Fetch credits (cast & crew)
        // let creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=en-US`;
        // let creditsRes = await fetch(creditsUrl);
        // let credits = await creditsRes.json();

        // // Fetch video trailers
        // let videosUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`;
        // let videosRes = await fetch(videosUrl);
        // let videos = await videosRes.json();

            const poster = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : `https://placehold.co/500x750/1c1c1c/aaa?text=No+Image`;
            
            // Title, movies use title, TV shows use name
            const title = movie.title || movie.name || "Untitled";

            // Release Date , release_date (movies), first_air_date (TV shows)
            const releaseDate = movie.release_date || movie.first_air_date || "N/A";

            // Genres
            const genres = movie.genres.map(g => g.name).join(', ') || "N/A";

            // Languages
            const languages = movie.spoken_languages.map(l => l.english_name).join(', ') || "N/A";

            // Production Companies
            const companies = movie.production_companies.map(c => c.name).join(', ') || "N/A";

            // Cast (top 6 actors)
            const cast = movie.credits?.cast?.slice(0, 6).map(actor => actor.name).join(', ') || "N/A";

            // Pick the 1st trailer
            const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');


            detailContainer.innerHTML = `
            <div class = "details-card">
                <img src="${poster}" alt="${title}" />
                <div class="details-info">
                    <h2>${title}</h2>
                    <p class="tagline"><em>${movie.tagline || ""}</em></p>
                    <p><strong>Genres:</strong> ${genres}</p>
                    <p><strong>Runtime:</strong> ${movie.runtime 
                    ? movie.runtime + " min" 
                    : movie.episode_run_time?.length ? movie.episode_run_time[0] + " min/episode" 
                    : "N/A"}</p>
                    <p><strong>Languages:</strong> ${languages}</p>
                    <p><strong>Release Date:</strong> ${releaseDate}</p>
                    <p><strong>Rating:</strong> ⭐ ${movie.vote_average}</p>
                    <p><strong>Overview:</strong> ${movie.overview}</p>
                    <p><strong>Cast:</strong> ${cast}</p>
                    <p><strong>Production:</strong> ${companies}</p>
                    ${mediaType === "movie" ? `<p><strong>Budget:</strong> $${movie.budget.toLocaleString()}</p>` : ""}
                    ${mediaType === "movie" ? `<p><strong>Revenue:</strong> $${movie.revenue.toLocaleString()}</p>` : ""}
                    ${movie.homepage ? `<p>Website: <a href="${movie.homepage}" target="_blank">Official Website</a></p>` : ""}
                    ${trailer ? `<p>Trailer: <a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank">Watch Trailer</a></p>` : ""}
                </div>
            </div>
            `;

            mainSection.classList.add('hidden');
            favSection.classList.add('hidden');
            detailSection.classList.remove('hidden')

        } catch (error) {
            alert("Failed to fetch movie/series data. Please check your internet connection.");
    }
}


let favorites = JSON.parse(localStorage.getItem("favorites")) || [];


function toggleFav(item)
{

    const favItem = {
        id: item.id,
        media_type: item.media_type || (item.title ? "movie" : "tv"),
        title: item.title || item.name || "Untitled",                 
        poster_path: item.poster_path || null,
        vote_average: item.vote_average || 0
    };

    const index = favorites.findIndex(
        fav => fav.id === favItem.id && fav.media_type === favItem.media_type
    );

    let action;

    if(index === -1)
    {
        // Add to favorites
        favorites.push(favItem);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        console.log("ADDED", favItem.title);
        return "added"; 
    }
    else
    {
        // Remove from favorites
        favorites.splice(index, 1); // Remove 1 item at position "index"
        localStorage.setItem("favorites", JSON.stringify(favorites));
        console.log("REMOVED", favItem.title);
        return "removed"; 
    }
}

function showFav()
{
    // Always reload from localStorage to keep it fresh
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    displayMovies(favs, favContainer);
}

