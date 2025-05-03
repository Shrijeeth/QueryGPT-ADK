from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base import Base


class LLMCredential(Base):
    __tablename__ = "llm_credentials"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    api_key = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=False)
    label = Column(String(255), nullable=False)

    user = relationship("User", back_populates="llm_credentials")
