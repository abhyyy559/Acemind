"""
Source Manager - Handle multiple input sources
Supports text, PDF, URL, and documents
"""
import hashlib
import logging
from typing import List, Optional, Dict
from datetime import datetime
from app.models.source import Source, SourceType
from app.utils.pdf_parser import extract_text_from_pdf
from app.services.url_fetcher import url_fetcher

logger = logging.getLogger(__name__)

class SourceManager:
    """Manage multiple content sources"""
    
    def __init__(self):
        self.sources: Dict[str, Source] = {}
    
    async def add_text_source(self, text: str, title: Optional[str] = None) -> Source:
        """Add text source"""
        
        source_id = self._generate_id(text)
        
        source = Source(
            id=source_id,
            type=SourceType.TEXT,
            title=title or "Text Input",
            content=text,
            metadata={
                "word_count": len(text.split()),
                "char_count": len(text)
            },
            created_at=datetime.now(),
            word_count=len(text.split()),
            status="ready"
        )
        
        self.sources[source_id] = source
        logger.info(f"✅ Added text source: {source_id}")
        
        return source
    
    async def add_pdf_source(self, file, title: Optional[str] = None) -> Source:
        """Add PDF source"""
        
        source_id = self._generate_id(file.filename)
        
        # Create source with processing status
        source = Source(
            id=source_id,
            type=SourceType.PDF,
            title=title or file.filename,
            content="",
            metadata={"filename": file.filename},
            created_at=datetime.now(),
            word_count=0,
            status="processing"
        )
        
        self.sources[source_id] = source
        
        try:
            # Extract text from PDF
            content = await extract_text_from_pdf(file)
            
            # Update source
            source.content = content
            source.word_count = len(content.split())
            source.metadata["char_count"] = len(content)
            source.status = "ready"
            
            logger.info(f"✅ Added PDF source: {source_id} ({source.word_count} words)")
            
        except Exception as e:
            source.status = "error"
            source.metadata["error"] = str(e)
            logger.error(f"❌ PDF extraction failed: {e}")
        
        return source
    
    async def add_url_source(self, url: str, title: Optional[str] = None) -> Source:
        """Add URL source"""
        
        source_id = self._generate_id(url)
        
        # Create source with processing status
        source = Source(
            id=source_id,
            type=SourceType.URL,
            title=title or url,
            content="",
            metadata={"url": url},
            created_at=datetime.now(),
            word_count=0,
            status="processing"
        )
        
        self.sources[source_id] = source
        
        try:
            # Fetch URL content
            content, extracted_title = await url_fetcher.fetch_url(url)
            
            # Update source
            source.content = content
            source.title = title or extracted_title or url
            source.word_count = len(content.split())
            source.metadata["char_count"] = len(content)
            source.status = "ready"
            
            logger.info(f"✅ Added URL source: {source_id} ({source.word_count} words)")
            
        except Exception as e:
            source.status = "error"
            source.metadata["error"] = str(e)
            logger.error(f"❌ URL fetch failed: {e}")
        
        return source
    
    def get_source(self, source_id: str) -> Optional[Source]:
        """Get source by ID"""
        return self.sources.get(source_id)
    
    def get_all_sources(self) -> List[Source]:
        """Get all sources"""
        return list(self.sources.values())
    
    def remove_source(self, source_id: str) -> bool:
        """Remove source"""
        if source_id in self.sources:
            del self.sources[source_id]
            logger.info(f"🗑️ Removed source: {source_id}")
            return True
        return False
    
    def get_combined_content(self, source_ids: Optional[List[str]] = None) -> str:
        """Get combined content from multiple sources"""
        
        if source_ids:
            sources = [self.sources[sid] for sid in source_ids if sid in self.sources]
        else:
            sources = list(self.sources.values())
        
        # Filter ready sources
        ready_sources = [s for s in sources if s.status == "ready"]
        
        # Combine content
        combined = "\n\n---\n\n".join([s.content for s in ready_sources])
        
        logger.info(f"📚 Combined {len(ready_sources)} sources ({len(combined)} chars)")
        
        return combined
    
    def _generate_id(self, text: str) -> str:
        """Generate unique ID for source"""
        return hashlib.md5(f"{text}{datetime.now()}".encode()).hexdigest()[:12]

# Global instance
source_manager = SourceManager()
