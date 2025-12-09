import os
import re
import json
import logging
import google.generativeai as genai
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class LLMService:
    """
    A service to interact with Google's Gemini API for generating learning roadmaps.
    """
    def __init__(self):
        """
        Initializes the LLMService, configuring the Gemini API and model.
        """
        # Local LLM (Ollama) configuration - PRIMARY
        self.local_llm_base_url = os.getenv("LOCAL_LLM_BASE_URL", "http://localhost:11434")
        self.local_llm_model = os.getenv("LOCAL_LLM_MODEL", "deepseek-coder-v2:latest")
        self.use_local_llm = True  # Always use Ollama as primary

        # DeepSeek API configuration - SECONDARY
        self.deepseek_api_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.deepseek_base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
        
        # Gemini API configuration - TERTIARY
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-pro")  # Use the standard model
        
        # Simple Gemini configuration
        if self.api_key:
            try:
                # Configure the API
                logging.info("🔄 Initializing Gemini API...")
                genai.configure(api_key=self.api_key)
                
                # Basic configuration test
                try:
                    response = genai.GenerativeModel("gemini-pro").generate_content("Test")
                    if response and (hasattr(response, 'text') or hasattr(response, 'parts')):
                        logging.info("✅ Basic API test successful")
                except Exception as e:
                    logging.warning(f"⚠️ Basic API test failed: {e}")
                
                # Try to discover available models
                try:
                    models = genai.list_models()
                    # Just get all model names and log them
                    model_names = []
                    for model in models:
                        try:
                            name = model.name if hasattr(model, 'name') else str(model)
                            model_names.append(name)
                        except:
                            continue
                    
                    logging.info(f"📋 Available models: {model_names}")
                    
                    # Try to find a suitable model
                    candidates = [
                        "gemini-1.0-pro",
                        "gemini-pro",
                        "gemini-pro-vision",
                        "gemini-1.0-pro-001",
                        "models/gemini-1.0-pro",
                        "models/gemini-pro"
                    ]
                    
                    # Find the first available model from our candidates
                    for candidate in candidates:
                        if any(candidate in name for name in model_names):
                            self.model_name = candidate
                            break
                    else:
                        # If no exact match, try any model with 'gemini' in the name
                        for name in model_names:
                            if 'gemini' in name.lower():
                                self.model_name = name.replace('models/', '')
                                break
                        else:
                            raise ValueError("No Gemini model found")
                        
                    logging.info(f"✨ Selected model: {self.model_name}")
                    
                    # Test the configuration with selected model
                    model = genai.GenerativeModel(self.model_name)
                    response = model.generate_content("Test")
                    logging.info("✅ Gemini API configuration successful")
                except Exception as e:
                    logging.error(f"❌ Model discovery failed: {e}")
                    raise
            except Exception as e:
                logging.error(f"❌ Gemini API configuration failed: {e}")
                self.api_key = None  # Invalidate the key if it doesn't work

        # Always use Ollama as primary (already set to True in __init__)
        logging.info(
            f"LLMService initialized. Ollama: {self.use_local_llm}, DeepSeek API: {bool(self.deepseek_api_key)}, Gemini API: {bool(self.api_key)}"
        )

    def generate_roadmap(self, topic: str, difficulty_level: str = "beginner") -> str:
        """
        Generates a learning roadmap for a given topic and difficulty level.

        Args:
            topic: The learning topic (e.g., "Full-Stack Web Development").
            difficulty_level: The user's skill level (e.g., "beginner").

        Returns:
            A markdown string representing the learning roadmap.
        """
        prompt = self._create_roadmap_prompt(topic, difficulty_level)
        
        # Prefer local LLM endpoint (Ollama) - Primary choice
        if self.use_local_llm:
            try:
                logging.info(f"🤖 Generating roadmap via Ollama '{self.local_llm_model}' for: {topic}")
                resp = requests.post(
                    f"{self.local_llm_base_url}/api/generate",
                    json={
                        "model": self.local_llm_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "num_predict": 2048,  # Limit response length for faster generation
                        }
                    },
                    timeout=300,  # Increased timeout to 5 minutes for complex prompts
                )
                resp.raise_for_status()
                data = resp.json()
                content = data.get("response") or data.get("text") or ""
                if not content or len(content.strip()) < 50:
                    logging.warning("⚠️ Ollama returned empty/short content; trying Gemini fallback.")
                    if self.api_key:
                        return self._generate_with_gemini(topic, prompt)
                    return self._get_fallback_roadmap(topic)
                logging.info(f"✅ Successfully generated roadmap with Ollama ({len(content)} chars)")
                return content
            except Exception as e:
                logging.error(f"❌ Ollama call failed: {e}")
                # Try DeepSeek API first, then Gemini
                if self.deepseek_api_key:
                    logging.info("🔄 Falling back to DeepSeek API")
                    return self._generate_with_deepseek(topic, prompt)
                elif self.api_key:
                    logging.info("🔄 Falling back to Gemini API")
                    return self._generate_with_gemini(topic, prompt)
                return self._get_fallback_roadmap(topic)

        # Try DeepSeek API, then Gemini as fallback (only if Ollama is disabled)
        if self.deepseek_api_key:
            return self._generate_with_deepseek(topic, prompt)
        return self._generate_with_gemini(topic, prompt)
    
    def _generate_with_deepseek(self, topic: str, prompt: str) -> str:
        """Generate roadmap using DeepSeek API."""
        try:
            if not self.deepseek_api_key:
                logging.warning("⚠️ DEEPSEEK_API_KEY is not set, trying Gemini")
                if self.api_key:
                    return self._generate_with_gemini(topic, prompt)
                return self._get_fallback_roadmap(topic)
            
            logging.info(f"🔄 Generating roadmap with DeepSeek for topic: {topic}")
            
            headers = {
                "Authorization": f"Bearer {self.deepseek_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 2048
            }
            
            response = requests.post(
                f"{self.deepseek_base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            response.raise_for_status()
            data = response.json()
            
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if not content or len(content.strip()) < 100:
                logging.warning("⚠️ DeepSeek returned empty/short content, trying Gemini")
                if self.api_key:
                    return self._generate_with_gemini(topic, prompt)
                return self._get_fallback_roadmap(topic)
            
            logging.info(f"✅ Successfully generated roadmap with DeepSeek ({len(content)} chars)")
            return content
            
        except Exception as e:
            logging.error(f"❌ DeepSeek API error: {e}")
            # Try Gemini as final fallback
            if self.api_key:
                logging.info("🔄 Falling back to Gemini API")
                return self._generate_with_gemini(topic, prompt)
            return self._get_fallback_roadmap(topic)
    
    def _generate_with_gemini(self, topic: str, prompt: str) -> str:
        """Generate roadmap using Gemini API as fallback."""
        try:
            if not self.api_key:
                logging.warning("⚠️ GEMINI_API_KEY is not set, using fallback")
                return self._get_fallback_roadmap(topic)
            
            logging.info(f"🔄 Generating roadmap with Gemini for topic: {topic}")
            logging.info(f"📝 Using model: {self.model_name}")
            
            # Use the discovered model name
            model = genai.GenerativeModel(self.model_name)
            
            # Set minimal generation config
            generation_config = {
                "temperature": 0.7,
                "top_p": 1.0
            }
            
            logging.info(f"[LLM] Using Gemini model '{self.model_name}' for topic: {topic}")
            
            # First try: Generate with minimal configuration
            try:
                logging.info("🚀 Attempting Gemini API call")
                response = model.generate_content(
                    prompt,
                    generation_config=generation_config
                )
                
                if hasattr(response, 'text'):
                    content = response.text
                elif hasattr(response, 'parts'):
                    content = "".join([p.text for p in response.parts if hasattr(p, 'text')])
                else:
                    content = ""
                    
                logging.info(f"📝 Initial response length: {len(content) if content else 0} chars")
                
                if not content or len(content.strip()) < 100:
                    logging.warning("⚠️ Short response received, retrying with different params")
                    # Try again with even simpler call
                    response = model.generate_content(prompt)
                    content = response.text if hasattr(response, 'text') else ""
                    
            except Exception as e:
                logging.error(f"❌ Gemini call failed: {e}")
                try:
                    logging.info("🔄 Retrying with basic configuration")
                    # One last try with absolute minimal configuration
                    response = model.generate_content(prompt)
                    content = response.text if hasattr(response, 'text') else ""
                except Exception as e2:
                    logging.error(f"❌ All retries failed: {e2}")
                    raise
                
            if not content:
                logging.warning("[LLM] Gemini returned no usable content")
                raise RuntimeError("Gemini returned no usable content")
            
            logging.info(f"✅ Successfully generated roadmap with Gemini ({len(content)} chars)")
            return content
                
        except Exception as e:
            logging.error(f"[LLM] Gemini API error: {e}")
            return self._get_fallback_roadmap(topic)

    def estimate_duration(self, roadmap_markdown: str) -> str:
        """
        Estimates the learning duration based on the complexity of the roadmap.
        """
        sections = len(re.findall(r'^##\s', roadmap_markdown, re.MULTILINE))
        content_length = len(roadmap_markdown)
        
        if content_length < 1500:
            return "2-4 weeks"
        elif content_length < 3000:
            return "1-2 months"
        elif sections > 8:
            return "3-6 months"
        else:
            return "6-12 weeks"
    
    def convert_to_markmap(self, roadmap_markdown: str, output_file: str = "roadmap.html") -> str:
        """
        Converts markdown roadmap to interactive Markmap HTML visualization with classy, minimal UI.
        
        Args:
            roadmap_markdown: The markdown content from Gemini API
            output_file: Output filename for the HTML file
            
        Returns:
            The HTML content as a string
        """
        # Count nodes to optimize initial expand level
        # Count headers (##) and list items (-) as nodes
        header_count = len(re.findall(r'^#{1,6}\s', roadmap_markdown, re.MULTILINE))
        list_item_count = len(re.findall(r'^\s*[-*]\s', roadmap_markdown, re.MULTILINE))
        total_nodes = header_count + list_item_count
        
        # Set initial expand level based on node count
        # Level 2 for <50 nodes, level 1 for >=50 nodes
        initial_expand_level = 2 if total_nodes < 50 else 1
        
        logging.info(f"📊 Roadmap stats: {total_nodes} nodes (headers: {header_count}, items: {list_item_count}), expand level: {initial_expand_level}")
        
        # Escape the markdown content for JavaScript
        escaped_markdown = json.dumps(roadmap_markdown)
        
        html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Learning Roadmap</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0d1117;
            min-height: 100vh;
            color: #e6edf3;
            overflow: hidden;
        }}
        
        .container {{
            max-width: 1600px;
            margin: 20px auto;
            background: rgba(33, 38, 45, 0.8);
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            overflow: hidden;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(240, 246, 252, 0.1);
            height: calc(100vh - 40px);
            display: flex;
            flex-direction: column;
        }}
        
        .header {{
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: #e6edf3;
            padding: 24px 32px;
            text-align: center;
            position: relative;
            border-bottom: 1px solid rgba(240, 246, 252, 0.1);
            flex-shrink: 0;
        }}
        
        .header h1 {{
            margin: 0;
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }}
        
        .header p {{
            margin: 12px 0 0 0;
            font-size: 0.9rem;
            color: #e6edf3;
            opacity: 0.85;
        }}
        
        .mindmap-container {{
            position: relative;
            background: #0d1117;
            flex: 1;
            min-height: 0;
        }}
        
        #mindmap {{
            width: 100%;
            height: 100%;
        }}
        
        .controls {{
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }}
        
        .btn {{
            background: #21262d;
            color: #e6edf3;
            border: 1px solid #30363d;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }}
        
        .btn:hover {{
            background: #30363d;
            border-color: #484f58;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            transform: translateY(-1px);
        }}
        
        .btn:active {{
            transform: translateY(0) scale(0.98);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }}
        
        .btn:focus {{
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }}
        
        /* Markmap Node Styling - Dark Theme */
        .markmap-node {{
            cursor: pointer;
        }}
        
        .markmap-node circle {{
            stroke-width: 2px;
            transition: all 0.2s ease;
        }}
        
        .markmap-node:hover circle {{
            stroke-width: 3px;
            filter: brightness(1.2);
        }}
        
        .markmap-node text {{
            fill: #e6edf3;
            font-size: 14px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 500;
        }}
        
        /* Markmap Link Styling - Dark Theme */
        .markmap-link {{
            stroke-width: 2px;
            opacity: 0.6;
            transition: opacity 0.2s ease;
        }}
        
        .markmap-node:hover ~ .markmap-link,
        .markmap-link:hover {{
            opacity: 0.9;
        }}
        
        /* SVG Background for better contrast */
        #mindmap {{
            background: #0d1117;
        }}
        
        .loading {{
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(21, 26, 33, 0.95);
            padding: 24px;
            border-radius: 12px;
            z-index: 100;
            color: #e6edf3;
        }}
        
        .spinner {{
            width: 32px;
            height: 32px;
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
        }}
        
        @keyframes spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
        }}
        
        /* Print Styles */
        @media print {{
            body {{
                background: white;
            }}
            
            .container {{
                max-width: 100%;
                margin: 0;
                box-shadow: none;
                border: none;
                height: auto;
            }}
            
            .controls {{
                display: none !important;
            }}
            
            .controls button {{
                display: none !important;
            }}
            
            .header {{
                background: white;
                color: black;
                border-bottom: 2px solid #e5e7eb;
            }}
            
            .header h1 {{
                background: none;
                -webkit-text-fill-color: #1f2937;
                color: #1f2937;
            }}
            
            .header p {{
                color: #6b7280;
            }}
            
            .mindmap-container {{
                background: white;
            }}
            
            .markmap-node text {{
                fill: #1f2937;
            }}
            
            .loading {{
                display: none !important;
            }}
        }}
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-lib@0.15.3/dist/browser/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.15.3/dist/browser/index.js"></script>
</head>
<body>
    <!-- Control Buttons -->
    <div class="controls">
        <button class="btn" onclick="expandAll()">📂 Expand All</button>
        <button class="btn" onclick="collapseAll()">📁 Collapse All</button>
        <button class="btn" onclick="fitScreen()">🔍 Fit Screen</button>
        <button class="btn" onclick="downloadHTML()">💾 Download HTML</button>
    </div>
    
    <div class="container">
        <div class="header">
            <h1>🎯 Interactive Learning Roadmap</h1>
            <p>Click nodes to expand • Drag to navigate • Scroll to zoom</p>
        </div>
        <div class="mindmap-container">
            <svg id="mindmap"></svg>
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <div>Loading...</div>
            </div>
        </div>
    </div>

    <script>
        var mm;
        var markdown = {escaped_markdown};
        
        function init() {{
            document.getElementById('loading').style.display = 'block';
            
            setTimeout(function() {{
                try {{
                    var transformer = new window.markmap.Transformer();
                    var data = transformer.transform(markdown).root;
                    
                    mm = window.markmap.Markmap.create('#mindmap', {{
                        color: function(node) {{
                            var colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                            return colors[node.depth % 5];
                        }},
                        duration: 300,
                        maxWidth: 280,
                        initialExpandLevel: {initial_expand_level}
                    }}, data);
                    
                    mm.fit();
                    document.getElementById('loading').style.display = 'none';
                }} catch(e) {{
                    console.error(e);
                    document.getElementById('loading').style.display = 'none';
                }}
            }}, 100);
        }}
        
        function fitScreen() {{
            if (mm) mm.fit();
        }}
        
        function expandAll() {{
            if (!mm) return;
            
            var transformer = new window.markmap.Transformer();
            var data = transformer.transform(markdown).root;
            
            // Recursively set fold=0 on all nodes
            function forceExpand(node) {{
                if (node.payload) {{
                    delete node.payload.fold;
                }}
                node.payload = node.payload || {{}};
                node.payload.fold = 0;
                
                if (node.children) {{
                    node.children.forEach(forceExpand);
                }}
            }}
            
            forceExpand(data);
            mm.setData(data);
            mm.fit();
        }}
        
        function collapseAll() {{
            if (!mm) return;
            
            var transformer = new window.markmap.Transformer();
            var data = transformer.transform(markdown).root;
            
            // Set fold=1 on all non-root nodes
            function foldAll(node, isRoot) {{
                if (!isRoot) {{
                    node.payload = node.payload || {{}};
                    node.payload.fold = 1;
                }}
                if (node.children) {{
                    node.children.forEach(child => foldAll(child, false));
                }}
            }}
            
            foldAll(data, true);
            mm.setData(data);
            mm.fit();
        }}
        
        function downloadHTML() {{
            // Get complete HTML document
            var fullHTML = document.documentElement.outerHTML;
            
            // Create blob and download with date-stamped filename
            var blob = new Blob([fullHTML], {{ type: 'text/html;charset=utf-8' }});
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'mindmap-' + new Date().toISOString().split('T')[0] + '.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }}
        
        init();
    </script>
</body>
</html>"""
        
        # Write to file if output_file is provided
        if output_file:
            try:
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(html_template)
                logging.info(f"✅ Interactive roadmap saved to {output_file}")
            except Exception as e:
                logging.error(f"Failed to write HTML file: {e}")
        
        return html_template

    def _create_roadmap_prompt(self, topic: str, difficulty_level: str) -> str:
        """Create a prompt for generating the roadmap."""
        current_year = "2025"
        
        prompt = f'''Create a learning roadmap for {topic} at {difficulty_level} level.

Use this exact structure with 4-6 points per section:

## 🎯 Learning Goals
- [Specific goal with outcome]
- [Skill to master]
- [Project to build]

## 🌱 Prerequisites  
- [Required knowledge]
- [Tools needed]
- [Time estimate]

## 📚 Core Concepts
- [Key concept 1]
- [Key concept 2]
- [Key concept 3]

## 💻 Hands-on Practice
- [Project 1]
- [Project 2]
- [Exercise]

## 🚀 Advanced Topics
- [Advanced topic 1]
- [Advanced topic 2]

## 📈 Next Steps
- [Career path]
- [Further learning]

Be specific with tool names and versions. Focus on {current_year} best practices.'''
        return prompt

    def _get_fallback_roadmap(self, topic: str) -> str:
        """Generate a basic roadmap when API calls fail."""
        return f"""# Learning Roadmap: {topic}

## 🎯 Learning Goals
- Understand core concepts
- Build practical skills
- Develop professional expertise

## 🌱 Prerequisites
- Basic computer skills
- Willingness to learn
- Internet access and development environment

## 📚 Core Concepts
- Fundamental principles
- Essential terminology
- Basic techniques

## 💻 Hands-on Practice
- Start with tutorials
- Complete exercises
- Build sample projects

## 🚀 Advanced Topics
- Specialized areas
- Industry standards
- Best practices

## 📈 Next Steps
- Join communities
- Contribute to projects
- Explore career opportunities"""

    def _generate_with_local_llm(self, topic: str, prompt: str) -> str:
        """Generate roadmap using the local LLM."""
        try:
            resp = requests.post(
                f"{self.local_llm_base_url}/api/generate",
                json={
                    "model": self.local_llm_model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=60
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "") or data.get("text", "") or self._get_fallback_roadmap(topic)
        except Exception as e:
            logging.error(f"Local LLM generation failed: {e}")
            return self._get_fallback_roadmap(topic)

    async def generate_quick_template(self, topic: str) -> str:
        """
        Generates a quick roadmap template for a given topic.
        """
        return f"""# Quick Roadmap for {topic}

## Introduction
- Overview of {topic}

## Key Concepts
- Concept 1
- Concept 2

## Next Steps
- Further learning
- Practice"""