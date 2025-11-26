# Implementation Plan

- [x] 1. Fix Planner Component State Synchronization





  - Remove duplicate local state variables (`dailyStudyHours`, `examDate`, `goals`)
  - Update daily study hours input to modify `studyPlanInput.daily_study_hours` directly
  - Update exam date input to modify `studyPlanInput.exam_date` directly with days calculation
  - Update goals textarea to modify `studyPlanInput.goals` directly
  - Update all references to use `studyPlanInput` properties instead of local state
  - Verify button enable/disable logic works with synchronized state
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
-

- [x] 2. Create Backend Roadmap Router


  - [x] 2.1 Create roadmap router file with request/response models


    - Create `app/routers/roadmap.py` file
    - Define `RoadmapRequest` Pydantic model with topic, difficulty_level, roadmap_markdown fields
    - Define `RoadmapResponse` Pydantic model with topic, roadmap_markdown, resources, estimated_duration
    - Define `Resource` Pydantic model for resource objects
    - Create APIRouter instance
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_


  - [x] 2.2 Implement visual roadmap HTML generation function

    - Create `generate_visual_html()` function that takes topic, roadmap_markdown, difficulty_level
    - Build HTML template with proper DOCTYPE, meta tags, and styling
    - Include markmap CDN script in head section
    - Add container structure with header, controls, and SVG element
    - Define `showToast()` JavaScript function first
    - Define `downloadHTML()` JavaScript function second
    - Define `init()` JavaScript function third
    - Call `init()` after all functions are defined using DOMContentLoaded
    - Properly escape markdown content for JavaScript (escape backticks and ${})
    - Use double braces {{}} for Python f-string literal braces
    - Return formatted HTML string
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4_


  - [x] 2.3 Implement generate-visual-roadmap endpoint

    - Create POST endpoint `/generate-visual-roadmap` in roadmap router
    - Accept `RoadmapRequest` as request body
    - Validate topic is not empty (return 400 if missing)
    - Call `generate_visual_html()` with request parameters
    - Return HTMLResponse with generated content
    - Add try-catch error handling with proper logging
    - Return 500 status with error message on failures
    - _Requirements: 2.4, 2.5, 3.5_

  - [x] 2.4 Register roadmap router in main application


    - Import roadmap router in `app/main.py`
    - Add `app.include_router(roadmap.router, prefix="/roadmap", tags=["Roadmap"])`
    - Verify router is registered before running server
    - _Requirements: 2.4, 2.5_

- [-] 3. Test and Validate Fixes





  - [x] 3.1 Test Planner component functionality


    - Start frontend development server
    - Navigate to Planner page
    - Verify button is initially disabled
    - Add a subject with name and topic
    - Enter daily study hours
    - Select future exam date
    - Verify button becomes enabled
    - Click generate button and verify plan is created
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


  - [ ] 3.2 Test visual roadmap generation
    - Start backend server
    - Navigate to Roadmap page
    - Enter a topic (e.g., "React Development")
    - Select difficulty level
    - Click "Generate Learning Roadmap"
    - Wait for roadmap to generate
    - Click "Visual Map" button
    - Verify popup window opens
    - Verify mind map renders without JavaScript errors
    - Check browser console for errors
    - Test download button in popup
    - Test print button in popup
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.3 Verify error handling
    - Test planner with missing fields
    - Test planner with past exam date
    - Test roadmap with empty topic
    - Verify appropriate error messages are shown
    - _Requirements: 3.5_
