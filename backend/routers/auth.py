from fastapi import APIRouter, HTTPException, status
from schemas.auth import LoginRequest
from db.mock_data import fake_users_db
from core.security import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Autentificare"])

@router.post("/login")
def login(request: LoginRequest):
    user = fake_users_db.get(request.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email sau parolă incorectă"
        )
    
    if request.password != user["password"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email sau parolă incorectă"
        )
    
    access_token = create_access_token(data={"sub": request.email, "role": "user"})
    
    # frontend response
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user["name"]
    }