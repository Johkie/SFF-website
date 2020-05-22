async function fetchDataAsync(url)
{
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

async function fetchActiveRentsForLoggedInUser(filmstudioId) {
    return fetchDataAsync(apiURL + "/rentedFilm").then(r => r.filter(rent => rent.studioId == filmstudioId && rent.returned == false));
}

function getLoggedInUser() {
    return localStorage.getItem("loggedUser");
}

function updateLoggedInUser(rawData) {
    localStorage.setItem("loggedUser", JSON.stringify(rawData));
}

function removeLoggedInUser() {
    localStorage.removeItem("loggedUser");
}

async function updateFilmstudioStorage() {
    
    if (getLoggedInUser()) {
        var filmstudio = JSON.parse(getLoggedInUser());

        var rentedMovies = await fetchActiveRentsForLoggedInUser(filmstudio.id);
        filmstudio["activeRents"] = rentedMovies;
        updateLoggedInUser(filmstudio);
    }
}

async function registerNewStudio(studio, email, pw) {
    var studios = await fetchDataAsync(apiURL + "/filmstudio");

    if(studios.find(m => m.name == studio)) {
        return "Det finns redan en studio med det namnet...";
    }
    else {
        var studio = { 
            name: studio, 
            password: pw,
            // email: email,
            verified: false  };

        // Post studio to server
        await fetch(apiURL + "/filmstudio", { 
            method: 'POST',
            body: JSON.stringify(studio),
            headers: {'Content-Type': 'application/json' }    
        });

        return true;
    }
}

async function AttempLogin(user, pw) {

    // Fetch all users and compare 'em with the provided input
    return fetchDataAsync(apiURL + "/filmstudio")
    .then(function(data) {
        for(i=0; i < data.length; i++) {
        
            u = data[i].name;
            p = data[i].password;

            if(u == user && p == pw) {
                return data[i];
            }
        };

        // If no matches found
        return null;
    });
}