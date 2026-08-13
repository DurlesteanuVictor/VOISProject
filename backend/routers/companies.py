from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/companies",
    tags=["Companii"]
)

class CompanyCreateData(BaseModel):
    name: str
    address: str
    email: str
    password: str
    description: str
    services: list[str] = []
    lat: float = 0.0
    lon: float = 0.0

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_company(company_data: CompanyCreateData, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == company_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")
    new_company = models.Company(
        name_service=company_data.name,
        adress=company_data.address,
        Description=company_data.description,
        servicii=",".join(company_data.services),
        lat=company_data.lat,
        lon=company_data.lon
    )
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    new_user = models.User(
        user=company_data.name,
        email=company_data.email,
        password=company_data.password,
        telephoneNumber="N/A", 
        role="mechanic",
        id_company=new_company.id
    )
    db.add(new_user)
    db.commit()
    
    return {"message": "Company and account created successfully"}


@router.get("/all")
def get_all_companies(db: Session = Depends(get_db)):
    companii = db.query(models.Company).all()
    rezultat = []
    
    for c in companii:
        rezultat.append({
            "id": c.id,
            "nume": c.name_service,
            "descriere": c.Description,
            "locatie": c.adress,
            "lat": c.lat,
            "lon": c.lon,
            "pret": "La cerere", 
            "rating": "5.0",     
            "stele": "★★★★★",   
            "servicii": c.servicii.split(",") if c.servicii else []
        })
    return rezultat