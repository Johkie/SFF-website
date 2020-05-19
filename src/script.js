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


function displayMovie(movie, trivias)
{
    var movieId = "movie" + movie.id;
    var movieItem = document.createElement("div");
    movieItem.className = "movie-item";

    movieItem.className = "movie-item";
    
    // FULLÖSNING
    var movieImg = "https://sd.keepcalms.com/i-w600/keep-calm-poster-not-found.jpg";
    if(movie.name == "Jurassic Park") {
        movieImg = "https://lh3.googleusercontent.com/BVSejbKFir0thw8OmJKsWL-uDexGT9LDwSOcDuGE7vTC13b2JxjBHGzby7suSzvzziI";
    }
    else if(movie.name == "Blade Runner") {
        movieImg = "https://i.pinimg.com/originals/e8/0e/7f/e80e7faf0de61a22810afbabe17dd53d.jpg";
    }
    else if(movie.name == "Rambo") {
        movieImg = "https://m.media-amazon.com/images/M/MV5BODBmOWU2YWMtZGUzZi00YzRhLWJjNDAtYTUwNWVkNDcyZmU5XkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg";
    }

    movieItem.innerHTML =
        `<button type='button' id='${movieId}'>` +
            `<img class='movie-img' src='${movieImg}'>` +
            `<div class='movie-title'>${movie.name}</div>` +
        "</button>";
    
    var triviaDiv = document.createElement("div");
    triviaDiv.className = "trivia-container";
    triviaDiv.insertAdjacentHTML("afterbegin", "<div class='trivia-title'>Trivia</div>");

    if (trivias.length != 0) {
        // Adding trivia
        // for (let i = 0; i < trivias.length; i++) {
        for (let i = 0; i < 1; i++) {
            var t = document.createElement("p");
            t.className = "trivia-text";
            t.innerHTML = `"${trivias[i].trivia}"`;
            triviaDiv.appendChild(t);
        }
    }
    else {
        var t = document.createElement("p");
        t.className = "trivia-text";
        t.innerHTML = "Sadly no trivias exist for this movie...yet!";
        triviaDiv.appendChild(t);
    }

    movieItem.appendChild(triviaDiv)

    var content = document.getElementById("movie-container");
    content.insertAdjacentElement("beforeend", movieItem);

    // var movieButton = document.getElementById(`${movieId}`);
    // movieButton.addEventListener("click", function() {
    //     this.classList.toggle("active");
    //     var content = this.nextElementSibling;
    //     if (content.style.maxWidth){
    //     content.style.maxWidth = null;
    //     } else {
    //     content.style.maxWidth = 200 + "px";
    //     }
    // });
}


async function fetchDataAsync(url)
{
    let response = await fetch(url);
    let data = await response.json();
    return data;
}