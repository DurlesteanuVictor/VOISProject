const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

const profileForm = document.getElementById('profile-form');
const logoutBtn = document.getElementById('logout-btn');
const editBtn = document.getElementById('edit-btn');
const actionButtons = document.getElementById('action-buttons');
const cancelBtn = document.getElementById('cancel-btn');
const passwordForm = document.getElementById('password-form');
const addCarForm = document.getElementById('add-car-form');
const addCarContainer = document.getElementById('add-car-form-container');
const myCarSection = document.querySelector('.section-my-car');
const carsListContainer = document.getElementById('cars-list-container');
const avatarUpload = document.getElementById('avatar-upload');
const avatarPreview = document.getElementById('avatar-preview');

const formInputs = profileForm.querySelectorAll('input');

async function loadProfileData() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        window.location.href = '../Login/Login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile?t=` + new Date().getTime(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            document.getElementById('name').value = data.user;
            document.getElementById('email').value = data.email;
            document.getElementById('phone').value = data.telephoneNumber;

            if (data.avatar_url) {
                document.getElementById('avatar-preview').src = data.avatar_url;
            }

            if (data.role === 'mechanic') {
                myCarSection.style.display = 'none';
            } else if (data.cars) {
                renderCars(data.cars);
            }
        } else {
            alert("Error loading profile.");
        }
    } catch (error) {
        console.error("Connection error:", error);
    }
}

function renderCars(cars) {
    carsListContainer.innerHTML = '';
    cars.forEach(car => {
        const contentId = `car-${car.id}-content`;
        const carHtml = `
            <div class="inner-car-item">
                <div class="accordion-header" onclick="toggleAccordion('${contentId}', this)">
                    <h3>${car.make || ''} ${car.model || ''}</h3>
                    <div class="car-actions">
                        <button type="button" class="delete-btn" onclick="event.stopPropagation(); deleteCar(${car.id})">Delete</button>
                        <span class="toggle-icon">+</span>
                    </div>
                </div>
                <div class="accordion-content" id="${contentId}">
                    <div class="input-row">
                        <div class="input-group">
                            <label>Year</label>
                            <input type="number" value="${car.year || ''}" readonly />
                        </div>
                        <div class="input-group">
                            <label>Engine</label>
                            <input type="text" value="${car.engine || ''}" readonly />
                        </div>
                    </div>
                </div>
            </div>
        `;
        carsListContainer.insertAdjacentHTML('beforeend', carHtml);
    });
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

    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Profile updated successfully!");
            
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
        alert("Server connection error!");
    }
});

addCarForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const payload = {
        make: document.getElementById('newCarMake').value,
        model: document.getElementById('newCarModel').value,
        year: parseInt(document.getElementById('newCarYear').value),
        engine: document.getElementById('newCarEngine').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/car`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Car added successfully!");
            addCarForm.reset();
            addCarContainer.style.display = 'none';
            loadProfileData();
        } else {
            const data = await response.json();
            alert("Error adding car: " + (data.detail || "Invalid data."));
        }
    } catch (error) {
        alert("Server connection error!");
    }
});

window.deleteCar = async function(carId) {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (!confirm("Are you sure you want to delete this car?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/car/${carId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("Car deleted successfully!");
            loadProfileData();
        } else {
            const data = await response.json();
            alert("Error deleting car: " + (data.detail || "Not found."));
        }
    } catch (error) {
        alert("Server connection error!");
    }
};

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
        const response = await fetch(`${API_BASE_URL}/password`, {
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

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    window.location.href = '../Login/Login.html';
});

avatarUpload.addEventListener('change', async () => {
    const file = avatarUpload.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.src = reader.result;
    };
    reader.readAsDataURL(file);

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${API_BASE_URL}/upload-avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            avatarPreview.src = data.avatar_url;
        } else {
            alert("Error uploading avatar to the server.");
        }
    } catch (error) {
        alert("Server connection error during upload.");
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

// ==========================================
// BOOKINGS WORKFLOW
// ==========================================
const bookingsContainer = document.getElementById('bookings-list-container');

async function loadMyBookings() {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('role'); 
    if (!token || !bookingsContainer) return;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/bookings/my-bookings', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const bookings = await response.json();
            
            if (bookings.length === 0) {
                bookingsContainer.innerHTML = '<p class="history-empty-text">You have no bookings.</p>';
                return;
            }

            const azi = new Date();
            azi.setHours(0, 0, 0, 0);

            let htmlUrmeaza = '<h3 style="margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Upcoming Bookings</h3>';
            let htmlIstoric = '<h3 style="margin-top: 20px; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">History</h3>';

            let areUrmeaza = false;
            let areIstoric = false;

            bookings.forEach(booking => {
                const bookingDate = new Date(booking.booking_date);
                bookingDate.setHours(0, 0, 0, 0);

                const esteInTrecut = bookingDate < azi;
                const esteIncheiata = booking.status === 'cancelled' || booking.status === 'completed';

                let statusColor = '#f0ad4e'; 
                let statusDisplay = 'PENDING';
                
                if (booking.status === 'confirmed') {
                    statusColor = '#5a8dee';
                    statusDisplay = 'ACCEPTED';
                } else if (booking.status === 'cancelled') {
                    statusColor = '#d32f2f';
                    statusDisplay = 'CANCELLED';
                } else if (booking.status === 'completed') {
                    statusColor = '#28a745';
                    statusDisplay = 'FINISHED';
                }

                // Generare butoane specifice in functie de rol
                let actionButtonsHtml = '';
                
                if (!esteInTrecut && !esteIncheiata) {
                    if (userRole === 'user') {
                        if (booking.status === 'pending' || booking.status === 'confirmed') {
                            actionButtonsHtml = `<button onclick="updateBookingStatus(${booking.id}, 'cancelled')" style="background-color: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 4px;">Cancel</button>`;
                        }
                    } else if (userRole === 'mechanic') {
                        if (booking.status === 'pending') {
                            actionButtonsHtml = `
                                <button onclick="updateBookingStatus(${booking.id}, 'confirmed')" style="background-color: #5a8dee; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 4px; margin-right: 5px;">Accept</button>
                                <button onclick="updateBookingStatus(${booking.id}, 'cancelled')" style="background-color: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 4px;">Reject</button>
                            `;
                        } else if (booking.status === 'confirmed') {
                            actionButtonsHtml = `
                                <button onclick="updateBookingStatus(${booking.id}, 'completed')" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 4px; margin-right: 5px;">Finish</button>
                                <button onclick="updateBookingStatus(${booking.id}, 'cancelled')" style="background-color: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 4px;">Cancel</button>
                            `;
                        }
                    }
                }

                const bHtml = `
                    <div class="inner-car-item" style="padding: 12px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="font-size: 15px; color: #000; margin-bottom: 4px;">
                                    ${userRole === 'user' ? booking.company_name : 'Client: ' + booking.user_name}
                                </h3>
                                <p style="font-size: 13px; color: #666;">Date: ${booking.booking_date} | Time: ${booking.time_slot}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 13px; font-weight: bold; color: ${statusColor};">
                                    ${statusDisplay}
                                </div>
                                <div>
                                    ${actionButtonsHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                if (esteInTrecut || esteIncheiata) {
                    htmlIstoric += bHtml;
                    areIstoric = true;
                } else {
                    htmlUrmeaza += bHtml;
                    areUrmeaza = true;
                }
            });

            if (!areUrmeaza) htmlUrmeaza += '<p style="font-size: 13px; color: #888;">No upcoming bookings.</p>';
            if (!areIstoric) htmlIstoric += '<p style="font-size: 13px; color: #888;">No history at the moment.</p>';

            bookingsContainer.innerHTML = htmlUrmeaza + htmlIstoric;
        }
    } catch (error) {
        bookingsContainer.innerHTML = '<p class="history-empty-text" style="color:red;">Loading error.</p>';
    }
}

window.updateBookingStatus = async function(bookingId, newStatus) {
    let confirmMessage = "Are you sure you want to proceed?";
    if (newStatus === 'cancelled') confirmMessage = "Are you sure you want to cancel/reject this booking?";
    if (newStatus === 'confirmed') confirmMessage = "Are you sure you want to accept this booking?";
    if (newStatus === 'completed') confirmMessage = "Mark this booking as finished?";

    if (!confirm(confirmMessage)) return;

    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            loadMyBookings(); 
        } else {
            const data = await response.json();
            alert(data.detail || "Error updating status.");
        }
    } catch (error) {
        alert("Server connection error.");
    }
}

loadMyBookings();
loadProfileData();