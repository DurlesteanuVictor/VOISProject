const carDetailsSection = document.getElementById('car-details-section');
const registerForm = document.getElementById('register-form');
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggle-password');

toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleBtn.textContent = isHidden ? 'Ascunde' : 'Arată';
});

registerForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const user = document.getElementById('user').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const telephoneNumber = document.getElementById('telephoneNumber').value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|ro)$/;
    
    if (!emailRegex.test(email)) {
        alert("Introduce a valid email");
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
            alert("Account Is Active!");
            registerForm.reset();
            window.location.href = "../Login/Login.html";
        } else {
            alert("Problem!: " + data.detail);
        }
    } catch (error) {
        alert("Server Error!");
    }
});