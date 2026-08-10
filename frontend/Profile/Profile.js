const profileForm = document.getElementById('profile-form');
const logoutBtn = document.getElementById('logout-btn');
const editBtn = document.getElementById('edit-btn');
const actionButtons = document.getElementById('action-buttons');
const cancelBtn = document.getElementById('cancel-btn');
const carSection = document.getElementById('car-section');
const avatarUpload = document.getElementById('avatar-upload');
const avatarPreview = document.getElementById('avatar-preview');

const formInputs = profileForm.querySelectorAll('input');

async function loadProfileData() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        alert("You are not authenticated!");
        window.location.href = '../Login/Login.html';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            document.getElementById('name').value = data.user;
            document.getElementById('email').value = data.email;
            document.getElementById('phone').value = data.telephoneNumber;

            if (data.role === 'mechanic') {
                carSection.style.display = 'none';
            } else if (data.car) {
                document.getElementById('carMake').value = data.car.make || '';
                document.getElementById('carModel').value = data.car.model || '';
                document.getElementById('carYear').value = data.car.year || '';
                document.getElementById('carEngine').value = data.car.engine || '';
            }
        } else {
            alert("Error loading profile.");
        }
    } catch (error) {
        console.error("Connection error:", error);
    }
}

editBtn.addEventListener('click', () => {
    formInputs.forEach(input => {
        input.removeAttribute('readonly');
        input.classList.add('editable'); 
    });
    
    editBtn.style.display = 'none';
    actionButtons.style.display = 'flex';
});

cancelBtn.addEventListener('click', () => {
    formInputs.forEach(input => {
        input.setAttribute('readonly', true);
        input.classList.remove('editable'); 
    });
    
    editBtn.style.display = 'block';
    actionButtons.style.display = 'none';
    
    loadProfileData();
});

profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const payload = {
        user: document.getElementById('name').value,
        email: document.getElementById('email').value,
        telephoneNumber: document.getElementById('phone').value
    };

    if (carSection.style.display !== 'none') {
        const yearValue = document.getElementById('carYear').value;
        payload.car = {
            make: document.getElementById('carMake').value,
            model: document.getElementById('carModel').value,
            year: yearValue ? parseInt(yearValue) : null,
            engine: document.getElementById('carEngine').value
        };
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Data updated successfully!");
            
            formInputs.forEach(input => {
                input.setAttribute('readonly', true);
                input.classList.remove('editable'); 
            });
            
            editBtn.style.display = 'block';
            actionButtons.style.display = 'none';
        } else {
            const data = await response.json();
            alert("Update failed: " + (data.detail || "Check the entered data."));
        }
    } catch (error) {
        console.error("Connection error:", error);
        alert("Server connection error!");
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    window.location.href = '../Login/Login.html';
});

avatarUpload.addEventListener('change', () => {
    const file = avatarUpload.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.src = reader.result;
    };
    reader.readAsDataURL(file);
});

const passwordForm = document.getElementById('password-form');

passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    
    if (currentPassword === newPassword) {
        alert("Cannot use the same password");
        return;
    }
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        
        if (response.ok) {
            alert("Password updated successfully!");
            passwordForm.reset();
        } else {
            const data = await response.json();
            alert("Update failed: " + (data.detail || "Error updating password."));
        }
    } catch (error) {
        alert("Server connection error!");
    }
});

document.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const targetInput = document.getElementById(btn.dataset.target);
        const isHidden = targetInput.type === 'password';
        targetInput.type = isHidden ? 'text' : 'password';
        btn.textContent = isHidden ? 'Hide' : 'Show';
    });
});

loadProfileData();