"""
Image generation service using Google Gemini API.
"""
import os
import base64
from io import BytesIO
from datetime import datetime
from PIL import Image
from google import genai
from app.core.config import settings


class ImageGenerationService:
    """Service for handling image generation operations"""
    
    def __init__(self):
        """Initialize the Gemini client"""
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.model = settings.GEMINI_MODEL
    
    async def generate_image(self, image_data: bytes, prompt: str) -> dict:
        """
        Generate an image based on input image and text prompt.
        
        Args:
            image_data: Bytes of the input image
            prompt: Text prompt for image generation
            
        Returns:
            dict: Contains output_path and filename of generated image
        """
        try:
            # Open image from bytes
            input_image = Image.open(BytesIO(image_data))
            
            # Call Gemini API
            response = self.client.models.generate_content(
                model=self.model,
                contents=[input_image, prompt],
            )
            
            # Extract image data from response
            image_parts = [
                part.inline_data.data
                for part in response.candidates[0].content.parts
                if part.inline_data
            ]
            
            if not image_parts:
                raise ValueError("No image data returned from API")
            
            # Decode and save the generated image
            raw_data = image_parts[0]
            
            if isinstance(raw_data, str):
                generated_image_data = base64.b64decode(raw_data)
            elif isinstance(raw_data, bytes):
                generated_image_data = raw_data
            else:
                raise ValueError(f"Unexpected data type: {type(raw_data)}")
            
            # Open and save the generated image
            generated_image = Image.open(BytesIO(generated_image_data))
            
            # Generate unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"generated_{timestamp}.png"
            output_path = os.path.join(settings.OUTPUT_DIR, filename)
            
            # Save the image
            generated_image.save(output_path)
            
            return {
                "output_path": output_path,
                "filename": filename
            }
            
        except Exception as e:
            raise Exception(f"Image generation failed: {str(e)}")
