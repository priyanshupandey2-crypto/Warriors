# Curriculum Discovery - Firecrawl Required

## Configuration

The curriculum discovery API **requires Firecrawl** to work.

### Setup Steps

1. **Get Firecrawl API Key**
   - Visit: https://www.firecrawl.dev/
   - Sign up and create an account
   - Copy your API key

2. **Set Environment Variable**
   
   **Option A: In .env file**
   ```
   FIRECRAWL_API_KEY=your-api-key-here
   ```

   **Option B: In shell (Linux/Mac)**
   ```bash
   export FIRECRAWL_API_KEY="your-api-key-here"
   python main.py
   ```

   **Option C: In PowerShell (Windows)**
   ```powershell
   $env:FIRECRAWL_API_KEY="your-api-key-here"
   python main.py
   ```

   **Option D: In Command Prompt (Windows)**
   ```cmd
   set FIRECRAWL_API_KEY=your-api-key-here
   python main.py
   ```

3. **Verify Setup**
   ```bash
   # Check if API key is accessible
   python -c "from app.config import Settings; print('API Key configured' if Settings().FIRECRAWL_API_KEY else 'API Key missing')"
   ```

## How It Works

```
API Request
    ↓
Generate source URLs (GeeksforGeeks, W3Schools, MDN, Roadmap.sh)
    ↓
Firecrawl extracts and chunks web content
    ↓
Claude LLM analyzes chunks
    ↓
Generate meaningful topics
    ↓
Generate subtopics with pedagogical structure
    ↓
Save to database
    ↓
Return curriculum response
```

## Testing

```bash
# Start backend
python main.py

# In another terminal, test curriculum discovery
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "JavaScript",
    "difficulty": "Beginner",
    "duration": "6 weeks"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "extracted_topics": [
      "Variables and Data Types",
      "Functions and Scope",
      "Object-Oriented Programming",
      "Asynchronous Programming"
    ],
    "extracted_subtopics": {
      "Variables and Data Types": [
        "Primitive Types",
        "Type Coercion",
        "Variable Declaration"
      ]
    },
    "quality_metrics": {
      "generation_method": "Claude LLM",
      "topics_generated": 4,
      "chunks_analyzed": 42,
      "sources_used": 8
    }
  }
}
```

## Error Handling

If Firecrawl key is not set:
```
Error: Failed to extract content from sources. 
Ensure FIRECRAWL_API_KEY is set and accessible.
```

Solution: Set the `FIRECRAWL_API_KEY` environment variable.

## What Firecrawl Does

1. **Web Crawling**: Visits URLs and extracts content
2. **Markdown Conversion**: Converts HTML to clean markdown
3. **Chunking**: Breaks content into logical pieces
4. **Metadata**: Extracts headings, concepts, links

Sources extracted from:
- GeeksforGeeks (geeksforgeeks.org)
- W3Schools (w3schools.com)
- MDN Web Docs (developer.mozilla.org)
- Roadmap.sh (roadmap.sh)

## Production Notes

- **Real Content**: Firecrawl extracts actual web resources
- **Quality**: Content-based curriculum generation
- **Scalability**: Caching prevents repeated extractions
- **Fallback**: None (Firecrawl is required)

## Support

- Firecrawl Docs: https://docs.firecrawl.dev/
- Firecrawl Dashboard: https://www.firecrawl.dev/

---

No demo data fallback. Firecrawl is required for curriculum discovery to work.
