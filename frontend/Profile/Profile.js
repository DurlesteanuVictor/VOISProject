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
  const street = document.getElementById('street').value;
  const city = document.getElementById('city').value;
  const postalCode = document.getElementById('postalCode').value;

  console.log('Saving profile:', {
    name, email, phone,
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
