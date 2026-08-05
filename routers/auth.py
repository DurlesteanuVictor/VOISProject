from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from schemas.auth import LoginRequest, RegisterRequest
from core.security import create_access_token
from db.database import get_db
from db.models import User

router = APIRouter(prefix="/api/auth", tags=["Autentificare"])

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already Registered!"
        )
    
    # Build new user
    new_User = User(
        user=request.user,
        email=request.email,
        password=request.password,
        telephoneNumber=request.telephoneNumber,
        role=request.role,
        carName=request.carName,
        carYear=request.carYear,
        carEngine=request.carEngine
    )
    
    db.add(new_User)
    db.commit()
    db.refresh(new_User)
    
    return {"message": "Account made with success!", "user_id": new_User.id}

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect Email!"
        )
    
    if request.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect Password!"
        )
    
    access_token = create_access_token(data={"sub": request.email, "role": user.role})
    
    # front resp
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user.user,
        "role": user.role 
    }