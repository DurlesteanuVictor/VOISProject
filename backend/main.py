from fastapi import FastAPI, HTTPException, status
import uuid

app = FastAPI()


fake_users_db = {
    "test@mecanic.ro": {
        "password": "parola123", 
        "name": "Ion Mecanicul",
        "role": "mecanic"
    }
}

active_sessions = {}

@app.post("/login")
def login(email: str, parola: str):
    user = fake_users_db.get(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email sau parolă incorectă"
        )
    
    if parola != user["password"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email sau parolă incorectă"
        )
    
    session_token = str(uuid.uuid4())
    
    active_sessions[session_token] = email
    
    return {
        "session_token": session_token, 
        "user_name": user["name"]
    }