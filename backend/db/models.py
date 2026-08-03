from sqlalchemy import Column, Integer, String, Boolean, CheckConstraint
from db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user = Column(String(50), nullable=False) 
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    numar_telefon = Column(String(15), nullable=False)
    
    #role = Column(String(10), default="user", nullable=False)
    #is_active = Column(Boolean, default=True)

    nume_masina = Column(String(35), nullable=True)
    an_masina = Column(Integer, nullable=True)
    motor_masina = Column(String(20), nullable=True)

    __table_args__ = (
        #CheckConstraint("role IN ('user', 'mecanic')", name="check_valid_role"),
        CheckConstraint("an_masina >= 1970 AND an_masina <= 2027", name="check_valid_year"),
    )