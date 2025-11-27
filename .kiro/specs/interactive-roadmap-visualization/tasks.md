# Implementation Plan

- [x] 1. Set up backend API endpoint and service method





  - Create POST endpoint `/api/generate-visual-roadmap` in `roadmap.py`
  - Define `VisualRoadmapRequest` Pydantic model with topic, difficulty_level, and roadmap_markdown fields
  - Implement endpoint handler that calls llm_service and returns HTMLResponse
  - _Requirements: 5.1, 5.5_

- [x] 1.1 Implement markdown to Markmap HTML conversion service


  - Add `convert_to_markmap()` method to `llm_service.py`
  - Implement markdown escaping using `json.dumps()`
  - Create complete HTML template with CDN links for D3.js v7.8.5, markmap-lib v0.15.3, and markmap-view v0.15.3
  - Embed escaped markdown content in JavaScript initialization code
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 1.2 Add Markmap initialization and configuration


  - Implement JavaScript initialization code in HTML template
  - Configure Markmap options: 5-color palette, 300ms duration, 280px maxWidth, initialExpandLevel 2
  - Add Transformer.transform() to convert markdown to tree structure
  - Add Markmap.create() to render interactive SVG
  - Add mm.fit() to auto-fit visualization on load
  - _Requirements: 1.3, 2.3, 2.4, 2.5, 8.2_

- [x] 2. Implement interactive control buttons in HTML template





  - Add fixed-position controls div with Expand All, Collapse All, Fit Screen, and Download HTML buttons
  - Implement `expandAll()` function that recursively sets fold=0 on all nodes
  - Implement `collapseAll()` function that sets fold=1 on all non-root nodes
  - Implement `fitScreen()` function that calls mm.fit()
  - Implement `downloadHTML()` function that creates blob and triggers download with date-stamped filename
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.5_
-

- [x] 3. Apply dark theme styling to HTML template




  - Add CSS for dark background (#0d1117), light text (#e6edf3), and Inter font family
  - Style control buttons with dark theme colors (#21262d background, #30363d border)
  - Add hover and active states for buttons
  - Style Markmap nodes and links for dark theme
  - Ensure text contrast ratio meets 4.5:1 minimum
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4. Implement frontend Visual Map button and handler





  - Add "Visual Map" button to RoadmapView.jsx component
  - Implement `generateVisualRoadmap()` async function
  - Send POST request to `/api/generate-visual-roadmap` with topic, difficulty_level, and roadmap_markdown
  - Handle response and create Blob with type 'text/html'
  - _Requirements: 1.1, 6.1, 6.2_

- [x] 4.1 Implement Blob URL creation and window opening






  - Create temporary URL using URL.createObjectURL(blob)
  - Open URL in new window with window.open() and dimensions 1200x800
  - Add setTimeout to revoke URL after 2 seconds for memory cleanup
  - _Requirements: 1.4, 6.3, 6.4, 6.5_


- [ ] 4.2 Add error handling and user feedback
  - Add try-catch block around API call
  - Handle network errors with user-friendly toast messages
  - Handle empty markdown case with validation
  - Handle popup blocker scenario with appropriate message
  - Add loading state to button during generation
  - _Requirements: 1.2_
-

- [x] 5. Implement node interaction functionality




  - Verify Markmap handles click events for expand/collapse (built-in functionality)
  - Ensure expand animation completes within 300ms
  - Ensure collapse animation completes within 300ms
  - Verify color coding by depth level works correctly
  - Verify text rendering with 12-16px font size
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.2_



- [ ] 6. Optimize performance for large roadmaps

  - Add conditional logic to set initialExpandLevel based on node count (level 2 for <50 nodes, level 1 for >50 nodes)
  - Verify rendering completes within 2 seconds for roadmaps with up to 100 nodes
  - Test smooth panning with mouse drag
  - Test smooth zooming with mouse wheel
  - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [ ] 7. Add CORS configuration for API endpoint

  - Update CORS middleware to allow POST requests to `/api/generate-visual-roadmap`
  - Add frontend origin (localhost:3000 and production URL) to allowed origins
  - _Requirements: 5.1_

- [ ] 8. Write backend unit tests

  - Test `convert_to_markmap()` with basic markdown
  - Test markdown escaping with special characters (quotes, backslashes)
  - Test API endpoint with valid request


  - Test API endpoint response headers and status code
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9. Write frontend unit tests

  - Test Visual Map button renders in RoadmapView
  - Test button click triggers API call with correct payload
  - Test error handling displays toast on API failure
  - Test loading state during generation
  - _Requirements: 1.1, 6.1, 6.2_

- [ ] 10. Perform integration and manual testing

  - Test complete flow from button click to visualization display
  - Test all control buttons (Expand All, Collapse All, Fit Screen, Download HTML)
  - Test downloaded HTML works offline
  - Test with various roadmap sizes (small, medium, large)
  - Test in multiple browsers (Chrome, Firefox, Safari, Edge)
  - Verify dark theme consistency with GrowMap UI
  - Test error scenarios (network failure, empty markdown, popup blocked)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_
