// This tutorial server was made following a tutorial from Digital Ocean https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module

console.log("Hello world");

// Import the modules needed
const http = require("http");
const fs = require("fs").promises; //This lets me use .then

// Define where it's going to be
const host = "127.0.0.1";
const port = 8081;

// Make a listener that listens to every request
const listener = function (request, response) {

    // Open the HTML file
    fs.readFile(__dirname + "/index.html").then(contents => {

        // Give the HTML file to the user with code 200 (good)
        response.setHeader("Content-Type", "text/html");
        response.writeHead(200);
        response.end(contents);

        // Give an error if it can't load the file
    }).catch(err => {
        // Code 500 = Server error
        response.writeHead(500);
        response.end("Internal Server Error");
        return;
    });
};

// Create the server
const server = http.createServer(listener);

// Make the server listen to requests and send the console message once it starts listening
server.listen(port, host, () => {
    console.log(`Server is online at ${host}:${port}`);
});
