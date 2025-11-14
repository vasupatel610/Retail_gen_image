"""
FastAPI application entry point for image generation service.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.routes import image_router
from app.core.config import settings
import os
import socket

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered image generation and editing service using Google Gemini",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    root_path=settings.ROOT_PATH  # Configure for nginx reverse proxy
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Mount static files
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Include routers
app.include_router(image_router, prefix="/api/v1", tags=["images"])


@app.get("/")
async def root():
    """Serve the main frontend application"""
    static_file = os.path.join(static_dir, "index.html")
    if os.path.exists(static_file):
        return FileResponse(static_file)
    else:
        return {
            "status": "healthy",
            "service": settings.APP_NAME,
            "version": settings.VERSION,
            "message": "Frontend not found. Please ensure static files are properly configured."
        }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


@app.on_event("startup")
async def startup_event():
    """Display access information on startup"""
    try:
        # Get local IP address
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        
        print("\n" + "="*70)
        print(f"🚀 {settings.APP_NAME} is running!")
        print("="*70)
        print(f"📱 Local access:     http://localhost:{settings.PORT}")
        print(f"🌐 Network access:   http://{local_ip}:{settings.PORT}")
        print("="*70)
        print("🔗 PRODUCTION NGINX PROXY URLS:")
        print(f"🌍 Main app:         https://ai-use-cases-backend.artisanscloud.com.my/retail-gen-img/")
        print(f"🔧 API docs:         https://ai-use-cases-backend.artisanscloud.com.my/retail-gen-img/docs")
        print(f"📚 ReDoc:            https://ai-use-cases-backend.artisanscloud.com.my/retail-gen-img/redoc")
        print(f"❤️  Health check:    https://ai-use-cases-backend.artisanscloud.com.my/retail-gen-img/health")
        print("="*70)
        print("💡 The app is configured for nginx reverse proxy at /retail-gen-img")
        print("   Make sure nginx is properly configured and running!")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"Could not determine network IP: {e}")
        print(f"App is running on http://localhost:{settings.PORT}")
        print(f"Production URL: https://ai-use-cases-backend.artisanscloud.com.my/retail-gen-img/")


def get_local_ip():
    """Get the local IP address of the machine"""
    try:
        # Connect to a remote address to determine local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
