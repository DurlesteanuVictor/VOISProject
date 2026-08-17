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

const dateBtn = document.getElementById('date-btn');
const calendarDropdown = document.getElementById('calendar-dropdown');
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthLabel = document.getElementById('calendar-month-label');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
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
      dateBtn.textContent = selectedDate.toLocaleDateString('en-GB');
      renderCalendar();
    });
    
    calendarGrid.appendChild(dayEl);
  }
}

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
    color: '#5a8dee',
    fillColor: '#5a8dee',
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
  alert('Location saved! Filtering companies by distance is not connected to the backend yet.');
  locationPanel.classList.add('hidden');
});

const servicesContainer = document.getElementById('services-container');
// RESTAURAT LINK-UL REAL CATRE API
const API_URL = "http://127.0.0.1:8000/api/companies/all";
let companiiIncarcate = [];

if (servicesContainer) {
  servicesContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('booking-btn')) {
      event.stopPropagation();
      const card = event.target.closest('.card');
      if (card) {
        const bookingCompany = {
          id: card.dataset.id || '', // NE ASIGURĂM CĂ ID-UL AJUNGE ÎN CHECKOUT
          nume: card.dataset.nume || '',
          pret: card.dataset.pret || '',
          locatie: card.dataset.locatie || '',
          descriere: card.dataset.descriere || '',
          rating: card.dataset.rating || '',
          stele: card.dataset.stele || ''
        };
        localStorage.setItem('checkout_company', JSON.stringify(bookingCompany));
      }
      if (selectedDate) {
        // format YYYY-MM-DD asteptat de backend
        const an = selectedDate.getFullYear();
        const luna = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const zi = String(selectedDate.getDate()).padStart(2, '0');
        const dataFormatata = `${an}-${luna}-${zi}`;
        localStorage.setItem('checkout_date', dataFormatata);
      } else {
        localStorage.removeItem('checkout_date');
      }
      window.location.href = '../Checkout/Checkout.html';
      return;
    }
    const clickedCard = event.target.closest('.card');
    if (clickedCard) clickedCard.classList.toggle('open');
  });
}

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

async function incarcaCompaniile() {
  if (!servicesContainer) return;
  try {
    servicesContainer.innerHTML = "<p style='text-align:center; width:100%;'>Loading services...</p>";
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Network error");
    
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
    
    companiiIncarcate = companii;
    randeazaCompanii(companii);
  } catch (error) {
    console.error("Error fetching companies:", error);
    servicesContainer.innerHTML = "<p style='text-align:center; width:100%; color:red;'>Could not load the list of services.</p>";
  }
}

function randeazaCompanii(companii) {
  servicesContainer.innerHTML = "";
  if (companii.length === 0) {
    servicesContainer.innerHTML = "<p style='text-align:center; width:100%;'>No companies registered at the moment.</p>";
    return;
  }
  
  companii.forEach((companie, index) => {
    const animationDelay = (index * 0.06).toFixed(2);
    // ADAUGAT data-id="${companie.id}" ca sa functioneze checkout-ul!
    const cardHTML = `
      <div class="card" style="animation-delay: ${animationDelay}s;" data-id="${companie.id}" data-nume="${companie.nume}" data-pret="${companie.pret}" data-locatie="${companie.locatie}" data-descriere="${companie.descriere}" data-rating="${companie.rating}" data-stele="${companie.stele}">
        <div class="card-header">
          <h3>${companie.nume}</h3>
          <div class="rating">
            <span class="rating-number">${companie.rating}</span>
            <span class="stars">${companie.stele}</span>
          </div>
          <span class="price">${companie.pret}</span>
        </div>
        <div class="card-body">
          <div class="card-content">
            <p class="location-text" style="font-weight: bold; margin-bottom: 5px;">📍 ${companie.locatie}</p>
            <p>${companie.descriere}</p>
            <button class="booking-btn">Checkout</button>
          </div>
        </div>
      </div>
    `;
    servicesContainer.insertAdjacentHTML('beforeend', cardHTML);
  });
}

incarcaCompaniile();

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

// RESTAURAT FUNCTIA NOASTRA DE AVATAR!
async function incarcaAvatarUtilizator() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/profile?t=" + new Date().getTime(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.avatar_url) {
                const avatarImg = document.querySelector('.account-avatar');
                if (avatarImg) {
                    avatarImg.src = data.avatar_url;
                }
            }
        }
    } catch (error) {
        console.error("Eroare la incarcarea pozei de profil in meniu:", error);
    }
}

incarcaAvatarUtilizator();