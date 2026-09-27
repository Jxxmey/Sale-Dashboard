from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import sales

app = FastAPI(title="Sales Dashboard API")

# ตั้งค่า CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# นำ Router ที่แยกไว้เข้ามาต่อกับแอปหลัก
app.include_router(sales.router)

@app.get("/")
def root():
    return {"message": "API is running. Visit /docs for documentation."}