from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth

app = FastAPI(title="Aplicație Căutare Mecanici API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # aici se pune normal url-ul de la frontend
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

app.include_router(auth.router)

# uvicorn main:app --reload
@app.get("/")
def read_root():
    return {"status": "Backend-ul este viu!"}