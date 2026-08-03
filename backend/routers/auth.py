from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from schemas.auth import LoginRequest
from core.security import create_access_token
from db.database import get_db
from db.models import User

router = APIRouter(prefix="/api/auth", tags=["Autentificare"])

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email sau parolă incorectă"
        )
    
    if request.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email sau parolă incorectă"
        )
    
    access_token = create_access_token(data={"sub": request.email, "role": "user"})
    
    # frontend response
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user.user,
        "role": "user"
    }