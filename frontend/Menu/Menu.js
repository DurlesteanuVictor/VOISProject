const menuLink = document.getElementById('menu-link');

menuLink.addEventListener('click', (event) => {
  event.preventDefault();
  window.location.reload();
});

function toggleMenu(menuId) {
  const menu = document.getElementById(menuId);
  const navGroup = menu.parentElement;
  const isActive = navGroup.classList.contains('active');

  closeAllMenus();
  if (!isActive) navGroup.classList.add('active');
}

function closeAllMenus() {
  document.querySelectorAll('.nav-group').forEach((item) => {
    item.classList.remove('active');
  });
  calendarDropdown.classList.add('hidden');
  locationPanel.classList.add('hidden');
}

document.querySelectorAll('.nav-toggle-btn[data-menu-target]').forEach((btn) => {
  btn.addEventListener('click', () => toggleMenu(btn.dataset.menuTarget));
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav-group')) closeAllMenus();
});

// --- Setări Calendar ---

const dateBtn = document.getElementById('date-btn');
const calendarDropdown = document.getElementById('calendar-dropdown');
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthLabel = document.getElementById('calendar-month-label');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

const dayNames = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];
const monthNames = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

let currentDate = new Date();
let selectedDate = null;

dateBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  const wasHidden = calendarDropdown.classList.contains('hidden');
  
  closeAllMenus();
  calendarDropdown.classList.toggle('hidden');
  if (wasHidden) renderCalendar();
});

prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  calendarMonthLabel.textContent = `${monthNames[month]} ${year}`;
  calendarGrid.innerHTML = '';

  dayNames.forEach((name) => {
    const nameEl = document.createElement('div');
    nameEl.className = 'calendar-day-name';
    nameEl.textContent = name;
    calendarGrid.appendChild(nameEl);
  });

  const firstDayOfMonth = new Date(year, month, 1);
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  for (let i = 0; i < startOffset; i++) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyEl);
  }

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;

    if (
      selectedDate &&
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    ) {
      dayEl.classList.add('selected');
    }

    dayEl.addEventListener('click', () => {
      selectedDate = new Date(year, month, day);
      dateBtn.textContent = selectedDate.toLocaleDateString('ro-RO');
      renderCalendar();
    });

    calendarGrid.appendChild(dayEl);
  }
}

// --- Location Settings ---

const locationBtn = document.getElementById('location-btn');
const locationPanel = document.getElementById('location-panel');
const locationRadiusInput = document.getElementById('location-radius');
const locationRadiusValue = document.getElementById('location-radius-value');
const locationAddressInput = document.getElementById('location-address');
const locationSearchBtn = document.getElementById('location-search-btn');
const locationCurrentBtn = document.getElementById('location-current-btn');
const locationApplyBtn = document.getElementById('location-apply-btn');

const DEFAULT_LAT = 47.1585;
const DEFAULT_LON = 27.6014;

let locationMap = null;
let locationMarker = null;
let locationCircle = null;
let mapInitialized = false;

function initLocationMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  locationMap = L.map('location-map').setView([DEFAULT_LAT, DEFAULT_LON], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(locationMap);

  L.control.scale({ metric: true, imperial: false }).addTo(locationMap);

  locationMarker = L.marker([DEFAULT_LAT, DEFAULT_LON]).addTo(locationMap);
  locationCircle = L.circle([DEFAULT_LAT, DEFAULT_LON], {
    radius: locationRadiusInput.value * 1000,
    color: '#0096FF',
    fillColor: '#0096FF',
    fillOpacity: 0.15
  }).addTo(locationMap);

  locationMap.on('click', (event) => {
    setLocationPoint(event.latlng.lat, event.latlng.lng);
  });
}

function setLocationPoint(lat, lon) {
  locationMarker.setLatLng([lat, lon]);
  locationCircle.setLatLng([lat, lon]);
  locationMap.setView([lat, lon], locationMap.getZoom());
}

locationBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  const wasHidden = locationPanel.classList.contains('hidden');

  closeAllMenus();
  locationPanel.classList.toggle('hidden');

  if (wasHidden) {
    initLocationMap();
    setTimeout(() => locationMap.invalidateSize(), 200);
  }
});

locationRadiusInput.addEventListener('input', () => {
  locationRadiusValue.textContent = locationRadiusInput.value;
  if (locationCircle) locationCircle.setRadius(locationRadiusInput.value * 1000);
});

locationSearchBtn.addEventListener('click', () => {
  const query = locationAddressInput.value.trim();
  if (!query) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
    .then((response) => response.json())
    .then((results) => {
      if (results.length === 0) {
        alert('Location not found. Try a different address.');
        return;
      }
      setLocationPoint(parseFloat(results[0].lat), parseFloat(results[0].lon));
    })
    .catch(() => {
      alert('Could not search for that address right now.');
    });
});

locationCurrentBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Your browser does not support location detection.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocationPoint(position.coords.latitude, position.coords.longitude);
    },
    () => {
      alert('Could not get your current location.');
    }
  );
});

locationApplyBtn.addEventListener('click', () => {
  const chosenLocation = {
    lat: locationMarker.getLatLng().lat,
    lon: locationMarker.getLatLng().lng,
    radiusKm: Number(locationRadiusInput.value)
  };

  localStorage.setItem('preferredLocation', JSON.stringify(chosenLocation));
  locationPanel.classList.add('hidden');
  incarcaCompaniile(); 
});

function calculeazaDistanta(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const servicesContainer = document.getElementById('services-container');
const API_URL = "http://127.0.0.1:8000/api/companies/all"; 

// Event delegation pentru cardurile generate dinamic
if (servicesContainer) {
  servicesContainer.addEventListener('click', (event) => {
    const ratingClicked = event.target.closest('.rating');
    if (ratingClicked) {
      event.stopPropagation();
      openReviewModal(ratingClicked.dataset.companyId);
      return;
    }

    if (event.target.classList.contains('booking-btn')) {
      event.stopPropagation();
      window.location.href = '../Checkout/Checkout.html';
      return;
    }

    const clickedCard = event.target.closest('.card');
    if (clickedCard) clickedCard.classList.toggle('open');
  });
}

async function incarcaCompaniile() {
  if (!servicesContainer) return;
  try {
    servicesContainer.innerHTML = "<p style='text-align:center; width:100%;'>Se încarcă serviciile...</p>";
    
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Eroare rețea");
    
    let companii = await response.json();
    const preferintaSalvata = localStorage.getItem('preferredLocation');
    if (preferintaSalvata) {
        const preferinta = JSON.parse(preferintaSalvata);
        companii = companii.filter(companie => {
            if (companie.lat === 0 && companie.lon === 0) return false;
            const distanta = calculeazaDistanta(preferinta.lat, preferinta.lon, companie.lat, companie.lon);
            return distanta <= preferinta.radiusKm;
        });
    }
    randeazaCompanii(companii);
  } catch (error) {
    console.error("Eroare fetch companii:", error);
    servicesContainer.innerHTML = "<p style='text-align:center; width:100%; color:red;'>Nu am putut încărca lista de servicii.</p>";
  }
}

function randeazaCompanii(companii) {
  servicesContainer.innerHTML = ""; 

  if (companii.length === 0) {
    servicesContainer.innerHTML = "<p style='text-align:center; width:100%;'>Nicio companie înregistrată momentan.</p>";
    return;
  }

  companii.forEach(companie => {
    const cardHTML = `
      <div class="card" data-company-id="${companie.id}">
        <div class="card-header">
          <h3>${companie.nume}</h3>
          <div class="rating" data-company-id="${companie.id}">
            <span class="rating-number">${companie.rating}</span>
            <span class="stars">${companie.stele}</span>
            <span class="review-count">(0)</span>
          </div>
          <span class="price">${companie.pret}</span>
        </div>
        <div class="card-body">
          <div class="card-content">
            <p class="location-text" style="font-weight: bold; margin-bottom: 5px;">📍 ${companie.locatie}</p>
            <p>${companie.descriere}</p>
            <button class="booking-btn">Booking</button>
          </div>
        </div>
      </div>
    `;
    servicesContainer.insertAdjacentHTML('beforeend', cardHTML);
  });

  applyStoredReviews();
}

incarcaCompaniile();

// --- Efect Motto (Typewriter) ---

const mottoEl = document.getElementById('page-motto');

if (mottoEl) {
  const mottoText = mottoEl.dataset.text;
  let mottoCharIndex = 0;

  function typeMotto() {
    if (mottoCharIndex <= mottoText.length) {
      mottoEl.textContent = mottoText.slice(0, mottoCharIndex);
      mottoCharIndex++;
      setTimeout(typeMotto, 60);
    }
  }

  typeMotto();
}
// --- Reviews ---

const reviewModalOverlay = document.getElementById('review-modal-overlay');
const reviewCancelBtn = document.getElementById('review-cancel-btn');
const reviewSubmitBtn = document.getElementById('review-submit-btn');

let activeReviewCompanyId = null;

function openReviewModal(companyId) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('Please log in to leave a review.');
    window.location.href = '../Login/Login.html';
    return;
  }

  activeReviewCompanyId = companyId;

  document.querySelectorAll('.review-stars').forEach((starsRow) => {
    starsRow.dataset.value = '0';
    updateStarsDisplay(starsRow, 0);
  });

  reviewModalOverlay.classList.remove('hidden');
}

function closeReviewModal() {
  reviewModalOverlay.classList.add('hidden');
  activeReviewCompanyId = null;
}

function updateStarsDisplay(starsRow, value) {
  starsRow.querySelectorAll('.review-star').forEach((starEl) => {
    const starNumber = Number(starEl.dataset.star);
    starEl.classList.toggle('filled', starNumber <= value);
  });
}

document.querySelectorAll('.review-stars').forEach((starsRow) => {
  starsRow.querySelectorAll('.review-star').forEach((starEl) => {
    starEl.addEventListener('click', () => {
      const value = Number(starEl.dataset.star);
      starsRow.dataset.value = value;
      updateStarsDisplay(starsRow, value);
    });
  });
});

reviewCancelBtn.addEventListener('click', closeReviewModal);

reviewSubmitBtn.addEventListener('click', () => {
  const starsRows = document.querySelectorAll('.review-stars');
  let total = 0;
  let unanswered = false;

  starsRows.forEach((starsRow) => {
    const value = Number(starsRow.dataset.value);
    if (value === 0) unanswered = true;
    total += value;
  });

  if (unanswered) {
    alert('Please rate all categories before submitting.');
    return;
  }

  const thisReviewAverage = total / starsRows.length;
  saveReview(activeReviewCompanyId, thisReviewAverage);
  updateCardDisplay(activeReviewCompanyId);
  closeReviewModal();
});

function getStoredReviews() {
  const raw = localStorage.getItem('companyReviews');
  return raw ? JSON.parse(raw) : {};
}

function saveReview(companyId, averageForThisReview) {
  const allReviews = getStoredReviews();
  const existing = allReviews[companyId] || { totalScore: 0, count: 0 };

  existing.totalScore += averageForThisReview;
  existing.count += 1;

  allReviews[companyId] = existing;
  localStorage.setItem('companyReviews', JSON.stringify(allReviews));
}

function starsToText(rating) {
  const roundedRating = Math.round(rating);
  return '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);
}

function updateCardDisplay(companyId) {
  const allReviews = getStoredReviews();
  const companyReviews = allReviews[companyId];
  if (!companyReviews) return;

  const average = companyReviews.totalScore / companyReviews.count;
  const ratingEl = document.querySelector(`.rating[data-company-id="${companyId}"]`);
  if (!ratingEl) return;

  ratingEl.querySelector('.rating-number').textContent = average.toFixed(1);
  ratingEl.querySelector('.stars').textContent = starsToText(average);
  ratingEl.querySelector('.review-count').textContent = `(${companyReviews.count})`;
}

function applyStoredReviews() {
  const allReviews = getStoredReviews();
  Object.keys(allReviews).forEach((companyId) => updateCardDisplay(companyId));
}
