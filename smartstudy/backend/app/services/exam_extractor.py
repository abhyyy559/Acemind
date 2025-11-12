"""
Exam Key Extractor - Extract questions from exam PDFs
Handles 200+ questions automatically
"""
import re
import logging
from typing import List, Dict, Optional, Tuple
from app.models.quiz import QuizQuestion

logger = logging.getLogger(__name__)

class ExamExtractor:
    """Extract questions from exam keys and answer sheets"""
    
    def __init__(self):
        self.question_patterns = {
            'numbered': r'(\d+)\.\s*(.+?)(?=\n(?:\d+\.|[A-D]\)|$))',
            'parenthesis': r'(\d+)\)\s*(.+?)(?=\n(?:\d+\)|[A-D]\)|$))',
            'lettered': r'([A-Z])\.\s*(.+?)(?=\n(?:[A-Z]\.|$))',
        }
        
        self.option_patterns = {
            'parenthesis': r'([A-D])\)\s*(.+?)(?=\n[A-D]\)|$|\n\d+)',
            'period': r'([A-D])\.\s*(.+?)(?=\n[A-D]\.|$|\n\d+)',
            'bracket': r'\[([A-D])\]\s*(.+?)(?=\n\[[A-D]\]|$|\n\d+)',
        }
        
        self.answer_key_patterns = {
            'simple': r'(\d+)\.\s*([A-D])',
            'dash': r'(\d+)-([A-D])',
            'colon': r'(\d+):\s*([A-D])',
            'table': r'(\d+)\s+([A-D])\s',
        }
    
    def is_exam_key(self, content: str) -> bool:
        """Detect if content is an exam key"""
        
        # Check for multiple numbered questions
        numbered_questions = re.findall(r'^\d+[\.\)]\s+', content, re.MULTILINE)
        
        # Check for option patterns
        options = re.findall(r'^[A-D][\.\)]\s+', content, re.MULTILINE)
        
        # If we have 10+ questions and 40+ options, likely an exam
        is_exam = len(numbered_questions) >= 10 and len(options) >= 40
        
        logger.info(f"Exam detection: {len(numbered_questions)} questions, {len(options)} options -> {is_exam}")
        
        return is_exam
    
    def extract_exam_questions(self, content: str) -> List[QuizQuestion]:
        """Extract all questions from exam key"""
        
        logger.info("🔍 Extracting exam questions...")
        
        # Step 1: Detect format
        format_type = self._detect_format(content)
        logger.info(f"📋 Detected format: {format_type}")
        
        # Step 2: Extract questions
        questions = self._extract_questions(content, format_type)
        logger.info(f"📝 Extracted {len(questions)} questions")
        
        # Step 3: Extract options for each question
        questions_with_options = self._extract_options(content, questions)
        logger.info(f"✅ Parsed {len(questions_with_options)} questions with options")
        
        # Step 4: Find and match answer key
        answer_key = self._find_answer_key(content)
        if answer_key:
            logger.info(f"🔑 Found answer key with {len(answer_key)} answers")
            questions_with_options = self._match_answers(questions_with_options, answer_key)
        
        # Step 5: Convert to QuizQuestion objects
        quiz_questions = self._convert_to_quiz_questions(questions_with_options)
        
        logger.info(f"🎉 Successfully extracted {len(quiz_questions)} exam questions")
        
        return quiz_questions
    
    def _detect_format(self, content: str) -> str:
        """Detect question format"""
        
        # Count occurrences of each pattern
        scores = {}
        
        for format_name, pattern in self.question_patterns.items():
            matches = re.findall(pattern, content, re.MULTILINE | re.DOTALL)
            scores[format_name] = len(matches)
        
        # Return format with most matches
        if scores:
            best_format = max(scores, key=scores.get)
            if scores[best_format] > 5:  # At least 5 questions
                return best_format
        
        return 'numbered'  # Default
    
    def _extract_questions(self, content: str, format_type: str) -> List[Dict]:
        """Extract question texts"""
        
        pattern = self.question_patterns.get(format_type, self.question_patterns['numbered'])
        matches = re.findall(pattern, content, re.MULTILINE | re.DOTALL)
        
        questions = []
        for match in matches:
            q_num, q_text = match
            questions.append({
                'number': int(q_num) if q_num.isdigit() else len(questions) + 1,
                'text': q_text.strip(),
                'options': []
            })
        
        return questions
    
    def _extract_options(self, content: str, questions: List[Dict]) -> List[Dict]:
        """Extract options for each question"""
        
        # Try each option pattern
        for pattern_name, pattern in self.option_patterns.items():
            all_options = re.findall(pattern, content, re.MULTILINE | re.DOTALL)
            
            if len(all_options) >= len(questions) * 2:  # At least 2 options per question
                logger.info(f"Using option pattern: {pattern_name}")
                
                # Group options by question
                option_index = 0
                for question in questions:
                    question_options = []
                    
                    # Get next 4 options (or until we run out)
                    for _ in range(4):
                        if option_index < len(all_options):
                            opt_letter, opt_text = all_options[option_index]
                            question_options.append({
                                'letter': opt_letter,
                                'text': opt_text.strip()
                            })
                            option_index += 1
                    
                    question['options'] = question_options
                
                break
        
        return questions
    
    def _find_answer_key(self, content: str) -> Dict[int, str]:
        """Find answer key in content"""
        
        # Try each answer key pattern
        for pattern_name, pattern in self.answer_key_patterns.items():
            matches = re.findall(pattern, content, re.MULTILINE)
            
            if len(matches) > 10:  # Valid answer key
                logger.info(f"Found answer key using pattern: {pattern_name}")
                answer_key = {}
                
                for q_num, answer in matches:
                    try:
                        answer_key[int(q_num)] = answer.upper()
                    except ValueError:
                        continue
                
                return answer_key
        
        return {}
    
    def _match_answers(self, questions: List[Dict], answer_key: Dict[int, str]) -> List[Dict]:
        """Match answers to questions"""
        
        for question in questions:
            q_num = question['number']
            
            if q_num in answer_key:
                correct_letter = answer_key[q_num]
                
                # Find the correct option and move it to first position
                options = question['options']
                correct_index = None
                
                for i, opt in enumerate(options):
                    if opt['letter'] == correct_letter:
                        correct_index = i
                        break
                
                if correct_index is not None and correct_index > 0:
                    # Move correct answer to first position
                    correct_opt = options.pop(correct_index)
                    options.insert(0, correct_opt)
                    question['options'] = options
        
        return questions
    
    def _convert_to_quiz_questions(self, questions: List[Dict]) -> List[QuizQuestion]:
        """Convert to QuizQuestion objects"""
        
        quiz_questions = []
        
        for q in questions:
            if not q['options'] or len(q['options']) < 2:
                continue  # Skip questions without enough options
            
            # Ensure exactly 4 options
            options = q['options'][:4]
            while len(options) < 4:
                options.append({'letter': chr(65 + len(options)), 'text': 'Option'})
            
            # Extract option texts
            option_texts = [opt['text'] for opt in options]
            
            quiz_question = QuizQuestion(
                id=f"exam_q{q['number']}",
                question=q['text'],
                options=option_texts
            )
            
            quiz_questions.append(quiz_question)
        
        return quiz_questions

# Global instance
exam_extractor = ExamExtractor()
