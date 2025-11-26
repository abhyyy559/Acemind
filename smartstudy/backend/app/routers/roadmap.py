from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

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
    """Generate valid HTML with mind map visualization"""
    
    # Escape markdown content for JavaScript (escape backticks and ${})
    escaped_markdown = roadmap_markdown.replace('`', '\\`').replace('${', '\\${')
    
    html_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{topic} - Learning Roadmap</title>
    <script src="https://cdn.jsdelivr.net/npm/markmap-autoloader@latest"></script>
    <style>
        body {{{{
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }}}}
        .container {{{{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }}}}
        .header {{{{
            text-align: center;
            margin-bottom: 30px;
        }}}}
        .header h1 {{{{
            color: #667eea;
            margin: 0 0 10px 0;
        }}}}
        .controls {{{{
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
        }}}}
        .btn {{{{
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }}}}
        .btn-primary {{{{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }}}}
        .btn-primary:hover {{{{
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }}}}
        #mindmap {{{{
            width: 100%;
            height: 700px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            background: #f8fafc;
        }}}}
        .toast {{{{
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            background: #10b981;
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s;
        }}}}
        .toast.show {{{{
            opacity: 1;
            transform: translateY(0);
        }}}}
        .toast.error {{{{
            background: #ef4444;
        }}}}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗺️ {topic}</h1>
            <p style="color: #64748b; font-size: 16px;">
                Difficulty: <strong>{difficulty_level.capitalize()}</strong> | 
                Interactive Learning Roadmap
            </p>
        </div>
        
        <div class="controls">
            <button class="btn btn-primary" onclick="downloadHTML()">
                ⬇️ Download HTML
            </button>
            <button class="btn btn-primary" onclick="window.print()">
                🖨️ Print
            </button>
        </div>
        
        <svg id="mindmap"></svg>
    </div>

    <script>
        // DEFINE ALL FUNCTIONS FIRST
        function showToast(msg, isError) {{{{
            const toast = document.createElement('div');
            toast.className = 'toast' + (isError ? ' error' : '');
            toast.textContent = msg;
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => {{{{
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }}}}, 2000);
        }}}}

        function downloadHTML() {{{{
            try {{{{
                const htmlContent = document.documentElement.outerHTML;
                const blob = new Blob([htmlContent], {{{{ type: 'text/html;charset=utf-8' }}}});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'learning-roadmap-' + new Date().toISOString().split('T')[0] + '.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 100);
                showToast('HTML file downloaded successfully!', false);
            }}}} catch(e) {{{{
                console.error('Download error:', e);
                showToast('Download failed: ' + e.message, true);
            }}}}
        }}}}

        function init() {{{{
            try {{{{
                const markdownContent = `{escaped_markdown}`;
                
                // Initialize markmap
                const {{{{ Markmap }}}} = window.markmap;
                const svg = document.getElementById('mindmap');
                
                if (!Markmap) {{{{
                    throw new Error('Markmap library not loaded');
                }}}}
                
                // Transform markdown to markmap data
                const {{{{ root }}}} = Markmap.transform(markdownContent);
                
                // Create markmap instance
                Markmap.create(svg, {{}}, root);
                
                console.log('Markmap initialized successfully');
            }}}} catch(e) {{{{
                console.error('Initialization error:', e);
                showToast('Failed to load mind map: ' + e.message, true);
            }}}}
        }}}}

        // CALL INIT AFTER ALL FUNCTIONS ARE DEFINED
        if (document.readyState === 'loading') {{{{
            document.addEventListener('DOMContentLoaded', init);
        }}}} else {{{{
            init();
        }}}}
    </script>
</body>
</html>'''
    
    return html_template


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
