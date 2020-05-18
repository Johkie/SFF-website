# Inlämningsuppgift - Filmstudion kundsida

Nu skall du bygga en framsida för filmstudions uthyrningstjänst. 
Ni skall använda ett färdigt API från "backend avdelningen" som ni fått tillgång till. 

Ni skall inte utveckla några nya funktioner till ert API, utan dokumentera det som inte går att lösa idag som ett underlag (kravspec) till backend teamet på vad du i frontend teamet önskar för nya funktioner och varför. Gärna med förslag på lösning. Detta underlag skall lämnas in som en del av reflektionen med uppgiften.
Men du skall ta fram de förmulär och den frontend som behövs för nya funktioner men anteckna att de inte funkar och varför.
Det är viktigt att till kund kunna illustrera hur det skall se ut, även fast det inte funkar.

På github finns ett repo med ett färdigt .Net API
Detta API skall ni använda utan ändringar. Observera att jag kommer att testa erat frontend projekt mot detta API repo.
I repot finns även en JSON dump från backend-gänget ni kan importera till Postman (collection) för att återställa och importera test data under utveckling.

## Backend API v0.3 (GET, POST, PUT, DELETE)
+ https://localhost:5001/api/film
+ https://localhost:5001/api/filmstudio
+ https://localhost:5001/api/filmTrivia
+ https://localhost:5001/api/rentedFilm

Detta projektet kör vi "Headless" dvs två separata projekt/repo, ett för backend och ett för frontend.
I erat eget repo så räcker det att ni har allt som tillhör frontend projektet.

Ett arbetsflöde är tex att ha igång API lokalt via Visual Studio på en port.
Samt starta och jobba med frontend projektet i Visual Studio Code och stara det på en egen port. 
Då simulerar vi det som att det är två separata serverar som pratar med varandra, fast båda kör lokalt.

## Krav för G
* Sidan skall kunna besökas publikt och då se en lista på samtliga tillgängliga filmer, samt en trivia lista per film.
* Det skall visas ett omslag för varje film.
* Det skall finnas ett formulär för att registrera en ny filmstudio.
* En filmstudio skall kunna logga in med sitt användarnamn "name" samt lösenord "password".
* En inloggad filmstudio skall kunna låna en film, lämna tillbaka en film samt skriva en trivia om en film.

## Krav för VG
* En film skall bara kunna lånas det antal gånger totalt som det finns licenser "stock".
* En SFF administratör skall kunna se vilka filmer som är uthyrda till vilka studios.
* En SFF administratör skall godkänna "verified" en filmstudio innan de kan logga in.
* Filmstudion skall automatiskt meddelas via epost när de blivit godkända.
* En SFF administratör skall kunna lägga till nya filmer.
* En skriven reflektion över hur du har löst uppgiften.
* Uppgiften skall lämnas in via Ping Pong och innehålla länk till ett repo med frontend projektet som kommentar samt bifoga den reflekterande texten.

_Till denna uppgift så skall ni använda er utav "vanilla" - js, inget ramverk eller bibliotek. 
Utan ren HTML5 och CSS3.
Vi anänvder lösenord i klartext, vilket man aldrig skall göra i ett projekt i produktion. Men vi kommer att titta på kryptering i kommande modul!_
