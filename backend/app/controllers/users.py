from ..models import User, RoleEnum
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..schemas import User as UserSchema
from ..utils import hash_password, verify_password
from .. import get_db
from fastapi import Depends, HTTPException, status
from typing import Optional
from datetime import datetime


def create_user(name: str, email: str, password: str, role: RoleEnum, organization: Optional[str], db: Session = Depends(get_db)):
    """
    Create a new user with the given details.
    """
    hashed_password = hash_password(password)
    new_user = User(
        name=name,
        email=email,
        password_hash=hashed_password,
        role=role,
        organization=organization,
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserSchema.from_data(new_user)


def get_user_by_id(user_id: str, db: Session = Depends(get_db)):
    """
    Retrieve user details by user ID.
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserSchema.from_data(user)


def update_user(user_id: str, name: Optional[str], email: Optional[str], password: Optional[str], role: Optional[RoleEnum], organization: Optional[str], db: Session = Depends(get_db)):
    """
    Update user details.
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if name:
        user.name = name
    if email:
        user.email = email
    if password:
        user.password_hash = hash_password(password)
    if role:
        user.role = role
    if organization:
        user.organization = organization

    db.commit()
    db.refresh(user)
    return UserSchema.from_data(user)


def delete_user(user_id: str, db: Session = Depends(get_db)):
    """
    Delete a user by user ID.
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


def authenticate_user(email: str, password: str, db: Session = Depends(get_db)):
    """
    Authenticate a user with the given email and password.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.last_login = datetime.utcnow()
    db.commit()
    return UserSchema.from_data(user)
