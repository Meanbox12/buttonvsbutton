// Some of the functions in this server come from this DigitalOcean tutorial:
// https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module

// Modules
const http = require("http");
const fs = require("fs").promises;

// Server variables
const host = "127.0.0.1";
const port = 8081;
let indexFile;
const DEBUG = true;

// Game variables
let team1 = 0;
let team2 = 0;
let users = [];

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

// Checks if a click is valid and adds it to the total
function addClick(data) {
    if (validateUser(data.id)) {
        if (data.team == 1) {
            team1++;
            console.log(`${data.id} clicked for Team 1 and they now have ${team1} clicks.`);
            return true;
        } else if (data.team == 2) {
            team2++;
            console.log(`${data.id} clicked for Team 2 and they now have ${team2} clicks.`);
            return true;
        }
    } else {
        console.log(`Invalid user ${data.id} tried to click.`);
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
            console.log(`User ID ${uid} expired.`)
        }, 600000);
        console.log(`Created a user with id ${uid}`);
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
            if (DEBUG) {
                fs.readFile(__dirname + "/index.html").then(contents => { response.end(contents) });
            } else {
                response.end(indexFile);
            }
        }
    }
};

// Create and start up the server
const server = http.createServer(listener);

fs.readFile(__dirname + "/index.html").then(contents => {
    indexFile = contents;
    server.listen(port, host, () => {
        console.log(`Server is online at ${host}:${port}`);
    });
}).catch(err => {
    console.error("Could not read the HTML file");
    process.exit(1);
});