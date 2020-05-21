var movieList = [];
buildMovieList();

async function buildMovieList() {
    var trivia = await getMovieTrivias();
    movieList = [];
    
    await fetchDataAsync(apiURL + "/film")
    .then(data => data.forEach(function(movie) {
        
        let movieImg = getPlaceholderMoviePoster(movie.name);
        let trivias = trivia.filter(t => t.filmId == movie.id);

        movie["img"] = movieImg; 

        var m = { movie, trivias};
        movieList.push(m);
    }));

    displayMovies();
}

async function getMovieTrivias() {
    return fetchDataAsync("https://localhost:44361/api/filmTrivia");
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


function displayMovies()
{
    var movieContainer = document.getElementById("movie-container");
    movieContainer.innerHTML = "";
    
    for(i=0; i < movieList.length; i++) {

        let movie = movieList[i].movie;

        var movieItem = document.createElement("div");
        movieItem.className = "movie-item";
        movieItem.innerHTML =
            `<button type='button' onclick='displayMovieModal(${movie.id})'>` +
                `<img class='movie-img' src='${movie.img}'>` +
                `<div class='movie-title'>${movie.name}</div>` +
            "</button>";

        var movieContainer = document.getElementById("movie-container");
        movieContainer.insertAdjacentElement("beforeend", movieItem);
    }
}

function displayMovieModal(movieId) {

    var movieInfo = movieList.find(movie => movie.movie.id == movieId);
    var movie = movieInfo.movie;

    var contentDiv = document.getElementById("content");

    // Create the modal object if it doesnt exists
    var modal = document.getElementById("movie-modal");
    if(!modal) {
        contentDiv.insertAdjacentHTML("beforeend", 
        '<div id="movie-modal">' +
            '<div id="modal-card">' +
                '<img id="modal-img">' +
                '<div id="modal-desc-box">' +
                    '<span id="modal-close" class="far fa-window-close"></span>' +
                    '<p id="modal-title">Title</p>' +
                    '<div id="modal-trivia-container">Trivia</div>' +
                    "<div id='modal-logged-in'></div>" +
                '</div>' +
            '</div>' +
        '</div>' 
        );
    }

    // Get modal + its elements
    var modal = document.getElementById("movie-modal");
    var modalImg = document.getElementById("modal-img");
    var modalTitle = document.getElementById("modal-title");
    var modalTriviaContainer = document.getElementById("modal-trivia-container");
    var modalTrivias = "";
    var modalLoggedIn = document.getElementById("modal-logged-in");

    // Get moviedata
    var imgSrc = movie.img;
    var title = movie.name;
    
    t = movieInfo.trivias;

    if (t.length > 0) {
        for(i=0; i < t.length; i++) {
            modalTrivias += `<p id='modal-trivia'>${t[i].trivia}</p>`;
        }
    } else {
        modalTrivias += `<p id='modal-trivia'>No trivias exists as of yet...</p>`;
    }
    
    // Assign data to modal
    modalImg.src = imgSrc;
    modalTitle.innerHTML = title;
    modalTriviaContainer.innerHTML = "<div id='modal-trivia-title'>Trivia</div>";
    modalTriviaContainer.insertAdjacentHTML("beforeend", modalTrivias);
    modalLoggedIn.innerHTML ="";
    
    // Add logged in specific data
    let filmstudio = localStorage.getItem("filmstudio");
    if(filmstudio) {
        activeRents = JSON.parse(filmstudio).activeRents;

        // Get logged-in specific data
        modalLoggedIn.insertAdjacentHTML("beforeend",
            `<div id='modal-movie-stock'>Filmer kvar: ${movie.stock}</div>`);

        if(activeRents.find(r => r.filmId == movieId)) {
            modalLoggedIn.insertAdjacentHTML("beforeend",
                "<button id='modal-return-button'>Returnera</button>" );

            var returnButton = document.getElementById("modal-return-button");
            returnButton.addEventListener("click", function() {
                returnMovie(movieId);
            });

        } else {
            modalLoggedIn.insertAdjacentHTML("beforeend",
                "<button id='modal-rent-button'>Hyr</button>" );

            var rentButton = document.getElementById("modal-rent-button");
            rentButton.addEventListener("click", function() {
                rentMovie(movieId);
            });
        }            
    }
    
    // Add event to check when to close the modal
    modal.addEventListener("click", function listener(event) {
        // Check if the close button was pressed
        var closeButton = document.getElementById("modal-close");
        var closeButtonPressed = closeButton.contains(event.target);

        // Check if the click was outside the modalcard
        var modalCard = document.getElementById("modal-card");
        var isClickInside= modalCard.contains(event.target);

        // Close modal if click was on close button or outside of modal
        if (!isClickInside || closeButtonPressed) {
            modal.style.display = "none";
            modal.removeEventListener("click", listener)
        }
    });
    
    // Display modal
    modal.style.display = "flex";
}

async function rentMovie(movieId)
{
    var filmstudio = localStorage.getItem("filmstudio");
    if(filmstudio) {
        // Get info and build rental object
        studio = JSON.parse(filmstudio);
        rental = { filmId: movieId, studioId: studio.id, returned:false };

        // Post rental on server
        await fetch(apiURL + "/rentedfilm", { 
            method: 'POST',
            body: JSON.stringify(rental),
            headers: {'Content-Type': 'application/json' }    
        });

        // Change movie stock on server
        await changeMovieStockFor(movieId, -1);

        // Update localstorage with new rental
        studio.activeRents.push(rental);
        localStorage.setItem("filmstudio", JSON.stringify(studio));
    }

    // Rebuild movielist and modal
    await buildMovieList();
    displayMovieModal(movieId);
}

function returnMovie(movieId)
{
    var filmstudio = localStorage.getItem("filmstudio");
    if(filmstudio) {
        filmstudio = JSON.parse(filmstudio);
        console.log("StudioId: " + filmstudio.id + ", återlämnar film med id:", movieId);
    }
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
