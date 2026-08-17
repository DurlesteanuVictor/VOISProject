const companyContainer = document.getElementById("company-container");
const messageBox = document.getElementById("message-box");
const submitBtn = document.getElementById("company-submit-btn");
const submitBtnText = document.getElementById("company-submit-btn-text");

// Logica de Servicii
const allServiceTags = document.querySelectorAll('#register-tags-container .service-tag');
allServiceTags.forEach(tag => {
    tag.addEventListener('click', function() {
        this.classList.toggle('selected');
    });
});

function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.classList.remove('success', 'error');
    messageBox.classList.add(type);
    if (type === 'error') {
        companyContainer.classList.remove('shake');
        void companyContainer.offsetWidth;
        companyContainer.classList.add('shake');
    }
}

function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
        submitBtnText.textContent = 'Registering...';
        const spinner = document.createElement('span');
        spinner.className = 'btn-spinner';
        submitBtn.appendChild(spinner);
    } else {
        submitBtnText.textContent = 'Register Company';
        const spinner = submitBtn.querySelector('.btn-spinner');
        if (spinner) spinner.remove();
    }
}

document.getElementById("company-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    messageBox.textContent = '';
    messageBox.classList.remove('success', 'error');
    
    setLoading(true);

    const addressInput = document.getElementById("address").value;
    let computedLat = 0.0;
    let computedLon = 0.0;

    // Calculăm Lat și Lon din Adresă
    try {
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}`);
        const geoResults = await geoResponse.json();
        
        if (geoResults.length > 0) {
            computedLat = parseFloat(geoResults[0].lat);
            computedLon = parseFloat(geoResults[0].lon);
        } else {
            console.warn("Adresa nu a putut fi localizata exact pe harta.");
        }
    } catch (error) {
        console.error("Eroare la geolocalizare:", error);
    }
    
    const selectedTags = Array.from(document.querySelectorAll('#register-tags-container .service-tag.selected')).map(tag => tag.innerText.trim());

    // Asamblăm Pachetul exact cum îl vrea API-ul
    const payload = {
        name: document.getElementById("name").value,
        address: addressInput,
        email: document.getElementById("contact_info").value,
        password: document.getElementById("password").value, 
        description: document.getElementById("description").value,
        services: selectedTags,
        lat: computedLat,
        lon: computedLon
    };

    try {
        const response = await fetch("http://localhost:8000/api/companies/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Salvăm datele pentru un checkout / meniu viitor
            localStorage.setItem("company_name", payload.name);
            localStorage.setItem("company_adress", payload.address);
            localStorage.setItem("company_contact", payload.email);
            localStorage.setItem("company_description", payload.description);
            
            showMessage("Company registered successfully!", 'success');
            setTimeout(() => {
                window.location.href = "../Login/Login.html";
            }, 800);
        } else {
            let errorMsg = "Could not register the company.";
            if (Array.isArray(result.detail)) {
                errorMsg = result.detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(" | ");
            } else if (result.detail) {
                errorMsg = result.detail;
            }
            showMessage(errorMsg, 'error');
            setLoading(false);
        }
    } catch (error) {
        console.error("Connexion Error:", error);
        showMessage("Could not connect to the server. Please try again.", 'error');
        setLoading(false);
    }
});