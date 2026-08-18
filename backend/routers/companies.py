from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from db.database import get_db
from db import models
from pydantic import BaseModel
from routers.auth import get_current_user

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

class ReviewCreate(BaseModel):
    id_company: int
    score: float

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


@router.post("/review", status_code=status.HTTP_201_CREATED)
def add_review(review_data: ReviewCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != 'user':
        raise HTTPException(status_code=403, detail="Only users can leave rewiew!")
    today_date = datetime.now().strftime("%Y-%m-%d")
    past_booking = db.query(models.Booking).filter(
        models.Booking.id_user == current_user.id,
        models.Booking.id_company == review_data.id_company,
        models.Booking.status != "cancelled",
        models.Booking.booking_date <= today_date
    ).first()

    if not past_booking:
        raise HTTPException(
            status_code=403, 
            detail="Trebuie să ai o rezervare onorată la acest service pentru a lăsa o recenzie."
        )

    # REGULA 3: Fără SPAM. Dacă ai lăsat deja un review, ești blocat.
    existing_review = db.query(models.Review).filter(
        models.Review.id_user == current_user.id,
        models.Review.id_company == review_data.id_company
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=400, 
            detail="Ai lăsat deja o recenzie pentru acest service. Nu poți vota de mai multe ori."
        )
        
    # Dacă a trecut de toate filtrele, salvăm nota!
    new_review = models.Review(
        id_user=current_user.id,
        id_company=review_data.id_company,
        score=review_data.score
    )
    db.add(new_review)
    db.commit()
    return {"message": "Review added successfully!"}


@router.get("/all")
def get_all_companies(db: Session = Depends(get_db)):
    results = db.query(
        models.Company,
        func.count(models.Review.id).label("review_count"),
        func.avg(models.Review.score).label("avg_score")
    ).outerjoin(models.Review, models.Company.id == models.Review.id_company) \
     .group_by(models.Company.id).all()

    rezultat = []
    for company, count, avg_score in results:
        avg_score = avg_score or 0.0
        rounded_score = round(avg_score)
      
        stele = "★" * rounded_score + "☆" * (5 - rounded_score)

        rezultat.append({
            "id": company.id,
            "nume": company.name_service,
            "descriere": company.Description,
            "locatie": company.adress,
            "lat": company.lat,
            "lon": company.lon,
            "pret": "La cerere", 
            "rating": f"{avg_score:.1f}", 
            "stele": stele if count > 0 else "☆☆☆☆☆",
            "review_count": count,
            "servicii": company.servicii.split(",") if company.servicii else []
        })
        
    return rezultat