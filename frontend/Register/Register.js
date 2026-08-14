const carDetailsSection = document.getElementById('car-details-section');
const registerForm = document.getElementById('register-form');
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggle-password');
const registerContainer = document.getElementById('register-container');
const formError = document.getElementById('form-error');
const registerBtn = document.getElementById('register-btn');
const registerBtnText = document.getElementById('register-btn-text');

toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleBtn.textContent = isHidden ? 'Ascunde' : 'Arată';
});

const passwordStrengthBar = document.getElementById('password-strength-bar');
const passwordStrengthLabel = document.getElementById('password-strength-label');

function getPasswordScore(password) {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

passwordInput.addEventListener('input', () => {
    const value = passwordInput.value;

    if (value === '') {
        passwordStrengthBar.style.width = '0%';
        passwordStrengthLabel.textContent = '';
        return;
    }

    const score = getPasswordScore(value);
    let width, color, text;

    if (score <= 2) {
        width = '33%';
        color = '#d32f2f';
        text = 'Parolă slabă';
    } else if (score <= 3) {
        width = '66%';
        color = '#e0a800';
        text = 'Parolă medie';
    } else {
        width = '100%';
        color = '#2e7d32';
        text = 'Parolă puternică';
    }

    passwordStrengthBar.style.width = width;
    passwordStrengthBar.style.backgroundColor = color;
    passwordStrengthLabel.textContent = text;
    passwordStrengthLabel.style.color = color;
});

function showError(message) {
    formError.textContent = message;

    registerContainer.classList.remove('shake');
    void registerContainer.offsetWidth;
    registerContainer.classList.add('shake');
}

function clearError() {
    formError.textContent = '';
}

function setLoading(isLoading) {
    registerBtn.disabled = isLoading;

    if (isLoading) {
        registerBtnText.textContent = 'Se creează contul...';
        const spinner = document.createElement('span');
        spinner.className = 'btn-spinner';
        registerBtn.appendChild(spinner);
    } else {
        registerBtnText.textContent = 'Register';
        const spinner = registerBtn.querySelector('.btn-spinner');
        if (spinner) spinner.remove();
    }
}

registerForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    clearError();

    const user = document.getElementById('user').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const telephoneNumber = document.getElementById('telephoneNumber').value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|ro)$/;

    if (!emailRegex.test(email)) {
        showError('Introdu o adresă de email validă.');
        return;
    }

    const DataPachet = {
        user: user,
        email: email,
        password: password,
        telephoneNumber: telephoneNumber,
        carName: null,
        carYear: null,
        carEngine: null
    };

    const carNameValue = document.getElementById('carName').value;
    DataPachet.carName = carNameValue !== "" ? carNameValue : null;

    const carEngineValue = document.getElementById('carEngine').value;
    DataPachet.carEngine = carEngineValue !== "" ? carEngineValue : null;

    const carYearValue = document.getElementById('carYear').value;
    DataPachet.carYear = carYearValue !== "" ? parseInt(carYearValue) : null;

    setLoading(true);

    try {

        const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(DataPachet)
        });

        const data = await response.json();

        if (response.ok) {
            registerForm.reset();
            window.location.href = "../Login/Login.html";
        } else {
            showError(data.detail || 'Nu am putut crea contul. Verifică datele introduse.');
            setLoading(false);
        }
    } catch (error) {
        showError('Nu ne putem conecta la server. Încearcă din nou.');
        setLoading(false);
    }
});