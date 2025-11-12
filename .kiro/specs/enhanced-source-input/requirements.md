# Requirements Document: Enhanced Multi-Source Input System

## Introduction

Transform AceMind into a NotebookLM-style quiz generation system that accepts multiple source types (text, PDF, URLs) and generates comprehensive, intelligent quizzes from the aggregated content. The system should provide clear content understanding and topic extraction before quiz generation.

---

## Requirements

### Requirement 1: Multi-Source Input Support

**User Story:** As a student, I want to add multiple sources (text, PDFs, URLs) to my study session, so that I can generate comprehensive quizzes from all my learning materials.

#### Acceptance Criteria

1. WHEN user accesses the quiz generator THEN system SHALL display options to add multiple sources
2. WHEN user adds a source THEN system SHALL support text input, PDF upload, and URL input
3. WHEN user adds multiple sources THEN system SHALL display all sources in a manageable list
4. WHEN user adds a URL THEN system SHALL fetch and extract content from the webpage
5. WHEN user adds sources THEN system SHALL allow removing individual sources before quiz generation

---

### Requirement 2: Content Processing and Analysis

**User Story:** As a student, I want the system to analyze and understand my source content, so that I can see what topics will be covered in the quiz.

#### Acceptance Criteria

1. WHEN sources are added THEN system SHALL extract and analyze content from all sources
2. WHEN content is analyzed THEN system SHALL identify key topics and concepts
3. WHEN analysis is complete THEN system SHALL display a summary of detected topics
4. WHEN multiple sources are added THEN system SHALL merge and deduplicate content intelligently
5. WHEN content is processed THEN system SHALL show word count and estimated quiz length

---

### Requirement 3: Source Management Interface

**User Story:** As a student, I want to manage my sources easily, so that I can organize my study materials before generating quizzes.

#### Acceptance Criteria

1. WHEN viewing sources THEN system SHALL display each source with title, type, and preview
2. WHEN user clicks on a source THEN system SHALL show full content preview
3. WHEN user wants to edit THEN system SHALL allow renaming source titles
4. WHEN user wants to remove THEN system SHALL allow deleting individual sources
5. WHEN sources are listed THEN system SHALL show source type icons (text/PDF/URL)

---

### Requirement 4: URL Content Extraction

**User Story:** As a student, I want to add web articles and documentation URLs, so that I can generate quizzes from online resources.

#### Acceptance Criteria

1. WHEN user enters a URL THEN system SHALL validate the URL format
2. WHEN URL is valid THEN system SHALL fetch the webpage content
3. WHEN content is fetched THEN system SHALL extract main article text (remove ads, navigation)
4. WHEN extraction fails THEN system SHALL provide clear error message with suggestions
5. WHEN URL is processed THEN system SHALL display article title and preview

---

### Requirement 5: Intelligent Content Aggregation

**User Story:** As a student, I want the system to combine content from multiple sources intelligently, so that my quiz covers all materials without redundancy.

#### Acceptance Criteria

1. WHEN multiple sources exist THEN system SHALL merge content while preserving context
2. WHEN generating quiz THEN system SHALL draw questions from all sources proportionally
3. WHEN sources overlap THEN system SHALL identify and handle duplicate information
4. WHEN content is aggregated THEN system SHALL maintain source attribution for each question
5. WHEN quiz is generated THEN system SHALL indicate which source each question came from

---

### Requirement 6: Topic-Based Quiz Generation

**User Story:** As a student, I want to select specific topics from my sources, so that I can focus my quiz on particular areas.

#### Acceptance Criteria

1. WHEN content is analyzed THEN system SHALL extract and list all major topics
2. WHEN topics are displayed THEN system SHALL allow user to select/deselect topics
3. WHEN topics are selected THEN system SHALL generate quiz only from selected topics
4. WHEN no topics selected THEN system SHALL generate quiz from all content
5. WHEN quiz is generated THEN system SHALL show topic coverage in results

---

### Requirement 7: Source Preview and Validation

**User Story:** As a student, I want to preview extracted content before generating a quiz, so that I can verify the system understood my sources correctly.

#### Acceptance Criteria

1. WHEN source is added THEN system SHALL show content preview immediately
2. WHEN preview is displayed THEN system SHALL show first 500 characters
3. WHEN user clicks "View Full" THEN system SHALL display complete extracted content
4. WHEN content is incorrect THEN system SHALL allow user to edit or re-upload
5. WHEN content is validated THEN system SHALL show confirmation indicator

---

### Requirement 8: Enhanced Quiz Customization

**User Story:** As a student, I want to customize quiz parameters based on my sources, so that I can get the most relevant questions.

#### Acceptance Criteria

1. WHEN sources are ready THEN system SHALL suggest optimal number of questions
2. WHEN user customizes THEN system SHALL allow setting questions per source
3. WHEN difficulty is set THEN system SHALL adjust question complexity accordingly
4. WHEN quiz type is selected THEN system SHALL support multiple choice, true/false, fill-in-blank
5. WHEN parameters are set THEN system SHALL show estimated generation time

---

### Requirement 9: Source Persistence

**User Story:** As a student, I want my sources to be saved, so that I can generate multiple quizzes from the same materials.

#### Acceptance Criteria

1. WHEN sources are added THEN system SHALL save them to browser storage
2. WHEN user returns THEN system SHALL restore previously added sources
3. WHEN user creates session THEN system SHALL allow naming and saving source collections
4. WHEN sessions exist THEN system SHALL allow loading previous sessions
5. WHEN storage is full THEN system SHALL provide clear warning and cleanup options

---

### Requirement 10: Progress Indicators

**User Story:** As a student, I want to see progress when processing sources, so that I know the system is working.

#### Acceptance Criteria

1. WHEN URL is being fetched THEN system SHALL show loading indicator
2. WHEN PDF is being processed THEN system SHALL show extraction progress
3. WHEN content is being analyzed THEN system SHALL show analysis progress
4. WHEN quiz is generating THEN system SHALL show generation progress with estimated time
5. WHEN errors occur THEN system SHALL show clear error messages with retry options

---

## Success Criteria

- Users can add 3+ different source types in one session
- URL content extraction works for 90%+ of common websites
- Content analysis identifies topics with 85%+ accuracy
- Quiz generation draws from all sources proportionally
- Source management interface is intuitive and responsive
- System handles 10+ sources without performance degradation

---

## Out of Scope

- Real-time collaborative source sharing
- Automatic source recommendations
- Integration with cloud storage (Google Drive, Dropbox)
- Video/audio content transcription
- Advanced NLP topic modeling
- Source version control

---

## Technical Constraints

- URL fetching must respect robots.txt
- PDF processing limited to text-based PDFs (OCR optional)
- Browser storage limited to 10MB per domain
- Content extraction must handle various webpage structures
- All processing must work with local Ollama (no external APIs required)
