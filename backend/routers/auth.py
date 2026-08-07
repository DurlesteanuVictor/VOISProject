from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.security import create_access_token
from db.database import get_db
from db import models
from schemas import auth as schemas

router = APIRouter(
    prefix="/api/auth",
    tags=["Autentificare"]
)

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

@router.post("/login")
async def login_user(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or user.password != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email sau parolă incorectă"
        )
    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_name": user.user
    } 
    return {"message": "Account made with success", "user_id": new_user.id}