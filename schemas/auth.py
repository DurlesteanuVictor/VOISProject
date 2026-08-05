from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    user: str
    email: str
    password: str
    telephoneNumber: str
    role: str
    
    carName: Optional[str] = None
    carYear: Optional[int] = None
    carEngine: Optional[str] = None