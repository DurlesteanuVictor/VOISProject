function toggleAccordion(contentId, headerElement) {
    const content = document.getElementById(contentId);
    const wrapper = content.parentElement;
    const icon = headerElement.classList.contains('toggle-icon')
        ? headerElement
        : headerElement.querySelector('.toggle-icon');

    const isOpen = wrapper.classList.contains('open');

    if (isOpen) {
        wrapper.classList.remove('open');
        if (icon) icon.textContent = '+';
    } else {
        wrapper.classList.add('open');
        if (icon) icon.textContent = '-';
    }
}

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

const profileContainer = document.getElementById('profile-container');
const profileForm = document.getElementById('profile-form');
const logoutBtn = document.getElementById('logout-btn');
const editBtn = document.getElementById('edit-btn');
const actionButtons = document.getElementById('action-buttons');
const cancelBtn = document.getElementById('cancel-btn');
const passwordForm = document.getElementById('password-form');
const addCarForm = document.getElementById('add-car-form');
const addCarContainer = document.getElementById('add-car-form-container');
const myCarSection = document.querySelector('.section-my-car');
const avatarUpload = document.getElementById('avatar-upload');
const avatarPreview = document.getElementById('avatar-preview');

const formInputs = profileForm.querySelectorAll('input');

function shakeContainer() {
    profileContainer.classList.remove('shake');
    void profileContainer.offsetWidth;
    profileContainer.classList.add('shake');
}

function showMessage(el, text, type) {
    el.textContent = text;
    el.classList.remove('success', 'error');
    el.classList.add(type);
    if (type === 'error') shakeContainer();
}

function clearMessage(el) {
    el.textContent = '';
    el.classList.remove('success', 'error');
}

function setBtnLoading(btn, btnTextEl, isLoading, loadingText, defaultText) {
    btn.disabled = isLoading;

    if (isLoading) {
        btnTextEl.textContent = loadingText;
        const spinner = document.createElement('span');
        spinner.className = 'btn-spinner';
        btn.appendChild(spinner);
    } else {
        btnTextEl.textContent = defaultText;
        const spinner = btn.querySelector('.btn-spinner');
        if (spinner) spinner.remove();
    }
}

async function loadProfileData() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        window.location.href = '../Login/Login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
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
                myCarSection.style.display = 'none';
            } else if (data.cars) {
                renderCars(data.cars);
            }
        } else {
            showMessage(profileMessage, 'Nu am putut încărca profilul.', 'error');
        }
    } catch (error) {
        console.error("Eroare de conexiune:", error);
    }
}

function renderCars(cars) {
    document.querySelectorAll('.inner-car-item').forEach(el => el.remove());

    cars.forEach(car => {
        const contentId = `car-${car.id}-content`;
        const carHtml = `
            <div class="inner-car-item">
                <div class="accordion-header">
                    <h3>${car.make || ''} ${car.model || ''}</h3>
                    <div class="car-actions">
                        <button type="button" class="delete-btn" onclick="event.stopPropagation(); deleteCar(${car.id})">Șterge</button>
                        <span class="toggle-icon" onclick="toggleAccordion('${contentId}', this)">+</span>
                    </div>
                </div>
                <div class="accordion-content" id="${contentId}">
                    <div class="accordion-content-inner">
                        <div class="input-row">
                            <div class="input-group">
                                <label>An</label>
                                <input type="number" value="${car.year || ''}" readonly />
                            </div>
                            <div class="input-group">
                                <label>Motor</label>
                                <input type="text" value="${car.engine || ''}" readonly />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        myCarSection.insertAdjacentHTML('beforeend', carHtml);
    });
}

const profileMessage = document.getElementById('profile-message');
const saveBtn = document.getElementById('save-btn');
const saveBtnText = document.getElementById('save-btn-text');

editBtn.addEventListener('click', () => {
    clearMessage(profileMessage);

    formInputs.forEach(input => {
        input.removeAttribute('readonly');
        input.classList.add('editable');
    });
    
    editBtn.style.display = 'none';
    actionButtons.style.display = 'flex';
});

cancelBtn.addEventListener('click', () => {
    clearMessage(profileMessage);

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

    clearMessage(profileMessage);
    
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const payload = {
        user: document.getElementById('name').value,
        email: document.getElementById('email').value,
        telephoneNumber: document.getElementById('phone').value
    };

    setBtnLoading(saveBtn, saveBtnText, true, 'Se salvează...', 'Salvează modificările');

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
            showMessage(profileMessage, 'Profilul a fost actualizat cu succes!', 'success');
            
            formInputs.forEach(input => {
                input.setAttribute('readonly', true);
                input.classList.remove('editable');
            });
            
            editBtn.style.display = 'block';
            actionButtons.style.display = 'none';
        } else {
            const data = await response.json();
            showMessage(profileMessage, data.detail || 'Verifică datele introduse.', 'error');
        }
    } catch (error) {
        showMessage(profileMessage, 'Eroare de conexiune cu serverul!', 'error');
    } finally {
        setBtnLoading(saveBtn, saveBtnText, false, 'Se salvează...', 'Salvează modificările');
    }
});

const addCarMessage = document.getElementById('add-car-message');
const addCarBtnSubmit = document.getElementById('add-car-btn-submit');
const addCarBtnText = document.getElementById('add-car-btn-text');

addCarForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    clearMessage(addCarMessage);

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const payload = {
        make: document.getElementById('newCarMake').value,
        model: document.getElementById('newCarModel').value,
        year: parseInt(document.getElementById('newCarYear').value),
        engine: document.getElementById('newCarEngine').value
    };

    setBtnLoading(addCarBtnSubmit, addCarBtnText, true, 'Se salvează...', 'Salvează mașina');

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
            addCarForm.reset();
            addCarContainer.style.display = 'none';
            loadProfileData();
        } else {
            const data = await response.json();
            showMessage(addCarMessage, 'Eroare la adăugarea mașinii: ' + (data.detail || 'Date invalide.'), 'error');
        }
    } catch (error) {
        showMessage(addCarMessage, 'Eroare de conexiune cu serverul!', 'error');
    } finally {
        setBtnLoading(addCarBtnSubmit, addCarBtnText, false, 'Se salvează...', 'Salvează mașina');
    }
});

const confirmModal = document.getElementById('confirm-modal');
const confirmModalText = document.getElementById('confirm-modal-text');
const confirmModalConfirmBtn = document.getElementById('confirm-modal-confirm');
const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel');

function showConfirmModal(message) {
    return new Promise((resolve) => {
        confirmModalText.textContent = message;
        confirmModal.classList.remove('hidden');

        function cleanup(result) {
            confirmModal.classList.add('hidden');
            confirmModalConfirmBtn.removeEventListener('click', onConfirm);
            confirmModalCancelBtn.removeEventListener('click', onCancel);
            confirmModal.removeEventListener('click', onOverlayClick);
            resolve(result);
        }

        function onConfirm() { cleanup(true); }
        function onCancel() { cleanup(false); }
        function onOverlayClick(event) {
            if (event.target === confirmModal) cleanup(false);
        }

        confirmModalConfirmBtn.addEventListener('click', onConfirm);
        confirmModalCancelBtn.addEventListener('click', onCancel);
        confirmModal.addEventListener('click', onOverlayClick);
    });
}

window.deleteCar = async function(carId) {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const confirmed = await showConfirmModal('Ești sigur că vrei să ștergi această mașină?');
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/car/${carId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadProfileData();
        } else {
            const data = await response.json();
            showMessage(profileMessage, 'Eroare la ștergerea mașinii: ' + (data.detail || 'Nu a fost găsită.'), 'error');
        }
    } catch (error) {
        showMessage(profileMessage, 'Eroare de conexiune cu serverul!', 'error');
    }
};

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

const passwordMessage = document.getElementById('password-message');
const passwordBtn = document.getElementById('password-btn');
const passwordBtnText = document.getElementById('password-btn-text');
const newPasswordInput = document.getElementById('newPassword');
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

newPasswordInput.addEventListener('input', () => {
    const value = newPasswordInput.value;

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

passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    clearMessage(passwordMessage);
    
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = newPasswordInput.value;
    
    if (currentPassword === newPassword) {
        showMessage(passwordMessage, 'Nu poți folosi aceeași parolă.', 'error');
        return;
    }

    setBtnLoading(passwordBtn, passwordBtnText, true, 'Se actualizează...', 'Actualizează parola');
    
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
            showMessage(passwordMessage, 'Parola a fost actualizată cu succes!', 'success');
            passwordForm.reset();
            passwordStrengthBar.style.width = '0%';
            passwordStrengthLabel.textContent = '';
        } else {
            const data = await response.json();
            showMessage(passwordMessage, data.detail || 'Eroare la actualizarea parolei.', 'error');
        }
    } catch (error) {
        showMessage(passwordMessage, 'Eroare de conexiune cu serverul!', 'error');
    } finally {
        setBtnLoading(passwordBtn, passwordBtnText, false, 'Se actualizează...', 'Actualizează parola');
    }
});

document.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const targetInput = document.getElementById(btn.dataset.target);
        const isHidden = targetInput.type === 'password';
        targetInput.type = isHidden ? 'text' : 'password';
        btn.textContent = isHidden ? 'Ascunde' : 'Arată';
    });
});

loadProfileData();