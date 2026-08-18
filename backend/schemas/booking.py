from pydantic import BaseModel

class BookingCreate(BaseModel):
    id_company: int
    booking_date: str
    time_slot: str

class BookingResponse(BaseModel):
    id: int
    id_company: int
    id_user: int
    booking_date: str
    time_slot: str
    status: str
    company_name: str | None = None
    user_name: str | None = None

class BookingStatusUpdate(BaseModel):
    status: str