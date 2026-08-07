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

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('username').value;
    const password = passwordInput.value;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('user_name', data.user_name);
            if (data.role === 'user') {
                window.location.href = "../Menu/Menu.html";
            } else if (data.role === 'mechanic') {
                window.location.href = "../Menu/Menu.html";
            }
        } else {
            alert("Eroare la autentificare: " + data.detail);
        }
    } catch (error) {
        alert("Eroare de conexiune cu serverul!");
        console.error(error);
    }
});

