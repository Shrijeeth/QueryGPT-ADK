from sqlalchemy import Column, Integer, String, Boolean
from .base import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(255))
    email = Column(String(255), unique=True)
    hashed_password = Column(String(255), nullable=False)
    disabled = Column(Boolean, default=False)
