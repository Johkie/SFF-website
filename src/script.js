getMovies();

function showWelcome() {
    var content = document.getElementById("content");
    content.innerHTML = "Hello World!";
}

async function getMovies() {

    var trivia = await getMovieTrivias();
    fetchDataAsync("https://localhost:44361/api/film")
        .then(data => data.forEach(movie => displayMovie(movie, trivia.filter(t => t.filmId == movie.id))));
}

async function getMovieTrivias() {
    return await fetchDataAsync("https://localhost:44361/api/filmTrivia");
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


function displayMovie(movie, trivias)
{
    // Get data for movie
    var movieId = "movie" + movie.id;
    var movieImg = getPlaceholderMoviePoster(movie.name)

    var movieItem = document.createElement("div");
    movieItem.className = "movie-item";
    movieItem.innerHTML =
        `<button type='button' id='${movieId}'>` +
            `<img class='movie-img' src='${movieImg}'>` +
            `<div class='movie-title'>${movie.name}</div>` +
            "<div class='trivia-holder'></div>"+
        "</button>";
   
    // Add Trivia    
    var triviaDiv = movieItem.getElementsByClassName("trivia-holder")[0];
    if (trivias.length != 0) {
        for (let i = 0; i < trivias.length; i++) {
            var t = document.createElement("p");
            t.className = "trivia";
            t.innerHTML = `"${trivias[i].trivia}"`;
            triviaDiv.appendChild(t);
        }
    }
    else {
        // Placeholder trivia
        var t = document.createElement("p");
        t.className = "trivia-text";
        t.innerHTML = "Sadly no trivias exist for this movie...yet!";
        triviaDiv.appendChild(t);
    }

    var content = document.getElementById("movie-container");
    content.insertAdjacentElement("beforeend", movieItem);

    // Add click event to button
    var movieButton = document.getElementById(`${movieId}`);
    movieButton.addEventListener("click", function() {
        displayMovieModal(this);
    });
}

function displayMovieModal(movieItem) {

    // Get the modal and its elements
    var modal = document.getElementById("movie-modal");
    var modalImg = document.getElementById("modal-img");
    var modalTitle = document.getElementById("modal-title");
    var modalTrivias = document.getElementById("modal-trivia");
    var modalTriviaContainer = document.getElementById("modal-trivia-container");
    
    var modalTrivias = "";
    var t = movieItem.getElementsByClassName("trivia-holder")[0].children;
    for(i=0; i < t.length; i++) {
        modalTrivias += `<p id='modal-trivia'>${t[i].innerHTML}</p>`;
    }
    
    // Assign data to modal
    modalImg.src = movieItem.getElementsByClassName("movie-img")[0].src;
    modalTitle.innerHTML = movieItem.getElementsByClassName("movie-title")[0].innerHTML;
    modalTriviaContainer.innerHTML = "<div id='modal-trivia-title'>Trivia</div>";
    modalTriviaContainer.insertAdjacentHTML("beforeend", modalTrivias);

    
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


async function fetchDataAsync(url)
{
    let response = await fetch(url);
    let data = await response.json();
    return data;
}