# Design Document

## Overview

The Interactive Roadmap Visualization feature transforms GrowMap's markdown-based learning roadmaps into interactive, node-based mind maps using the Markmap library. The system follows a client-server architecture where the backend generates complete HTML documents with embedded Markmap visualizations, and the frontend displays them in new browser windows.

**Key Design Principles:**
- Server-side HTML generation to minimize client-side processing
- Standalone HTML output that works offline
- Responsive, performant visualization for roadmaps up to 100+ nodes
- Dark theme consistency with GrowMap's existing UI

## Architecture

### High-Level Flow

```
User clicks "Visual Map" button
    ↓
Frontend (RoadmapView.jsx) sends POST request
    ↓
Backend (/api/generate-visual-roadmap) receives markdown
    ↓
Backend (llm_service.py) generates complete HTML with:
    - Markmap CDN libraries (D3.js, markmap-lib, markmap-view)
    - Escaped markdown content
    - Initialization JavaScript
    - Control buttons (Expand/Collapse/Fit/Download)
    - Dark theme styling
    ↓
Backend returns HTML as response
    ↓
Frontend creates Blob URL from HTML
    ↓
Frontend opens Blob URL in new window
    ↓
Markmap transforms markdown → Interactive SVG mind map
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │         RoadmapView.jsx Component                 │  │
│  │  - Visual Map button                              │  │
│  │  - generateVisualRoadmap() function               │  │
│  │  - Axios POST to backend                          │  │
│  │  - Blob URL creation and window.open()            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓ HTTP POST
┌─────────────────────────────────────────────────────────┐
│                    Backend Layer                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │         roadmap.py (FastAPI Router)               │  │
│  │  - POST /api/generate-visual-roadmap              │  │
│  │  - Request validation (VisualRoadmapRequest)      │  │
│  │  - Calls llm_service.convert_to_markmap()         │  │
│  │  - Returns HTMLResponse                           │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │         llm_service.py (Service Layer)            │  │
│  │  - convert_to_markmap(markdown: str) → str        │  │
│  │  - Escapes markdown with json.dumps()             │  │
│  │  - Generates complete HTML template               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓ HTML Response
┌─────────────────────────────────────────────────────────┐
│                  Browser Window (New)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Generated HTML Document                   │  │
│  │  - D3.js v7.8.5 (CDN)                             │  │
│  │  - markmap-lib v0.15.3 (CDN)                      │  │
│  │  - markmap-view v0.15.3 (CDN)                     │  │
│  │  - Embedded markdown content                      │  │
│  │  - Markmap initialization script                  │  │
│  │  - Control buttons (Expand/Collapse/Fit/Download) │  │
│  │  - Dark theme CSS                                 │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Markmap Rendering Engine                  │  │
│  │  - Transformer.transform(markdown) → tree         │  │
│  │  - Markmap.create('#mindmap', options, tree)      │  │
│  │  - Renders interactive SVG                        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Component: RoadmapView.jsx

**Location:** `Growmap/frontend/src/components/RoadmapView.jsx`

**Responsibilities:**
- Display "Visual Map" button in the roadmap view
- Trigger visualization generation on button click
- Handle HTTP communication with backend
- Create and manage Blob URLs
- Open visualization in new window

**Key Methods:**

```javascript
const generateVisualRoadmap = async () => {
  try {
    // 1. Send POST request with markdown content
    const response = await axios.post(
      `${API_BASE}/api/generate-visual-roadmap`,
      {
        topic: topic,
        difficulty_level: 'beginner',
        roadmap_markdown: roadmapData?.roadmap_markdown || ''
      }
    );
    
    // 2. Create Blob from HTML response
    const blob = new Blob([response.data], { type: 'text/html' });
    
    // 3. Generate temporary URL
    const url = URL.createObjectURL(blob);
    
    // 4. Open in new window
    window.open(url, '_blank', 'width=1200,height=800');
    
    // 5. Clean up URL after 2 seconds
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    
  } catch (error) {
    console.error('Error generating visual roadmap:', error);
    // Show user-friendly error message
  }
};
```

**UI Integration:**
- Button placement: Below or next to existing roadmap display
- Button styling: Consistent with GrowMap's design system
- Loading state: Show spinner/disabled state during generation
- Error handling: Toast notification for failures

### Backend API Endpoint: roadmap.py

**Location:** `Growmap/backend/app/routes/roadmap.py`

**Endpoint Definition:**

```python
from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

router = APIRouter()

class VisualRoadmapRequest(BaseModel):
    topic: str
    difficulty_level: str
    roadmap_markdown: str = ""

@router.post("/generate-visual-roadmap", response_class=HTMLResponse)
async def generate_visual_roadmap(request: VisualRoadmapRequest):
    """
    Generate interactive Markmap visualization from markdown roadmap.
    
    Args:
        request: Contains topic, difficulty_level, and roadmap_markdown
        
    Returns:
        HTMLResponse: Complete HTML document with embedded Markmap
    """
    # Get markdown content (use provided or generate new)
    roadmap_markdown = request.roadmap_markdown
    
    if not roadmap_markdown:
        # Fallback: generate new roadmap if none provided
        roadmap_markdown = llm_service.generate_roadmap(
            request.topic,
            request.difficulty_level
        )
    
    # Convert to interactive HTML
    html_content = llm_service.convert_to_markmap(roadmap_markdown)
    
    return HTMLResponse(
        content=html_content,
        media_type="text/html",
        status_code=200
    )
```

**Request Validation:**
- `topic`: String, required
- `difficulty_level`: String, required (beginner/intermediate/advanced)
- `roadmap_markdown`: String, optional (empty string triggers generation)

**Response:**
- Content-Type: `text/html`
- Status: 200 OK
- Body: Complete HTML document with Markmap

### Backend Service: llm_service.py

**Location:** `Growmap/backend/app/services/llm_service.py`

**Key Method:**

```python
import json

def convert_to_markmap(self, roadmap_markdown: str) -> str:
    """
    Convert markdown roadmap to interactive Markmap HTML.
    
    Args:
        roadmap_markdown: Hierarchical markdown content
        
    Returns:
        Complete HTML document with embedded Markmap libraries
    """
    # Escape markdown for JavaScript embedding
    escaped_markdown = json.dumps(roadmap_markdown)
    
    # Generate complete HTML template
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Learning Roadmap</title>
    
    <!-- Markmap Dependencies (CDN) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-lib@0.15.3/dist/browser/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.15.3/dist/browser/index.js"></script>
    
    <style>
        /* Dark Theme Styling */
        body {{
            margin: 0;
            padding: 0;
            background: #0d1117;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow: hidden;
        }}
        
        #mindmap {{
            width: 100vw;
            height: 100vh;
        }}
        
        /* Control Buttons */
        .controls {{
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 10px;
            flex-direction: column;
        }}
        
        .controls button {{
            background: #21262d;
            color: #e6edf3;
            border: 1px solid #30363d;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }}
        
        .controls button:hover {{
            background: #30363d;
            border-color: #484f58;
        }}
        
        .controls button:active {{
            transform: scale(0.95);
        }}
        
        /* Markmap Node Styling */
        .markmap-node {{
            cursor: pointer;
        }}
        
        .markmap-node circle {{
            stroke-width: 2px;
        }}
        
        .markmap-node text {{
            fill: #e6edf3;
            font-size: 14px;
        }}
        
        .markmap-link {{
            stroke-width: 2px;
        }}
    </style>
</head>
<body>
    <!-- Control Buttons -->
    <div class="controls">
        <button onclick="expandAll()">📂 Expand All</button>
        <button onclick="collapseAll()">📁 Collapse All</button>
        <button onclick="fitScreen()">🔍 Fit Screen</button>
        <button onclick="downloadHTML()">💾 Download HTML</button>
    </div>
    
    <!-- SVG Container for Markmap -->
    <svg id="mindmap"></svg>
    
    <script>
        // Embedded markdown content
        var markdown = {escaped_markdown};
        var mm; // Global Markmap instance
        
        // Initialize Markmap
        function init() {{
            // Transform markdown to tree structure
            var transformer = new window.markmap.Transformer();
            var {{ root: data }} = transformer.transform(markdown);
            
            // Markmap options
            var options = {{
                color: (node) => {{
                    // 5-color palette for different depth levels
                    var colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    return colors[node.depth % 5];
                }},
                duration: 300,        // Animation duration (ms)
                maxWidth: 280,        // Max node width (px)
                initialExpandLevel: 2 // Auto-expand to level 2
            }};
            
            // Create Markmap instance
            mm = window.markmap.Markmap.create('#mindmap', options, data);
            
            // Fit to screen on load
            mm.fit();
        }}
        
        // Control Functions
        function expandAll() {{
            if (!mm) return;
            var transformer = new window.markmap.Transformer();
            var {{ root: data }} = transformer.transform(markdown);
            
            // Recursively expand all nodes
            function forceExpand(node) {{
                if (node.payload) delete node.payload.fold;
                node.payload = node.payload || {{}};
                node.payload.fold = 0;
                if (node.children) {{
                    node.children.forEach(forceExpand);
                }}
            }}
            
            forceExpand(data);
            mm.setData(data);
            mm.fit();
        }}
        
        function collapseAll() {{
            if (!mm) return;
            var transformer = new window.markmap.Transformer();
            var {{ root: data }} = transformer.transform(markdown);
            
            // Recursively collapse all nodes except root
            function foldAll(node, isRoot) {{
                if (!isRoot) {{
                    node.payload = node.payload || {{}};
                    node.payload.fold = 1;
                }}
                if (node.children) {{
                    node.children.forEach(child => foldAll(child, false));
                }}
            }}
            
            foldAll(data, true);
            mm.setData(data);
            mm.fit();
        }}
        
        function fitScreen() {{
            if (mm) mm.fit();
        }}
        
        function downloadHTML() {{
            // Get complete HTML document
            var fullHTML = document.documentElement.outerHTML;
            
            // Create blob and download
            var blob = new Blob([fullHTML], {{ type: 'text/html;charset=utf-8' }});
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'mindmap-' + new Date().toISOString().split('T')[0] + '.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }}
        
        // Initialize on page load
        window.addEventListener('load', init);
    </script>
</body>
</html>"""
    
    return html_template
```

**Key Implementation Details:**
- Uses `json.dumps()` to safely escape markdown for JavaScript
- Includes all three Markmap libraries via CDN
- Embeds complete functionality (no external dependencies)
- Generates standalone HTML that works offline after download

## Data Models

### Request Model

```python
class VisualRoadmapRequest(BaseModel):
    topic: str
    difficulty_level: str
    roadmap_markdown: str = ""
    
    class Config:
        schema_extra = {
            "example": {
                "topic": "Python Programming",
                "difficulty_level": "beginner",
                "roadmap_markdown": "# Python Learning Path\n## Fundamentals\n- Variables\n- Data Types"
            }
        }
```

### Markdown Structure

The system expects hierarchical markdown with the following structure:

```markdown
# Main Topic (Root Node)

## Section 1 (Level 1)
- Point 1 (Level 2)
  - Sub-point 1.1 (Level 3)
  - Sub-point 1.2 (Level 3)
- Point 2 (Level 2)

## Section 2 (Level 1)
- Point 3 (Level 2)
  - Sub-point 3.1 (Level 3)
```

**Markdown Requirements:**
- Use `#` headers for main sections
- Use `-` bullets for nested items
- Maintain consistent indentation (2 spaces per level)
- Avoid special characters that need escaping (`"`, `\`, backticks)

### Markmap Tree Structure

Markmap transforms markdown into a tree structure:

```javascript
{
  type: 'heading',
  depth: 0,
  payload: {
    lines: [0, 1]
  },
  content: 'Main Topic',
  children: [
    {
      type: 'heading',
      depth: 1,
      content: 'Section 1',
      children: [
        {
          type: 'list_item',
          depth: 2,
          content: 'Point 1',
          children: [...]
        }
      ]
    }
  ]
}
```

## Error Handling

### Frontend Error Scenarios

**1. Network Failure**
```javascript
catch (error) {
  if (error.code === 'ERR_NETWORK') {
    showToast('Unable to connect to server. Please check your connection.');
  }
}
```

**2. Backend Error Response**
```javascript
if (response.status !== 200) {
  showToast('Failed to generate visualization. Please try again.');
}
```

**3. Popup Blocked**
```javascript
const newWindow = window.open(url, '_blank');
if (!newWindow || newWindow.closed) {
  showToast('Popup blocked. Please allow popups for this site.');
}
```

**4. Empty Markdown**
```javascript
if (!roadmapData?.roadmap_markdown) {
  showToast('No roadmap available to visualize.');
  return;
}
```

### Backend Error Scenarios

**1. Invalid Markdown**
```python
try:
    html_content = llm_service.convert_to_markmap(roadmap_markdown)
except Exception as e:
    raise HTTPException(
        status_code=400,
        detail=f"Failed to convert markdown: {str(e)}"
    )
```

**2. Missing Dependencies**
```python
if not roadmap_markdown and not llm_service:
    raise HTTPException(
        status_code=500,
        detail="LLM service unavailable"
    )
```

**3. Malformed Request**
```python
# Handled automatically by Pydantic validation
# Returns 422 Unprocessable Entity
```

### Markmap Rendering Errors

**1. CDN Unavailable**
```javascript
window.addEventListener('error', (e) => {
  if (e.target.tagName === 'SCRIPT') {
    document.body.innerHTML = `
      <div style="color: white; padding: 20px;">
        Failed to load Markmap libraries. Please check your internet connection.
      </div>
    `;
  }
});
```

**2. Invalid Markdown Structure**
```javascript
try {
  var { root: data } = transformer.transform(markdown);
} catch (error) {
  console.error('Markdown transformation failed:', error);
  document.body.innerHTML = `
    <div style="color: white; padding: 20px;">
      Invalid markdown structure. Please regenerate the roadmap.
    </div>
  `;
}
```

## Testing Strategy

### Unit Tests

**Backend Tests (pytest)**

```python
# test_roadmap.py

def test_convert_to_markmap_basic():
    """Test basic markdown conversion"""
    markdown = "# Test\n## Section\n- Item"
    html = llm_service.convert_to_markmap(markdown)
    
    assert "<!DOCTYPE html>" in html
    assert "markmap" in html
    assert "Test" in html

def test_convert_to_markmap_escaping():
    """Test special character escaping"""
    markdown = '# Test "quotes" and \\backslashes'
    html = llm_service.convert_to_markmap(markdown)
    
    # Should be properly escaped in JavaScript
    assert '\\"' in html or '&quot;' in html

def test_generate_visual_roadmap_endpoint():
    """Test API endpoint"""
    response = client.post("/api/generate-visual-roadmap", json={
        "topic": "Test",
        "difficulty_level": "beginner",
        "roadmap_markdown": "# Test\n- Item"
    })
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/html; charset=utf-8"
    assert "markmap" in response.text
```

**Frontend Tests (Jest/React Testing Library)**

```javascript
// RoadmapView.test.jsx

test('renders Visual Map button', () => {
  render(<RoadmapView roadmapData={mockData} />);
  expect(screen.getByText(/Visual Map/i)).toBeInTheDocument();
});

test('calls API when Visual Map button clicked', async () => {
  const mockPost = jest.spyOn(axios, 'post').mockResolvedValue({
    data: '<html>...</html>'
  });
  
  render(<RoadmapView roadmapData={mockData} />);
  fireEvent.click(screen.getByText(/Visual Map/i));
  
  await waitFor(() => {
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/api/generate-visual-roadmap'),
      expect.objectContaining({
        roadmap_markdown: expect.any(String)
      })
    );
  });
});

test('shows error toast on API failure', async () => {
  jest.spyOn(axios, 'post').mockRejectedValue(new Error('Network error'));
  
  render(<RoadmapView roadmapData={mockData} />);
  fireEvent.click(screen.getByText(/Visual Map/i));
  
  await waitFor(() => {
    expect(screen.getByText(/Unable to connect/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

**End-to-End Flow Test**

```python
def test_full_visualization_flow():
    """Test complete flow from request to HTML generation"""
    # 1. Generate roadmap
    roadmap = llm_service.generate_roadmap("Python", "beginner")
    assert roadmap
    
    # 2. Convert to visualization
    response = client.post("/api/generate-visual-roadmap", json={
        "topic": "Python",
        "difficulty_level": "beginner",
        "roadmap_markdown": roadmap
    })
    
    # 3. Verify HTML structure
    assert response.status_code == 200
    html = response.text
    assert "d3.min.js" in html
    assert "markmap-lib" in html
    assert "markmap-view" in html
    assert "Python" in html
```

### Manual Testing Checklist

- [ ] Visual Map button appears in RoadmapView
- [ ] Clicking button opens new window within 3 seconds
- [ ] Mind map displays all roadmap content
- [ ] Nodes expand/collapse on click
- [ ] Expand All button works
- [ ] Collapse All button works
- [ ] Fit Screen button works
- [ ] Download HTML button works
- [ ] Downloaded HTML works offline
- [ ] Colors are distinct for different levels
- [ ] Text is readable (contrast, size)
- [ ] Smooth animations (300ms)
- [ ] Pan and zoom work smoothly
- [ ] Works with large roadmaps (100+ nodes)
- [ ] Dark theme matches GrowMap UI
- [ ] Error messages display correctly
- [ ] Works in Chrome, Firefox, Safari, Edge

### Performance Tests

```python
def test_large_roadmap_performance():
    """Test performance with large roadmaps"""
    import time
    
    # Generate large markdown (100 nodes)
    large_markdown = generate_large_markdown(100)
    
    start = time.time()
    html = llm_service.convert_to_markmap(large_markdown)
    duration = time.time() - start
    
    assert duration < 1.0  # Should complete in under 1 second
    assert len(html) > 0
```

## Performance Optimization

### Backend Optimizations

1. **HTML Template Caching**
   - Cache static parts of HTML template
   - Only inject markdown content dynamically

2. **Markdown Escaping**
   - Use `json.dumps()` for efficient escaping
   - Avoid regex-based escaping

3. **Response Compression**
   - Enable gzip compression in FastAPI
   - Reduces HTML transfer size by ~70%

### Frontend Optimizations

1. **Blob URL Management**
   - Revoke URLs after 2 seconds to free memory
   - Use `setTimeout` for cleanup

2. **Lazy Loading**
   - Only load visualization when button clicked
   - Don't preload Markmap libraries

3. **Window Reuse**
   - Consider reusing window if already open
   - Avoid creating multiple windows

### Markmap Optimizations

1. **Initial Expand Level**
   - Set to 2 for roadmaps < 50 nodes
   - Set to 1 for roadmaps > 50 nodes

2. **Node Width**
   - Limit to 280px to prevent overflow
   - Truncate long text with ellipsis

3. **Animation Duration**
   - 300ms provides smooth feel
   - Shorter for better performance

## Security Considerations

### XSS Prevention

1. **Markdown Escaping**
   - Use `json.dumps()` to escape all special characters
   - Prevents JavaScript injection via markdown

2. **Content Security Policy**
   - Allow CDN scripts from trusted sources only
   - Restrict inline scripts to generated HTML

### CORS Configuration

```python
# Allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://growmap.vercel.app"],
    allow_methods=["POST"],
    allow_headers=["*"],
)
```

### Input Validation

1. **Request Validation**
   - Pydantic models validate all inputs
   - Reject requests with missing required fields

2. **Markdown Size Limits**
   - Limit markdown to 100KB max
   - Prevent memory exhaustion attacks

## Deployment Considerations

### CDN Dependencies

**Pros:**
- No need to bundle libraries
- Automatic updates
- Reduced server load

**Cons:**
- Requires internet for initial load
- CDN downtime affects functionality

**Mitigation:**
- Use reliable CDNs (cdnjs, jsdelivr)
- Consider fallback to local copies
- Downloaded HTML works offline

### Browser Compatibility

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- SVG support
- ES6 JavaScript
- Blob API
- window.open()

### Scalability

**Expected Load:**
- 100-1000 visualizations per day
- Average markdown size: 5-10KB
- Average HTML response: 50-60KB

**Scaling Strategy:**
- Stateless API (easy horizontal scaling)
- No database required
- Consider caching for popular topics

## Future Enhancements

1. **Export Formats**
   - PNG export (using html2canvas)
   - SVG export (native Markmap support)
   - PDF export (using jsPDF)

2. **Customization Options**
   - Color theme selection
   - Font size adjustment
   - Layout orientation (horizontal/vertical)

3. **Collaboration Features**
   - Share visualization via URL
   - Embed in other websites
   - Real-time collaboration

4. **Advanced Interactions**
   - Search within mind map
   - Highlight specific paths
   - Add notes to nodes

5. **Performance Improvements**
   - Virtual rendering for 1000+ nodes
   - Progressive loading
   - WebGL rendering for complex maps
