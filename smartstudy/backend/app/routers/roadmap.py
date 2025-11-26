from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional
import logging
from app.services.llm_service import LLMService
from app.services.scraper_service import ScraperService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
llm_service = LLMService()
scraper_service = ScraperService()

# Request/Response Models
class Resource(BaseModel):
    title: str
    url: str
    type: str
    source: Optional[str] = None
    description: Optional[str] = None

class RoadmapRequest(BaseModel):
    topic: str
    difficulty_level: str
    roadmap_markdown: Optional[str] = ""

class RoadmapResponse(BaseModel):
    topic: str
    roadmap_markdown: str
    resources: List[Resource]
    estimated_duration: str


def generate_visual_html(topic: str, roadmap_markdown: str, difficulty_level: str) -> str:
    """Generate valid HTML with mind map visualization using dark theme"""
    
    # Properly escape markdown content for JavaScript
    # Replace backslashes first, then quotes, then newlines
    escaped_markdown = (roadmap_markdown
                       .replace('\\', '\\\\')  # Escape backslashes
                       .replace('"', '\\"')     # Escape double quotes
                       .replace("'", "\\'")     # Escape single quotes
                       .replace('\n', '\\n')    # Escape newlines
                       .replace('\r', '\\r')    # Escape carriage returns
                       .replace('\t', '\\t'))   # Escape tabs
    
    html_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{topic} - Interactive Learning Roadmap</title>
    <style>
        * {{{{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}}}
        
        body {{{{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%);
            min-height: 100vh;
            color: #e6edf3;
        }}}}
        
        .container {{{{
            max-width: 1600px;
            margin: 20px auto;
            background: rgba(33, 38, 45, 0.8);
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            overflow: hidden;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(240, 246, 252, 0.1);
            height: calc(100vh - 40px);
            display: flex;
            flex-direction: column;
        }}}}
        
        .header {{{{
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: #f9fafb;
            padding: 24px 32px;
            text-align: center;
            position: relative;
            border-bottom: 1px solid rgba(240, 246, 252, 0.1);
            flex-shrink: 0;
        }}}}
        
        .header h1 {{{{
            margin: 0;
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }}}}
        
        .header p {{{{
            margin: 12px 0 0 0;
            opacity: 0.8;
            font-size: 0.9rem;
            color: #d1d5db;
        }}}}
        
        .mindmap-container {{{{
            position: relative;
            background: #0d1117;
            flex: 1;
            min-height: 0;
        }}}}
        
        #mindmap {{{{
            width: 100%;
            height: 100%;
        }}}}
        
        .controls {{{{
            padding: 16px 24px;
            background: rgba(21, 26, 33, 0.9);
            border-top: 1px solid rgba(240, 246, 252, 0.1);
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            flex-shrink: 0;
        }}}}
        
        .btn {{{{
            background: rgba(30, 41, 59, 0.8);
            color: #e2e8f0;
            border: 1px solid rgba(240, 246, 252, 0.2);
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
        }}}}
        
        .btn:hover {{{{
            background: rgba(51, 65, 85, 0.9);
            border-color: rgba(240, 246, 252, 0.3);
            transform: translateY(-1px);
        }}}}
        
        .btn.success {{{{
            background: #059669;
            border-color: #059669;
            color: white;
        }}}}
        
        .btn.success:hover {{{{
            background: #047857;
        }}}}
        
        .loading {{{{
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(21, 26, 33, 0.95);
            padding: 24px;
            border-radius: 12px;
            z-index: 100;
        }}}}
        
        .spinner {{{{
            width: 32px;
            height: 32px;
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
        }}}}
        
        @keyframes spin {{{{
            0% {{{{ transform: rotate(0deg); }}}}
            100% {{{{ transform: rotate(360deg); }}}}
        }}}}
        
        .toast {{{{
            position: fixed;
            top: 24px;
            right: 24px;
            background: #059669;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 1000;
            font-size: 14px;
        }}}}
        
        .toast.show {{{{
            transform: translateX(0);
        }}}}
        
        .toast.error {{{{
            background: #dc2626;
        }}}}
        
        @media print {{{{
            body {{{{ background: white; }}}}
            .container {{{{ max-width: 100%; margin: 0; box-shadow: none; border: none; height: auto; }}}}
            .controls {{{{ display: none !important; }}}}
            .header {{{{ background: white; color: black; border-bottom: 2px solid #e5e7eb; }}}}
            .header h1 {{{{ background: none; -webkit-text-fill-color: #1f2937; color: #1f2937; }}}}
            .header p {{{{ color: #6b7280; }}}}
            .mindmap-container {{{{ background: white; }}}}
            .toast, .loading {{{{ display: none !important; }}}}
        }}}}
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-lib@0.15.3/dist/browser/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.15.3/dist/browser/index.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 {topic}</h1>
            <p>Difficulty: {difficulty_level.capitalize()} | Click nodes to expand • Drag to navigate • Scroll to zoom</p>
        </div>
        <div class="mindmap-container">
            <svg id="mindmap"></svg>
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <div>Loading...</div>
            </div>
        </div>
        <div class="controls">
            <button class="btn" onclick="fitScreen()">🔍 Fit Screen</button>
            <button class="btn" onclick="expandAll()">📖 Expand All</button>
            <button class="btn" onclick="collapseAll()">📚 Collapse All</button>
            <button class="btn success" onclick="downloadHTML()">⬇️ Download HTML</button>
        </div>
    </div>

    <script>
        var mm;
        var markdown = "{escaped_markdown}";
        
        function init() {{{{
            document.getElementById('loading').style.display = 'block';
            
            setTimeout(function() {{{{
                try {{{{
                    var transformer = new window.markmap.Transformer();
                    var data = transformer.transform(markdown).root;
                    
                    mm = window.markmap.Markmap.create('#mindmap', {{{{
                        color: function(node) {{{{
                            var colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                            return colors[node.depth % 6];
                        }}}},
                        duration: 300,
                        maxWidth: 280,
                        initialExpandLevel: 2
                    }}}}, data);
                    
                    mm.fit();
                    document.getElementById('loading').style.display = 'none';
                    showToast('Roadmap loaded successfully!');
                }}}} catch(e) {{{{
                    console.error(e);
                    document.getElementById('loading').style.display = 'none';
                    showToast('Error loading roadmap: ' + e.message, true);
                }}}}
            }}}}, 100);
        }}}}
        
        function fitScreen() {{{{
            if (mm) mm.fit();
            showToast('Fitted to screen');
        }}}}
        
        function expandAll() {{{{
            if (!mm) return;
            showToast('Expanding all nodes...');
            var transformer = new window.markmap.Transformer();
            var data = transformer.transform(markdown).root;
            function forceExpandEverything(node) {{{{
                if (node.payload) delete node.payload.fold;
                node.payload = node.payload || {{}};
                node.payload.fold = 0;
                if (node.children) {{{{
                    for (var i = 0; i < node.children.length; i++) {{{{
                        forceExpandEverything(node.children[i]);
                    }}}}
                }}}}
            }}}}
            forceExpandEverything(data);
            mm.setData(data);
            setTimeout(function() {{{{ mm.fit(); showToast('All nodes expanded!'); }}}}, 300);
        }}}}
        
        function collapseAll() {{{{
            if (!mm) return;
            var transformer = new window.markmap.Transformer();
            var data = transformer.transform(markdown).root;
            function foldAllNodes(node, isRoot) {{{{
                if (!isRoot) {{{{
                    node.payload = node.payload || {{}};
                    node.payload.fold = 1;
                }}}}
                if (node.children && node.children.length > 0) {{{{
                    for (var i = 0; i < node.children.length; i++) {{{{
                        foldAllNodes(node.children[i], false);
                    }}}}
                }}}}
            }}}}
            foldAllNodes(data, true);
            mm.setData(data);
            setTimeout(function() {{{{ mm.fit(); showToast('All nodes collapsed!'); }}}}, 100);
        }}}}
        
        function downloadHTML() {{{{
            try {{{{
                showToast('Creating HTML file...');
                var htmlContent = document.documentElement.outerHTML;
                var blob = new Blob([htmlContent], {{{{type: 'text/html;charset=utf-8'}}}});
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'learning-roadmap-' + new Date().toISOString().split('T')[0] + '.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function() {{{{ URL.revokeObjectURL(url); }}}}, 100);
                showToast('HTML file downloaded successfully!');
            }}}} catch(e) {{{{
                console.error('Download error:', e);
                showToast('Download failed: ' + e.message, true);
            }}}}
        }}}}
        
        function showToast(msg, error) {{{{
            var toast = document.createElement('div');
            toast.className = 'toast' + (error ? ' error' : '');
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(function() {{{{ toast.classList.add('show'); }}}}, 100);
            setTimeout(function() {{{{
                toast.classList.remove('show');
                setTimeout(function() {{{{ toast.remove(); }}}}, 300);
            }}}}, 2000);
        }}}}
        
        init();
    </script>
</body>
</html>'''
    
    return html_template


@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    """Generate AI-powered learning roadmap with resources using LLM and web scraping"""
    try:
        # Validate topic is not empty
        if not request.topic or not request.topic.strip():
            raise HTTPException(status_code=400, detail="Topic is required")
        
        logger.info(f"Generating roadmap for topic: {request.topic}, difficulty: {request.difficulty_level}")
        
        # Generate roadmap using LLM service (Ollama/Gemini)
        try:
            roadmap_markdown = llm_service.generate_roadmap(request.topic, request.difficulty_level)
            logger.info(f"LLM generated roadmap, length: {len(roadmap_markdown)} characters")
        except Exception as e:
            logger.error(f"LLM generation failed: {e}, using fallback")
            roadmap_markdown = _get_fallback_roadmap(request.topic, request.difficulty_level)
        
        # Extract topics from roadmap for resource collection
        try:
            roadmap_topics = scraper_service._extract_topics_from_roadmap(roadmap_markdown)
            search_topics = [request.topic] + roadmap_topics[:5]  # Main topic + top 5 subtopics
            logger.info(f"Collecting resources for topics: {search_topics}")
            
            # Collect real resources using web scraping
            scraped_resources = await scraper_service.collect_resources_for_topics(search_topics, limit_per_topic=8)
            
            # Convert to Resource model
            resources = [
                Resource(
                    title=res.get("title", ""),
                    url=res.get("url", ""),
                    type=res.get("type", "Resource"),
                    source=res.get("source", ""),
                    description=res.get("description", "")
                )
                for res in scraped_resources
            ]
            
            logger.info(f"Collected {len(resources)} resources from web scraping")
        except Exception as e:
            logger.error(f"Resource collection failed: {e}, using fallback resources")
            resources = _get_fallback_resources(request.topic)
        
        # Estimate duration based on difficulty and content
        estimated_duration = _estimate_duration(roadmap_markdown, request.difficulty_level)
        
        response = RoadmapResponse(
            topic=request.topic,
            roadmap_markdown=roadmap_markdown,
            resources=resources,
            estimated_duration=estimated_duration
        )
        
        logger.info(f"Successfully generated roadmap for: {request.topic}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating roadmap: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate roadmap: {str(e)}"
        )

def _get_fallback_roadmap(topic: str, difficulty_level: str) -> str:
    """Generate a basic fallback roadmap when LLM is unavailable"""
    return f"""# {topic} Learning Roadmap

## Phase 1: Fundamentals ({difficulty_level.capitalize()} Level)
- Understand core concepts and terminology
- Learn basic principles and foundations
- Practice with simple examples
- Build foundational knowledge

## Phase 2: Intermediate Skills
- Apply concepts to real projects
- Explore advanced topics
- Work with practical scenarios
- Develop hands-on experience

## Phase 3: Advanced Topics
- Master complex patterns
- Optimize for performance
- Learn best practices
- Study industry standards

## Phase 4: Specialization
- Choose your focus area
- Deep dive into specific technologies
- Build portfolio projects
- Contribute to open source

## Phase 5: Mastery
- Teach others
- Stay updated with trends
- Build advanced projects
- Become an expert
"""

def _get_fallback_resources(topic: str) -> List[Resource]:
    """Generate fallback resources when scraping fails"""
    return [
        Resource(
            title=f"{topic} - Official Documentation",
            url=f"https://www.google.com/search?q={topic.replace(' ', '+')}+documentation",
            type="Documentation",
            source="Search",
            description=f"Official documentation and guides for {topic}"
        ),
        Resource(
            title=f"Learn {topic} - YouTube",
            url=f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}+tutorial",
            type="Video",
            source="YouTube",
            description=f"Video tutorials and courses on {topic}"
        ),
        Resource(
            title=f"{topic} Courses - Coursera",
            url=f"https://www.coursera.org/search?query={topic.replace(' ', '%20')}",
            type="Course",
            source="Coursera",
            description=f"Online courses for {topic}"
        )
    ]

def _estimate_duration(roadmap_markdown: str, difficulty_level: str) -> str:
    """Estimate learning duration based on content and difficulty"""
    # Count sections/topics
    sections = roadmap_markdown.count('##')
    items = roadmap_markdown.count('- ')
    
    # Base duration by difficulty
    base_weeks = {
        'beginner': 12,
        'intermediate': 8,
        'advanced': 6
    }.get(difficulty_level.lower(), 10)
    
    # Adjust based on content
    if sections > 8 or items > 50:
        base_weeks += 4
    elif sections > 5 or items > 30:
        base_weeks += 2
    
    return f"{base_weeks}-{base_weeks + 4} weeks"

@router.post("/generate-visual-roadmap")
async def generate_visual_roadmap(request: RoadmapRequest):
    """Generate interactive HTML mind map visualization"""
    try:
        # Validate topic is not empty
        if not request.topic or not request.topic.strip():
            raise HTTPException(status_code=400, detail="Topic is required")
        
        # Generate HTML content
        html_content = generate_visual_html(
            topic=request.topic,
            roadmap_markdown=request.roadmap_markdown,
            difficulty_level=request.difficulty_level
        )
        
        logger.info(f"Generated visual roadmap for topic: {request.topic}")
        
        return HTMLResponse(content=html_content)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating visual roadmap: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate visual roadmap: {str(e)}"
        )
