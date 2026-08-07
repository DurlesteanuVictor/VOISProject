from pydantic import BaseModel, Field, field_validator, model_validator

class UserCreate(BaseModel):
    user: str = Field(..., min_length=2, max_length=50)
    email: str
    password: str = Field(..., min_length=6)
    telephoneNumber: str = Field(..., min_length=10, max_length=10)
    role: str
    
    carName: str | None = None
    carYear: int | None = None
    carEngine: str | None = None

    @field_validator('telephoneNumber')
    @classmethod
    def validare_telefon(cls, valoare):
        if not valoare.isdigit():
            raise ValueError("Telephone number should contain only numbers")
        return valoare

    @field_validator('user')
    @classmethod
    def validare_nume(cls, valoare):
        if any(char.isdigit() for char in valoare):
            raise ValueError("User name should have only letters")
        return valoare

    
    @model_validator(mode='after')
    def validare_masina_pentru_client(self):
        if self.role == 'user':
            if not self.carName or not self.carYear or not self.carEngine:
                raise ValueError("Car details req")
        elif self.role == 'mechanic':
            self.carName = None
            self.carYear = None
            self.carEngine = None   
        return self
class UserLogin(BaseModel):
    email: str
    password: str