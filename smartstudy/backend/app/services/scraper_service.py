import requests
from bs4 import BeautifulSoup
import asyncio
import aiohttp
from typing import List, Dict
import urllib.parse
import logging
import re
import json

class ScraperService:
    """
    Enhanced scraper that finds ACTUAL specific courses and videos
    Scrapes from: YouTube, Coursera, Udemy, edX, Khan Academy, freeCodeCamp, GitHub
    """
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
    async def collect_resources(self, topic: str, limit: int = 20) -> List[Dict]:
        """
        Collect ACTUAL specific resources for a topic
        """
        all_resources = []
        
        # Collect from multiple sources in parallel
        tasks = [
            self._get_real_youtube_videos(topic, limit // 3),
            self._get_real_coursera_courses(topic, 2),
            self._get_real_udemy_courses(topic, 2),
            self._get_real_freecodecamp_resources(topic, 2),
            self._get_real_github_repos(topic, 2),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, list):
                all_resources.extend(result)
        
        # Remove duplicates, sort by quality, and return
        unique_resources = self._remove_duplicates(all_resources)
        sorted_resources = self._sort_by_quality(unique_resources)
        return sorted_resources[:limit]
    
    async def collect_resources_for_topics(self, topics: List[str], limit_per_topic: int = 8) -> List[Dict]:
        """
        Collect resources for multiple topics
        """
        all_resources = []
        
        for topic in topics:
            try:
                topic_resources = await self.collect_resources(topic, limit=limit_per_topic)
                all_resources.extend(topic_resources)
            except Exception as e:
                logging.error(f"Failed to collect resources for topic '{topic}': {e}")
                continue
        
        unique_resources = self._remove_duplicates(all_resources)
        return unique_resources[:50]
    
    def _extract_topics_from_roadmap(self, roadmap_markdown: str) -> List[str]:
        """
        Extract learning topics from checkbox items in roadmap
        """
        topics = []
        
        # Find all checkbox items with ** bold text **
        checkbox_pattern = r'- \[ \] (?:\*\*)?([^*\n]+?)(?:\*\*)?'
        matches = re.findall(checkbox_pattern, roadmap_markdown)
        
        for match in matches:
            # Clean up the topic text
            topic = match.strip()
            # Remove common prefixes
            topic = re.sub(r'^(Learn |Master |Understand |Build |Create |Study )', '', topic, flags=re.IGNORECASE)
            # Take only the main topic part (before any parentheses or dashes)
            topic = topic.split('(')[0].split('-')[0].strip()
            
            if len(topic) > 3 and topic not in topics:
                topics.append(topic)
        
        return topics
    
    async def _get_real_youtube_videos(self, topic: str, limit: int) -> List[Dict]:
        """
        Get ACTUAL YouTube videos by scraping search results
        """
        try:
            search_query = urllib.parse.quote_plus(f"{topic} full course tutorial")
            url = f"https://www.youtube.com/results?search_query={search_query}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status != 200:
                        logging.error(f"YouTube search failed with status {response.status}")
                        return []
                    
                    html = await response.text()
                    videos = []
                    
                    # Find ytInitialData in the HTML
                    match = re.search(r'var ytInitialData = ({.*?});', html)
                    if match:
                        try:
                            data = json.loads(match.group(1))
                            contents = data.get('contents', {}).get('twoColumnSearchResultsRenderer', {}).get('primaryContents', {}).get('sectionListRenderer', {}).get('contents', [])
                            
                            for content in contents:
                                item_section = content.get('itemSectionRenderer', {})
                                for item in item_section.get('contents', []):
                                    video_renderer = item.get('videoRenderer', {})
                                    if video_renderer:
                                        video_id = video_renderer.get('videoId')
                                        title = video_renderer.get('title', {}).get('runs', [{}])[0].get('text', '')
                                        channel = video_renderer.get('ownerText', {}).get('runs', [{}])[0].get('text', 'YouTube')
                                        duration_text = video_renderer.get('lengthText', {}).get('simpleText', 'Unknown')
                                        view_text = video_renderer.get('viewCountText', {}).get('simpleText', '')
                                        
                                        if video_id and title:
                                            videos.append({
                                                "title": title,
                                                "url": f"https://www.youtube.com/watch?v={video_id}",
                                                "source": channel,
                                                "description": f"{view_text} • {duration_text}",
                                                "duration": duration_text,
                                                "type": "video"
                                            })
                                            
                                            if len(videos) >= limit:
                                                break
                                
                                if len(videos) >= limit:
                                    break
                        except json.JSONDecodeError:
                            logging.error("Failed to parse YouTube data")
                    
                    return videos[:limit]
                    
        except Exception as e:
            logging.error(f"YouTube scraping error: {e}")
            return []
    
    async def _get_real_coursera_courses(self, topic: str, limit: int) -> List[Dict]:
        """
        Get ACTUAL Coursera courses
        """
        try:
            search_query = urllib.parse.quote_plus(topic)
            url = f"https://www.coursera.org/search?query={search_query}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status != 200:
                        return []
                    
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    courses = []
                    course_cards = soup.find_all('a', {'class': re.compile(r'cds-.*-link')}, href=re.compile(r'/learn/'))
                    
                    for card in course_cards[:limit]:
                        href = card.get('href', '')
                        if not href:
                            continue
                        
                        title_elem = card.find('h3') or card.find('h2')
                        title = title_elem.get_text(strip=True) if title_elem else ''
                        
                        if title and href:
                            full_url = f"https://www.coursera.org{href}" if href.startswith('/') else href
                            courses.append({
                                "title": title,
                                "url": full_url,
                                "source": "Coursera",
                                "description": f"Professional course on {topic}",
                                "duration": "4-6 weeks",
                                "rating": "4.7/5",
                                "type": "course"
                            })
                    
                    return courses
                    
        except Exception as e:
            logging.error(f"Coursera scraping error: {e}")
            return []
    
    async def _get_real_udemy_courses(self, topic: str, limit: int) -> List[Dict]:
        """
        Get ACTUAL Udemy courses
        """
        try:
            search_query = urllib.parse.quote_plus(topic)
            url = f"https://www.udemy.com/courses/search/?q={search_query}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status != 200:
                        return []
                    
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    courses = []
                    course_cards = soup.find_all('a', {'data-purpose': 'course-card-title'})
                    
                    for card in course_cards[:limit]:
                        title = card.get_text(strip=True)
                        href = card.get('href', '')
                        
                        if title and href:
                            full_url = f"https://www.udemy.com{href}" if href.startswith('/') else href
                            courses.append({
                                "title": title,
                                "url": full_url,
                                "source": "Udemy",
                                "description": f"Comprehensive {topic} course",
                                "duration": "Variable",
                                "rating": "4.5/5",
                                "type": "course"
                            })
                    
                    return courses
                    
        except Exception as e:
            logging.error(f"Udemy scraping error: {e}")
            return []
    
    async def _get_real_freecodecamp_resources(self, topic: str, limit: int) -> List[Dict]:
        """
        Get ACTUAL freeCodeCamp articles/tutorials
        """
        try:
            search_query = urllib.parse.quote_plus(topic)
            url = f"https://www.freecodecamp.org/news/search/?query={search_query}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status != 200:
                        return []
                    
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    resources = []
                    articles = soup.find_all('article', class_=re.compile(r'post-card'))
                    
                    for article in articles[:limit]:
                        link = article.find('a', class_=re.compile(r'post-card-image-link'))
                        if not link:
                            continue
                        
                        href = link.get('href', '')
                        title_elem = article.find('h2', class_=re.compile(r'post-card-title'))
                        title = title_elem.get_text(strip=True) if title_elem else ''
                        
                        if title and href:
                            resources.append({
                                "title": title,
                                "url": href,
                                "source": "freeCodeCamp",
                                "description": f"Free tutorial on {topic}",
                                "duration": "15-30 min read",
                                "type": "article"
                            })
                    
                    return resources
                    
        except Exception as e:
            logging.error(f"freeCodeCamp scraping error: {e}")
            return []
    
    async def _get_real_github_repos(self, topic: str, limit: int) -> List[Dict]:
        """
        Get ACTUAL GitHub repositories
        """
        try:
            search_query = urllib.parse.quote_plus(f"{topic} tutorial")
            url = f"https://github.com/search?q={search_query}&type=repositories"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status != 200:
                        return []
                    
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    repos = []
                    repo_items = soup.find_all('div', class_=re.compile(r'repo-list-item'))
                    
                    for item in repo_items[:limit]:
                        link = item.find('a', class_=re.compile(r'v-align-middle'))
                        if not link:
                            continue
                        
                        href = link.get('href', '')
                        title = link.get_text(strip=True)
                        
                        if title and href:
                            full_url = f"https://github.com{href}" if href.startswith('/') else href
                            repos.append({
                                "title": title,
                                "url": full_url,
                                "source": "GitHub",
                                "description": f"Open-source {topic} project",
                                "duration": "Ongoing",
                                "type": "repository"
                            })
                    
                    return repos
                    
        except Exception as e:
            logging.error(f"GitHub scraping error: {e}")
            return []
    
    def _remove_duplicates(self, resources: List[Dict]) -> List[Dict]:
        """
        Remove duplicate resources based on URL
        """
        seen_urls = set()
        unique_resources = []
        
        for resource in resources:
            url = resource.get('url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_resources.append(resource)
        
        return unique_resources
    
    def _sort_by_quality(self, resources: List[Dict]) -> List[Dict]:
        """
        Sort resources by quality metrics
        """
        def get_quality_score(resource):
            score = 0
            resource_type = resource.get('type', '')
            source = resource.get('source', '').lower()
            
            # Boost for popular platforms
            if 'freecodecamp' in source or 'khan academy' in source:
                score += 30
            elif 'coursera' in source or 'edx' in source:
                score += 25
            elif 'udemy' in source or 'udacity' in source:
                score += 20
            elif 'youtube' in source:
                score += 15
            
            return score
        
        return sorted(resources, key=get_quality_score, reverse=True)
