async function fetchDataAsync(url)
{
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

async function getActiveRentsForStudio(filmstudioId) {
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

        var rentedMovies = await getActiveRentsForStudio(filmstudio.id);
        filmstudio["activeRents"] = rentedMovies;
        updateLoggedInUser(filmstudio);
    }
}


async function AttempToFindLogin(user, pw) {
    
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

async function registerNewStudio(studio, email, pw) {
    var studios = await fetchDataAsync(apiURL + "/filmstudio");

    // if(studio == "admin") {
    //     return `Otillåtet namn: "${studio}"`;
    // }
    if(studios.find(m => m.name == studio)) {
        return "Det finns redan en studio med det namnet...";
    }
    else {

        // ONLY FOR CONVENIENCE
        var verified = false;
        if (studio == "admin") {
            verified = true;
        }

        // Build studio object
        studio = { 
            name: studio, 
            password: pw,
            // email: email,
            verified: verified  
        };

        // Post studio to server
        await fetch(apiURL + "/filmstudio", { 
            method: 'POST',
            body: JSON.stringify(studio),
            headers: {'Content-Type': 'application/json' }    
        });

        return true;
    }
}

async function getAllFilmStudios() {
    return await fetchDataAsync(apiURL + "/filmstudio");
}

async function verifyFilmstudio(filmstudioId) {
    var user = getLoggedInUser();
    if(user) {
        // Get rental from localstorage
        user = JSON.parse(user);
        if(user.isAdmin) {
            filmstudio = await fetchDataAsync(apiURL + `/filmstudio/${filmstudioId}`)
            
            // Update and post the filmstudio
            if (filmstudio) {
                filmstudio.verified = true;
                try {
                    
                    // Update rental on server
                    await fetch(apiURL + `/filmstudio/${filmstudioId}`, { 
                        method: 'PUT',
                        body: JSON.stringify(filmstudio),
                        headers: {'Content-Type': 'application/json' }    
                    });

                    displayFilmstudioPanel();

                } catch(error) {
                    console.log(error);
                };
            }
        }
    }
}

// Thank you google
function join(lookupTable, mainTable, lookupKey, mainKey, select) {
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = [],
        output = [];
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        lookupIndex[row[lookupKey]] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
};