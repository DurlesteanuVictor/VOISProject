const companyContainer = document.getElementById("company-container");
const messageBox = document.getElementById("message-box");
const submitBtn = document.getElementById("company-submit-btn");
const submitBtnText = document.getElementById("company-submit-btn-text");

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

    const payload = {
        name: document.getElementById("name").value,
        address: document.getElementById("address").value,
        contact_info: document.getElementById("contact_info").value,
        description: document.getElementById("description").value 
    };

    setLoading(true);

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
            localStorage.setItem("company_name", payload.address);
            localStorage.setItem("company_adress", payload.address);
            localStorage.setItem("company_contact", payload.contact_info);
            localStorage.setItem("company_description", payload.description);

            showMessage("Company registered successfully!", 'success');
            setTimeout(() => {
                window.location.href = "../Menu/Menu.html";
            }, 800);
        } else {
            showMessage(result.detail || "Could not register the company.", 'error');
            setLoading(false);
        }
    } catch (error) {
        console.error("Connexion Error:", error);
        showMessage("Could not connect to the server. Please try again.", 'error');
        setLoading(false);
    }
});