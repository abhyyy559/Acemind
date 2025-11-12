# Design Document: NotebookLM-Style Quiz System

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Source Input │  │ Quiz Display │  │ Results View │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API (FastAPI)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Source       │  │ Content      │  │ Quiz         │  │
│  │ Manager      │  │ Analyzer     │  │ Generator    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PDF Parser   │  │ URL Fetcher  │  │ AI Service   │
│ (PyPDF2 +    │  │ (BeautifulSoup│  │ (DeepSeek/   │
│  OCR)        │  │  + Requests)  │  │  OpenAI)     │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Component Design

### 1. Source Manager

**Purpose**: Handle multiple input sources and extract content

**Components**:
```python
class SourceManager:
    def add_source(type, content) -> Source
    def remove_source(source_id) -> bool
    def get_all_sources() -> List[Source]
    def extract_content(source) -> str
```

**Source Types**:
- `TEXT`: Direct text input
- `PDF`: PDF file upload
- `URL`: Web article URL
- `DOCUMENT`: Word/other documents

---

### 2. Content Analyzer

**Purpose**: Analyze content and detect patterns

**Components**:
```python
class ContentAnalyzer:
    def analyze(content: str) -> Analysis
    def detect_exam_key(content: str) -> bool
    def extract_questions(content: str) -> List[Question]
    def identify_topics(content: str) -> List[Topic]
    def summarize(content: str) -> Summary
```

**Detection Patterns**:
- Exam key format: `1. Question text\nA) Option\nB) Option...`
- Answer key format: `1. A  2. B  3. C...`
- Topic markers: Headers, bold text, definitions

---

### 3. Quiz Generator (Optimized)

**Purpose**: Generate questions quickly and efficiently

**Strategy**:
```python
class QuizGenerator:
    def generate_fast(content: str, num_questions: int) -> Quiz:
        # Use parallel processing
        # Batch questions efficiently
        # Cache common patterns
        # Use fastest AI model
```

**Optimization Techniques**:
1. **Parallel Processing**: Generate multiple questions simultaneously
2. **Smart Batching**: Optimal batch size (5-10 questions)
3. **Caching**: Cache analyzed content
4. **Fast AI**: Use GPT-3.5-turbo or DeepSeek (fastest models)

---

### 4. Exam Key Extractor

**Purpose**: Extract existing questions from exam PDFs

**Algorithm**:
```python
def extract_exam_key(content: str) -> List[Question]:
    # Step 1: Detect question pattern
    pattern = r'(\d+)\.\s*(.+?)\n([A-D]\).*?)(?=\n\d+\.|$)'
    
    # Step 2: Extract questions
    questions = re.findall(pattern, content, re.DOTALL)
    
    # Step 3: Parse options
    for q in questions:
        options = parse_options(q)
        
    # Step 4: Find answer key
    answers = find_answer_key(content)
    
    # Step 5: Match answers to questions
    return match_answers(questions, answers)
```

---

## Data Models

### Source Model
```python
class Source(BaseModel):
    id: str
    type: SourceType  # TEXT, PDF, URL, DOCUMENT
    title: str
    content: str
    metadata: Dict
    created_at: datetime
    word_count: int
    status: str  # processing, ready, error
```

### Analysis Model
```python
class Analysis(BaseModel):
    source_id: str
    topics: List[str]
    key_concepts: List[str]
    is_exam_key: bool
    question_count: int
    summary: str
    difficulty: str
```

### Question Model
```python
class Question(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str]
    source_id: str
    topic: str
    difficulty: str
```

---

## API Endpoints

### Source Management
```
POST   /api/sources/text          - Add text source
POST   /api/sources/pdf           - Upload PDF
POST   /api/sources/url           - Add URL
GET    /api/sources               - List all sources
DELETE /api/sources/{id}          - Remove source
GET    /api/sources/{id}/preview  - Preview source
```

### Quiz Generation
```
POST   /api/quiz/generate         - Generate quiz from sources
POST   /api/quiz/extract          - Extract from exam key
GET    /api/quiz/{id}             - Get quiz
POST   /api/quiz/{id}/submit      - Submit answers
GET    /api/quiz/{id}/results     - Get results
```

### Analysis
```
POST   /api/analyze               - Analyze content
GET    /api/analyze/{source_id}   - Get analysis
```

---

## Performance Optimization

### 1. Fast AI Integration

**Use fastest models**:
```python
# Priority order (fastest to slowest)
1. GPT-3.5-turbo (OpenAI) - 2-5 seconds
2. DeepSeek-chat - 3-8 seconds
3. Claude-instant - 3-7 seconds
4. Ollama (local) - 60+ seconds (fallback only)
```

### 2. Parallel Processing

**Generate questions in parallel**:
```python
async def generate_parallel(content, num_questions):
    # Split into batches
    batches = split_into_batches(num_questions, batch_size=10)
    
    # Generate in parallel
    tasks = [generate_batch(content, batch) for batch in batches]
    results = await asyncio.gather(*tasks)
    
    # Combine results
    return combine_results(results)
```

### 3. Caching Strategy

**Cache analyzed content**:
```python
# Cache key: hash(content)
# Cache value: Analysis object
# TTL: 1 hour

@cache(ttl=3600)
def analyze_content(content: str) -> Analysis:
    # Expensive analysis here
    pass
```

### 4. Smart Batching

**Optimal batch sizes**:
- Small quizzes (5-10 questions): 1 batch
- Medium quizzes (10-20 questions): 2 batches of 10
- Large quizzes (20-50 questions): 5 batches of 10
- Exam keys (200 questions): Extract directly, no AI needed

---

## Exam Key Extraction Algorithm

### Pattern Detection

```python
def detect_exam_key_format(content: str) -> str:
    """Detect exam key format"""
    
    patterns = {
        'numbered': r'^\d+\.\s+.+',  # 1. Question
        'lettered': r'^[A-Z]\.\s+.+',  # A. Question
        'parenthesis': r'^\d+\)\s+.+',  # 1) Question
    }
    
    for format_name, pattern in patterns.items():
        if re.search(pattern, content, re.MULTILINE):
            return format_name
    
    return 'unknown'
```

### Question Extraction

```python
def extract_questions_from_exam(content: str) -> List[Question]:
    """Extract all questions from exam key"""
    
    # Step 1: Detect format
    format_type = detect_exam_key_format(content)
    
    # Step 2: Extract questions based on format
    if format_type == 'numbered':
        questions = extract_numbered_questions(content)
    elif format_type == 'lettered':
        questions = extract_lettered_questions(content)
    else:
        questions = extract_generic_questions(content)
    
    # Step 3: Extract options for each question
    for q in questions:
        q.options = extract_options(q.text)
    
    # Step 4: Find and match answer key
    answer_key = find_answer_key(content)
    if answer_key:
        match_answers(questions, answer_key)
    
    return questions
```

### Answer Key Detection

```python
def find_answer_key(content: str) -> Dict[int, str]:
    """Find answer key in content"""
    
    # Pattern 1: "1. A  2. B  3. C"
    pattern1 = r'(\d+)\.\s*([A-D])'
    
    # Pattern 2: "Answer: 1-A, 2-B, 3-C"
    pattern2 = r'(\d+)-([A-D])'
    
    # Pattern 3: Table format
    pattern3 = r'(\d+)\s+([A-D])\s+'
    
    # Try all patterns
    for pattern in [pattern1, pattern2, pattern3]:
        matches = re.findall(pattern, content)
        if len(matches) > 10:  # Valid answer key
            return {int(q): ans for q, ans in matches}
    
    return {}
```

---

## Frontend Components

### 1. Source Input Component

```typescript
interface SourceInputProps {
  onSourceAdded: (source: Source) => void;
}

const SourceInput: React.FC<SourceInputProps> = ({ onSourceAdded }) => {
  const [inputType, setInputType] = useState<'text' | 'pdf' | 'url'>('text');
  
  return (
    <div>
      <Tabs>
        <Tab label="Text" onClick={() => setInputType('text')} />
        <Tab label="PDF" onClick={() => setInputType('pdf')} />
        <Tab label="URL" onClick={() => setInputType('url')} />
      </Tabs>
      
      {inputType === 'text' && <TextInput onSubmit={onSourceAdded} />}
      {inputType === 'pdf' && <PDFUpload onUpload={onSourceAdded} />}
      {inputType === 'url' && <URLInput onSubmit={onSourceAdded} />}
    </div>
  );
};
```

### 2. Source List Component

```typescript
const SourceList: React.FC<{ sources: Source[] }> = ({ sources }) => {
  return (
    <div>
      {sources.map(source => (
        <SourceCard
          key={source.id}
          source={source}
          onRemove={handleRemove}
          onPreview={handlePreview}
        />
      ))}
    </div>
  );
};
```

### 3. Quiz Generator Component

```typescript
const QuizGenerator: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleGenerate = async () => {
    setGenerating(true);
    
    // Show progress
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 500);
    
    // Generate quiz
    const quiz = await generateQuiz(sources);
    
    clearInterval(interval);
    setProgress(100);
    setGenerating(false);
  };
  
  return (
    <div>
      <SourceInput onSourceAdded={addSource} />
      <SourceList sources={sources} />
      <Button onClick={handleGenerate} disabled={generating}>
        {generating ? `Generating... ${progress}%` : 'Generate Quiz'}
      </Button>
    </div>
  );
};
```

---

## Implementation Plan

### Phase 1: Core Optimization (Week 1)
- [ ] Integrate fast AI API (DeepSeek/OpenAI)
- [ ] Implement parallel processing
- [ ] Optimize batch sizes
- [ ] Add caching layer
- [ ] Test performance (target: < 10 seconds)

### Phase 2: Exam Key Extraction (Week 2)
- [ ] Implement pattern detection
- [ ] Build question extractor
- [ ] Add answer key matcher
- [ ] Test with real exam PDFs
- [ ] Handle edge cases

### Phase 3: Multi-Source Support (Week 3)
- [ ] Build source manager
- [ ] Add URL content fetcher
- [ ] Implement source list UI
- [ ] Add source preview
- [ ] Test with multiple sources

### Phase 4: Polish & Deploy (Week 4)
- [ ] Add loading indicators
- [ ] Improve error messages
- [ ] Add progress tracking
- [ ] Performance testing
- [ ] Deploy and monitor

---

## Success Metrics

### Performance
- Quiz generation: < 10 seconds ✅
- PDF extraction: < 5 seconds ✅
- Exam key extraction: < 15 seconds ✅

### Quality
- Question relevance: 90%+ ✅
- Exam key accuracy: 95%+ ✅
- User satisfaction: 4.5/5 stars ✅

### Usage
- Daily active users: 100+
- Quizzes generated: 500+/day
- Average quiz size: 20 questions

---

**Ready to start implementation?**
