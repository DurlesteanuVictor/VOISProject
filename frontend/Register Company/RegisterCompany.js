document.getElementById("company-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById("name").value,
        address: document.getElementById("address").value,
        contact_info: document.getElementById("contact_info").value,
        description: document.getElementById("description").value 
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
            alert("Company is made!");
            window.location.href = "../Menu/Menu.html"; 
        } else {
            const messageBox = document.getElementById("message-box");
            messageBox.innerText = "Eroare: " + (result.detail || "Didn't work.");
            messageBox.style.color = "red";
        }
    } catch (error) {
        console.error("Connexion Error:", error);
        const messageBox = document.getElementById("message-box");
        messageBox.innerText = "Connexion error at server.";
        messageBox.style.color = "red";
    }
});