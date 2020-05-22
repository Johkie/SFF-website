var apiURL = "https://localhost:44361/api";

//add admin account TEMPORARY
registerNewStudio("admin", "admin@admin.se", "admin");

// Make sure that rentlist is up to date
updateFilmstudioStorage();

function CheckIfAdminLogin(name) {
    return (name == "admin") ? true : false;
}

if(getLoggedInUser()) {
    displayWelcomeScreen();
} else {
    showLoginOptions();
}

function displayWelcomeScreen() {
    var filmstudio = JSON.parse(getLoggedInUser());
    var loginDiv = document.getElementById("nav-item-login");
    
    loginDiv.innerHTML = "Inloggad som: " + filmstudio.name;
    loginDiv.insertAdjacentHTML("beforeend", 
    "<button id='logout-button'>Logga Ut</button>"
    );
    
    var logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", function() {
        removeLoggedInUser();
        buildContentWindow();
        showLoginOptions();
    });
}

function showLoginOptions() {
    var login = document.getElementById("nav-item-login");
    login.innerHTML = "";
    login.insertAdjacentHTML("afterbegin",
        `<div id="login-form">
            <input type="text" placeholder="Filmstudio..." name="username" id="loginUser">
            <input type="password" placeholder="Lösenord..." name="password" id="loginPass">
            <button type="button" id="login-button">Login</button>
        </div>
        <div id="register-container">
            <div id="register-here">Registrera dig här!</div>
        </div>
        `
    );

    // Login button click event
    var loginButton = document.getElementById("login-button");
    loginButton.addEventListener("click", async function() {

        var getUser = document.getElementById("loginUser").value;
        var getPw = document.getElementById("loginPass").value;

       AttempToFindLogin(getUser, getPw)
        .then(async function(result) {
            
            // If a user was found
            if(result != null) {
                
                // If user is verified
                if(result.verified) {

                    // Grant adminright if admin has logged in
                    var isAdmin = CheckIfAdminLogin(result.name);
          
                    // Get user details and show welcome screen
                    var rentedMovies = await fetchActiveRentsForLoggedInUser(result.id);
                    var user = { id: result.id, name: result.name, isAdmin: isAdmin, activeRents: rentedMovies };
                    updateLoggedInUser(user);

                    // Build and display the logged in content
                    displayWelcomeScreen();
                    buildContentWindow();

                } else {
                    displayLoginErrorMsg("Kontot har ännu inte blivit godkänt av en administratör!");
                }

            } else {
                displayLoginErrorMsg("Användarnamnet eller lösenordet stämde inte!");
            }
        });
    });

    // Register here click event
    var registerButton = document.getElementById("register-here");
    registerButton.addEventListener("click", function() {
        showRegisterWindow();
    });
}

function showRegisterWindow() {

    var registerForm = document.getElementById("register-container")
    if (!document.getElementById("register-display")) {

        registerForm.insertAdjacentHTML("beforeend" , 
        `<div id="register-display">
            <div id="register-form">
                <H3>Registrera konto</H3>

                <label for="studio"><b>Filmstudio/Ort*</b></label>
                <input id="register-studio" type="text" placeholder="Ange Filmstudio" name="studio"> 

                <label for="email"><b>Email*</b></label>
                <input id="register-email" type="text" placeholder="Ange Email" name="email"> 
                
                <label for="psw"><b>Lösenord*</b></label>
                <input id="register-pw" type="password" placeholder="Ange Lösenord" name="psw">

                <div id="register-errorMsg"> </div>
                
                <button type="button" id="register-submit-btn">Registrera konto</button>
                <button type="button" id="register-cancel-btn">Stäng</button>
            </div>
        </div>
        ` );

        // Cancel button click event
        var cancelButton = document.getElementById("register-cancel-btn") ;
        cancelButton.addEventListener("click", hideRegisterWindow);

        // Submit button click event
        var submitButton = document.getElementById("register-submit-btn");
        submitButton.addEventListener("click", async function() {
            var studioInput = document.getElementById("register-studio").value;
            var emailInput = document.getElementById("register-email").value;
            var pwInput = document.getElementById("register-pw").value;

            // If all field are entered
            if (studioInput && emailInput && pwInput) {
                
                var result = await registerNewStudio(studioInput, emailInput, pwInput);

                if (result != true) {
                    displayRegisterErrorMsg(result);
                }
                else {
                    var registerForm = document.getElementById("register-form");
                    registerForm.innerHTML = "";
                    registerForm.insertAdjacentHTML("beforeend", 
                    `
                        <div>Ditt konto är registrerat!</div>
                        <button type="button" id="register-cancel-btn">Stäng</button>
                    ` 
                    );

                    // Cancel button click event
                    var cancelButton = document.getElementById("register-cancel-btn") ;
                    cancelButton.addEventListener("click", hideRegisterWindow);
                }
            }
            else {
                displayRegisterErrorMsg("Alla fält är ej ifyllda!");
            }
        });       
    }
}

function hideRegisterWindow() {
    var registerDisplay = document.getElementById("register-display");
    registerDisplay.parentNode.removeChild(registerDisplay);
}

function displayRegisterErrorMsg(msg) {
    var registerErrorMsg = document.getElementById("register-errorMsg");
    registerErrorMsg.innerHTML = "";
    registerErrorMsg.innerHTML = msg;
}

function displayLoginErrorMsg(msg) {
    // Check if errorMsgDiv exists, if not create it.
    errorMsgDiv = document.getElementById("loginErrorMsg");
    if (errorMsgDiv) {
        errorMsgDiv.innerHTML = msg;

    } else {
        var loginForm = document.getElementById("login-form");
        loginForm.insertAdjacentHTML("beforeend", `<p id='loginErrorMsg'>${msg}</p>`);
    }  
}