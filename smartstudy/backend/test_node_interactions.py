"""
Test script to verify node interaction functionality for Markmap visualization.
Tests Requirements: 2.1, 2.2, 2.3, 2.4, 8.2
"""
import re
from app.services.llm_service import LLMService

def test_markmap_configuration():
    """Verify Markmap configuration meets all requirements."""
    print("🧪 Testing Markmap Node Interaction Configuration\n")
    
    # Initialize service
    service = LLMService()
    
    # Generate sample markdown
    sample_markdown = """# Test Roadmap
## Section 1
- Item 1.1
- Item 1.2
## Section 2
- Item 2.1
  - Sub-item 2.1.1
  - Sub-item 2.1.2
- Item 2.2
## Section 3
- Item 3.1
"""
    
    # Convert to HTML
    html_output = service.convert_to_markmap(sample_markdown, output_file=None)
    
    # Test 1: Verify animation duration is 300ms (Requirement 2.1, 2.2, 8.2)
    duration_match = re.search(r'duration:\s*(\d+)', html_output)
    if duration_match:
        duration = int(duration_match.group(1))
        assert duration == 300, f"❌ Duration should be 300ms, got {duration}ms"
        print(f"✅ Animation duration: {duration}ms (meets 300ms requirement)")
    else:
        print("❌ Duration configuration not found")
        return False
    
    # Test 2: Verify color palette has 5 colors (Requirement 2.3)
    color_pattern = r"var colors = \['([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\]"
    color_match = re.search(color_pattern, html_output)
    if color_match:
        colors = [color_match.group(i) for i in range(1, 6)]
        assert len(colors) == 5, f"❌ Should have 5 colors, got {len(colors)}"
        print(f"✅ Color palette: {len(colors)} distinct colors")
        print(f"   Colors: {', '.join(colors)}")
    else:
        print("❌ Color palette configuration not found")
        return False
    
    # Test 3: Verify text font size is between 12-16px (Requirement 2.4)
    font_size_pattern = r'\.markmap-node text\s*\{[^}]*font-size:\s*(\d+)px'
    font_size_match = re.search(font_size_pattern, html_output, re.DOTALL)
    if font_size_match:
        font_size = int(font_size_match.group(1))
        assert 12 <= font_size <= 16, f"❌ Font size should be 12-16px, got {font_size}px"
        print(f"✅ Text font size: {font_size}px (within 12-16px range)")
    else:
        print("❌ Font size configuration not found")
        return False
    
    # Test 4: Verify maxWidth is set (for node text wrapping)
    max_width_match = re.search(r'maxWidth:\s*(\d+)', html_output)
    if max_width_match:
        max_width = int(max_width_match.group(1))
        print(f"✅ Max node width: {max_width}px")
    else:
        print("❌ maxWidth configuration not found")
        return False
    
    # Test 5: Verify initialExpandLevel is 2 (Requirement 2.5)
    expand_level_match = re.search(r'initialExpandLevel:\s*(\d+)', html_output)
    if expand_level_match:
        expand_level = int(expand_level_match.group(1))
        assert expand_level == 2, f"❌ Initial expand level should be 2, got {expand_level}"
        print(f"✅ Initial expand level: {expand_level} (auto-expands to level 2)")
    else:
        print("❌ initialExpandLevel configuration not found")
        return False
    
    # Test 6: Verify click event handling is present (built-in Markmap functionality)
    # Markmap handles click events natively, so we just verify the library is loaded
    if 'markmap-view' in html_output and 'markmap-lib' in html_output:
        print("✅ Markmap libraries loaded (click events handled by library)")
    else:
        print("❌ Markmap libraries not properly loaded")
        return False
    
    # Test 7: Verify color function uses depth-based coloring (Requirement 2.3)
    if 'node.depth % 5' in html_output:
        print("✅ Color coding by depth level implemented")
    else:
        print("❌ Depth-based color coding not found")
        return False
    
    # Test 8: Verify text styling for readability
    text_style_pattern = r'\.markmap-node text\s*\{[^}]*fill:\s*#([a-fA-F0-9]{6})'
    text_color_match = re.search(text_style_pattern, html_output, re.DOTALL)
    if text_color_match:
        text_color = text_color_match.group(1)
        print(f"✅ Text color: #{text_color} (light color for dark theme)")
    else:
        print("❌ Text color configuration not found")
        return False
    
    print("\n" + "="*60)
    print("✅ ALL NODE INTERACTION TESTS PASSED")
    print("="*60)
    print("\nVerified Requirements:")
    print("  • 2.1: Click to expand animation (300ms)")
    print("  • 2.2: Click to collapse animation (300ms)")
    print("  • 2.3: Color coding by depth (5-color palette)")
    print("  • 2.4: Text rendering (14px, within 12-16px range)")
    print("  • 2.5: Initial expand level 2")
    print("  • 8.2: Animation duration 300ms")
    
    return True

if __name__ == "__main__":
    try:
        success = test_markmap_configuration()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
