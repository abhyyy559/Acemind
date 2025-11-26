from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from app.services.llm_service import LLMService
from app.services.scraper_service import ScraperService
import logging
import re

router = APIRouter()
llm_service = LLMService()
scraper_service = ScraperService()

class RoadmapRequest(BaseModel):
    topic: str
    difficulty_level: str = "beginner"

class RoadmapResponse(BaseModel):
    topic: str
    roadmap_markdown: str
    resources: list
    estimated_duration: str

class VisualRoadmapRequest(BaseModel):
    topic: str | None = None
    difficulty_level: str = "beginner"
    roadmap_markdown: str | None = None

@router.post("/generate")
async def generate_roadmap(request: RoadmapRequest):
    """
    Generate a learning roadmap for a given topic
    """
    try:
        # Generate via LLM
        roadmap_markdown = llm_service.generate_roadmap(request.topic, request.difficulty_level)

        # Collect learning resources
        resources = []
        try:
            logging.info(f"Collecting resources for topic: {request.topic}")
            roadmap_topics = scraper_service._extract_topics_from_roadmap(roadmap_markdown)
            search_topics = [request.topic] + roadmap_topics[:5]
            resources = await scraper_service.collect_resources_for_topics(search_topics, limit_per_topic=10)
            logging.info(f"Collected {len(resources)} resources")
        except Exception as e:
            logging.error(f"Resource collection failed: {e}")

        # Filter valid resources
        valid_resources = []
        for resource in resources:
            if isinstance(resource, dict) and resource.get('url') and resource['url'].startswith("http"):
                valid_resources.append(resource)

        estimated_duration = llm_service.estimate_duration(roadmap_markdown)
        return RoadmapResponse(
            topic=request.topic,
            roadmap_markdown=roadmap_markdown,
            resources=valid_resources,
            estimated_duration=estimated_duration
        )
    except Exception as e:
        logging.error(f"Error in generate_roadmap: {e}")
        fallback = llm_service._get_fallback_roadmap(request.topic)
        estimated_duration = llm_service.estimate_duration(fallback)
        return RoadmapResponse(
            topic=request.topic,
            roadmap_markdown=fallback,
            resources=[],
            estimated_duration=estimated_duration
        )

@router.post("/generate-visual-roadmap", response_class=HTMLResponse)
async def generate_visual_roadmap(request: VisualRoadmapRequest):
    """
    Generate an interactive visual roadmap using Markmap
    """
    try:
        if request.roadmap_markdown and request.roadmap_markdown.strip():
            roadmap_markdown = request.roadmap_markdown
        else:
            roadmap_markdown = llm_service.generate_roadmap(request.topic or "Roadmap", request.difficulty_level)
        
        html_content = llm_service.convert_to_markmap(roadmap_markdown)
        return HTMLResponse(content=html_content, media_type="text/html")
    except Exception as e:
        logging.error(f"Failed to generate visual roadmap: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate visual roadmap: {str(e)}")

@router.get("/roadmap-template/{topic}")
async def get_roadmap_template(topic: str):
    """
    Get a quick roadmap template without full processing
    """
    try:
        template = await llm_service.generate_quick_template(topic)
        return {"topic": topic, "template": template}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate template: {str(e)}")
