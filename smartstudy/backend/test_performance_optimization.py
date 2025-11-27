"""
Test script to verify performance optimization for large roadmaps.
Tests the conditional initialExpandLevel logic based on node count.
"""
import sys
import os
import re

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.llm_service import LLMService

def create_small_roadmap():
    """Create a roadmap with <50 nodes"""
    return """# Python Programming

## 🎯 Learning Goals
- Master Python basics
- Build web applications
- Understand data structures

## 🌱 Prerequisites
- Basic computer skills
- Text editor installed
- Python 3.8+ installed

## 📚 Core Concepts
- Variables and data types
- Control flow
- Functions
- Classes and objects

## 💻 Hands-on Practice
- Build a calculator
- Create a todo app
- Develop a web scraper

## 🚀 Advanced Topics
- Async programming
- Decorators
- Metaclasses

## 📈 Next Steps
- Contribute to open source
- Build portfolio projects
"""

def create_large_roadmap():
    """Create a roadmap with >50 nodes"""
    sections = []
    for i in range(10):
        section = f"""## Section {i+1}
- Topic {i+1}.1
  - Subtopic {i+1}.1.1
  - Subtopic {i+1}.1.2
  - Subtopic {i+1}.1.3
- Topic {i+1}.2
  - Subtopic {i+1}.2.1
  - Subtopic {i+1}.2.2
  - Subtopic {i+1}.2.3
- Topic {i+1}.3
  - Subtopic {i+1}.3.1
  - Subtopic {i+1}.3.2
"""
        sections.append(section)
    
    return "# Large Learning Roadmap\n\n" + "\n".join(sections)

def count_nodes(markdown):
    """Count nodes in markdown"""
    header_count = len(re.findall(r'^#{1,6}\s', markdown, re.MULTILINE))
    list_item_count = len(re.findall(r'^\s*[-*]\s', markdown, re.MULTILINE))
    return header_count + list_item_count

def test_small_roadmap():
    """Test that small roadmaps use expand level 2"""
    print("\n" + "="*60)
    print("TEST 1: Small Roadmap (<50 nodes)")
    print("="*60)
    
    service = LLMService()
    small_roadmap = create_small_roadmap()
    node_count = count_nodes(small_roadmap)
    
    print(f"Node count: {node_count}")
    print(f"Expected expand level: 2 (since {node_count} < 50)")
    
    html = service.convert_to_markmap(small_roadmap, output_file=None)
    
    # Check if initialExpandLevel is set to 2
    if "initialExpandLevel: 2" in html:
        print("✅ PASS: Small roadmap uses expand level 2")
        return True
    else:
        print("❌ FAIL: Small roadmap does not use expand level 2")
        return False

def test_large_roadmap():
    """Test that large roadmaps use expand level 1"""
    print("\n" + "="*60)
    print("TEST 2: Large Roadmap (>=50 nodes)")
    print("="*60)
    
    service = LLMService()
    large_roadmap = create_large_roadmap()
    node_count = count_nodes(large_roadmap)
    
    print(f"Node count: {node_count}")
    print(f"Expected expand level: 1 (since {node_count} >= 50)")
    
    html = service.convert_to_markmap(large_roadmap, output_file=None)
    
    # Check if initialExpandLevel is set to 1
    if "initialExpandLevel: 1" in html:
        print("✅ PASS: Large roadmap uses expand level 1")
        return True
    else:
        print("❌ FAIL: Large roadmap does not use expand level 1")
        return False

def test_html_structure():
    """Test that HTML contains all required elements for performance"""
    print("\n" + "="*60)
    print("TEST 3: HTML Structure and Performance Features")
    print("="*60)
    
    service = LLMService()
    roadmap = create_small_roadmap()
    html = service.convert_to_markmap(roadmap, output_file=None)
    
    checks = [
        ("duration: 300", "Animation duration set to 300ms"),
        ("maxWidth: 280", "Max width set to 280px"),
        ("mm.fit()", "Auto-fit functionality present"),
        ("d3.min.js", "D3.js library included"),
        ("markmap-lib", "Markmap library included"),
        ("markmap-view", "Markmap view included"),
    ]
    
    all_passed = True
    for check, description in checks:
        if check in html:
            print(f"✅ {description}")
        else:
            print(f"❌ {description} - NOT FOUND")
            all_passed = False
    
    return all_passed

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("PERFORMANCE OPTIMIZATION TESTS")
    print("="*60)
    
    results = []
    
    # Run tests
    results.append(("Small Roadmap Test", test_small_roadmap()))
    results.append(("Large Roadmap Test", test_large_roadmap()))
    results.append(("HTML Structure Test", test_html_structure()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️ {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    exit(main())
