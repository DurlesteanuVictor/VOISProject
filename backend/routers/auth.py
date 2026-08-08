from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.security import create_access_token
from db.database import get_db
from db import models
from schemas import auth as schemas
from fastapi.security import OAuth2PasswordBearer
import jwt
from core.config import SECRET_KEY, ALGORITHM

router = APIRouter(
    prefix="/api/auth",
    tags=["Autentificare"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token invalid"
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token invalid sau expirat"
        )
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Utilizatorul nu a fost găsit"
        )
    return user

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(date_intrare: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == date_intrare.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Mail already registered."
        )
    
    new_User = models.User(
        user=date_intrare.user,
        email=date_intrare.email,
        password=date_intrare.password,
        telephoneNumber=date_intrare.telephoneNumber,
        role=date_intrare.role
    )
    db.add(new_User)
    db.commit()
    db.refresh(new_User)
    
    if date_intrare.role == 'user':
        masina_noua = models.Car(
            make=date_intrare.carName,
            year=date_intrare.carYear,
            model=date_intrare.carName,
            engine=date_intrare.carEngine,
            id_user=new_User.id
        )
        db.add(masina_noua)
        db.commit()
        
    return {"message": "Account made with success", "user_id": new_User.id}

@router.post("/login")
async def login_user(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or user.password != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
    
    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_name": user.user
    }

@router.get("/profile", response_model=schemas.UserProfileResponse)
async def get_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    car_data = None
    
    # Dacă utilizatorul este client, căutăm și mașina atașată lui
    if current_user.role == 'user':
        car = db.query(models.Car).filter(models.Car.id_user == current_user.id).first()
        if car:
            car_data = schemas.CarResponse(
                make=car.make,
                model=car.model,
                year=car.year,
                engine=car.engine
            )
            
    return schemas.UserProfileResponse(
        user=current_user.user,
        email=current_user.email,
        telephoneNumber=current_user.telephoneNumber,
        role=current_user.role,
        car=car_data
    )

@router.put("/profile")
async def update_profile(
    update_data: schemas.UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.user:
        current_user.user = update_data.user
    if update_data.email:
        current_user.email = update_data.email
    if update_data.telephoneNumber:
        current_user.telephoneNumber = update_data.telephoneNumber
    
    if current_user.role == 'user' and update_data.car:
        car = db.query(models.Car).filter(models.Car.id_user == current_user.id).first()
        if car:
            if update_data.car.make is not None: car.make = update_data.car.make
            if update_data.car.model is not None: car.model = update_data.car.model
            if update_data.car.year is not None: car.year = update_data.car.year
            if update_data.car.engine is not None: car.engine = update_data.car.engine
        else:
            new_car = models.Car(
                make=update_data.car.make,
                model=update_data.car.model,
                year=update_data.car.year,
                engine=update_data.car.engine,
                id_user=current_user.id
            )
            db.add(new_car)
    
    db.commit()
    return {"message": "Profile updated successfully"}

@router.put("/password")
async def update_password(
    password_data: schemas.PasswordUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.password != password_data.currentPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid current password"
        )
    
    if password_data.currentPassword == password_data.newPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot use the same password"
        )
        
    current_user.password = password_data.newPassword
    db.commit()
    return {"message": "Password updated successfully"}