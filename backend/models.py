from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    ig_username = Column(String, unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    targets = relationship("Target", back_populates="agent")


class Target(Base):
    __tablename__ = "targets"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    username = Column(String, index=True)
    is_private = Column(Boolean, default=False)
    status = Column(String, default="Tracking")
    created_at = Column(DateTime, server_default=func.now())
    agent = relationship("Agent", back_populates="targets")
    history = relationship("FollowerHistory", back_populates="target", cascade="all, delete-orphan")


class FollowerHistory(Base):
    __tablename__ = "follower_history"
    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"))
    follower_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    timestamp = Column(DateTime, server_default=func.now())
    target = relationship("Target", back_populates="history")
