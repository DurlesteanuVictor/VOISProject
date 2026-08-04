// Referințe către elementele din pagină
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggle-password');
const loginForm = document.getElementById('login-form');

// Comută vizibilitatea parolei (text vizibil <-> ascuns cu *)
toggleBtn.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';

  passwordInput.type = isHidden ? 'text' : 'password';
  toggleBtn.textContent = isHidden ? 'Ascunde' : 'Arată';
});

// Logica de autentificare (unde duce, ce se verifică etc.) o adăugăm ulterior.
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log('Formular trimis - logica va fi adăugată ulterior.');
});