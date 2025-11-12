"""
Fast AI Service - Optimized for speed
Supports OpenAI, DeepSeek, and other fast APIs
"""
import httpx
import asyncio
import json
import logging
from typing import List, Optional, Dict, Any
from app.config import settings
from app.models.quiz import QuizQuestion

logger = logging.getLogger(__name__)

class FastAIService:
    """Optimized AI service for fast quiz generation"""
    
    def __init__(self):
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.deepseek_api_key = settings.DEEPSEEK_API_KEY
        self.deepseek_base_url = settings.DEEPSEEK_BASE_URL
        self.ollama_base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
        self.ollama_model = getattr(settings, 'OLLAMA_MODEL', 'deepseek-coder-v2:latest')
        
        # API priority (Ollama first - local and free!)
        self.api_priority = ['ollama']
        if self.openai_api_key:
            self.api_priority.append('openai')
        if self.deepseek_api_key:
            self.api_priority.append('deepseek')
        
        logger.info(f"FastAI initialized with APIs: {self.api_priority}")
    
    async def generate_quiz_fast(
        self, 
        content: str, 
        topic: Optional[str] = None, 
        num_questions: int = 10
    ) -> List[QuizQuestion]:
        """
        Generate quiz questions quickly using parallel processing
        Target: < 10 seconds for 20 questions
        """
        logger.info(f"🚀 Fast generation: {num_questions} questions")
        
        # Optimize batch size for speed
        batch_size = 10  # Generate 10 questions per batch
        batches = self._create_batches(num_questions, batch_size)
        
        # Generate all batches in parallel
        tasks = [
            self._generate_batch(content, topic, batch_size, i)
            for i, batch_size in enumerate(batches)
        ]
        
        logger.info(f"⚡ Generating {len(batches)} batches in parallel...")
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine results
        all_questions = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"❌ Batch {i+1} failed: {result}")
                continue
            all_questions.extend(result)
        
        logger.info(f"✅ Generated {len(all_questions)} questions")
        return all_questions[:num_questions]
    
    def _create_batches(self, total: int, batch_size: int) -> List[int]:
        """Split total questions into optimal batches"""
        batches = []
        remaining = total
        
        while remaining > 0:
            current_batch = min(batch_size, remaining)
            batches.append(current_batch)
            remaining -= current_batch
        
        return batches
    
    async def _generate_batch(
        self, 
        content: str, 
        topic: Optional[str], 
        num_questions: int,
        batch_num: int
    ) -> List[QuizQuestion]:
        """Generate a single batch of questions"""
        
        prompt = self._create_optimized_prompt(content, topic, num_questions)
        
        # Try APIs in priority order
        for api_name in self.api_priority:
            try:
                logger.info(f"📡 Batch {batch_num+1}: Using {api_name}")
                
                if api_name == 'ollama':
                    response = await self._call_ollama(prompt)
                elif api_name == 'openai':
                    response = await self._call_openai(prompt)
                elif api_name == 'deepseek':
                    response = await self._call_deepseek(prompt)
                else:
                    continue
                
                questions = self._parse_response(response)
                
                if questions:
                    logger.info(f"✅ Batch {batch_num+1}: Got {len(questions)} questions from {api_name}")
                    return questions
                    
            except Exception as e:
                logger.warning(f"⚠️ {api_name} failed: {e}")
                continue
        
        # If all APIs fail, return empty
        logger.error(f"❌ Batch {batch_num+1}: All APIs failed")
        return []
    
    def _create_optimized_prompt(
        self, 
        content: str, 
        topic: Optional[str], 
        num_questions: int
    ) -> str:
        """Create optimized prompt for fast generation"""
        
        # Truncate content if too long (for speed)
        max_content_length = 3000
        if len(content) > max_content_length:
            content = content[:max_content_length] + "..."
        
        topic_text = f" about {topic}" if topic else ""
        
        return f"""Generate {num_questions} multiple-choice quiz questions{topic_text}.

CONTENT:
{content}

REQUIREMENTS:
- Create exactly {num_questions} questions
- Each question must have 4 options (A, B, C, D)
- First option is always correct
- Questions must be based on the content above
- Be concise and clear

OUTPUT FORMAT (JSON only):
[
  {{
    "id": "q1",
    "question": "Question text here?",
    "options": ["Correct answer", "Wrong 1", "Wrong 2", "Wrong 3"]
  }},
  ...
]

Generate {num_questions} questions now. Respond with ONLY the JSON array:"""
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API (GPT-3.5-turbo - fastest)"""
        
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a quiz generator. Respond with ONLY valid JSON arrays."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.status_code}")
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _call_deepseek(self, prompt: str) -> str:
        """Call DeepSeek API"""
        
        if not self.deepseek_api_key or not self.deepseek_api_key.strip():
            raise Exception("DeepSeek API key not configured")
        
        headers = {
            "Authorization": f"Bearer {self.deepseek_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a quiz generator. Respond with ONLY valid JSON arrays."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.deepseek_base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                raise Exception(f"DeepSeek API error: {response.status_code}")
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _call_ollama(self, prompt: str) -> str:
        """Call Ollama API (local)"""
        
        try:
            logger.info(f"🤖 Calling Ollama at {self.ollama_base_url} with model {self.ollama_model}")
            
            payload = {
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 1500,
                    "num_ctx": 2048
                }
            }
            
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    f"{self.ollama_base_url}/api/generate",
                    json=payload
                )
                
                if response.status_code != 200:
                    error_text = response.text
                    logger.error(f"Ollama error response: {error_text}")
                    raise Exception(f"Ollama API error {response.status_code}: {error_text}")
                
                data = response.json()
                logger.info(f"✅ Ollama response received, length: {len(data.get('response', ''))}")
                return data["response"]
        except Exception as e:
            logger.error(f"❌ Ollama call failed: {type(e).__name__}: {str(e)}")
            raise
    
    def _parse_response(self, response: str) -> List[QuizQuestion]:
        """Parse AI response into QuizQuestion objects"""
        
        try:
            # Clean response
            response = response.strip()
            
            # Try direct JSON parse
            try:
                data = json.loads(response)
            except json.JSONDecodeError:
                # Try to extract JSON from response
                import re
                json_match = re.search(r'\[.*\]', response, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group())
                else:
                    raise ValueError("No JSON found in response")
            
            # Ensure it's a list
            if not isinstance(data, list):
                data = [data]
            
            # Convert to QuizQuestion objects
            questions = []
            for i, item in enumerate(data):
                if not isinstance(item, dict):
                    continue
                
                if "question" not in item or "options" not in item:
                    continue
                
                # Ensure 4 options
                options = item["options"]
                if len(options) < 4:
                    options.extend([f"Option {j}" for j in range(len(options), 4)])
                elif len(options) > 4:
                    options = options[:4]
                
                question = QuizQuestion(
                    id=item.get("id", f"q{i+1}"),
                    question=item["question"],
                    options=options
                )
                questions.append(question)
            
            return questions
            
        except Exception as e:
            logger.error(f"Parse error: {e}")
            return []

# Global instance
fast_ai_service = FastAIService()
