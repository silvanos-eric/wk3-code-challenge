// DOM Elements of interest
const fragmentEl = document.createDocumentFragment();
const featuredMovieEl = document.querySelector("section#featured-movie");
const movieMenuEl = document.querySelector("ul#movies");

async function main() {
  showFirstMovieDetails();
  showMovieMenu();
  initializeTicketPurchase();
  initializeUpdateSelectedMovie();
}

// Utility functions
async function showFirstMovieDetails() {
  const movie = await getMovie(1);
  displayMovieCard(movie);
}

async function getMovie(movieId) {
  const movies = await fetchMovies();
  return movies.find((movie) => movie.id === movieId.toString());
}

async function fetchMovies() {
  try {
    // Fetch user data from the API
    const response = await fetch(
      "https://json-server-vercel-three-pearl.vercel.app/movies"
    );

    // Check if the response is okay
    if (!response.ok) {
      throw new Error(`Network response was not ok ${response.statusText}`);
    } else {
    }

    // Parse the JSON data
    const moviesData = await response.json();

    // return the movies data
    return moviesData;
  } catch (error) {
    // Handle any errors that occurred during the fetch
    console.error(`There has been an error with your fetch operation ${error}`);
  }
}

function displayMovieCard(movieData) {
  if (featuredMovieEl.querySelector("div")) {
    featuredMovieEl.querySelector("div").remove();
  }
  const movieEl = createSelectedMovieCard(movieData);
  featuredMovieEl.appendChild(movieEl);
}

function createSelectedMovieCard(movie) {
  const ableToBuyTicket = allowBuyTicket(movie.capacity, movie.tickets_sold);

  const movieEl = document.createElement("div");
  movieEl.classList.add("card");
  movieEl.style.width = "18rem";
  movieEl.dataset.id = movie.id;

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

  const button = document.createElement("button");
  if (ableToBuyTicket) {
    button.textContent = "Buy Ticket";
    button.classList.add("btn", "btn-success");
    button.setAttribute("id", "purchase-ticket");
  } else {
    button.classList.add("btn", "btn-secondary");
    button.textContent = "Sold Out";
    button.setAttribute("disabled", true);
  }
  body.appendChild(button);

  const footer = document.createElement("div");
  footer.classList.add("card-footer");

  const ul = document.createElement("ul");
  ul.classList.add("list-group");

  const runtimeEl = document.createElement("li");
  runtimeEl.textContent = `Runtime: ${convertToHoursAndMinutes(movie.runtime)}`;
  runtimeEl.classList.add("list-group-item");
  ul.appendChild(runtimeEl);

  const showTimeEl = document.createElement("li");
  showTimeEl.textContent = `Showtime: ${movie.showtime}`;
  showTimeEl.classList.add("list-group-item");
  ul.appendChild(showTimeEl);

  if (ableToBuyTicket) {
    const availableTicketsEl = document.createElement("li");
    availableTicketsEl.textContent = `Available tickets: ${availableTickets(
      movie.capacity,
      movie.tickets_sold
    )}`;
    availableTicketsEl.classList.add("list-group-item", "available-tickets");
    availableTicketsEl.dataset.tickets_sold = movie.tickets_sold;
    ul.appendChild(availableTicketsEl);
  }

  footer.appendChild(ul);

  movieEl.append(img, body, footer);

  return movieEl;
}

function availableTickets(capacity, tickets_sold) {
  return capacity - tickets_sold;
}

async function showMovieMenu() {
  const allMoviesData = await fetchMovies();
  createMovieMenu(allMoviesData);
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
  menuItem.classList.add("movie-item", "list-group-item", "d-flex");
  menuItem.dataset.id = movie.id;

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

function allowBuyTicket(capacity, tickets_sold) {
  const remainingTickets = availableTickets(capacity, tickets_sold);
  if (remainingTickets <= 0) {
    return false;
  }
  return true;
}

function convertToHoursAndMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} ${hours > 1 ? "hours" : "hour"} and ${minutes} ${
    minutes > 1 ? "minutes" : "minute"
  }`;
}

function initializeTicketPurchase() {
  featuredMovieEl.addEventListener("click", (event) => {
    if (event.target.matches("button#purchase-ticket")) {
      const cardBody = event.target.parentElement;
      const card = cardBody.parentElement;
      const movieId = card.dataset.id;

      const availableTicketsEl = card.querySelector("li.available-tickets");
      const ticketsSoldBeforePurchase = Number.parseInt(
        availableTicketsEl.dataset.tickets_sold
      );

      const ticketsSoldAfterPurchase = ticketsSoldBeforePurchase + 1;

      updateMovie(movieId, ticketsSoldAfterPurchase);
    }
  });
}

async function updateMovie(movieId, newTicketsSold) {
  const updateMovie = await patchMovie(movieId, newTicketsSold);
  displayMovieCard(updateMovie);
}

async function patchMovie(movieId, newTicketsSold) {
  try {
    // Fetch user data from the API
    const response = await fetch(`http://localhost:3000/movies/${movieId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        tickets_sold: newTicketsSold,
      }),
    });

    // Check if the response is okay
    if (!response.ok) {
      throw new Error(`Network response was not ok ${response.statusText}`);
    }

    // Parse the JSON data
    const movieData = await response.json();

    // return the movies data
    return movieData;
  } catch (error) {
    // Handle any errors that occurred during the fetch
    console.error(`There has been an error with your fetch operation ${error}`);
  }
}

function initializeUpdateSelectedMovie() {
  initializeSelectingAMovie();
}

function initializeSelectingAMovie() {
  const movieList = document.querySelector("ul#movies");

  let selectedMovieListItem = undefined;
  let selectedMovieId = undefined;

  movieList.addEventListener("click", async (event) => {
    if (event.target.matches("li") || event.target.matches("li *")) {
      if (event.target.nodeName === "LI") {
        selectedMovieListItem = event.target;
      } else {
        const childEl = event.target;
        selectedMovieListItem = childEl.parentElement;
      }
      selectedMovieId = Number.parseInt(selectedMovieListItem.dataset.id);
    }
    const movieData = await getMovie(selectedMovieId);
    displayMovieCard(movieData);
    scrollMovieCardIntoView();
  });
}

function scrollMovieCardIntoView() {
  const movieCardEl = document.querySelector("div.card");
  movieCardEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

main();
