from sqlalchemy import Column, Integer, String, CheckConstraint
from db.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user = Column(String(50), nullable=False) 
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    telephoneNumber = Column(String(15), nullable=False)
    
    role = Column(String(10), default="user", nullable=False)
    
    carName = Column(String(35), nullable=True)
    carYear = Column(Integer, nullable=True)
    carEngine = Column(String(20), nullable=True)
    
    __table_args__ = (
        CheckConstraint("role IN ('user', 'mechanic')", name="check_valid_role"),
        CheckConstraint("carYear >= 1900 AND carYear <= 2027", name="check_valid_year"),
    )