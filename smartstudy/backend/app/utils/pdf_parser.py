from fastapi import UploadFile
import PyPDF2
import io
import re
import logging

logger = logging.getLogger(__name__)

# Try to import OCR libraries (optional)
try:
    from google.cloud import vision
    from pdf2image import convert_from_bytes
    GOOGLE_VISION_AVAILABLE = True
    logger.info("Google Vision API OCR available")
except ImportError:
    GOOGLE_VISION_AVAILABLE = False
    logger.warning("Google Vision API not available. Install: pip install google-cloud-vision pdf2image")

# Fallback to pytesseract if Google Vision not available
try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
    logger.info("Pytesseract OCR available (fallback)")
except ImportError:
    PYTESSERACT_AVAILABLE = False
    logger.warning("Pytesseract not available")

OCR_AVAILABLE = GOOGLE_VISION_AVAILABLE or PYTESSERACT_AVAILABLE

async def extract_text_from_pdf(file: UploadFile) -> str:
    """Extract and clean text content from uploaded PDF file"""
    
    try:
        # Read file content
        content = await file.read()
        logger.info(f"PDF file size: {len(content)} bytes")
        
        # Create PDF reader
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        logger.info(f"PDF has {len(pdf_reader.pages)} pages")
        
        # Extract text from all pages with multiple strategies
        text = ""
        raw_text = ""
        
        for i, page in enumerate(pdf_reader.pages):
            try:
                # Strategy 1: Standard extraction
                page_text = page.extract_text()
                if page_text:
                    raw_text += page_text + "\n\n"
                    logger.info(f"Page {i+1}: Extracted {len(page_text)} characters")
                
                # Strategy 2: Try alternative extraction method
                if not page_text or len(page_text.strip()) < 10:
                    try:
                        # Try extracting with different parameters
                        page_text = page.extract_text(extraction_mode="layout")
                        if page_text:
                            raw_text += page_text + "\n\n"
                            logger.info(f"Page {i+1}: Extracted {len(page_text)} characters (layout mode)")
                    except:
                        pass
                
            except Exception as e:
                logger.warning(f"Error extracting text from page {i+1}: {e}")
                continue
        
        logger.info(f"Raw text extracted: {len(raw_text)} characters")
        logger.info(f"Raw text preview: {raw_text[:200]}...")
        
        # If no text extracted, try OCR (for image-based PDFs)
        if len(raw_text.strip()) < 10 and OCR_AVAILABLE:
            logger.info("No text found with standard extraction, trying OCR...")
            try:
                raw_text = await _extract_text_with_ocr(content)
                logger.info(f"OCR extracted {len(raw_text)} characters")
            except Exception as ocr_error:
                logger.warning(f"OCR extraction failed: {ocr_error}")
        
        # Clean up text
        text = _clean_extracted_text(raw_text)
        
        # Be more lenient with minimum text length
        if not text or len(text.strip()) < 10:
            logger.error(f"Insufficient text extracted. Raw length: {len(raw_text)}, Cleaned length: {len(text)}")
            logger.error(f"Raw text sample: {raw_text[:500]}")
            
            # Provide helpful error message
            error_msg = "No meaningful text could be extracted from the PDF.\n\n"
            error_msg += "Possible reasons:\n"
            error_msg += "1. Image-based PDF (scanned document) - "
            if OCR_AVAILABLE:
                error_msg += "OCR attempted but failed\n"
            else:
                error_msg += "OCR not available (install: pip install pdf2image pytesseract)\n"
            error_msg += "2. Encrypted or password-protected PDF\n"
            error_msg += "3. Corrupted PDF file\n\n"
            error_msg += "💡 Workaround: Copy text from PDF and use 'Text Input' instead"
            
            raise ValueError(error_msg)
        
        logger.info(f"Successfully extracted and cleaned {len(text)} characters from PDF")
        return text
        
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    finally:
        # Reset file position for potential reuse
        try:
            await file.seek(0)
        except:
            pass

async def _extract_text_with_ocr(pdf_content: bytes) -> str:
    """Extract text from image-based PDF using OCR (Google Vision API or Pytesseract)"""
    
    if not OCR_AVAILABLE:
        raise Exception("OCR libraries not installed")
    
    try:
        # Convert PDF pages to images
        logger.info("Converting PDF to images for OCR...")
        images = convert_from_bytes(pdf_content, dpi=300)
        logger.info(f"Converted {len(images)} pages to images")
        
        # Try Google Vision API first (more accurate)
        if GOOGLE_VISION_AVAILABLE:
            logger.info("Using Google Vision API for OCR...")
            return await _extract_with_google_vision(images)
        
        # Fallback to Pytesseract
        elif PYTESSERACT_AVAILABLE:
            logger.info("Using Pytesseract for OCR...")
            return await _extract_with_pytesseract(images)
        
        else:
            raise Exception("No OCR engine available")
        
    except Exception as e:
        logger.error(f"OCR extraction error: {e}")
        raise

async def _extract_with_google_vision(images: list) -> str:
    """Extract text using Google Vision API"""
    
    try:
        # Initialize Google Vision client
        client = vision.ImageAnnotatorClient()
        
        text = ""
        for i, image in enumerate(images):
            logger.info(f"Running Google Vision OCR on page {i+1}...")
            
            # Convert PIL Image to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            
            # Create Vision API image object
            vision_image = vision.Image(content=img_byte_arr)
            
            # Perform text detection
            response = client.text_detection(image=vision_image)
            
            if response.error.message:
                raise Exception(f"Google Vision API error: {response.error.message}")
            
            # Extract text from response
            if response.text_annotations:
                page_text = response.text_annotations[0].description
                text += page_text + "\n\n"
                logger.info(f"Google Vision page {i+1}: Extracted {len(page_text)} characters")
            else:
                logger.warning(f"No text found on page {i+1}")
        
        return text
        
    except Exception as e:
        logger.error(f"Google Vision OCR error: {e}")
        # If Google Vision fails, try pytesseract as fallback
        if PYTESSERACT_AVAILABLE:
            logger.info("Falling back to Pytesseract...")
            return await _extract_with_pytesseract(images)
        raise

async def _extract_with_pytesseract(images: list) -> str:
    """Extract text using Pytesseract (fallback)"""
    
    text = ""
    for i, image in enumerate(images):
        logger.info(f"Running Pytesseract OCR on page {i+1}...")
        page_text = pytesseract.image_to_string(image)
        if page_text:
            text += page_text + "\n\n"
            logger.info(f"Pytesseract page {i+1}: Extracted {len(page_text)} characters")
    
    return text

def _clean_extracted_text(text: str) -> str:
    """Clean and normalize extracted PDF text"""
    
    if not text:
        return ""
    
    # Remove excessive whitespace and normalize line breaks
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)  # Normalize paragraph breaks (3+ newlines -> 2)
    text = re.sub(r'[ \t]+', ' ', text)      # Normalize spaces
    text = re.sub(r'\n[ \t]+', '\n', text)   # Remove leading spaces on lines
    
    # Remove common PDF artifacts (but be less aggressive)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)  # Remove control characters (keep extended ASCII)
    
    # Remove page numbers and headers/footers (simple heuristic)
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        
        # Skip empty lines
        if not line:
            cleaned_lines.append('')
            continue
            
        # Skip likely page numbers (standalone numbers)
        if re.match(r'^\d+$', line) and len(line) < 4:
            continue
            
        # Keep everything else (be more permissive)
        cleaned_lines.append(line)
    
    # Rejoin text
    text = '\n'.join(cleaned_lines)
    
    # Final cleanup
    text = re.sub(r'\n{4,}', '\n\n', text)  # Limit consecutive line breaks to max 2
    text = text.strip()
    
    return text