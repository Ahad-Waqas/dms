from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..models import RoleEnum
from ..schemas import User as UserSchema
from ..controllers.users import create_user, get_user_by_id, update_user, delete_user, authenticate_user
from .. import get_db

router = APIRouter()


@router.post("/", response_model=UserSchema)
def create_user_route(name: str, email: str, password: str, role: RoleEnum, organization: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Create a new user.
    """
    return create_user(name, email, password, role, organization, db)


@router.get("/{user_id}", response_model=UserSchema)
def get_user_route(user_id: str, db: Session = Depends(get_db)):
    """
    Retrieve user details by user ID.
    """
    return get_user_by_id(user_id, db)


@router.put("/{user_id}", response_model=UserSchema)
def update_user_route(user_id: str, name: Optional[str] = None, email: Optional[str] = None, password: Optional[str] = None, role: Optional[RoleEnum] = None, organization: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Update user details.
    """
    return update_user(user_id, name, email, password, role, organization, db)


@router.delete("/{user_id}")
def delete_user_route(user_id: str, db: Session = Depends(get_db)):
    """
    Delete a user by user ID.
    """
    return delete_user(user_id, db)


@router.post("/login", response_model=UserSchema)
def login_user_route(email: str, password: str, db: Session = Depends(get_db)):
    """
    Authenticate a user.
    """
    return authenticate_user(email, password, db)
