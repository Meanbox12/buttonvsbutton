// This tutorial server was made following a tutorial from Digital Ocean https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module

console.log("Hello world");

// Import the modules needed
const http = require("http");
const fs = require("fs").promises; //This lets me use .then

// Define where it's going to be
const host = "127.0.0.1";
const port = 8081;
let indexFile;

// To parse the body of a POST request (this function is copied from the DigitalOcean tutorial)
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

// Make a listener that listens to every request
const listener = async function (request, response) {

    if (request.method === "POST" && request.url === "/click") {
        const clickData = await parseJSONBody(request, response);

        console.log(clickData.team);
    }

    // Give the HTML file to the user with code 200 (good)
    response.setHeader("Content-Type", "text/html");
    response.writeHead(200);
    response.end(indexFile);
};

// Create the server
const server = http.createServer(listener);

// Load the HTML file into the variable
fs.readFile(__dirname + "/index.html").then(contents => {
    indexFile = contents;
    // Make the server listen to requests and send the console message once it starts listening
    server.listen(port, host, () => {
        console.log(`Server is online at ${host}:${port}`);
    });
}).catch(err => {
    // Throw an error if it can't read the HTML file
    console.error("Could not read the HTML file");
    process.exit(1);
});
