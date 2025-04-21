from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import timedelta
from auth import (
    authenticate_user,
    create_access_token,
    get_current_active_user,
    Token,
    fake_users_db,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from utils.helpers import parse_json_markdown
from agents.query_agent.agent import root_agent
from google.adk import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

router = APIRouter()


class QueryRequest(BaseModel):
    query: str


@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/query")
async def run_query(request: QueryRequest, user=Depends(get_current_active_user)):
    # Setup ADK session
    session_service = InMemorySessionService()
    session = session_service.create_session(
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
    session = runner.session_service.get_session(
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
