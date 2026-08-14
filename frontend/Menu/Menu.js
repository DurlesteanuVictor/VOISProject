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

const servicesContainer = document.getElementById('services-container');
const API_URL = "/api/get-companii"; 

if (servicesContainer) {
  servicesContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('booking-btn')) {
      event.stopPropagation();

      const card = event.target.closest('.card');
      if (card) {
        const bookingCompany = {
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
        localStorage.setItem('checkout_date', selectedDate.toISOString());
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

async function incarcaCompaniile() {
  if (!servicesContainer) return;

  try {
    servicesContainer.innerHTML = "<p style='text-align:center; width:100%;'>Se încarcă serviciile...</p>";
    
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Eroare rețea");
    
    const companii = await response.json();
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

  companii.forEach((companie, index) => {
    const animationDelay = (index * 0.06).toFixed(2);
    const cardHTML = `
      <div class="card" style="animation-delay: ${animationDelay}s;" data-nume="${companie.nume}" data-pret="${companie.pret}" data-locatie="${companie.locatie}" data-descriere="${companie.descriere}" data-rating="${companie.rating}" data-stele="${companie.stele}">
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