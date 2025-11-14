"""
API routes for image generation endpoints.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse
from typing import Optional
import os
from app.services.image_service import ImageGenerationService
from app.schemas.image_schemas import ImageGenerationResponse, ErrorResponse
from app.core.config import settings

image_router = APIRouter()
image_service = ImageGenerationService()


@image_router.post(
    "/generate-image",
    response_model=ImageGenerationResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def generate_image(
    request: Request,
    image: UploadFile = File(..., description="Base image to use for generation"),
    prompt: str = Form(..., description="Text prompt describing the desired output"),
):
    """
    Generate a new image based on an uploaded image and text prompt.
    
    - **image**: Upload an image file (jpg, jpeg, png, webp)
    - **prompt**: Text description of what you want to generate
    """
    try:
        # Validate file extension
        file_ext = image.filename.split(".")[-1].lower()
        if file_ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file extension. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )
        
        # Read image content
        image_content = await image.read()
        
        # Validate file size
        if len(image_content) > settings.MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_IMAGE_SIZE} bytes"
            )
        
        # Generate image
        result = await image_service.generate_image(image_content, prompt)
        
        # Construct the image URL
        base_url = str(request.base_url).rstrip('/')
        image_url = f"{base_url}/api/v1/download/{result['filename']}"
        
        return ImageGenerationResponse(
            success=True,
            message="Image generated successfully",
            image_url=image_url,
            filename=result["filename"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")


@image_router.get("/download/{filename}")
async def download_image(filename: str):
    """
    Download a generated image by filename.
    
    - **filename**: Name of the generated image file
    """
    file_path = os.path.join(settings.OUTPUT_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(
        path=file_path,
        media_type="image/png",
        filename=filename,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "*",
        }
    )


@image_router.delete("/delete/{filename}")
async def delete_image(filename: str):
    """
    Delete a generated image by filename.
    
    - **filename**: Name of the image file to delete
    """
    file_path = os.path.join(settings.OUTPUT_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    try:
        os.remove(file_path)
        return {"success": True, "message": f"Image {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")
