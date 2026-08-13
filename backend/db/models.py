from sqlalchemy import Column, Float, ForeignKey, Integer, String, CheckConstraint
from db.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user = Column(String(50), nullable=False) 
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    telephoneNumber = Column(String(15), nullable=False)
    role = Column(String(10), default="user", nullable=False)
    # carName = Column(String(35), nullable=True)
    # carYear = Column(Integer, nullable=True)
    # carEngine = Column(String(20), nullable=True)

    id_company = Column(Integer, ForeignKey("company.id"))
    company = relationship("Company")
    car = relationship("Car", back_populates="owner")
    
    __table_args__ = (
        CheckConstraint("role IN ('user', 'mechanic')", name="check_valid_role"),
    )

class Company(Base):
    __tablename__ = "company"
    id = Column(Integer, primary_key = True, index = True)
    name_service = Column(String, index = True)
    servicii = Column(String, nullable=True)
    lat = Column(Float)
    lon = Column(Float)
    adress = Column(String)
    Description = Column(String)
    mechanics = relationship("Mechanic", back_populates="company")
    

class Car(Base):
    __tablename__ = "car" 
    id = Column(Integer, primary_key = True, index = True)
    make = Column(String)
    year = Column(Integer)
    model = Column(String)
    engine = Column(String)
    id_user = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    owner = relationship("User", back_populates="car")
    
class Mechanic(Base):
    __tablename__ = "mechanics"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    id_company = Column(Integer, ForeignKey("company.id", ondelete="CASCADE"))
    company = relationship("Company", back_populates="mechanics", cascade="all")