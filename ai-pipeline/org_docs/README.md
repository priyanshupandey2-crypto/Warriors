# Organisation Documents for RAG Layer

Place your organisation-specific project documentation files here as `.md` files.

## File Format

Each `.md` file must start with YAML frontmatter containing metadata tags:

```markdown
---
organisation: "Your Org Name"
project: "Project Name"
tags: ["AI", "Machine Learning", "NLP", "Computer Vision"]
description: "Brief description of what this project does"
---

# Project Name

Full documentation content goes here...
## Architecture
...
## Tech Stack
...
## Key Features
...
```

## How It Works

1. When a course is generated, the RAG layer scans all `.md` files in this directory
2. It matches the course **topic** and **tags** against each document's `tags` and content
3. If a relevant match is found (similarity score > threshold), the top matching document chunks are extracted
4. These chunks are fed to the LLM to generate an **organisation-specific final module** in the course
5. The module appears as the last module before the capstone project

## Tips for Quality Content

- **Use specific tags** — include both broad ("AI") and specific ("Reinforcement Learning") tags
- **Be detailed** — the more technical detail in your docs, the richer the generated module
- **Include architecture** — describe system design, tech stack, and technical decisions
- **Add use cases** — real examples of how the project solves problems
- **Multiple files OK** — you can have one file per project; the RAG layer searches all of them

## Example

See `_example_velocity_ai.md` for a complete example of a well-formatted org document.
