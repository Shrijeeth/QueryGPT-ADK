from fastapi import FastAPI
import uvicorn
from routes import router

app = FastAPI()

# Mount the API router (contains /token and /query)
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
