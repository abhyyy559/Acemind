from fastapi import UploadFile
import PyPDF2
import io
import re
import logging

logger = logging.getLogger(__name__)

async def extract_text_from_pdf(file: UploadFile) -> str:
    """Extract and clean text content from uploaded PDF file"""
    
    try:
        # Read file content
        content = await file.read()
        logger.info(f"PDF file size: {len(content)} bytes")
        
        # Create PDF reader
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        logger.info(f"PDF has {len(pdf_reader.pages)} pages")
        
        # Extract text from all pages
        text = ""
        for i, page in enumerate(pdf_reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n\n"
                logger.info(f"Extracted {len(page_text)} characters from page {i+1}")
        
        # Clean up text
        text = _clean_extracted_text(text)
        
        if not text or len(text.strip()) < 50:
            raise ValueError("No meaningful text could be extracted from the PDF")
        
        logger.info(f"Successfully extracted {len(text)} characters from PDF")
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

def _clean_extracted_text(text: str) -> str:
    """Clean and normalize extracted PDF text"""
    
    if not text:
        return ""
    
    # Remove excessive whitespace and normalize line breaks
    text = re.sub(r'\n\s*\n', '\n\n', text)  # Normalize paragraph breaks
    text = re.sub(r'[ \t]+', ' ', text)      # Normalize spaces
    text = re.sub(r'\n[ \t]+', '\n', text)   # Remove leading spaces on lines
    
    # Remove common PDF artifacts
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', text)  # Remove control characters
    text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)\[\]\{\}\"\'\/\@\#\$\%\&\*\+\=\<\>\~\`]', ' ', text)  # Keep only printable chars
    
    # Fix common OCR issues
    text = re.sub(r'\b([A-Z])\s+([A-Z])\s+([A-Z])\b', r'\1\2\3', text)  # Fix spaced capitals
    text = re.sub(r'\b(\w)\s+(\w)\s+(\w)\b', r'\1\2\3', text)  # Fix spaced words (cautiously)
    
    # Remove page numbers and headers/footers (simple heuristic)
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        # Skip likely page numbers
        if re.match(r'^\d+$', line) and len(line) < 4:
            continue
        # Skip very short lines that might be headers/footers
        if len(line) < 10 and not re.search(r'[.!?]$', line):
            continue
        # Skip lines that are mostly numbers or special characters
        if len(line) > 0 and len(re.sub(r'[\d\s\-\.\,]', '', line)) / len(line) < 0.3:
            continue
        
        cleaned_lines.append(line)
    
    # Rejoin text
    text = '\n'.join(cleaned_lines)
    
    # Final cleanup
    text = re.sub(r'\n{3,}', '\n\n', text)  # Limit consecutive line breaks
    text = text.strip()
    
    return text