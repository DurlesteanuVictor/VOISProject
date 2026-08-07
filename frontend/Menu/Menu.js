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

  if (!isActive) {
    navGroup.classList.add('active');
  }
}

function closeAllMenus() {
  document.querySelectorAll('.nav-group').forEach((item) => {
    item.classList.remove('active');
  });
  calendarDropdown.classList.add('hidden');
}

document.querySelectorAll('.nav-toggle-btn[data-menu-target]').forEach((btn) => {
  btn.addEventListener('click', () => {
    toggleMenu(btn.dataset.menuTarget);
  });
});

document.addEventListener('click', (event) => {
  const isClickInsideNavGroup = event.target.closest('.nav-group');

  if (!isClickInsideNavGroup) {
    closeAllMenus();
  }
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

  document.querySelectorAll('.nav-group').forEach((item) => {
    item.classList.remove('active');
  });

  calendarDropdown.classList.toggle('hidden');

  if (wasHidden) {
    renderCalendar();
  }
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

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.toggle('open');
  });
});

document.querySelectorAll('.booking-btn').forEach((btn) => {
  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    window.location.href = '../Checkout/Checkout.html';
  });
});

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