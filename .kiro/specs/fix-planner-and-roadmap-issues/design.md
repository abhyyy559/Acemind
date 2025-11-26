# Design Document

## Overview

This design addresses two critical bugs in the AceMind application:

1. **Planner State Synchronization Bug**: The form uses separate local state variables that aren't synchronized with the `studyPlanInput` state object used for button validation
2. **Missing Roadmap Backend Endpoint**: The frontend calls a non-existent `/roadmap/generate-visual-roadmap` endpoint, and even if it existed, the HTML generation would have JavaScript errors

## Architecture

### Component Architecture

```
Planner Component (Frontend)
├── Local Form State (dailyStudyHours, examDate, goals)
├── Study Plan State (studyPlanInput) ← NEEDS SYNC
└── Button Validation Logic ← Checks studyPlanInput

Roadmap Component (Frontend)
├── Calls /roadmap/generate-visual-roadmap ← ENDPOINT MISSING
└── Opens popup with HTML response

Backend API
├── Existing Routers (auth, quiz, notes, etc.)
└── Missing: Roadmap Router ← NEEDS CREATION
```

## Components and Interfaces

### 1. Planner Component State Fix

**Problem**: The component maintains duplicate state:
- Local state: `dailyStudyHours`, `examDate`, `goals` (updated by form inputs)
- API state: `studyPlanInput` (checked by button validation)
- These are never synchronized, so the button stays disabled

**Solution**: Synchronize local form state with `studyPlanInput` state

#### Implementation Approach A: Update studyPlanInput directly (Recommended)
```typescript
// Remove separate local state variables
// Update studyPlanInput directly in onChange handlers

<input
  type="number"
  value={studyPlanInput.daily_study_hours}
  onChange={(e) => setStudyPlanInput(prev => ({
    ...prev,
    daily_study_hours: parseInt(e.target.value) || 6
  }))}
/>

<input
  type="date"
  value={studyPlanInput.exam_date}
  onChange={(e) => {
    const newDate = e.target.value
    setStudyPlanInput(prev => ({
      ...prev,
      exam_date: newDate
    }))
    // Calculate days remaining
    if (newDate) {
      const examDate = new Date(newDate)
      const today = new Date()
      const days = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      setDaysUntilExam(days)
    }
  }}
/>

<textarea
  value={studyPlanInput.goals}
  onChange={(e) => setStudyPlanInput(prev => ({
    ...prev,
    goals: e.target.value
  }))}
/>
```

#### Implementation Approach B: Sync with useEffect (Alternative)
```typescript
// Keep local state but sync to studyPlanInput
useEffect(() => {
  setStudyPlanInput(prev => ({
    ...prev,
    daily_study_hours: dailyStudyHours,
    exam_date: examDate,
    goals: goals
  }))
}, [dailyStudyHours, examDate, goals])
```

**Recommendation**: Use Approach A (direct updates) to eliminate redundant state and prevent sync issues.

### 2. Roadmap Backend Endpoint Creation

**Problem**: The endpoint `/roadmap/generate-visual-roadmap` doesn't exist in the backend

**Solution**: Create a new roadmap router with visual generation endpoint

#### Backend Router Structure

```python
# app/routers/roadmap.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json

router = APIRouter()

class RoadmapRequest(BaseModel):
    topic: str
    difficulty_level: str
    roadmap_markdown: Optional[str] = ""

class Resource(BaseModel):
    title: str
    url: str
    type: str
    source: Optional[str] = None
    description: Optional[str] = None

class RoadmapResponse(BaseModel):
    topic: str
    roadmap_markdown: str
    resources: List[Resource]
    estimated_duration: str

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    """Generate a learning roadmap with AI"""
    # Implementation for roadmap generation
    pass

@router.post("/generate-visual-roadmap")
async def generate_visual_roadmap(request: RoadmapRequest):
    """Generate interactive HTML mind map visualization"""
    # Implementation for visual HTML generation
    pass
```

### 3. Visual Roadmap HTML Generation

**Problem**: The generated HTML has JavaScript errors:
- `downloadHTML is not defined` - function is referenced before definition
- `Uncaught SyntaxError` - malformed JavaScript code

**Solution**: Generate valid HTML with properly ordered JavaScript

#### HTML Template Structure

```python
def generate_visual_html(topic: str, roadmap_markdown: str, difficulty_level: str) -> str:
    """Generate valid HTML with mind map visualization"""
    
    html_template = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{topic} - Learning Roadmap</title>
    <script src="https://cdn.jsdelivr.net/npm/markmap-autoloader@latest"></script>
    <style>
        body {{
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #667eea;
            margin: 0 0 10px 0;
        }}
        .controls {{
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
        }}
        .btn {{
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }}
        .btn-primary {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }}
        .btn-primary:hover {{
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }}
        #mindmap {{
            width: 100%;
            height: 700px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            background: #f8fafc;
        }}
        .toast {{
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
        }}
        .toast.show {{
            opacity: 1;
            transform: translateY(0);
        }}
        .toast.error {{
            background: #ef4444;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗺️ {topic}</h1>
            <p style="color: #64748b; font-size: 16px;">
                Difficulty: <strong>{difficulty_level}</strong> | 
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
        function showToast(msg, isError) {{
            const toast = document.createElement('div');
            toast.className = 'toast' + (isError ? ' error' : '');
            toast.textContent = msg;
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => {{
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }}, 2000);
        }}

        function downloadHTML() {{
            try {{
                const htmlContent = document.documentElement.outerHTML;
                const blob = new Blob([htmlContent], {{ type: 'text/html;charset=utf-8' }});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'learning-roadmap-' + new Date().toISOString().split('T')[0] + '.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 100);
                showToast('HTML file downloaded successfully!', false);
            }} catch(e) {{
                console.error('Download error:', e);
                showToast('Download failed: ' + e.message, true);
            }}
        }}

        function init() {{
            try {{
                const markdownContent = `{escaped_markdown}`;
                
                // Initialize markmap
                const {{ Markmap }} = window.markmap;
                const svg = document.getElementById('mindmap');
                
                if (!Markmap) {{
                    throw new Error('Markmap library not loaded');
                }}
                
                // Transform markdown to markmap data
                const {{ root }} = Markmap.transform(markdownContent);
                
                // Create markmap instance
                Markmap.create(svg, {{}}, root);
                
                console.log('Markmap initialized successfully');
            }} catch(e) {{
                console.error('Initialization error:', e);
                showToast('Failed to load mind map: ' + e.message, true);
            }}
        }}

        // CALL INIT AFTER ALL FUNCTIONS ARE DEFINED
        if (document.readyState === 'loading') {{
            document.addEventListener('DOMContentLoaded', init);
        }} else {{
            init();
        }}
    </script>
</body>
</html>
'''
    
    # Escape markdown content for JavaScript
    escaped_markdown = roadmap_markdown.replace('`', '\\`').replace('${', '\\${')
    
    return html_template.format(
        topic=topic,
        difficulty_level=difficulty_level.capitalize(),
        escaped_markdown=escaped_markdown
    )
```

## Data Models

### Planner Component State

```typescript
interface CreateStudyPlanInput {
  title: string
  subjects: SubjectInput[]
  daily_study_hours: number  // Updated directly from form
  exam_date: string           // Updated directly from form
  goals: string               // Updated directly from form
}
```

### Roadmap API Models

```python
class RoadmapRequest(BaseModel):
    topic: str
    difficulty_level: str
    roadmap_markdown: Optional[str] = ""

class RoadmapResponse(BaseModel):
    topic: str
    roadmap_markdown: str
    resources: List[Resource]
    estimated_duration: str
```

## Error Handling

### Frontend Error Handling

1. **Planner Component**:
   - Validate form inputs before enabling button
   - Show error messages for invalid dates
   - Handle API errors gracefully

2. **Roadmap Component**:
   - Check if popup was blocked
   - Handle backend errors
   - Show loading states during generation

### Backend Error Handling

1. **Roadmap Router**:
   - Validate request parameters
   - Handle AI service failures
   - Return proper HTTP status codes
   - Log errors for debugging

```python
@router.post("/generate-visual-roadmap")
async def generate_visual_roadmap(request: RoadmapRequest):
    try:
        if not request.topic:
            raise HTTPException(status_code=400, detail="Topic is required")
        
        html_content = generate_visual_html(
            topic=request.topic,
            roadmap_markdown=request.roadmap_markdown,
            difficulty_level=request.difficulty_level
        )
        
        return HTMLResponse(content=html_content)
        
    except Exception as e:
        logger.error(f"Error generating visual roadmap: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate visual roadmap: {str(e)}"
        )
```

## Testing Strategy

### Unit Tests

1. **Planner Component**:
   - Test state updates when form fields change
   - Test button enable/disable logic
   - Test form validation

2. **Roadmap Backend**:
   - Test HTML generation with various inputs
   - Test JavaScript escaping
   - Test error handling

### Integration Tests

1. **Planner Flow**:
   - Fill form → Button enables → Generate plan → Success

2. **Roadmap Flow**:
   - Enter topic → Generate roadmap → Click visual map → Popup opens with rendered mind map

### Manual Testing Checklist

- [ ] Planner button enables when all fields are filled
- [ ] Planner button stays disabled when fields are empty
- [ ] Visual roadmap opens in popup without errors
- [ ] Mind map renders correctly in popup
- [ ] Download button works in visual roadmap
- [ ] Print button works in visual roadmap
- [ ] No JavaScript console errors

## Implementation Notes

### Key Changes Required

1. **Planner.tsx** (Lines ~400-500):
   - Remove unused local state variables
   - Update all form inputs to modify `studyPlanInput` directly
   - Ensure button validation checks the correct state

2. **Backend** (New files):
   - Create `app/routers/roadmap.py`
   - Add roadmap router to `app/main.py`
   - Implement HTML generation with proper JavaScript ordering

3. **HTML Template**:
   - Define all JavaScript functions before they're referenced
   - Properly escape markdown content
   - Use double braces `{{}}` for Python f-string escaping

### Dependencies

- Frontend: No new dependencies needed
- Backend: May need `markmap` or similar library (check if using CDN is sufficient)

### Performance Considerations

- HTML generation should be fast (<100ms)
- Popup window should open immediately
- Mind map rendering depends on markdown size
- Consider caching generated HTML for same inputs
