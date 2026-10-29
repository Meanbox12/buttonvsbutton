// Some of the functions in this server come from this DigitalOcean tutorial:
// https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module

// Modules
const http = require("http");

// Server variables
const host = "127.0.0.1";
const port = 8081;
const DEBUG = false;

// Game variables
let team1 = 0;
let team2 = 0;
let users = [];

// This variable contains the entire frontend code!!
const HTML = `<!DOCTYPE html>
<html lang="en">

<head>
    <title>Button vs. Button</title>

    <style>

        :root {
            --color-bar-width: 50%;
            --team-color: white;
        }

        html {
            height: 100%;
            display: table;
            margin: auto;
        }

        body {
            height: 100%;
            background-color: black;
            padding: 20px;
            margin: 0;
            color: white;
            display: table-cell;
            vertical-align: middle;
        }

        .section {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 0;
            width: 100%;
        }

        #headerSection>h1 {
            font-size: 9vw;
            font-family: 'Arial', sans-serif;
            font-weight: 1000;
            margin: 10px;
        }

        .section>span {
            display: flex;
            flex-direction: row;
        }

        #teamSelectSection>h1 {
            font-size: 5vw;
        }

        .section>span {
            width: 75%;
        }

        .section>span>button {
            font-size: 5vw;
            font-family: 'Arial', sans-serif;
            font-weight: 1000;
            padding: 40px;
            width: 50%;
            border: 2px solid black;
            transition: all 0.3s;
            background-color: white;
            text-align: center;
        }

        .section>span>button:hover {
            cursor: pointer;
        }

        #team1btn:hover {
            background-color: rgb(255, 210, 128);
        }

        #team2btn:hover {
            background-color: rgb(255, 173, 255);
        }

        #colorBarContainer {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            width: 75vw;
            height: 10vh;
        }

        #colorBarInner1, #colorBarInner2 {
            height: 100%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 50px;
            font-family: Verdana, sans-serif;
        }

        #colorBarInner1 {
            width: var(--color-bar-width-1);
            background-color: orange;
        }

        #colorBarInner2 {
            height: 100%;
            width: var(--color-bar-width-2);
            background-color: purple;
        }

        #clicker {
            margin: 25px;
            width: 25vw;
            height: 25vw;
            background-color: var(--team-color);
            border: none;
            cursor: pointer;
            font-size: 7vw;
            font-weight: 1000;
            border-radius: 25px;
            touch-action: manipulation;
        }

        #clicker:active {
            transform: rotate(1deg);
        }
    </style>
</head>

<body>

    <div id="headerSection" class="section">
        <h1 id="titleText"><span style="color: orange">Button</span> <span style="color: white;">vs</span> <span
                style="color: purple;">Button</span></h1>
    </div>

    <div id="teamSelectSection" class="section">
        <p style="font-size: 30px;">Click the button as many times as possible to keep your team on top!</p>
        <p>This game is only one file! Check out the source code at <a href="https://github.com/Meanbox12/buttonvsbutton">https://github.com/Meanbox12/buttonvsbutton</a>.</p>
        <h1>Choose a Team</h1>
        <span>
            <button id="team1btn">Orange</button>
            <button id="team2btn">Purple</button>
        </span>
    </div>

    <div id="gameSection" class="section" style="display: none;">
        <div id="colorBarContainer">
            <div id="colorBarInner1">0</div>
            <div id="colorBarInner2">0</div>
        </div>
        <button id="clicker">0</button>
    </div>

    <p id="uidDisplay" style="display: none;">Your Player ID is XXXX-XXXX.</p>
</body>

<script>
    const uidDisplay = document.getElementById("uidDisplay");
    const team1btn = document.getElementById("team1btn");
    const team2btn = document.getElementById("team2btn");
    const clicker = document.getElementById("clicker");
    const titleText = document.getElementById("titleText");

    const headerSection = document.getElementById("headerSection");
    const teamSelectSection = document.getElementById("teamSelectSection");
    const gameSection = document.getElementById("gameSection");

    const colorBarInner1 = document.getElementById("colorBarInner1");
    const colorBarInner2 = document.getElementById("colorBarInner2");

    const rootCss = document.querySelector(":root");

    let userId = 0;
    let userTeam = 0;
    let userClicks = 0;

    let team1 = 0;
    let team2 = 0;

    async function showGame() {
        await loadUid();
        rootCss.style.setProperty("--team-color", (userTeam == 1 ? "orange" : "purple"));
        teamSelectSection.style.display = "none";
        gameSection.style.display = "flex";
        titleText.style.fontSize = "5vw"
    }

    team1btn.addEventListener("click", function () {
        userTeam = 1;
        showGame();
    });

    team2btn.addEventListener("click", function () {
        userTeam = 2;
        showGame();
    });

    clicker.addEventListener("click", async function () {
        if (userTeam != 0) {
            const response = await fetch("/click", {
                method: "POST",
                body: JSON.stringify({ "team": userTeam, "id": userId }),
                headers: { "Content-Type": "application/json" }
            });

            success = (await response.text() === "true");

            if (success) {
                userClicks++;
                clicker.innerText = userClicks;
            } else {
                alert("Failed to validate your User ID. Please try refreshing the page.");
                window.location.reload();
            }
        }
    });

    // These functions are from one of my old projects
    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    async function getPlayerId() {
        const response = await fetch("/join");
        userId = await response.text();
        setCookie("uid", userId, "1");
        setTimeout(() => {
            alert("Your User ID has expired! Refresh the page to get a new one.");
            setCookie("uid", null, "0");
            window.location.reload();
        }, 590000);
        return userId;
    }

    async function loadUid() {
        let savedId = getCookie("uid");

        if (savedId == null) {
            await getPlayerId();
        } else {
            const response = await fetch("/validate", {
                method: "POST",
                body: JSON.stringify({ "id": savedId }),
                headers: { "Content-Type": "application/json" }
            });
            let valid = (await response.text() === "true");
            if (!valid) {
                await getPlayerId();
            } else {
                userId = savedId;
            }
        }
    }

    async function updateCounts() {
        const response = await fetch("/count");
        countJSON = await response.json();

        // Check if the click count has been reset by the server.
        if (countJSON.team1 - team1 < -900000 || countJSON.team2 - team2 < -900000) {
            alert("Congratulations! The total clicks have reached 1,000,000. The winner is: " + (team1 > team2 ? "Orange" : "Purple") + " Team! The counters have been reset to 0.");
            userClicks = 0;
        }

        team1 = countJSON.team1;
        team2 = countJSON.team2;
        
        colorBarInner1.innerText = team1;
        colorBarInner2.innerText = team2;

        rootCss.style.setProperty("--color-bar-width-1", ((team1 + team2 == 0 ? 50 : (team1 / (team1 + team2)) * 100) + "%"));
        rootCss.style.setProperty("--color-bar-width-2", (team1 + team2 == 0 ? 50 : (team2 / (team1 + team2)) * 100) + "%");
    }

    setTimeout(() => {
        updateCounts();
        setInterval(updateCounts, 100);
    }, 100);

</script>

</html>`;

// Returns the parsed JSON as an Array. This function is from the DigitalOcean tutorial.
function parseJSONBody(request, response) {

    // Tells whoever called this that it will give a value after it finishes parsing
    return new Promise((resolve, reject) => {
        let body = "";
        let received = 0;

        const contentType = request.headers["content-type"] || "";
        // Throw an error if the type of data isn't JSON
        if (!contentType.startsWith("application/json")) {
            response.writeHead(415, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Unsupported Content-Type" }));
            return reject(new Error("Unsupported Content-Type"));
        }

        request.on("data", chunk => {
            received += chunk.length;

            // Throw an error if the data is abnormally large
            // Since data packets will be tiny (just the team and maybe a user ID) the max size can also be tiny
            if (received > 1024) {
                response.writeHead(413, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ error: "Request payload too large" }));
                request.destroy();
                return reject(new Error("Payload too large"));
            }
            // Add the data to the request body
            body += chunk.toString();
        });

        request.on("end", () => {
            try {
                // Throw an error if there is no request body
                if (!body) {
                    response.writeHead(400, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ error: "Empty request body" }));
                    return reject(new Error("Empty request body"));
                }

                // Parse JSON
                const data = JSON.parse(body);

                // Throw an error if the data is not the right type
                if (typeof data !== "object" || data == null || Array.isArray(data)) {
                    response.writeHead(400, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ error: "Invalid JSON object" }));
                    return reject(new Error("Invalid JSON object"));
                }

                // If there are no problems, return the parsed JSON
                resolve(data);

                // Throw an error if there is a problem parsing the JSON
            } catch (parseError) {
                response.writeHead(400, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ error: "Malformed JSON" }));
                return reject(new Error("Malformed JSON"));
            }
        });

        // Throw an error if there is a network error
        request.on("error", (error) => {
            console.error("Request error: ", error.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Request error' }));
        });
    });
}

// Generates an 8 digit user id with a dash in the middle
function generateUID() {
    let uid = "";
    for (let i = 0; i < 8; i++) {
        uid += Math.floor(Math.random() * 10);
        if (i == 3) {
            uid += "-";
        }
    }
    return uid;
}

// Restart the counters at 1000000 clicks. 
// Since all data is stored in memory and the server will inevitably restart at some point, I added this to make it less bad if it restarts. 1m clicks is still a lot, though.
function checkIfRestartNeeded() {
    if (team1 + team2 >= 1000000) {
        team1 = 0;
        team2 = 0;
    }
}

// Checks if a click is valid and adds it to the total
function addClick(data) {
    if (validateUser(data.id)) {
        if (data.team == 1) {
            team1++;
            checkIfRestartNeeded();
            return true;
        } else if (data.team == 2) {
            team2++;
            checkIfRestartNeeded();
            return true;
        }
    } else {
        return false;
    }
}

// Checks if a User ID is valid
function validateUser(id) {
    return users.includes(id);
}

// Creates a new user
function createUser() {
    let uid = "";
    let retries = 0;
    while ((uid == "" || users.includes(uid)) && retries < 50) {
        uid = generateUID();
        retries++;
    }

    if (retries < 50) {
        let position = users.push(uid);
        // User IDs will be deleted after 10 minutes
        setTimeout(() => {
            users.splice(position - 1);
        }, 600000);
        return uid;
    } else {
        return false;
    }
}

// Handle requests
const listener = async function (request, response) {

    let url = request.url;

    if (request.method === "POST") {
        let url = request.url;
        if (url == "/click") {
            response.setHeader("Content-Type", "text/html");
            response.writeHead(200);
            response.end(addClick(await parseJSONBody(request, response)).toString());
        } else if (url == "/validate") {
            response.setHeader("Content-Type", "text/html");
            response.writeHead(200);
            let tester = await parseJSONBody(request, response);
            response.end(validateUser(tester.id).toString());
        }
    } else if (request.method === "GET") {
        if (url == "/join") {
            response.setHeader("Content-Type", "text/html");
            response.writeHead(200);
            response.end(createUser());
        } else if (url == "/count") {
            response.setHeader("Content-Type", "application/json");
            response.writeHead(200);
            response.end(JSON.stringify({ "team1": team1, "team2": team2 }));
        } else {
            response.setHeader("Content-Type", "text/html");
            response.writeHead(200);
            response.end(HTML);
        }
    }
};

// Create and start up the server
const server = http.createServer(listener);

server.listen(port, host, () => {
    console.log(`Server is online at ${host}:${port}`);
});