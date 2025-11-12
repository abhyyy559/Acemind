# 📚 NotebookLM-Style Quiz Generator - Feature Overview

## Vision

Transform AceMind into an intelligent quiz generation system that works like **NotebookLM** but focused on creating quizzes instead of explanations.

---

## User Experience Flow

### 1. Add Sources 📥
```
┌─────────────────────────────────────┐
│  Add Your Study Materials           │
├─────────────────────────────────────┤
│  [📝 Paste Text]  [📄 Upload PDF]  │
│  [🌐 Add URL]                       │
└─────────────────────────────────────┘
```

**User can add**:
- Text content (copy-paste)
- PDF files (upload)
- Web URLs (article links)

---

### 2. View Sources 📋
```
┌─────────────────────────────────────┐
│  Your Sources (3)                   │
├─────────────────────────────────────┤
│  📝 Chapter 1 Notes                 │
│     Text • 1,234 words • [View] [×] │
│                                     │
│  📄 Textbook Chapter 5.pdf          │
│     PDF • 2,456 words • [View] [×]  │
│                                     │
│  🌐 Wikipedia: Photosynthesis       │
│     URL • 3,789 words • [View] [×]  │
└─────────────────────────────────────┘
```

**Features**:
- See all sources at a glance
- View/preview each source
- Remove sources easily
- See word count per source

---

### 3. Content Analysis 🔍
```
┌─────────────────────────────────────┐
│  Analyzing Content...               │
├─────────────────────────────────────┤
│  ✓ Extracted 7,479 words            │
│  ✓ Identified 12 key topics         │
│  ✓ Ready to generate quiz           │
│                                     │
│  Topics Found:                      │
│  ☑ Photosynthesis Process           │
│  ☑ Chloroplasts Structure           │
│  ☑ Light Reactions                  │
│  ☑ Calvin Cycle                     │
│  ☐ Plant Anatomy                    │
│  ☐ Cellular Respiration             │
│  ... (6 more)                       │
└─────────────────────────────────────┘
```

**Features**:
- Automatic topic extraction
- Select/deselect topics
- See content coverage
- Estimated quiz length

---

### 4. Customize Quiz ⚙️
```
┌─────────────────────────────────────┐
│  Quiz Settings                      │
├─────────────────────────────────────┤
│  Number of Questions: [20] ▼        │
│  Questions per Source: Auto ▼       │
│  Difficulty: Medium ▼               │
│  Question Types:                    │
│    ☑ Multiple Choice                │
│    ☐ True/False                     │
│    ☐ Fill in the Blank              │
│                                     │
│  [Generate Quiz] (Est. 30 sec)      │
└─────────────────────────────────────┘
```

**Features**:
- Set number of questions
- Choose difficulty level
- Select question types
- See estimated time

---

### 5. Take Quiz 📝
```
┌─────────────────────────────────────┐
│  Question 5 of 20                   │
│  Source: Textbook Chapter 5.pdf     │
├─────────────────────────────────────┤
│  What is the primary function of    │
│  chlorophyll in photosynthesis?     │
│                                     │
│  ○ A) Absorb light energy           │
│  ○ B) Store glucose                 │
│  ○ C) Release oxygen                │
│  ○ D) Break down water              │
│                                     │
│  [Previous] [Next] [Submit]         │
└─────────────────────────────────────┘
```

**Features**:
- Source attribution per question
- Progress indicator
- Navigation between questions
- Submit for grading

---

### 6. View Results 📊
```
┌─────────────────────────────────────┐
│  Quiz Results                       │
├─────────────────────────────────────┤
│  Score: 16/20 (80%)                 │
│                                     │
│  By Source:                         │
│  📝 Chapter 1 Notes: 5/6 (83%)      │
│  📄 Textbook Ch 5: 7/9 (78%)        │
│  🌐 Wikipedia: 4/5 (80%)            │
│                                     │
│  By Topic:                          │
│  ✓ Photosynthesis: 4/4 (100%)       │
│  ⚠ Calvin Cycle: 2/4 (50%)          │
│  ✓ Light Reactions: 3/3 (100%)      │
│                                     │
│  [Review Answers] [New Quiz]        │
└─────────────────────────────────────┘
```

**Features**:
- Overall score
- Breakdown by source
- Breakdown by topic
- Identify weak areas

---

## Key Differences from NotebookLM

| Feature | NotebookLM | AceMind |
|---------|-----------|---------|
| **Purpose** | Explain & summarize | Generate quizzes |
| **Output** | Explanations, summaries | Quiz questions |
| **Interaction** | Chat with sources | Answer questions |
| **Focus** | Understanding | Testing knowledge |
| **Sources** | Multiple docs | Multiple docs ✓ |
| **Analysis** | Topic extraction ✓ | Topic extraction ✓ |
| **AI** | Google AI | Local Ollama ✓ |

---

## Technical Architecture

### Frontend Components
```
SourceManager/
├── SourceInput.tsx       # Add sources (text/PDF/URL)
├── SourceList.tsx        # Display all sources
├── SourcePreview.tsx     # Preview source content
├── TopicSelector.tsx     # Select topics for quiz
└── QuizCustomizer.tsx    # Customize quiz settings
```

### Backend Services
```
services/
├── url_extractor.py      # Fetch & extract URL content
├── content_analyzer.py   # Analyze & extract topics
├── source_manager.py     # Manage multiple sources
└── quiz_generator.py     # Generate from multiple sources
```

### Data Flow
```
1. User adds sources → Store in state
2. Extract content → Process each source
3. Analyze content → Identify topics
4. User customizes → Set quiz parameters
5. Generate quiz → Combine all sources
6. Take quiz → Track source per question
7. View results → Show breakdown by source/topic
```

---

## Implementation Phases

### Phase 1: Multi-Source Input ⭐
- Add text, PDF, URL inputs
- Source list management
- Content extraction

### Phase 2: Content Analysis
- Topic extraction
- Content summarization
- Source preview

### Phase 3: Quiz Generation
- Multi-source quiz generation
- Source attribution
- Topic-based filtering

### Phase 4: Enhanced Results
- Source breakdown
- Topic breakdown
- Weak area identification

---

## Success Metrics

- ✅ Users can add 3+ sources in one session
- ✅ URL extraction works for 90%+ of websites
- ✅ Topic extraction identifies 80%+ of key concepts
- ✅ Quiz draws from all sources proportionally
- ✅ Users can identify weak topics from results

---

## Example Use Case

**Student studying for Biology exam**:

1. **Adds sources**:
   - Lecture notes (text)
   - Textbook chapter (PDF)
   - Wikipedia article (URL)

2. **System analyzes**:
   - Extracts 8,000 words total
   - Identifies 15 topics
   - Shows topic coverage

3. **Student customizes**:
   - Selects 5 key topics
   - Requests 25 questions
   - Sets difficulty to "Hard"

4. **Takes quiz**:
   - Answers 25 questions
   - Sees source for each question
   - Submits for grading

5. **Reviews results**:
   - Scores 20/25 (80%)
   - Sees weak topic: "Calvin Cycle"
   - Generates new quiz focused on weak areas

---

**This is the vision! Does it match what you want?** 🎯
