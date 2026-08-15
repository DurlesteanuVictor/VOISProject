const token = localStorage.getItem('access_token');
if (token) {
    window.location.href = "../Menu/Menu.html";
}

const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggle-password');
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const formError = document.getElementById('form-error');
const loginBtn = document.getElementById('login-btn');
const loginBtnText = document.getElementById('login-btn-text');

toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleBtn.textContent = isHidden ? 'Hide' : 'Show';
});

function showError(message) {
    formError.textContent = message;

    loginContainer.classList.remove('shake');
    void loginContainer.offsetWidth;
    loginContainer.classList.add('shake');
}

function clearError() {
    formError.textContent = '';
}

function setLoading(isLoading) {
    loginBtn.disabled = isLoading;

    if (isLoading) {
        loginBtnText.textContent = 'Logging in...';
        const spinner = document.createElement('span');
        spinner.className = 'btn-spinner';
        loginBtn.appendChild(spinner);
    } else {
        loginBtnText.textContent = 'Login';
        const spinner = loginBtn.querySelector('.btn-spinner');
        if (spinner) spinner.remove();
    }
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    clearError();
    setLoading(true);

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

            if (data.role === 'user' || data.role === 'mechanic') {
                window.location.href = "../Menu/Menu.html";
            }
        } else {
            showError(data.detail || 'Incorrect email or password.');
            setLoading(false);
        }
    } catch (error) {
        showError('Could not connect to the server. Please try again.');
        setLoading(false);
    }
});