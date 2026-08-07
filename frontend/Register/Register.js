const roleSelect = document.getElementById('role');
const carDetailsSection = document.getElementById('car-details-section');
const registerForm = document.getElementById('register-form');

roleSelect.addEventListener('change', function() {
    if (this.value === 'mechanic') {
        carDetailsSection.style.display = 'none';
    } else {
        carDetailsSection.style.display = 'block';
    }
});

registerForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const roleValue = roleSelect.value;
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
        role: roleValue,
        carName: null,
        carYear: null,
        carEngine: null
    };

    if (roleValue === 'user') {
        const carNameValue = document.getElementById('carName').value;
        if (carNameValue !== "") {
            DataPachet.carName = carNameValue;
        } else {
            DataPachet.carName = null;
        }

        const carEngineValue = document.getElementById('carEngine').value;
        if (carEngineValue !== "") {
            DataPachet.carEngine = carEngineValue;
        } else {
            DataPachet.carEngine = null;
        }

        const carYearValue = document.getElementById('carYear').value;
        if (carYearValue !== "") {
            DataPachet.carYear = parseInt(carYearValue);
        } else {
            DataPachet.carYear = null;
        }
    }

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