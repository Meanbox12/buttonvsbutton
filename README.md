# Button vs. Button
Click the button as many times as possible to keep your team on top! Created for the Grandma YSWS at Hack Club.

## What is this?
It's a game/demo where users click a button to gain clicks for their team. Once the total amount of clicks reaches 1,000,000, the counter resets. Clicks are validated using User IDs.

<sub>**Why does the counter reset at 1,000,000 clicks?** Since this project is a single file, all data is stored in memory. This means that if my server crashes, all the clicks are lost forever. Making the clicks reset means that it's not as big of a deal if the data gets lost. (Otherwise, I would be very sad. 😢)<sub>

## Conditions
* **Single File** - The entire project is in server.js.
* **No Images** - The project does not contain any images (how would it have images if it's only one file?)
* **Homemade** - No 3rd party libraries are used, only Node's built-in HTTP library.

## Demo
You can try out the game at https://bvb.cheeserinc.com.

## AI Usage
Absolutely no AI was used in the making of this project. However, I did take some functions (such as the JSON parser) from [this DigitalOcean tutorial](https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module). I learned what the functions did instead of just copying them, and you can see my comments in [tutorial-server.js](https://github.com/Meanbox12/buttonvsbutton/blob/70c266c8fdac4d8961a6878bdd049374eb16427c/tutorial-server.js) (which I deleted to make the project only one file).