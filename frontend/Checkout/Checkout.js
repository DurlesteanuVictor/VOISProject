const companyRaw = localStorage.getItem('checkout_company');
const checkoutDateRaw = localStorage.getItem('checkout_date');

if (companyRaw) {
  const company = JSON.parse(companyRaw);

  document.getElementById('company-name').textContent = company.nume || 'Nume companie';
  document.getElementById('company-rating').textContent = company.rating || '-';
  document.getElementById('company-stars').textContent = company.stele || '';
  document.getElementById('company-location').textContent = company.locatie
    ? `\u{1F4CD} ${company.locatie}`
    : 'Locație indisponibilă';
  document.getElementById('company-description').textContent = company.descriere || 'Nicio descriere disponibilă.';
  document.getElementById('checkout-price').textContent = company.pret || '-';
}

if (checkoutDateRaw) {
  const parsedDate = new Date(checkoutDateRaw);
  document.getElementById('checkout-date').textContent = parsedDate.toLocaleDateString('ro-RO');
} else {
  document.getElementById('checkout-date').textContent = 'Nespecificată';
}

const hourDropdown = document.getElementById('hour-dropdown');
const hourToggle = document.getElementById('hour-dropdown-toggle');
const hourList = document.getElementById('hour-dropdown-list');

for (let hour = 8; hour < 18; hour++) {
  const start = hour.toString().padStart(2, '0');
  const end = (hour + 1).toString().padStart(2, '0');
  const label = `${start}:00 - ${end}:00`;

  const optionEl = document.createElement('div');
  optionEl.className = 'hour-option';
  optionEl.textContent = label;

  optionEl.addEventListener('click', () => {
    hourToggle.textContent = label;
    hourList.querySelectorAll('.hour-option').forEach((el) => el.classList.remove('selected'));
    optionEl.classList.add('selected');
    hourList.classList.add('hidden');
  });

  hourList.appendChild(optionEl);
}

hourToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  hourList.classList.toggle('hidden');
});

document.addEventListener('click', (event) => {
  if (!hourDropdown.contains(event.target)) {
    hourList.classList.add('hidden');
  }
});

const carSelect = document.getElementById('car-select');

async function incarcaMasinile() {
  const token = localStorage.getItem('access_token');

  if (!token) {
    carSelect.innerHTML = '<option value="">Autentifică-te pentru a-ți vedea mașinile</option>';
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Eroare la încărcarea profilului');

    const data = await response.json();
    carSelect.innerHTML = '';

    if (Array.isArray(data.cars) && data.cars.length > 0) {
      data.cars.forEach((car, index) => {
        const option = document.createElement('option');
        option.value = car.id || index;
        option.textContent = `${car.make || ''} ${car.model || ''}`.trim() || `Mașina ${index + 1}`;
        carSelect.appendChild(option);
      });
    } else {
      carSelect.innerHTML = '<option value="">Nicio mașină adăugată în profil</option>';
    }
  } catch (error) {
    console.error('Eroare la încărcarea mașinilor:', error);
    carSelect.innerHTML = '<option value="">Nu am putut încărca mașinile</option>';
  }
}

incarcaMasinile();

const checkoutRight = document.getElementById('checkout-right');
const formError = document.getElementById('form-error');
const nextStepBtn = document.getElementById('next-step-btn');
const nextStepBtnText = document.getElementById('next-step-btn-text');

function showFormError(message) {
  formError.textContent = message;

  checkoutRight.classList.remove('shake');
  void checkoutRight.offsetWidth;
  checkoutRight.classList.add('shake');
}

function clearFormError() {
  formError.textContent = '';
}

function setNextStepLoading(isLoading) {
  nextStepBtn.disabled = isLoading;

  if (isLoading) {
    nextStepBtnText.textContent = 'Se procesează...';
    const spinner = document.createElement('span');
    spinner.className = 'btn-spinner';
    nextStepBtn.appendChild(spinner);
  } else {
    nextStepBtnText.textContent = 'Pasul următor';
    const spinner = nextStepBtn.querySelector('.btn-spinner');
    if (spinner) spinner.remove();
  }
}

nextStepBtn.addEventListener('click', () => {
  clearFormError();

  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const postalCode = document.getElementById('postalCode').value.trim();
  const country = document.getElementById('country').value.trim();
  const carValue = carSelect.value;
  const hourSelected = hourToggle.textContent !== 'Selectați ora';

  if (!address || !city || !postalCode || !country) {
    showFormError('Completează toate câmpurile de adresă.');
    return;
  }

  if (!carValue) {
    showFormError('Selectează o mașină.');
    return;
  }

  if (!hourSelected) {
    showFormError('Selectează o oră pentru programare.');
    return;
  }

  setNextStepLoading(true);

  setTimeout(() => {
    window.location.href = '../Menu/Menu.html';
  }, 500);
});