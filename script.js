// DOM Elements of interest
const fragmentEl = document.createDocumentFragment();
const featuredMovieEl = document.querySelector("section#featured-movie");
const movieMenuEl = document.querySelector("ul#films");

async function main() {
  showFirstMovieDetails();
  showMovieMenu();
}

// Utility functions
async function showFirstMovieDetails() {
  const movie = await getMovie(1);
  displayMovie(movie);
}

async function getMovie(movieId) {
  const movies = await fetchMovies();
  return movies.find((movie) => movie.id === movieId.toString());
}

async function fetchMovies() {
  try {
    // Fetch user data from the API
    const response = await fetch("http://localhost:3000/movies");

    // Check if the response is okay
    if (!response.ok) {
      throw new Error(`Network response was not ok ${response.statusText}`);
    }

    // Parse the JSON data
    const moviesData = await response.json();

    // return the films data
    return moviesData;
  } catch (error) {
    // Handle any errors that occurred during the fetch
    console.error(`There has been an error with your fetch operation ${error}`);
  }
}

function displayMovie(movie) {
  const movieEl = createMovieCardEl(movie);
  featuredMovieEl.appendChild(movieEl);
}

function createMovieCardEl(movie) {
  const movieEl = document.createElement("div");
  movieEl.classList.add("card");
  movieEl.style.width = "18rem";

  const img = document.createElement("img");
  img.setAttribute("src", movie.poster);
  img.setAttribute("alt", movie.title);
  img.classList.add("card-img-top");

  const body = document.createElement("div");
  body.classList.add("card-body");

  const h5 = document.createElement("h5");
  h5.textContent = movie.title;
  h5.classList.add("card-title");
  body.appendChild(h5);

  const p = document.createElement("p");
  p.textContent = movie.description;
  p.classList.add("card-text");
  body.appendChild(p);

  const footer = document.createElement("div");
  footer.textContent = `Available tickets: ${availableTickets(
    movie.capacity,
    movie.tickets_sold
  )}`;
  footer.classList.add("card-footer");

  movieEl.append(img, body, footer);

  return movieEl;
}

function availableTickets(capacity, tickets_sold) {
  return capacity - tickets_sold;
}

async function showMovieMenu() {
  const allMovies = await fetchMovies();
  createMovieMenu(allMovies);
  displayMovieMenu();
}

function createMovieMenu(movies) {
  const movieMenuElCollection = [];
  for (const movie of movies) {
    const movieMenuEl = createMovieMenuItem(movie);
    movieMenuElCollection.push(movieMenuEl);
  }
  addCollectionToFragmentEl(movieMenuElCollection);
}

function createMovieMenuItem(movie) {
  const menuItem = document.createElement("li");
  menuItem.classList.add("list-group-item", "d-flex");

  const p = document.createElement("p");
  p.classList.add("ms-2");
  p.textContent = movie.title;

  const img = document.createElement("img");
  img.setAttribute("src", movie.poster);
  img.setAttribute("alt", movie.title);
  img.classList.add("mw-25", "movie-menu-item-img");

  menuItem.append(img, p);
  return menuItem;
}

function displayMovieMenu() {
  movieMenuEl.appendChild(fragmentEl);
}

function addCollectionToFragmentEl(collection) {
  for (const item of collection) {
    fragmentEl.appendChild(item);
  }
}

main();
