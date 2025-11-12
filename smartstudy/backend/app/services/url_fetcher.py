"""
URL Fetcher - Extract content from web pages
"""
import httpx
import logging
from typing import Tuple, Optional
from bs4 import BeautifulSoup
import re

logger = logging.getLogger(__name__)

class URLFetcher:
    """Fetch and extract content from URLs"""
    
    def __init__(self):
        self.timeout = 30.0
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    
    async def fetch_url(self, url: str) -> Tuple[str, Optional[str]]:
        """
        Fetch URL and extract main content
        Returns: (content, title)
        """
        
        logger.info(f"🌐 Fetching URL: {url}")
        
        # Validate URL
        if not self._is_valid_url(url):
            raise ValueError(f"Invalid URL: {url}")
        
        # Fetch page
        html = await self._fetch_html(url)
        
        # Extract content
        content, title = self._extract_content(html)
        
        logger.info(f"✅ Extracted {len(content)} chars from {url}")
        
        return content, title
    
    def _is_valid_url(self, url: str) -> bool:
        """Validate URL format"""
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        return url_pattern.match(url) is not None
    
    async def _fetch_html(self, url: str) -> str:
        """Fetch HTML from URL"""
        
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }
        
        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code != 200:
                raise Exception(f"HTTP {response.status_code}: {url}")
            
            return response.text
    
    def _extract_content(self, html: str) -> Tuple[str, Optional[str]]:
        """Extract main content from HTML"""
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract title
        title = None
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text().strip()
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'noscript']):
            element.decompose()
        
        # Try to find main content
        main_content = None
        
        # Strategy 1: Look for article tag
        article = soup.find('article')
        if article:
            main_content = article
        
        # Strategy 2: Look for main tag
        if not main_content:
            main = soup.find('main')
            if main:
                main_content = main
        
        # Strategy 3: Look for content div
        if not main_content:
            content_divs = soup.find_all('div', class_=re.compile(r'content|article|post|entry', re.I))
            if content_divs:
                main_content = content_divs[0]
        
        # Strategy 4: Use body
        if not main_content:
            main_content = soup.find('body')
        
        # Extract text
        if main_content:
            # Get all paragraphs
            paragraphs = main_content.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'])
            
            text_parts = []
            for p in paragraphs:
                text = p.get_text().strip()
                if len(text) > 20:  # Only include substantial text
                    text_parts.append(text)
            
            content = '\n\n'.join(text_parts)
        else:
            content = soup.get_text()
        
        # Clean up content
        content = self._clean_text(content)
        
        return content, title
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        
        # Remove excessive whitespace
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        
        # Remove very short lines (likely navigation/ads)
        lines = text.split('\n')
        cleaned_lines = [line for line in lines if len(line.strip()) > 10 or line.strip() == '']
        
        text = '\n'.join(cleaned_lines)
        
        return text.strip()

# Global instance
url_fetcher = URLFetcher()
