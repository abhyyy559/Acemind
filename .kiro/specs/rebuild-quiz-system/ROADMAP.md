# Implementation Roadmap: NotebookLM-Style Quiz System

## Overview

Rebuild AceMind as a fast, intelligent quiz generation system that:
- ✅ Generates quizzes in < 10 seconds
- ✅ Extracts 200 questions from exam keys
- ✅ Supports multiple sources (text, PDF, URL)
- ✅ Uses NotebookLM-style content understanding

---

## Phase 1: Performance Optimization (Priority: CRITICAL)

### Goal: Reduce quiz generation time from 60-120s to < 10s

### Tasks:

#### 1.1 Fast AI Integration ⚡
**Time**: 2 hours

- [ ] Add OpenAI API support (GPT-3.5-turbo - fastest)
- [ ] Configure DeepSeek API properly
- [ ] Add API key validation
- [ ] Test response times
- [ ] Set priority: OpenAI > DeepSeek > Ollama

**Files to modify**:
- `backend/app/services/ai_service.py` (new)
- `backend/app/config/settings.py`
- `backend/.env`

#### 1.2 Parallel Processing 🚀
**Time**: 3 hours

- [ ] Implement async batch processing
- [ ] Generate multiple questions simultaneously
- [ ] Use `asyncio.gather()` for parallel requests
- [ ] Optimize batch size (5-10 questions per batch)
- [ ] Test with different batch sizes

**Files to create**:
- `backend/app/services/parallel_generator.py`

#### 1.3 Smart Caching 💾
**Time**: 2 hours

- [ ] Add Redis/in-memory cache
- [ ] Cache analyzed content
- [ ] Cache generated questions
- [ ] Set TTL (1 hour)
- [ ] Test cache hit rates

**Files to create**:
- `backend/app/utils/cache.py`

**Expected Result**: Quiz generation in 5-10 seconds ✅

---

## Phase 2: Exam Key Extraction (Priority: HIGH)

### Goal: Extract 200 questions from exam PDFs automatically

### Tasks:

#### 2.1 Pattern Detection 🔍
**Time**: 3 hours

- [ ] Detect question formats (numbered, lettered, etc.)
- [ ] Identify option patterns (A), B), C), D))
- [ ] Find answer key sections
- [ ] Handle multiple formats
- [ ] Test with real exam PDFs

**Files to create**:
- `backend/app/services/exam_extractor.py`

#### 2.2 Question Extraction 📋
**Time**: 4 hours

- [ ] Extract questions with regex
- [ ] Parse options for each question
- [ ] Match answers from answer key
- [ ] Handle edge cases (missing options, etc.)
- [ ] Validate extracted questions

**Files to modify**:
- `backend/app/services/exam_extractor.py`

#### 2.3 Answer Key Matching 🎯
**Time**: 2 hours

- [ ] Detect answer key format
- [ ] Parse answer mappings
- [ ] Match to questions
- [ ] Handle partial answer keys
- [ ] Validate correctness

**Expected Result**: Extract 200 questions in < 15 seconds ✅

---

## Phase 3: Multi-Source Support (Priority: MEDIUM)

### Goal: Support text, PDF, and URL sources

### Tasks:

#### 3.1 Source Manager 📚
**Time**: 3 hours

- [ ] Create Source model
- [ ] Implement add/remove/list operations
- [ ] Store sources in database
- [ ] Add source preview
- [ ] Test with multiple sources

**Files to create**:
- `backend/app/models/source.py`
- `backend/app/services/source_manager.py`
- `backend/app/routers/sources.py`

#### 3.2 URL Content Fetcher 🌐
**Time**: 4 hours

- [ ] Fetch URL content with requests
- [ ] Extract main article with BeautifulSoup
- [ ] Remove ads and navigation
- [ ] Handle different website structures
- [ ] Add error handling

**Files to create**:
- `backend/app/services/url_fetcher.py`

#### 3.3 Content Analyzer 🧠
**Time**: 3 hours

- [ ] Analyze content structure
- [ ] Identify topics and concepts
- [ ] Detect exam key format
- [ ] Generate summary
- [ ] Cache analysis results

**Files to create**:
- `backend/app/services/content_analyzer.py`

**Expected Result**: Support 3+ source types ✅

---

## Phase 4: Frontend Rebuild (Priority: MEDIUM)

### Goal: Create NotebookLM-style UI

### Tasks:

#### 4.1 Source Input UI 📥
**Time**: 4 hours

- [ ] Create tabbed interface (Text/PDF/URL)
- [ ] Add drag-and-drop for PDFs
- [ ] Add URL validation
- [ ] Show upload progress
- [ ] Display source preview

**Files to create**:
- `frontend/src/components/SourceInput.tsx`
- `frontend/src/components/PDFUpload.tsx`
- `frontend/src/components/URLInput.tsx`

#### 4.2 Source List UI 📋
**Time**: 3 hours

- [ ] Display all sources
- [ ] Show source metadata (type, size, status)
- [ ] Add remove button
- [ ] Add preview modal
- [ ] Show processing status

**Files to create**:
- `frontend/src/components/SourceList.tsx`
- `frontend/src/components/SourceCard.tsx`

#### 4.3 Quiz Generator UI ⚡
**Time**: 3 hours

- [ ] Add "Generate Quiz" button
- [ ] Show progress indicator
- [ ] Display estimated time
- [ ] Handle errors gracefully
- [ ] Show success message

**Files to modify**:
- `frontend/src/pages/EnhancedQuiz.tsx`

**Expected Result**: Clean, intuitive UI ✅

---

## Phase 5: Google Vision Integration (Priority: LOW)

### Goal: Support image-based PDFs with OCR

### Tasks:

#### 5.1 Google Vision Setup 🔧
**Time**: 2 hours

- [ ] Verify vision.json exists
- [ ] Test Google Vision API
- [ ] Add error handling
- [ ] Test with scanned PDFs
- [ ] Document setup process

**Files to modify**:
- `backend/app/utils/pdf_parser.py`

#### 5.2 OCR Optimization ⚡
**Time**: 2 hours

- [ ] Optimize image quality
- [ ] Batch process pages
- [ ] Cache OCR results
- [ ] Add progress tracking
- [ ] Test performance

**Expected Result**: OCR in < 30 seconds per page ✅

---

## Timeline

### Week 1: Performance (CRITICAL)
- Day 1-2: Fast AI integration
- Day 3-4: Parallel processing
- Day 5: Caching & testing

### Week 2: Exam Extraction (HIGH)
- Day 1-2: Pattern detection
- Day 3-4: Question extraction
- Day 5: Answer key matching & testing

### Week 3: Multi-Source (MEDIUM)
- Day 1-2: Source manager
- Day 3-4: URL fetcher
- Day 5: Content analyzer

### Week 4: Frontend & Polish
- Day 1-2: Source input UI
- Day 3: Source list UI
- Day 4: Quiz generator UI
- Day 5: Testing & deployment

---

## Success Criteria

### Performance ✅
- [ ] Quiz generation: < 10 seconds
- [ ] PDF extraction: < 5 seconds
- [ ] Exam key extraction: < 15 seconds
- [ ] URL fetch: < 3 seconds

### Functionality ✅
- [ ] Extract 200 questions from exam PDF
- [ ] Support text, PDF, URL sources
- [ ] Generate content-specific questions
- [ ] Handle image-based PDFs with OCR

### Quality ✅
- [ ] Question relevance: 90%+
- [ ] Exam extraction accuracy: 95%+
- [ ] User satisfaction: 4.5/5 stars

---

## Next Steps

1. **Review and approve** this roadmap
2. **Start Phase 1** (Performance Optimization)
3. **Test each phase** before moving to next
4. **Iterate based on feedback**

---

**Ready to start Phase 1: Performance Optimization?**

Let me know and I'll begin implementing the fast AI integration!
