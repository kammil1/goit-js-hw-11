import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-form input');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

loadMoreBtn.style.display = 'none';

let findValue;
let page = 1;
let perpage = 40;
let searchQuery;
let totalHits;

searchForm.addEventListener('submit', async event => {
  event.preventDefault();
  page = 1;
  loadMoreBtn.style.display = 'block';
  gallery.innerHTML = '';
  searchQuery = searchInput.value.trim();

  if (searchQuery === '') {
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.info('Please fill the field!');
    return;
  }

  findValue = searchQuery.split(' ').join('+');

  try {
    photos = await fetchPhoto(findValue, page);
    renderImages(photos);
    page += 1;

    totalHits = photos.totalHits;

    if (photos.totalHits == 0) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else {
      Notiflix.Notify.success(`Hooray! We found ${photos.totalHits} images.`);
    }

    if (photos.totalHits < perpage) {
      gallery.insertAdjacentHTML(
        'beforeend',
        `<h2 class = 'down-text'>We're sorry, but you've reached the end of search results</h2>`
      );
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    console.log(error.message);
    Notiflix.Notify.failure('There is a problem with searching, try again');
  }
  form.reset();
});

loadMoreBtn.addEventListener('click', loadMore);

async function loadMore() {
  try {
    photos = await fetchPhoto(findValue, page);
    renderImages(photos);
    page += 1;
    totalHits -= perpage;

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect('.photo-card');

    window.scrollBy({
      top: cardHeight,
      behavior: 'smooth',
    });

    if (totalHits < perpage) {
      gallery.insertAdjacentHTML(
        'beforeend',
        "<h2 class = 'down-text'> We're sorry, but you've reached the end of search results</h2>"
      );
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    console.log(error.message);
    Notiflix.Notify.failure('There is some problem with loading more photos!');
  }
}

async function fetchPhoto(findValue, page) {
  const searchParams = new URLSearchParams({
    key: '42649733-5993dbfe8e8a355fb15e3b6ec',
    q: findValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: 'perpage',
    page: page,
  });

  const response = await axios.get(`https://pixabay.com/api/?${searchParams}`);

  return response.data;
}

function renderImages(items) {
  const markup = items.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
            <a href="${largeImageURL}">
              <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
              <p class="info-item">
              <b>${likes} Likes</b>
              </p>
              <p class="info-item">
              <b>${views} Views</b>
              </p>
              <p class="info-item">
              <b>${comments} Comments</b>
              </p>
              <p class="info-item">
              <b>${downloads} Downloads</b>
              </p>
            </div>
          </div>`;
      }
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);

  const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt' });
  lightbox.refresh();
}
