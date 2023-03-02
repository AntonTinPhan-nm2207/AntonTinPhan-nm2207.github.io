// API urls
const api_url_dish = 'https://www.themealdb.com/api/json/v1/1/random.php';
const api_url_ingredients = 'https://www.themealdb.com/api/json/v1/1/list.php?i=list';

// Importing packages
const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const { isPromise } = require("util/types");

// Init server and socket
const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// State variables
var gameState = "";
var gameDataFetched = false;

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Fetching data
// Start server (only if we have loaded gamedata)
const ingredients = fetchData(api_url_ingredients);
const dish = fetchData(api_url_dish);

// (async () => {
//     ingredients.concat(await fetchData(api_url_ingredients));
//     dish.concat(await fetchData(api_url_dish));
// })

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log(dish);
console.log(ingredients);

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Handle socket request from client
const connections = [null, null];
io.on("connection", socket => {
    console.log(`New socket connection:`);

    // Find available player spot
    let playerIndex = null;
    for (let i in connections) {
        if (!connections[i]) {
            playerIndex = i;
            break;
        }
    }
    // Notify client about player number
    socket.emit("player-number", playerIndex);
    console.log(`Player number # ${playerIndex} connected`);
    // Ignore future connections if lobby full
    if (!playerIndex) return;
    // Fill player space
    connections[playerIndex] = true;

    // Send game data
    socket.emit("game-data", ingredients, dish);
});


// Fetches data (promise => data)
async function fetchData(api_url) {
    return fetch(api_url)
        .then(async (promise) => await promise.json())
        .then((data) => data.meals)
        .catch(error => console.log(error))
}

async function loadIngredients() {
    return fetchData(api_url_ingredients);
}
async function loadDish() {
    return fetchData(api_url_dish);
}

// // startup function
// async function startup() {
//     // Fetching ingredients
//     const allIngredients = await fetchData(api_url_ingredients);
//     postIngredients(allIngredients);
//     console.log(allIngredients);
//     // console.log(allIngredients.find(o => o.strIngredient == "Salmon"));

//     // Fetching dish
//     const dish = await fetchData(api_url_dish).then(data => data[0]);
//     const dish_ingredients = filterIngredients(dish);
//     postDish(dish);
//     console.log(dish_ingredients);
//     console.log(dish)
// }
