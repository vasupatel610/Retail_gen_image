# Image Generation API

A production-ready FastAPI application for AI-powered image generation and editing using Google Gemini API.

## Features

- 🚀 FastAPI-based REST API
- 🎨 AI-powered image generation using Google Gemini
- 🖥️ Modern web frontend with intuitive UI
- 📱 Responsive design for all devices
- 🎯 Drag-and-drop image upload
- 📸 Image gallery with generation history
- 📁 Organized project structure
- 🔒 Environment-based configuration
- 📝 Automatic API documentation (Swagger/ReDoc)
- 🐳 Docker support
- ✅ Input validation and error handling
- 🌟 Beautiful animations and loading states

## Project Structure

```
retail_gen_image/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py           # API endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py           # Configuration management
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── image_schemas.py    # Pydantic models
│   └── services/
│       ├── __init__.py
│       └── image_service.py    # Business logic
├── static/                      # Frontend files
│   ├── index.html              # Main web interface
│   ├── styles.css              # Modern CSS styling
│   └── script.js               # JavaScript functionality
├── outputs/                     # Generated images
├── uploads/                     # Uploaded images (optional)
├── .env                        # Environment variables
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose configuration
└── README.md                   # This file
```

## Setup

### Prerequisites

- Python 3.12+
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
cd /home/artisans15/projects/test_gen_image
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables in `.env`:
```env
GOOGLE_API_KEY=your_api_key_here
HOST=0.0.0.0
PORT=8010
DEBUG=False
MAX_IMAGE_SIZE=10485760
OUTPUT_DIR=outputs
UPLOAD_DIR=uploads
```

## Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8010 --workers 4
```

### Using Docker

```bash
docker-compose up --build
```

## API Endpoints

### Health Check
- **GET** `/` - Root endpoint
- **GET** `/health` - Health check

### Image Generation
- **POST** `/api/v1/generate-image` - Generate image from uploaded image and prompt
  - **Parameters:**
    - `image` (file): Base image file
    - `prompt` (string): Text description

- **GET** `/api/v1/download/{filename}` - Download generated image
- **DELETE** `/api/v1/delete/{filename}` - Delete generated image

### API Documentation
- Swagger UI: `http://localhost:8010/docs`
- ReDoc: `http://localhost:8010/redoc`

## Usage Example

### Using cURL

```bash
curl -X POST "http://localhost:8010/api/v1/generate-image" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/your/image.png" \
  -F "prompt=Create an image in which a 24 year old girl is wearing these shoes, and make the background of a tennis court"
```

### Using Python

```python
import requests

url = "http://localhost:8010/api/v1/generate-image"
files = {"image": open("shoes.png", "rb")}
data = {"prompt": "Create an image in which a 24 year old girl is wearing these shoes"}

response = requests.post(url, files=files, data=data)
print(response.json())
```

## Configuration

All configuration is managed through environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google Gemini API key | Required |
| `HOST` | Server host | 0.0.0.0 |
| `PORT` | Server port | 8010 |
| `DEBUG` | Debug mode | False |
| `MAX_IMAGE_SIZE` | Max upload size (bytes) | 10485760 |
| `OUTPUT_DIR` | Output directory | outputs |
| `UPLOAD_DIR` | Upload directory | uploads |

## Production Deployment

### Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Configure `ALLOWED_ORIGINS` in `app/core/config.py`
- [ ] Use HTTPS/TLS
- [ ] Implement rate limiting
- [ ] Add authentication/authorization
- [ ] Set up monitoring and logging
- [ ] Use environment secrets management
- [ ] Configure firewall rules

### Recommended Production Setup

1. Use a reverse proxy (Nginx/Traefik)
2. Run with multiple workers
3. Set up logging aggregation
4. Implement health checks
5. Use container orchestration (Kubernetes/Docker Swarm)





