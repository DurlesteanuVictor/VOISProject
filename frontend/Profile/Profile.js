const profileForm = document.getElementById('profile-form');
const passwordForm = document.getElementById('password-form');
const logoutBtn = document.getElementById('logout-btn');
const addCardBtn = document.getElementById('add-card-btn');
const removeCardBtn = document.getElementById('remove-card-btn');
const avatarUpload = document.getElementById('avatar-upload');
const avatarPreview = document.getElementById('avatar-preview');

profileForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const carMakeValue = document.getElementById('carMake').value;
  const carModelValue = document.getElementById('carModel').value;
  const carYear = document.getElementById('carYear').value;
  const carEngineType = document.getElementById('carEngineType').value;
  const carEnginePower = document.getElementById('carEnginePower').value;
  const carPlate = document.getElementById('carPlate').value;
  const carMileage = document.getElementById('carMileage').value;
  const carTransmission = document.getElementById('carTransmission').value;
  const street = document.getElementById('street').value;
  const city = document.getElementById('city').value;
  const postalCode = document.getElementById('postalCode').value;

  console.log('Saving profile:', {
    name, email, phone,
    car: { carMake: carMakeValue, carModel: carModelValue, carYear, carEngineType, carEnginePower, carPlate, carMileage, carTransmission },
    address: { street, city, postalCode }
  });

  alert("Not connected to backend yet!");
});

passwordForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;

  console.log('Updating password:', { currentPassword, newPassword });

  alert("Not connected to backend yet!");
});

logoutBtn.addEventListener('click', () => {
  window.location.href = '../Login/Login.html';
});

addCardBtn.addEventListener('click', () => {
  alert("Not connected to backend yet!");
});

removeCardBtn.addEventListener('click', () => {
  alert("Not connected to backend yet!");
});

avatarUpload.addEventListener('change', () => {
  const file = avatarUpload.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    avatarPreview.src = reader.result;
  };
  reader.readAsDataURL(file);
});

document.querySelectorAll('.toggle-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetInput = document.getElementById(btn.dataset.target);
    const isHidden = targetInput.type === 'password';
    targetInput.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? 'Hide' : 'Show';
  });
});

const carEngineType = document.getElementById('carEngineType');
const carTransmission = document.getElementById('carTransmission');

carEngineType.addEventListener('change', () => {
  if (carEngineType.value === 'hybrid' || carEngineType.value === 'electric') {
    carTransmission.value = 'automatic';
  }
});

const carMake = document.getElementById('carMake');
const carModel = document.getElementById('carModel');
const carMakeList = document.getElementById('carMakeList');
const carModelList = document.getElementById('carModelList');
const carYearList = document.getElementById('carYearList');
const carEnginePowerList = document.getElementById('carEnginePowerList');

const CAR_DATA = {
  'Dacia': ['Logan', 'Sandero', 'Duster', 'Spring', 'Jogger', 'Dokker', 'Lodgy'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Talisman', 'Twingo', 'Kangoo'],
  'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'Arteon', 'Touran', 'Up!', 'ID.3', 'ID.4'],
  'Ford': ['Focus', 'Fiesta', 'Kuga', 'Puma', 'Mondeo', 'EcoSport', 'Galaxy', 'S-Max'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Zafira'],
  'Skoda': ['Octavia', 'Fabia', 'Superb', 'Kodiaq', 'Karoq', 'Scala', 'Kamiq'],
  'Toyota': ['Corolla', 'Yaris', 'RAV4', 'C-HR', 'Camry', 'Prius', 'Prius+', 'Auris', 'Aygo', 'Land Cruiser', 'Highlander'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', 'X1', 'X2', 'X3', 'X5'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE'],
  'Audi': ['A1', 'A3', 'A4', 'A6', 'A8', 'Q2', 'Q3', 'Q5', 'Q7'],
  'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Kona', 'Santa Fe', 'IONIQ'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Niro', 'Sorento', 'Stonic'],
  'Peugeot': ['108', '208', '308', '2008', '3008', '5008', '508'],
  'Citroen': ['C1', 'C3', 'C4', 'C5 Aircross', 'Berlingo', 'C3 Aircross'],
  'Fiat': ['Panda', 'Tipo', '500', '500X', '500L', 'Punto'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Note'],
  'Honda': ['Jazz', 'Civic', 'CR-V', 'HR-V', 'e'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
  'Mazda': ['Mazda2', 'Mazda3', 'CX-3', 'CX-5', 'CX-30'],
  'Suzuki': ['Swift', 'Vitara', 'S-Cross', 'Ignis']
};

function populateMakeList() {
  carMakeList.innerHTML = '';
  Object.keys(CAR_DATA).sort().forEach((make) => {
    const option = document.createElement('option');
    option.value = make;
    carMakeList.appendChild(option);
  });
}

function populateModelList(make) {
  carModelList.innerHTML = '';
  (CAR_DATA[make] || []).forEach((model) => {
    const option = document.createElement('option');
    option.value = model;
    carModelList.appendChild(option);
  });
}

function populateYearList() {
  carYearList.innerHTML = '';
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1995; year--) {
    const option = document.createElement('option');
    option.value = year;
    carYearList.appendChild(option);
  }
}

function populatePowerList() {
  carEnginePowerList.innerHTML = '';
  const commonPowers = ['1.0', '1.2', '1.3', '1.4', '1.5', '1.6', '1.8', '2.0', '2.2', '2.5', '3.0', '100 kW', '150 kW', '200 kW'];
  commonPowers.forEach((power) => {
    const option = document.createElement('option');
    option.value = power;
    carEnginePowerList.appendChild(option);
  });
}

populateMakeList();
populateYearList();
populatePowerList();

carMake.addEventListener('input', () => {
  populateModelList(carMake.value);
  carModel.placeholder = CAR_DATA[carMake.value] ? 'e.g. ' + CAR_DATA[carMake.value][0] : 'Enter model';
});
