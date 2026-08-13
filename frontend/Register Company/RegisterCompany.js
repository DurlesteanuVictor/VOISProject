const allServiceTags = document.querySelectorAll('#register-tags-container .service-tag');
allServiceTags.forEach(tag => {
    tag.addEventListener('click', function() {
        this.classList.toggle('selected');
    });
});

document.getElementById("company-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const addressInput = document.getElementById("address").value;
    let computedLat = 0.0;
    let computedLon = 0.0;
    try {
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}`);
        const geoResults = await geoResponse.json();
        
        if (geoResults.length > 0) {
            computedLat = parseFloat(geoResults[0].lat);
            computedLon = parseFloat(geoResults[0].lon);
        } else {
            console.warn("Adresa nu a putut fi localizată exact pe hartă.");
        }
    } catch (error) {
        console.error("Eroare la geolocalizare:", error);
    }
    
    const selectedTags = Array.from(document.querySelectorAll('#register-tags-container .service-tag.selected')).map(tag => tag.innerText.trim());
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
            localStorage.setItem("company_name", payload.name);
            localStorage.setItem("company_adress", payload.address);
            localStorage.setItem("company_contact", payload.email);
            localStorage.setItem("company_description", payload.description);
            
            alert("Company is made!");
            window.location.href = "../Login/Login.html"; 
        } else {
            const messageBox = document.getElementById("message-box");
            let errorMsg = "Didn't work.";
            if (Array.isArray(result.detail)) {
                errorMsg = result.detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(" | ");
            } else if (result.detail) {
                errorMsg = result.detail;
            }
            
            messageBox.innerText = "Eroare: " + errorMsg;
            messageBox.style.color = "red";
        }
    } catch (error) {
        console.error("Connexion Error:", error);
        const messageBox = document.getElementById("message-box");
        messageBox.innerText = "Connexion error at server.";
        messageBox.style.color = "red";
    }
});