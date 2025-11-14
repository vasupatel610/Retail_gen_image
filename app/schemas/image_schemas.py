"""
Pydantic schemas for API request/response models.
"""
from pydantic import BaseModel, Field
from typing import Optional


class ImageGenerationResponse(BaseModel):
    """Response model for successful image generation"""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Status message")
    image_url: str = Field(..., description="URL to access the generated image")
    filename: str = Field(..., description="Filename of the generated image")


class ErrorResponse(BaseModel):
    """Response model for errors"""
    detail: str = Field(..., description="Error message")


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str = Field(..., description="Service status")
