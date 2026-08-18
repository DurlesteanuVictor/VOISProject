from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from db.database import get_db
from db import models
from schemas import booking as schemas
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"]
)

@router.get("/available/{id_company}")
def get_available_slots(id_company: int, date: str, db: Session = Depends(get_db)):
    all_slots = [f"{hour:02d}:00" for hour in range(9, 18)]
    
    existing_bookings = db.query(models.Booking).filter(
        models.Booking.id_company == id_company,
        models.Booking.booking_date == date,
        models.Booking.status != "cancelled"
    ).all()
    
    booked_slots = [b.time_slot for b in existing_bookings]
    available_slots = [slot for slot in all_slots if slot not in booked_slots]
    
    return {"date": date, "available_slots": available_slots}

@router.post("/create")
def create_booking(
    booking_data: schemas.BookingCreate, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only clients can make bookings.")

    new_booking = models.Booking(
        id_user=current_user.id,
        id_company=booking_data.id_company,
        booking_date=booking_data.booking_date,
        time_slot=booking_data.time_slot
    )
    
    try:
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        return {"message": "Booking created successfully!", "booking_id": new_booking.id}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="This time slot has been taken. Please choose another time."
        )

@router.get("/my-bookings")
def get_my_bookings(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rezultat = []
    
    if current_user.role == "user":
        bookings = db.query(models.Booking).filter(models.Booking.id_user == current_user.id).order_by(models.Booking.booking_date, models.Booking.time_slot).all()
    elif current_user.role == "mechanic" and current_user.id_company:
        bookings = db.query(models.Booking).filter(models.Booking.id_company == current_user.id_company).order_by(models.Booking.booking_date, models.Booking.time_slot).all()
    else:
        return []

    for b in bookings:
        rezultat.append({
            "id": b.id,
            "id_company": b.id_company,
            "id_user": b.id_user,
            "booking_date": b.booking_date,
            "time_slot": b.time_slot,
            "status": b.status,
            "company_name": b.company.name_service if b.company else "Service Not Set",
            "user_name": b.user.user if b.user else "User"
        })
        
    return rezultat

@router.put("/{booking_id}/status")
def update_booking_status(
    booking_id: int, 
    status_update: schemas.BookingStatusUpdate, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
        
    if current_user.role == "user" and booking.id_user != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this booking.")
    
    if current_user.role == "mechanic" and booking.id_company != current_user.id_company:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this booking.")

    if current_user.role == "user" and status_update.status != "cancelled":
        raise HTTPException(status_code=400, detail="Clients can only cancel bookings.")

    booking.status = status_update.status
    db.commit()
    
    return {"message": f"Status updated successfully."}