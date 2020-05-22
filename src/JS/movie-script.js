var movieList = [];
buildContentWindow();

async function buildMovieList() {
    movieList = await getMovieList();
    displayMovies();
}

function buildContentWindow() {
    var content = document.getElementById("content");

    // If movie-container does not exist, create it
    if (!document.getElementById("movie-container")) {
        content.insertAdjacentHTML("beforeend", `<div id="movie-container" class="movie-container"></div>`);
    }
    // Build and display the movielist
    buildMovieList();

    // If admin content exists, remove it.
    var adminContent = document.getElementById("admin-content");
    if(adminContent) {
        content.removeChild(adminContent);
    };
    
    // If user is an admin, create and display the admin content
    var user = getLoggedInUser();
    if (user) {
        user = JSON.parse(getLoggedInUser());
        if (user.isAdmin) {
            content.insertAdjacentHTML("beforeend", 
            `
            <div id="admin-content">
                <div>Admin Panel</div>
                <div id="admin-display"></div>
            </div>`);

            displayAdminWindow();
        }
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

function displayAdminWindow() {
    var user = JSON.parse(getLoggedInUser());
    if (user.isAdmin) {

        var adminDisplay = document.getElementById("admin-display");
        adminDisplay.innerHTML = "";
        adminDisplay.insertAdjacentHTML("beforeend", 
        `
            <button id="admin-add-movie-button">Lägg till film</button>
            <button id="admin-studio-panel-button">Godkänn filmstudios</button>
        `);
        
        // Add click event for adding movies button
        var addMovieBtn = document.getElementById("admin-add-movie-button");
        addMovieBtn.addEventListener("click", displayAddMovieForm); 

        // Add click event for verify filmstudios
        var studioPanelBtn = document.getElementById("admin-studio-panel-button");
        studioPanelBtn.addEventListener("click", displayFilmstudioPanel); 
    }
}

async function displayFilmstudioPanel() {
    var filmstudio = await getAllFilmStudios();

    var adminDisplay = document.getElementById("admin-display");
    adminDisplay.innerHTML = "";
    adminDisplay.insertAdjacentHTML("beforeend", 
    `
        <h3>Filmstudios - Panel</h3>
        <div id="admin-studio-container"></div>


        <button id="panel-cancel-button">Tillbaka</button>
    `); 

    var studioContainer = document.getElementById("admin-studio-container");
    studioContainer.insertAdjacentHTML("beforeend", 
    ` 
        <div id="admin-studios-inactive">Studios not verified</div>
        <div id="admin-studios-list">Studios</div>
    `);

    var inActiveStudios = document.getElementById("admin-studios-inactive");
    var verifiedStudios = document.getElementById("admin-studios-list");

    for(i=0; i < filmstudio.length; i++) {
        studio = filmstudio[i];

        // Studios that are not yet verified
        if (!studio.verified) {
            inActiveStudios.insertAdjacentHTML("beforeend", 
            `
                <div class="admin-studio-item">
                <div>${studio.name}</div>
                    <button onclick="verifyFilmstudio(${studio.id})">Verify</button>
                </div>
            `);
        } 
        
        // Rest of the studios
        else {
            verifiedStudios.insertAdjacentHTML("beforeend", 
            `
            <div class="admin-studio-item">
                <button>${studio.name}</button>
            </div>
            `);
        }
    }

    // Add click event for cancel form button
    var cancelButton = document.getElementById("panel-cancel-button");
    cancelButton.addEventListener("click", displayAdminWindow);
}

function displayAddMovieForm() {
    var user = JSON.parse(getLoggedInUser());
    if (user.isAdmin) {
    
    var adminDisplay = document.getElementById("admin-display");
    adminDisplay.innerHTML = "";
    adminDisplay.insertAdjacentHTML("beforeend", 
    `
    <div id="add-movie-form">
        <h3>Lägg till ny film</h3>
        <label for="title"><b>Filmtitel*</b></label>
        <input id="form-movie-title" type="text" placeholder="Ange titel" name="title"> 
        
        <label for="img"><b>Länk till bild/poster*</b></label>
        <input id="form-movie-img" type="text" placeholder="Ange länk till bild" name="img"> 

        <label for="stock"><b>Antal licenser</b></label>
        <input id="form-movie-stock" type="text" placeholder="Ange antal licenser" name="stock">

        <div id="add-movie-errorMsg"></div>
        
        <button id="form-submit-button">Lägg till</button>
        <button id="form-cancel-button">Tillbaka</button>
    </div>
    `); 

    var submitButton = document.getElementById("form-submit-button");
    submitButton.addEventListener("click", function() {
        var errorMsgDiv = document.getElementById("add-movie-errorMsg"); 

        var inputTitle = document.getElementById("form-movie-title").value;
        var inputImgSrc = document.getElementById("form-movie-img").value;
        var inputStock = document.getElementById("form-movie-stock").value;

        // Check if all fields got a value
        if(inputTitle && inputImgSrc && inputStock) {
            // Convert and check if stock value is of type int
            inputStock = parseInt(inputStock);
            if(inputStock) {
                // Add movie to server
                var result = addNewMovie(inputTitle, inputImgSrc, inputStock);
                
                // If movie was added sucessfully
                if(result) {
                    var movieForm = document.getElementById("add-movie-form");
                    movieForm.innerHTML = "";
                    movieForm.insertAdjacentHTML("beforebegin", 
                    `
                        <div>Filmen har lagts till!</div>
                        <button id="form-cancel-button">Tillbaka</button>
                    `);
                    
                    // Add click event for cancel button
                    var cancelButton = document.getElementById("form-cancel-button");
                    cancelButton.addEventListener("click", displayAdminWindow);
                }
                else {
                    errorMsgDiv.innerHTML = "Något oväntat gick fel..."
                }
            }
            else {
                errorMsgDiv.innerHTML = "'Antal licenser' måste vara ett tal"
            }
        }
        else {
            errorMsgDiv.innerHTML = "Alla fält är ej ifyllda!"
        }
    });

    // Add click event for cancel form button
    var cancelButton = document.getElementById("form-cancel-button");
    cancelButton.addEventListener("click", displayAdminWindow);
    }
}