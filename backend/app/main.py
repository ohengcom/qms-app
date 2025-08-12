from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from .routers.quilts import quilts
from .routers.enhanced_quilts import router as enhanced_router
from .routers import users

app = FastAPI(
    title="Quilts Management System",
    description="Enhanced QMS for intelligent quilt inventory management",
    version="2.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router)
app.include_router(quilts.router, tags=["Legacy API"])  # Keep old API for backward compatibility
app.include_router(enhanced_router, tags=["Enhanced API"])

@app.get("/")
async def root():
    return {
        "message": "Quilts Management System API",
        "version": "2.0.0",
        "features": [
            "Enhanced quilt tracking with rich metadata",
            "Seasonal intelligence and recommendations",
            "Usage analytics and predictions",
            "Advanced search and filtering",
            "Storage optimization"
        ]
    }

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "QMS API"}