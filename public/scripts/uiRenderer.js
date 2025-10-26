import { playSongFromPlaylist } from './musicPlayer.js';
import { albumSections } from './albums.js';
const contentArea = document.getElementById("album-sections");
const navLinks = document.querySelectorAll('.nav-link');

// Function to render the Library Page with the theme toggle
function renderLibraryPage() {
  contentArea.innerHTML = `
        <div class="page-view">
            <div class="page-header">
                <h1>Your Library</h1>
            </div>
            <div class="library-section">
                <h3 class="library-heading">Your Library</h3>
                <ul>
                    <li><a href="#">Liked Songs</a></li>
                    <li><a href="#">Your Playlists</a></li>
                    <li><a href="#">Favorite Artists</a></li>
                    <li><a href="#">Albums</a></li>
                </ul>
            </div>
            <div class="library-section">
                <h3 class="library-heading">Playlists</h3>
                <ul>
                    <li><a href="#">My Playlist #1</a></li>
                    <li><a href="#">Workout Mix</a></li>
                    <li><a href="#">Chill Vibes</a></li>
                    <li><a href="#">Road Trip</a></li>
                </ul>
            </div>
        </div>
    `;
}

// Renders the main home page view from the albumSections data
export function renderHomePage() {
  contentArea.innerHTML = ""; // Clear previous content
  albumSections.forEach(section => {
    contentArea.appendChild(createSectionElement(section));
  });
  attachScrollButtonListeners();
}

// Renders the detail/placeholder page view for playlists/artists
function renderDetailPage(type, name) {
  contentArea.innerHTML = `
        <div class="page-view">
            <button class="back-btn">&#10094; Go Back</button>
            <h1>${type}: ${name}</h1>
            <p>Content for this page will be built in a future phase.</p>
        </div>`;
  contentArea.querySelector('.back-btn').addEventListener('click', () => {
    window.history.back(); // Use browser history to go back
  });
}

// Renders a placeholder search page
function renderSearchPage() {
  contentArea.innerHTML = `
        <div class="page-view">
            <h1>Search</h1>
            <p>The search feature will be built in a future phase.</p>
        </div>
    `;
}

// Main router function to decide which page to show
function router() {
  const hash = window.location.hash;

  // Update active link
  navLinks.forEach(link => {
    // Check if the link's hash matches or if it's the home link for an empty hash
    if (link.hash === hash || (link.hash === '#' && hash === '')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if (hash === '#library') {
    renderLibraryPage();
  } else if (hash === '#search') {
    renderSearchPage();
  } else if (hash.startsWith("#playlist/") || hash.startsWith("#artist/")) {
    const [type, name] = hash.substring(1).split("/");
    renderDetailPage(type, decodeURIComponent(name));
  } else {
    renderHomePage();
  }
}

function createSectionElement(section) {
  const fragment = document.createDocumentFragment();
  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = section.title;
  fragment.appendChild(sectionTitle);
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  if (section.type === 'artist') {
    wrapper.classList.add('artist-section');
  }
  const cardContainer = document.createElement('div');
  cardContainer.className = 'card-container';
  const items = section.songs || section.items;
  items.forEach((item, index) => {
    cardContainer.appendChild(createCardElement(item, section, index));
  });
  wrapper.appendChild(createScrollButton('scroll-left'));
  wrapper.appendChild(cardContainer);
  wrapper.appendChild(createScrollButton('scroll-right'));
  fragment.appendChild(wrapper);
  return fragment;
}

function createCardElement(item, section, index) {
  const card = document.createElement('div');
  card.className = 'card';
  if (section.type === 'song') {
    card.addEventListener('click', () => {
      playSongFromPlaylist(section.songs, index);
    });
  } else {
    card.addEventListener('click', () => {
      window.location.hash = `${section.type}/${encodeURIComponent(item.name)}`;
    });
  }
  const imgDiv = document.createElement('div');
  imgDiv.className = 'card-img-div';
  const img = document.createElement('img');
  img.src = item.img;
  img.alt = item.name || item.title;
  img.className = 'album-img';
  imgDiv.appendChild(img);
  const nameDiv = document.createElement('div');
  nameDiv.className = 'album-name-div';
  const name = document.createElement('div');
  name.className = 'album-name';
  name.textContent = item.name || item.title;
  nameDiv.appendChild(name);
  card.appendChild(imgDiv);
  card.appendChild(nameDiv);
  if (section.type === 'song') {
    const artist = document.createElement('div');
    artist.className = 'artist-name';
    artist.textContent = item.artist;
    card.appendChild(artist);
  }
  return card;
}

function createScrollButton(direction) {
  const btn = document.createElement('button');
  btn.className = `scroll-btn ${direction}`;
  btn.innerHTML = direction === 'scroll-left' ? '&#10094;' : '&#10095;';
  return btn;
}

function attachScrollButtonListeners() {
  document.querySelectorAll('.wrapper').forEach(wrapper => {
    const cardContainer = wrapper.querySelector('.card-container');
    const leftBtn = wrapper.querySelector('.scroll-left');
    const rightBtn = wrapper.querySelector('.scroll-right');
    wrapper.addEventListener('mouseenter', () => wrapper.classList.add('show-buttons'));
    wrapper.addEventListener('mouseleave', () => wrapper.classList.remove('show-buttons'));
    leftBtn.addEventListener('click', () => cardContainer.scrollBy({
      left: -1200,
      behavior: 'smooth'
    }));
    rightBtn.addEventListener('click', () => cardContainer.scrollBy({
      left: 1200,
      behavior: 'smooth'
    }));
  });
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router); // Run router on initial load