# Interview Prep — Q&A

A personal, searchable question & answer knowledge base for interview prep.
Read it anywhere — it's a static site hosted on GitHub Pages.

**Live site:** https://slkadlag.github.io/interview-prep-qa/

## Features

- 🔎 **Search** across questions, answers, and categories
- 🏷️ **Category filters** with per-category counts
- ▾ **Collapsible answers** (click a question to expand)
- 🌗 **Light / dark mode** (remembers your choice)
- 📱 **Responsive** — works on phone, tablet, and desktop
- ✍️ **Markdown answers** with code syntax highlighting

## How it works

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `styles.css` | Styling, theming, responsive layout |
| `app.js` | Loads data, renders cards, search + filter + theme logic |
| `questions.json` | **The data** — all questions and answers live here |

The site reads `questions.json` at load time and renders everything client-side.
There is no build step.

## Adding questions

Append an object to the array in `questions.json`:

```json
{
  "id": 5,
  "category": "System Design",
  "question": "What is a load balancer?",
  "answer": "Distributes incoming traffic across servers...\n\n```text\nclient → load balancer → [server A | server B]\n```"
}
```

- `answer` supports **Markdown** (headings, lists, tables, **bold**, and ```code``` blocks).
- Use `\n` for line breaks within the JSON string.
- `id` should be unique; `category` groups the question into a filter chip.

Commit and push — GitHub Pages redeploys automatically (usually within a minute).

## Local preview

Because the page fetches `questions.json`, open it through a local server
(not `file://`):

```bash
cd interview-prep-qa
python3 -m http.server 8000
# then visit http://localhost:8000
```
