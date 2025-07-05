import time
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from google.adk import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel, EmailStr
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from agents.query_agent.agent import root_agent
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    Token,
    authenticate_user,
    create_access_token,
    get_current_active_user,
    get_password_hash,
)
from database import get_db
from middleware.account_lockout import (
    is_account_locked,
    record_failed_login,
    reset_failed_logins,
)
from models import User as UserModel
from schemas.query_schemas import QueryRequest
from utils.helpers import parse_json_markdown

router = APIRouter()


@router.get("/validate-token")
async def validate_token(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_active_user),
):
    # If get_current_user does not raise, token is valid
    return {"valid": True, "username": user.username, "email": user.email}


@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    # Account lockout check
    locked, until = is_account_locked(form_data.username)
    if locked:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account locked due to too many failed login attempts. Try again in {int(until - time.time())} seconds.",
        )
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        record_failed_login(form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # On successful login, reset failed attempts
    reset_failed_logins(form_data.username)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/query")
async def run_query(request: QueryRequest, user=Depends(get_current_active_user)):
    # Setup ADK session
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name="QueryApp",
        user_id=user.username,
        session_id=f"{user.username}-session",
        state={"topic": request.query},
    )
    runner = Runner(
        agent=root_agent, app_name="QueryApp", session_service=session_service
    )
    content = types.Content(role="user", parts=[types.Part(text=request.query)])
    events = runner.run_async(
        user_id=user.username,
        session_id=f"{user.username}-session",
        new_message=content,
    )
    final_response = "No final response captured."
    async for event in events:
        if event.is_final_response() and event.content and event.content.parts:
            final_response = event.content.parts[0].text
    final_response = parse_json_markdown(final_response)
    if not final_response or not final_response.get("valid", False):
        raise HTTPException(
            status_code=400, detail="Failed to parse JSON response or invalid query"
        )
    session = await runner.session_service.get_session(
        app_name="QueryApp",
        user_id=user.username,
        session_id=f"{user.username}-session",
    )
    result = parse_json_markdown(session.state["generated_query"])
    if not result:
        raise HTTPException(
            status_code=400, detail="Failed to parse JSON response or invalid query"
        )
    return {"result": result}


class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr | None = None
    full_name: str | None = None


@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if username or email already exists
    existing = await db.execute(
        select(UserModel).where(
            (UserModel.username == user.username) | (UserModel.email == user.email)
        )
    )
    if existing.scalars().first():
        return {"error": "Username or email already exists."}

    hashed_pw = get_password_hash(user.password)
    new_user = UserModel(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_pw,
        disabled=False,
    )
    db.add(new_user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        return {"error": "Username or email already exists."}
    return {"message": "User registered successfully"}


@router.get("/profile")
async def profile(user=Depends(get_current_active_user)):
    return {"username": user.username, "email": user.email}
