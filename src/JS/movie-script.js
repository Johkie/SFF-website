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
    modalLoggedIn.style.visibility = "visible";
    

    // Add logged in specific data
    displayLoggedInData(movie, modalLoggedIn);

    // TEMPORÄRT FÖRHOPPNINGSVIS MEN ANTAGLIGEN INTE---------
    var closeButton = document.getElementById("modal-close");
    closeButton.addEventListener("click", function() {
        modal.style.display = "none";
    });

    // // Add event to check when to close the modal
    // modal.addEventListener("click", function listener(event) {
    //     // Check if the close button was pressed
    //     var closeButton = document.getElementById("modal-close");
    //     var closeButtonPressed = closeButton.contains(event.target);

    //     // Check if the click was outside the modalcard
    //     var modalCard = document.getElementById("modal-card");
    //     var isClickInside= modalCard.contains(event.target);

    //     // Close modal if click was on close button or outside of modal
    //     if (!isClickInside || closeButtonPressed) {
    //         modal.style.display = "none";
    //         modal.removeEventListener("click", listener)
    //     }
    // });
    
    // Display modal
    modal.style.display = "flex";

}

function displayLoggedInData(movie, modalLoggedIn) {
    let filmstudio = localStorage.getItem("filmstudio");
    if(filmstudio) {
        activeRents = JSON.parse(filmstudio).activeRents;

        // Display license left
        modalLoggedIn.insertAdjacentHTML("beforeend",
            `<div id='modal-movie-stock'>Licenser kvar: ${movie.stock}</div>`);

        // If studio has an active rental, show return button
        // Else show a rent button
        if(activeRents.find(r => r.filmId == movie.id)) {
            modalLoggedIn.insertAdjacentHTML("beforeend",
                "<button id='modal-return-button'>Returnera</button>" );

            var returnButton = document.getElementById("modal-return-button");
            returnButton.addEventListener("click", function() {
                returnMovie(movie.id);
            });
        } else if(parseInt(movie.stock) <= 0) {
            modalLoggedIn.insertAdjacentHTML("beforeend",
                "<button id='modal-nostock-button'>Slut</button>" );
        } else {
            modalLoggedIn.insertAdjacentHTML("beforeend",
                "<button id='modal-rent-button'>Hyr</button>" );

            var rentButton = document.getElementById("modal-rent-button");
            rentButton.addEventListener("click", function() {
                rentMovie(movie.id);
            });
        }

        //Didplay add trivia button 
        modalLoggedIn.insertAdjacentHTML("beforeend", 
        `<button id="modal-trivia-button">Lägg till trivia</button>
        `);

        var addTriviaButton = document.getElementById("modal-trivia-button");
        addTriviaButton.addEventListener("click", function listener() {
            displayAddTriviaWindow(movie.id);
        })
    }
}

function displayAddTriviaWindow(movieId) {
    var filmstudio = localStorage.getItem("filmstudio");
    if(filmstudio) {
        var modalTrivia = document.getElementById("modal-trivia-container");
        var modalLoggedIn = document.getElementById("modal-logged-in");
        modalTrivia.innerHTML = "";
        modalLoggedIn.innerHTML = "";
        
        modalTrivia.insertAdjacentHTML("beforeend", 
        `
        <div id="trivia-form">
            <label for="trivia-text"><b>Trivia</b></label>
            <textarea id="add-trivia-box" name="trivia-text" placeholder="Vad har du för kul att säga?"></textarea>
            <div id="add-trivia-errorMsg"></div>
            <button id="post-trivia">Lägg till</button>
            <button id="cancel-trivia">Tillbaka</button>
        </div>   
        `
        );

        // Add click event for submit trivia button
        var postTriviaButton = document.getElementById("post-trivia");
        postTriviaButton.addEventListener("click", function() 
        {
            var text = document.getElementById("add-trivia-box").value;
            // Post if text was found
            if (text) {
                addTrivia(movieId, text);
                var triviaForm = document.getElementById("trivia-form");
                triviaForm.innerHTML = "";
                triviaForm.insertAdjacentHTML("beforeend", 
                    `<div>Din trivia är tillagd!</div>
                    <button id="cancel-trivia">Tillbaka</button>
                    `);

                var cancelButton = document.getElementById("cancel-trivia");
                cancelButton.addEventListener("click", async function() {
                    await buildMovieList();
                    displayMovieModal(movieId);
                })

            } else {
                var errorMsg = document.getElementById("add-trivia-errorMsg");
                errorMsg.innerHTML = "Ingen trivia inskriven!";
            }
        })
        
        // Add click event for cancel button
        var cancelTriviaButton = document.getElementById("cancel-trivia");
        cancelTriviaButton.addEventListener("click", async function() {
            displayMovieModal(movieId);
        })        
    }
}

async function addTrivia(movieId, text) {
    var filmstudio = localStorage.getItem("filmstudio");
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
    var filmstudio = localStorage.getItem("filmstudio");
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
        localStorage.setItem("filmstudio", JSON.stringify(filmstudio));
    }

    // Rebuild movielist and modal
    await buildMovieList();
    displayMovieModal(movieId);
}

async function returnMovie(movieId)
{
    var filmstudio = localStorage.getItem("filmstudio");
    if(filmstudio) {
        // Get rental from localstorage
        filmstudio = JSON.parse(filmstudio);
        rents = filmstudio.activeRents;

        // Find and modify rental
        var rental = rents.find(r => r.filmId == movieId); 
        if (rental) {
            rental.returned = true;

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
            localStorage.setItem("filmstudio", JSON.stringify(filmstudio));

            // Rebuild movielist and modal
            await buildMovieList();
            displayMovieModal(movieId);
        }
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
