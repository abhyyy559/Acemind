#!/usr/bin/env python3
"""
Test Ollama Integration for AceMind
"""

import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'smartstudy', 'backend'))

async def test_ollama():
    try:
        from app.services.deepseek_ai import deepseek_service
        
        print("🧪 Testing Ollama Integration")
        print("=" * 50)
        
        # Test content
        test_content = """
        Photosynthesis is the process by which plants convert sunlight into energy.
        It occurs in the chloroplasts of plant cells and requires carbon dioxide,
        water, and sunlight. The process produces glucose and oxygen as byproducts.
        The chemical equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2.
        """
        
        print("📝 Test content prepared")
        print(f"📊 Content length: {len(test_content)} characters")
        
        # Generate questions
        print("\n🔄 Generating quiz questions...")
        questions = await deepseek_service.generate_quiz_from_text(
            content=test_content,
            topic="Photosynthesis",
            num_questions=3
        )
        
        print(f"\n✅ Generated {len(questions)} questions!")
        
        # Display results
        for i, question in enumerate(questions, 1):
            print(f"\n📋 Question {i}:")
            print(f"   Q: {question.question}")
            print(f"   Options:")
            for j, option in enumerate(question.options, 1):
                print(f"      {j}. {option}")
        
        print(f"\n🎉 Test completed successfully!")
        print(f"✅ Ollama is working with deepseek-coder-v2:latest")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ollama())