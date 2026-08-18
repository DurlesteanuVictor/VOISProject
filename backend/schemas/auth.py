from pydantic import BaseModel, Field, field_validator, model_validator

class UserCreate(BaseModel):
    user: str = Field(..., min_length=2, max_length=50)
    email: str
    password: str = Field(..., min_length=6)
    telephoneNumber: str = Field(..., min_length=10, max_length=10)
    role: str
    
    carMake: str | None = None
    carModel: str | None = None
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
            if not self.carMake or not self.carModel or not self.carYear or not self.carEngine:
                raise ValueError("Car details req")
        elif self.role == 'mechanic':
            self.carMake = None
            self.carModel = None
            self.carYear = None
            self.carEngine = None
            
        return self
class UserLogin(BaseModel):
    email: str
    password: str

class CarResponse(BaseModel):
    id: int 
    make: str | None = None
    model: str | None = None
    year: int | None = None
    engine: str | None = None

class MechanicResponse(BaseModel):
    id: int
    name: str

class CompanyProfileResponse(BaseModel):
    name: str
    services: list[str] = []
    mechanics: list[MechanicResponse] = []

class UserProfileResponse(BaseModel):
    user: str
    email: str
    telephoneNumber: str
    role: str
    avatar_url: str | None = None
    cars: list[CarResponse] = []
    company: CompanyProfileResponse | None = None

class CarCreate(BaseModel):
    make: str
    model: str
    year: int
    engine: str

class CarUpdate(BaseModel):
    make: str | None = None
    model: str | None = None
    year: int | None = None
    engine: str | None = None

class UserProfileUpdate(BaseModel):
    user: str | None = None
    email: str | None = None
    telephoneNumber: str | None = None
    car: CarUpdate | None = None
    company_services: list[str] | None = None
    company_mechanics: list[str] | None = None

class PasswordUpdate(BaseModel):
    currentPassword: str
    newPassword: str
