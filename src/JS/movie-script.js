var movieList = [];
buildMovieList();

async function buildMovieList() {
    movieList = await getMovieList();
    displayMovies();
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
    let filmstudio = getLoggedInUser();
    if(filmstudio) {
        filmstudio = JSON.parse(filmstudio);
        activeRents = filmstudio.activeRents;

        // Display license left
        modalLoggedIn.insertAdjacentHTML("beforeend",
            `<div id='modal-movie-stock'>Licenser kvar: ${movie.stock}</div>`);

        // Only show rental options if not an admin
        if (!filmstudio.isAdmin) {

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
    var filmstudio = getLoggedInUser();;
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