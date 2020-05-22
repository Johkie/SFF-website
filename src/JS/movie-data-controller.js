
async function getMovieList() {
    var trivia = await getMovieTrivias();
    var movieList = [];
    
    await fetchDataAsync(apiURL + "/film")
    .then(data => data.forEach(function(movie) {
        
        let movieImg = getPlaceholderMoviePoster(movie.name);
        let trivias = trivia.filter(t => t.filmId == movie.id);

        movie["img"] = movieImg; 

        var m = { movie, trivias};
        movieList.push(m);
    }));

    return movieList;
}

// PLACEHOLDER INNAN STÖD FINNS I BACKEND
function getPlaceholderMoviePoster(movieName) {

    if(movieName == "Jurassic Park") {
        return "https://lh3.googleusercontent.com/BVSejbKFir0thw8OmJKsWL-uDexGT9LDwSOcDuGE7vTC13b2JxjBHGzby7suSzvzziI";
    }
    else if(movieName == "Blade Runner") {
        return "https://i.pinimg.com/originals/e8/0e/7f/e80e7faf0de61a22810afbabe17dd53d.jpg";
    }
    else if(movieName == "Rambo") {
        return "https://m.media-amazon.com/images/M/MV5BODBmOWU2YWMtZGUzZi00YzRhLWJjNDAtYTUwNWVkNDcyZmU5XkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg";
    }
    else {
        return "https://sd.keepcalms.com/i-w600/keep-calm-poster-not-found.jpg";
    }
}

async function getMovieTrivias() {
    return fetchDataAsync("https://localhost:44361/api/filmTrivia");
}

async function addTrivia(movieId, text) {
    var filmstudio = getLoggedInUser();
    if(filmstudio) {
        // Get studio and build object
        trivia = { filmId: movieId, trivia: text };

        // Post trivia to server
        await fetch(apiURL + "/filmtrivia", { 
            method: 'POST',
            body: JSON.stringify(trivia),
            headers: {'Content-Type': 'application/json' }    
        });
    }
}

async function rentMovie(movieId)
{
    var filmstudio = getLoggedInUser();
    if(filmstudio) {
        // Get info and build rental object
        filmstudio = JSON.parse(filmstudio);
        rental = { filmId: movieId, studioId: filmstudio.id, returned: false };

        // Post rental on server
        var result = await fetch(apiURL + "/rentedfilm", { 
            method: 'POST',
            body: JSON.stringify(rental),
            headers: {'Content-Type': 'application/json' }    
        })
        .then(function(response) {
            return response.json();
        });

        // Change movie stock on server
        await changeMovieStockFor(movieId, -1);

        // Update localstorage with new rental
        filmstudio.activeRents.push(result);
        updateLoggedInUser(filmstudio);
    }

    // Rebuild movielist and modal
    await buildMovieList();
    displayMovieModal(movieId);
}

async function returnMovie(movieId)
{
    var filmstudio = getLoggedInUser();
    if(filmstudio) {
        // Get rental from localstorage
        filmstudio = JSON.parse(filmstudio);
        rents = filmstudio.activeRents;

        // Find and modify rental
        var rental = rents.find(r => r.filmId == movieId && r.returned == false); 
        if (rental) {
            rental.returned = true;
            try {

                // Update rental on server
                await fetch(apiURL + `/rentedfilm/${rental.id}`, { 
                    method: 'PUT',
                    body: JSON.stringify(rental),
                    headers: {'Content-Type': 'application/json' }    
                });
                
                // Change movie stock on server
                await changeMovieStockFor(movieId, 1);
                
                // Update localstorage without rental
                rents.splice(rents.indexOf(rental), 1);
                updateLoggedInUser(filmstudio);
                
                // // Rebuild movielist and modal
                await buildMovieList();
                displayMovieModal(movieId);
            } catch(error) {
                console.log(error);
            };
        }
    }
}

async function addNewMovie(title, imgSrc, stock) {
    var user = getLoggedInUser();
    if(user) {
        user = JSON.parse(user);
        if(user.isAdmin) {
            try {
                // Build movie object
                var movie = { name: title, /*imgSrc: imgSrc,*/ stock: stock };
                
                // Post rental on server
                var result = await fetch(apiURL + "/film", { 
                    method: 'POST',
                    body: JSON.stringify(movie),
                    headers: {'Content-Type': 'application/json' }    
                })
                .then(function(response) {
                    return response.json();
                });

                // Rebuild movielist and modal
                 await buildMovieList();
                displayMovieModal(movieId);
            } catch(error) {
                console.log(error);
                return false;
            }
        }        
    }
    return true;
}

async function changeMovieStockFor(movieId, valueChange) {
    var movie = movieList.find(m => m.movie.id == movieId).movie;

    await fetch(apiURL + `/film/${movieId}`, { 
        method: 'PUT',
        body: JSON.stringify({
            id: movie.id,
            name: movie.name,
            stock: (movie.stock + valueChange)
        }),
        headers: {'Content-Type': 'application/json' }    
    });
}
