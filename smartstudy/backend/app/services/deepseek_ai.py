import httpx
import json
import re
from typing import List, Dict, Any, Optional
from app.config import settings
from app.models.quiz import QuizQuestion
import logging

logger = logging.getLogger(__name__)

class DeepSeekAIService:
    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY
        self.base_url = settings.DEEPSEEK_BASE_URL
        self.nvidia_api_key = getattr(settings, 'NVIDIA_API_KEY', None)
        self.nvidia_base_url = "https://integrate.api.nvidia.com/v1"
        self.ollama_base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
        self.ollama_model = getattr(settings, 'OLLAMA_MODEL', 'deepseek-r1:7b')
        self.client = httpx.AsyncClient(timeout=120.0)
    
    async def generate_quiz_from_text(self, content: str, topic: Optional[str] = None, num_questions: Optional[int] = None) -> List[QuizQuestion]:
        """Generate quiz questions from text content"""
        
        # Calculate optimal number of questions based on content length
        if num_questions is None:
            # Estimate: 1 question per 200 words (roughly 1000 characters)
            word_count = len(content.split())
            num_questions = max(5, min(200, word_count // 200))  # Between 5 and 200 questions
        
        logger.info(f"Generating {num_questions} quiz questions for topic: {topic}, content length: {len(content)} characters")
        
        if not self.api_key:
            logger.info("DeepSeek API key not configured, using intelligent fallback")
            return self._generate_fallback_questions(content, topic, num_questions)
        
        # For large question sets, generate in batches
        all_questions = []
        batch_size = 20  # Generate 20 questions at a time
        num_batches = (num_questions + batch_size - 1) // batch_size
        
        for batch_num in range(num_batches):
            questions_in_batch = min(batch_size, num_questions - len(all_questions))
            
            # Try AI generation with retry logic
            max_retries = 2
            for attempt in range(max_retries):
                try:
                    logger.info(f"Batch {batch_num + 1}/{num_batches}: Attempting to generate {questions_in_batch} questions using DeepSeek AI (attempt {attempt + 1}/{max_retries})")
                    prompt = self._create_quiz_prompt(content, topic, questions_in_batch, batch_num)
                    response = await self._call_deepseek_api(prompt)
                    
                    logger.info(f"Received AI response, length: {len(response)} characters")
                    questions = self._parse_quiz_response(response)
                    
                    if questions and len(questions) >= questions_in_batch // 2:  # Accept if we get at least half
                        logger.info(f"Successfully generated {len(questions)} questions using AI for batch {batch_num + 1}")
                        all_questions.extend(questions)
                        break
                    else:
                        logger.warning(f"AI generated only {len(questions)} questions, retrying...")
                        if attempt == max_retries - 1:  # Last attempt
                            logger.warning("Final attempt failed for this batch, using intelligent fallback")
                            fallback_questions = self._generate_fallback_questions(content, topic, questions_in_batch)
                            all_questions.extend(fallback_questions)
                            break
                        
                except Exception as e:
                    logger.error(f"DeepSeek API error (attempt {attempt + 1}): {e}")
                    if attempt == max_retries - 1:  # Last attempt
                        logger.info("All AI attempts failed for this batch, falling back to intelligent question generation")
                        fallback_questions = self._generate_fallback_questions(content, topic, questions_in_batch)
                        all_questions.extend(fallback_questions)
                        break
        
        logger.info(f"Total questions generated: {len(all_questions)}")
        return all_questions[:num_questions]  # Ensure we don't exceed requested number
    
    def _create_quiz_prompt(self, content: str, topic: Optional[str], num_questions: int = 5, batch_num: int = 0) -> str:
        """Create optimized prompt for quiz generation"""
        
        # For large documents, use different sections for each batch
        content_length = len(content)
        section_size = content_length // max(1, (num_questions // 5))  # Divide content into sections
        start_pos = batch_num * section_size
        end_pos = min(start_pos + section_size + 2000, content_length)  # Overlap sections
        
        content_section = content[start_pos:end_pos]
        
        # Analyze content to extract key information
        import hashlib
        import re
        
        content_hash = hashlib.md5(content_section.encode()).hexdigest()[:8]
        
        # Extract specific details from content
        sentences = [s.strip() for s in content_section.split('.') if len(s.strip()) > 20]
        
        # Extract numbers, dates, names, and specific terms
        numbers = re.findall(r'\b\d+(?:\.\d+)?(?:%|\s*percent)?\b', content_section)
        dates = re.findall(r'\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}|\w+\s+\d{1,2},?\s+\d{4})\b', content_section)
        proper_nouns = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', content_section)
        
        # Check if content contains existing questions (exam key format)
        has_existing_questions = bool(re.search(r'\b(?:Question|Q\.|Q\d+|^\d+\.)\s*[:\)]?\s*[A-Z]', content_section, re.MULTILINE))
        
        if has_existing_questions:
            # Content appears to be an exam/quiz - extract and reformat questions
            return f"""You are analyzing an exam or quiz document. Extract and reformat EXACTLY {num_questions} questions from this content.

CONTENT (Section {batch_num + 1}):
\"\"\"{content_section}\"\"\"

INSTRUCTIONS:
1. EXTRACT EXISTING QUESTIONS: Find actual questions from the content
2. PRESERVE ACCURACY: Keep the exact question text and correct answers
3. FORMAT PROPERLY: Ensure each question has exactly 4 options
4. IDENTIFY CORRECT ANSWER: The first option should be the correct answer
5. If there are answer keys or solutions, use them to identify correct answers

IMPORTANT: 
- Extract questions AS THEY APPEAR in the document
- Do NOT create new questions - only extract existing ones
- Maintain the original difficulty and content
- If a question has fewer than 4 options, add plausible distractors
- If a question has more than 4 options, keep the 4 most relevant ones

RETURN FORMAT (JSON only, no other text):
[
  {{
    "id": "extracted_{content_hash}_1",
    "question": "[Exact question text from document]",
    "options": ["[Correct answer]", "[Wrong option 1]", "[Wrong option 2]", "[Wrong option 3]"]
  }},
  ... (continue for {num_questions} questions)
]"""
        
        return f"""You are an expert educational assessment designer. Create {num_questions} high-quality, content-specific multiple-choice questions based EXCLUSIVELY on the provided content.

CONTENT TO ANALYZE (Section {batch_num + 1}, Hash: {content_hash}):
\"\"\"{content_section}\"\"\"

CONTENT ANALYSIS:
- Key numbers found: {numbers[:10] if numbers else 'none'}
- Dates found: {dates[:5] if dates else 'none'}  
- Proper nouns: {proper_nouns[:10] if proper_nouns else 'none'}
- Sentences analyzed: {len(sentences)}

CRITICAL REQUIREMENTS:
1. CONTENT-SPECIFIC: Every question MUST reference specific facts, data, or concepts from THIS exact text
2. DIRECT QUOTES: Use actual terms, numbers, names, and phrases from the content
3. NO GENERIC QUESTIONS: Avoid questions that could apply to any document on this topic
4. VERIFIABLE ANSWERS: Correct answer must be explicitly stated or clearly derivable from the text
5. INTELLIGENT DISTRACTORS: Wrong answers should be plausible but factually incorrect based on the content

QUESTION QUALITY CHECKLIST:
✓ Does the question reference specific content from the text?
✓ Can the question ONLY be answered by reading this specific document?
✓ Are all 4 options grammatically parallel and similar in length?
✓ Is the correct answer unambiguously stated in the content?
✓ Are the wrong answers believable but clearly incorrect?
✓ Does the question test understanding, not just memorization?

QUESTION TYPES (Mix these):
1. SPECIFIC FACT: "According to the text, what is the exact [value/name/date] for [specific context]?"
2. DEFINITION: "How does the content define [specific term mentioned]?"
3. PROCESS/SEQUENCE: "The text describes that after [specific step], what happens next?"
4. COMPARISON: "According to the content, how does [specific A] differ from [specific B]?"
5. CAUSE-EFFECT: "The text states that [specific cause] results in what effect?"
6. APPLICATION: "Based on the example given in the text about [specific case], what principle is demonstrated?"

FORMATTING RULES:
- First option is ALWAYS the correct answer
- All options must be similar in length and structure
- Use specific terminology from the content
- Avoid "all of the above" or "none of the above"
- No obvious patterns (e.g., longest option is correct)

CRITICAL OUTPUT REQUIREMENTS:
- You MUST respond with ONLY valid JSON
- Do NOT include any markdown formatting (no ```json or ``` tags)
- Do NOT include any explanatory text before or after the JSON
- Do NOT include comments in the JSON
- Start your response with [ and end with ]

EXACT OUTPUT FORMAT:
[
  {{
    "id": "q_{content_hash}_1",
    "question": "[Specific question referencing exact content details]",
    "options": ["[Correct answer with specific details from text]", "[Plausible wrong answer]", "[Another plausible wrong answer]", "[Third plausible wrong answer]"]
  }},
  {{
    "id": "q_{content_hash}_2",
    "question": "[Another specific question]",
    "options": ["[Correct answer]", "[Wrong option 1]", "[Wrong option 2]", "[Wrong option 3]"]
  }}
]

GENERATE EXACTLY {num_questions} QUESTIONS NOW. RESPOND WITH ONLY THE JSON ARRAY:"""
    
    async def _call_deepseek_api(self, prompt: str) -> str:
        """Make API call to AI service (tries Ollama first, then NVIDIA, then DeepSeek)"""
        
        # Try Ollama first (local, no limits!)
        try:
            # First check if Ollama is available
            async with httpx.AsyncClient(timeout=10.0) as client:
                health_response = await client.get(f"{self.ollama_base_url}/api/tags")
                if health_response.status_code != 200:
                    logger.warning(f"Ollama not available at {self.ollama_base_url}")
                    raise Exception("Ollama service not available")
                
                # Check if model exists
                models_data = health_response.json()
                available_models = [model.get("name", "") for model in models_data.get("models", [])]
                logger.info(f"Available Ollama models: {available_models}")
                
                # Find the best matching model
                actual_model = None
                if self.ollama_model in available_models:
                    actual_model = self.ollama_model
                else:
                    # Try to find a similar model (case-insensitive partial match)
                    for model in available_models:
                        if "deepseek" in model.lower() and "coder" in model.lower():
                            actual_model = model
                            logger.info(f"Using similar DeepSeek model: {actual_model}")
                            break
                    
                    if not actual_model:
                        # Try any DeepSeek model
                        deepseek_models = [m for m in available_models if "deepseek" in m.lower()]
                        if deepseek_models:
                            actual_model = deepseek_models[0]
                            logger.info(f"Using available DeepSeek model: {actual_model}")
                        else:
                            raise Exception(f"No DeepSeek models found. Available: {available_models}")
                
                if not actual_model:
                    raise Exception(f"Could not find suitable model. Available: {available_models}")
            
            logger.info(f"Making API call to Ollama: {self.ollama_base_url}")
            logger.info(f"Using model: {actual_model}")
            
            # Use chat completion format for better results
            payload = {
                "model": actual_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert educational assessment designer who creates high-quality, content-specific quiz questions. You MUST respond with ONLY valid JSON arrays starting with [ and ending with ]. Do not include markdown formatting, code blocks, explanations, or any text outside the JSON array structure."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 4096
                }
                # Note: Removed "format": "json" as it causes Ollama to return single objects instead of arrays
            }
            
            async with httpx.AsyncClient(timeout=300.0) as client:
                logger.info("Sending request to Ollama...")
                response = await client.post(
                    f"{self.ollama_base_url}/api/chat",
                    json=payload
                )
                
                logger.info(f"Ollama API response status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    content = data.get("message", {}).get("content", "")
                    if content and len(content.strip()) > 10:  # Ensure meaningful content
                        logger.info(f"Received Ollama response, length: {len(content)} characters")
                        logger.info(f"Ollama response FULL: {content}")  # Log full response for debugging
                        return content
                    else:
                        logger.warning(f"Ollama returned empty or too short response: '{content}'")
                        raise Exception("Empty or insufficient response from Ollama")
                else:
                    error_text = response.text
                    logger.warning(f"Ollama API error: {response.status_code} - {error_text}")
                    raise Exception(f"Ollama API error: {response.status_code}")
                    
        except Exception as e:
            logger.warning(f"Ollama API call failed: {e}, trying other providers")
        
        # Try NVIDIA API second if available
        if self.nvidia_api_key:
            try:
                logger.info(f"Making API call to NVIDIA: {self.nvidia_base_url}")
                logger.info(f"Prompt length: {len(prompt)} characters")
                
                headers = {
                    "Authorization": f"Bearer {self.nvidia_api_key}",
                    "accept": "application/json",
                    "content-type": "application/json"
                }
                
                payload = {
                    "model": "openai/gpt-oss-20b",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert educational assessment designer who creates high-quality, content-specific quiz questions."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 4096,
                    "frequency_penalty": 0.3,
                    "presence_penalty": 0.3,
                    "stream": False
                }
                
                async with httpx.AsyncClient(timeout=180.0) as client:
                    logger.info("Sending request to NVIDIA API...")
                    response = await client.post(
                        f"{self.nvidia_base_url}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    
                    logger.info(f"NVIDIA API response status: {response.status_code}")
                    
                    if response.status_code == 200:
                        data = response.json()
                        content = data["choices"][0]["message"]["content"]
                        logger.info(f"Received NVIDIA AI response, length: {len(content)} characters")
                        return content
                    else:
                        logger.warning(f"NVIDIA API error: {response.status_code}, falling back to DeepSeek")
                        
            except Exception as e:
                logger.warning(f"NVIDIA API call failed: {e}, falling back to DeepSeek")
        
        # Fallback to DeepSeek API
        logger.info(f"Making API call to DeepSeek: {self.base_url}")
        logger.info(f"API key configured: {bool(self.api_key)}")
        logger.info(f"Prompt length: {len(prompt)} characters")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert educational assessment designer who creates high-quality, content-specific quiz questions."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 4096,
            "top_p": 0.9
        }
        
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                logger.info("Sending request to DeepSeek API...")
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                logger.info(f"DeepSeek API response status: {response.status_code}")
                
                if response.status_code != 200:
                    error_text = response.text
                    logger.error(f"API error: {response.status_code} - {error_text}")
                    raise Exception(f"API error: {response.status_code} - {error_text}")
                
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                logger.info(f"Received AI response, length: {len(content)} characters")
                logger.debug(f"AI response preview: {content[:200]}...")
                
                return content
                
        except httpx.TimeoutException:
            logger.error("DeepSeek API request timed out")
            raise Exception("API request timed out")
        except Exception as e:
            logger.error(f"DeepSeek API call failed: {e}")
            raise
    
    def _parse_quiz_response(self, response: str) -> List[QuizQuestion]:
        """Parse AI response into QuizQuestion objects with improved error handling"""
        
        try:
            # Clean the response to extract JSON
            response_clean = response.strip()
            
            # Log the raw response for debugging
            logger.info(f"Parsing response, length: {len(response_clean)} characters")
            logger.info(f"Response preview: {response_clean[:500]}...")
            
            # Try multiple parsing strategies
            json_str = None
            
            # Strategy 1: Direct JSON parse (if response is already valid JSON)
            try:
                test_parse = json.loads(response_clean)
                if isinstance(test_parse, list):
                    json_str = response_clean
                    logger.info("Response is already valid JSON array")
                elif isinstance(test_parse, dict):
                    # Check if it's a single question object
                    if "question" in test_parse and "options" in test_parse:
                        json_str = f"[{response_clean}]"
                        logger.info("Response is single question object, wrapped in array")
                    else:
                        # Might be a wrapper object, check for questions array inside
                        if "questions" in test_parse and isinstance(test_parse["questions"], list):
                            json_str = json.dumps(test_parse["questions"])
                            logger.info("Found questions array inside wrapper object")
                        else:
                            json_str = f"[{response_clean}]"
                            logger.info("Response is valid JSON object, wrapped in array")
            except json.JSONDecodeError:
                pass
            
            # Strategy 2: Look for JSON code block (```json ... ```)
            if not json_str:
                code_block_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', response_clean, re.DOTALL)
                if code_block_match:
                    json_str = code_block_match.group(1)
                    logger.info("Found JSON in code block")
            
            # Strategy 3: Look for JSON array with proper nesting
            if not json_str:
                # Find the first [ and last ] to extract the full array
                first_bracket = response_clean.find('[')
                last_bracket = response_clean.rfind(']')
                if first_bracket != -1 and last_bracket != -1 and last_bracket > first_bracket:
                    json_str = response_clean[first_bracket:last_bracket+1]
                    logger.info("Found JSON array by bracket matching")
            
            # Strategy 4: Look for single JSON object and wrap it
            if not json_str:
                # Use a more robust regex that handles nested braces
                brace_count = 0
                start_idx = -1
                for i, char in enumerate(response_clean):
                    if char == '{':
                        if brace_count == 0:
                            start_idx = i
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0 and start_idx != -1:
                            potential_json = response_clean[start_idx:i+1]
                            if '"question"' in potential_json and '"options"' in potential_json:
                                json_str = f"[{potential_json}]"
                                logger.info("Found single JSON object with proper nesting, wrapped in array")
                                break
            
            # Strategy 5: Try to extract multiple JSON objects
            if not json_str:
                objects = []
                brace_count = 0
                start_idx = -1
                for i, char in enumerate(response_clean):
                    if char == '{':
                        if brace_count == 0:
                            start_idx = i
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0 and start_idx != -1:
                            potential_json = response_clean[start_idx:i+1]
                            if '"question"' in potential_json and '"options"' in potential_json:
                                objects.append(potential_json)
                            start_idx = -1
                
                if objects:
                    json_str = "[" + ",".join(objects) + "]"
                    logger.info(f"Found {len(objects)} JSON objects with proper nesting, combined into array")
            
            # Strategy 6: Try to clean and extract JSON more aggressively
            if not json_str:
                # Remove common non-JSON prefixes/suffixes
                cleaned = response_clean
                # Remove markdown code blocks
                cleaned = re.sub(r'```[a-z]*\n?', '', cleaned)
                cleaned = re.sub(r'```', '', cleaned)
                # Remove common text before JSON
                cleaned = re.sub(r'^.*?(?=\[|\{)', '', cleaned, flags=re.DOTALL)
                # Remove common text after JSON
                cleaned = re.sub(r'(\]|\})(?!.*(\]|\})).*$', r'\1', cleaned, flags=re.DOTALL)
                
                # Try parsing the cleaned version
                try:
                    test_parse = json.loads(cleaned.strip())
                    if isinstance(test_parse, (list, dict)):
                        json_str = cleaned.strip()
                        logger.info("Found JSON after aggressive cleaning")
                except:
                    pass
            
            if not json_str:
                logger.error("No JSON found in expected format after all strategies")
                logger.error(f"Full response: {response_clean}")
                raise ValueError("No JSON found in response")
            
            # Clean up the JSON string
            json_str = json_str.strip()
            
            # Parse JSON
            logger.info(f"Attempting to parse JSON: {json_str[:200]}...")
            questions_data = json.loads(json_str)
            
            # Ensure it's a list
            if not isinstance(questions_data, list):
                questions_data = [questions_data]
            
            logger.info(f"Parsed {len(questions_data)} question objects from JSON")
            
            questions = []
            for i, q_data in enumerate(questions_data):
                # Validate required fields
                if not isinstance(q_data, dict):
                    logger.warning(f"Skipping item {i}: not a dictionary")
                    continue
                    
                if "question" not in q_data or "options" not in q_data:
                    logger.warning(f"Skipping question {i}: missing required fields. Keys: {q_data.keys()}")
                    continue
                
                # Ensure we have exactly 4 options
                options = q_data["options"]
                if not isinstance(options, list):
                    logger.warning(f"Skipping question {i}: options is not a list")
                    continue
                    
                if len(options) != 4:
                    logger.warning(f"Question {i} has {len(options)} options, adjusting to 4")
                    # Pad or trim to 4 options
                    if len(options) < 4:
                        options.extend([f"Option {chr(65+len(options)+j)}" for j in range(4-len(options))])
                    else:
                        options = options[:4]
                
                question = QuizQuestion(
                    id=q_data.get("id", f"q{i+1}"),
                    question=q_data["question"],
                    options=options
                )
                questions.append(question)
            
            if questions:
                logger.info(f"Successfully parsed {len(questions)} valid questions from AI response")
            else:
                logger.warning("No questions found in expected format")
                
            return questions
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(f"Response content: {response[:1000]}...")
            logger.error("Returning empty list - fallback will be triggered")
            return []
        except Exception as e:
            logger.error(f"Error parsing quiz response: {e}")
            logger.error(f"Response content: {response[:500]}...")
            logger.error("Returning empty list - fallback will be triggered")
            return []
    
    def _generate_fallback_questions(self, content: str, topic: Optional[str], num_questions: int = 5) -> List[QuizQuestion]:
        """Generate intelligent fallback questions when AI is unavailable"""
        
        # Advanced content analysis
        import re
        from collections import Counter
        
        logger.info(f"Generating {num_questions} fallback questions from content")
        
        # Check if content contains existing questions (exam key format)
        has_existing_questions = bool(re.search(r'\b(?:Question|Q\.|Q\d+|^\d+\.)\s*[:\)]?\s*[A-Z]', content, re.MULTILINE))
        
        if has_existing_questions:
            logger.info("Content appears to contain existing questions, extracting them")
            return self._extract_existing_questions(content, num_questions)
        
        # Clean and analyze content
        content_clean = re.sub(r'[^\w\s]', ' ', content.lower())
        words = content_clean.split()
        sentences = [s.strip() for s in content.split('.') if len(s.strip()) > 10]
        paragraphs = [p.strip() for p in content.split('\n\n') if len(p.strip()) > 50]
        
        # Extract meaningful terms (filter out common words)
        stop_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an', 'as', 'from', 'which', 'who', 'what', 'when', 'where', 'why', 'how'}
        
        meaningful_words = [word for word in words if len(word) > 3 and word not in stop_words and word.isalpha()]
        word_freq = Counter(meaningful_words)
        
        # Get key terms and concepts
        key_terms = [term for term, freq in word_freq.most_common(50) if freq > 1]
        key_concepts = [term.title() for term in key_terms[:20]]
        
        # Extract numbers, dates, and specific facts
        numbers = re.findall(r'\b\d+(?:\.\d+)?\b', content)
        years = re.findall(r'\b(?:19|20)\d{2}\b', content)
        percentages = re.findall(r'\b\d+(?:\.\d+)?%\b', content)
        
        # Extract definitions (pattern: "X is/means/refers to Y")
        definitions = re.findall(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|means|refers to|defined as)\s+([^.]+)', content)
        
        # Generate sophisticated questions
        questions = []
        question_id = 0
        
        # Generate questions from different content sections
        questions_per_type = max(1, num_questions // 5)
        
        # Type 1: Definition-based questions
        for i, (term, definition) in enumerate(definitions[:questions_per_type]):
            if question_id >= num_questions:
                break
            question_id += 1
            # Create wrong definitions by mixing terms
            wrong_defs = [definitions[j][1] for j in range(len(definitions)) if j != i][:3]
            if len(wrong_defs) < 3:
                wrong_defs.extend([f"An unrelated concept in {topic or 'the field'}" for _ in range(3 - len(wrong_defs))])
            
            questions.append(QuizQuestion(
                id=f"def_{question_id}",
                question=f"According to the content, what is {term}?",
                options=[definition.strip()] + wrong_defs[:3]
            ))
        
        # Type 2: Factual questions with numbers/dates
        if numbers or years or percentages:
            for i in range(min(questions_per_type, len(numbers) + len(years) + len(percentages))):
                if question_id >= num_questions:
                    break
                question_id += 1
                
                if i < len(numbers):
                    fact = numbers[i]
                    # Find context around the number
                    context_match = re.search(rf'.{{0,50}}{re.escape(fact)}.{{0,50}}', content)
                    context = context_match.group() if context_match else f"related to {topic or 'the content'}"
                    
                    questions.append(QuizQuestion(
                        id=f"fact_{question_id}",
                        question=f"According to the content, what is the value mentioned in the context of {context[:50]}?",
                        options=[
                            fact,
                            str(int(float(fact)) + 10) if fact.replace('.', '').isdigit() else "Different value",
                            str(int(float(fact)) - 5) if fact.replace('.', '').isdigit() else "Another value",
                            str(int(float(fact)) * 2) if fact.replace('.', '').isdigit() else "Incorrect value"
                        ]
                    ))
        
        # Type 3: Concept-based questions from key terms
        for i in range(min(questions_per_type, len(key_concepts))):
            if question_id >= num_questions:
                break
            question_id += 1
            
            concept = key_concepts[i]
            # Find sentence containing this concept
            concept_sentence = next((s for s in sentences if concept.lower() in s.lower()), None)
            
            if concept_sentence:
                questions.append(QuizQuestion(
                    id=f"concept_{question_id}",
                    question=f"The content discusses {concept}. Based on the material, what is the primary focus regarding this concept?",
                    options=[
                        f"Its role and significance in {topic or 'the subject matter'}",
                        "Its complete irrelevance to the topic",
                        "Only its historical background without current applications",
                        "Its use in completely different contexts"
                    ]
                ))
        
        # Type 4: Paragraph-based comprehension questions
        for i, paragraph in enumerate(paragraphs[:questions_per_type]):
            if question_id >= num_questions:
                break
            question_id += 1
            
            # Extract main idea from paragraph
            para_sentences = [s.strip() for s in paragraph.split('.') if len(s.strip()) > 20]
            if para_sentences:
                first_sentence = para_sentences[0]
                questions.append(QuizQuestion(
                    id=f"para_{question_id}",
                    question=f"In the section that begins with '{first_sentence[:60]}...', what is the main point being discussed?",
                    options=[
                        f"The detailed explanation of concepts related to {topic or 'the subject'}",
                        "Unrelated background information",
                        "Contradictory statements to the main topic",
                        "General information without specific details"
                    ]
                ))
        
        # Type 5: Application and synthesis questions
        remaining = num_questions - question_id
        for i in range(remaining):
            question_id += 1
            if i < len(key_concepts):
                concept = key_concepts[i]
                questions.append(QuizQuestion(
                    id=f"app_{question_id}",
                    question=f"Based on the content's discussion of {concept.lower()}, how would this concept be applied in practice?",
                    options=[
                        f"By understanding and applying the principles explained in the context of {topic or 'the field'}",
                        "By ignoring the content and using unrelated methods",
                        "By only memorizing terms without understanding",
                        "By applying it to completely different, unrelated scenarios"
                    ]
                ))
            else:
                questions.append(QuizQuestion(
                    id=f"synth_{question_id}",
                    question=f"What is the overall purpose of this content regarding {topic or 'the subject matter'}?",
                    options=[
                        "To provide comprehensive understanding and practical knowledge",
                        "To confuse readers with contradictory information",
                        "To present only theoretical concepts without applications",
                        "To discuss unrelated topics"
                    ]
                ))
        
        # Question 2: Content structure and main idea
        if sentences:
            first_sentence = sentences[0][:100] + "..." if len(sentences[0]) > 100 else sentences[0]
            questions.append(QuizQuestion(
                id="smart_2",
                question="Based on the structure and content of the material, what is the primary learning objective?",
                options=[
                    f"To understand the principles and applications of {topic or 'the subject matter'}",
                    "To memorize specific terminology only",
                    "To provide general background information",
                    "To introduce unrelated concepts"
                ]
            ))
        
        # Question 3: Relationship and application
        if len(key_concepts) >= 2:
            questions.append(QuizQuestion(
                id="smart_3",
                question=f"How does the content suggest {key_concepts[0].lower()} relates to {key_concepts[1].lower()}?",
                options=[
                    f"They are interconnected concepts that work together in {topic or 'the system'}",
                    "They are completely independent and unrelated",
                    "One completely replaces the other",
                    "They are contradictory concepts"
                ]
            ))
        
        # Question 4: Specific details or quantitative information
        if numbers or years or percentages:
            detail_info = numbers[0] if numbers else (years[0] if years else percentages[0])
            questions.append(QuizQuestion(
                id="smart_4",
                question=f"The content mentions specific quantitative information. What role does the figure '{detail_info}' play in the context?",
                options=[
                    f"It represents a key measurement or statistic relevant to {topic or 'the topic'}",
                    "It's just a random number with no significance",
                    "It's used only as an example with no real meaning",
                    "It contradicts the main points of the content"
                ]
            ))
        else:
            # Alternative question if no numbers found
            questions.append(QuizQuestion(
                id="smart_4",
                question="What approach does the content take to explain the subject matter?",
                options=[
                    "It provides detailed explanations with examples and context",
                    "It only lists facts without explanation",
                    "It focuses solely on historical background",
                    "It avoids explaining the core concepts"
                ]
            ))
        
        # Question 5: Synthesis and application
        questions.append(QuizQuestion(
            id="smart_5",
            question=f"Based on your understanding of the content, how would you apply the knowledge about {topic or 'this subject'} in a practical situation?",
            options=[
                f"Use the principles and concepts to analyze and solve problems related to {topic or 'the field'}",
                "Simply repeat the exact words from the content",
                "Ignore the content and use unrelated methods",
                "Apply it to completely different, unrelated situations"
            ]
        ))
        
        # Ensure we have exactly 5 questions
        while len(questions) < 5:
            questions.append(QuizQuestion(
                id=f"smart_{len(questions)+1}",
                question=f"What is the most important takeaway from this content about {topic or 'the subject'}?",
                options=[
                    f"A comprehensive understanding of {key_concepts[0].lower() if key_concepts else 'the main concepts'}",
                    "Memorization of specific details only",
                    "General awareness without deep understanding",
                    "Unrelated information"
                ]
            ))
        
        logger.info(f"Generated {len(questions)} intelligent fallback questions")
        return questions[:num_questions]
    
    def _extract_existing_questions(self, content: str, num_questions: int) -> List[QuizQuestion]:
        """Extract existing questions from exam/quiz documents"""
        import re
        
        logger.info("Extracting existing questions from exam document")
        
        questions = []
        
        # Pattern 1: Numbered questions with options (1. Question? A) Option B) Option)
        pattern1 = r'(?:^|\n)(\d+)[\.\)]\s*(.+?)\n\s*(?:A[\.\)]|a[\.\)])\s*(.+?)\n\s*(?:B[\.\)]|b[\.\)])\s*(.+?)\n\s*(?:C[\.\)]|c[\.\)])\s*(.+?)\n\s*(?:D[\.\)]|d[\.\)])\s*(.+?)(?=\n\d+[\.\)]|\n\n|$)'
        matches1 = re.finditer(pattern1, content, re.MULTILINE | re.DOTALL)
        
        for match in matches1:
            q_num, question, opt_a, opt_b, opt_c, opt_d = match.groups()
            questions.append(QuizQuestion(
                id=f"extracted_{q_num}",
                question=question.strip(),
                options=[opt_a.strip(), opt_b.strip(), opt_c.strip(), opt_d.strip()]
            ))
        
        # Pattern 2: Question followed by options on separate lines
        pattern2 = r'(?:Question|Q)\s*(\d+)[:\.\)]\s*(.+?)\n\s*(?:Options?:|Choices?:)?\s*\n\s*(?:A[\.\)]|1[\.\)])\s*(.+?)\n\s*(?:B[\.\)]|2[\.\)])\s*(.+?)\n\s*(?:C[\.\)]|3[\.\)])\s*(.+?)\n\s*(?:D[\.\)]|4[\.\)])\s*(.+?)(?=\n(?:Question|Q)\s*\d+|$)'
        matches2 = re.finditer(pattern2, content, re.MULTILINE | re.DOTALL | re.IGNORECASE)
        
        for match in matches2:
            q_num, question, opt_a, opt_b, opt_c, opt_d = match.groups()
            questions.append(QuizQuestion(
                id=f"extracted_q{q_num}",
                question=question.strip(),
                options=[opt_a.strip(), opt_b.strip(), opt_c.strip(), opt_d.strip()]
            ))
        
        # Pattern 3: Simple numbered list with inline options
        pattern3 = r'(\d+)[\.\)]\s*(.+?)\s+(?:A[\.\)]|a[\.\)])\s*(.+?)\s+(?:B[\.\)]|b[\.\)])\s*(.+?)\s+(?:C[\.\)]|c[\.\)])\s*(.+?)\s+(?:D[\.\)]|d[\.\)])\s*(.+?)(?=\n\d+[\.\)]|$)'
        matches3 = re.finditer(pattern3, content, re.MULTILINE)
        
        for match in matches3:
            q_num, question, opt_a, opt_b, opt_c, opt_d = match.groups()
            questions.append(QuizQuestion(
                id=f"extracted_{q_num}",
                question=question.strip(),
                options=[opt_a.strip(), opt_b.strip(), opt_c.strip(), opt_d.strip()]
            ))
        
        # Remove duplicates based on question text
        seen_questions = set()
        unique_questions = []
        for q in questions:
            q_text = q.question.lower().strip()
            if q_text not in seen_questions and len(q_text) > 10:
                seen_questions.add(q_text)
                unique_questions.append(q)
        
        logger.info(f"Extracted {len(unique_questions)} unique questions from document")
        
        # If we found questions, return them
        if unique_questions:
            return unique_questions[:num_questions]
        
        # If no questions found, return empty list (will be handled by caller)
        logger.warning("No questions found in expected format")
        return []

# Global instance
deepseek_service = DeepSeekAIService()