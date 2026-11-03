# PaperPilot — Research Paper Submission Assistant

PaperPilot is a focused author-support web application created for the Full Stack Development CIA challenge. It helps authors prepare paper details, review a readiness checklist, and organize local submission-tracking records.

## Features
- Responsive layout with sidebar navigation and mobile menu.
- Conference directory loaded using Fetch API from a JSON file.
- Search conferences by name, location or category.
- Select a conference from the directory to prefill the submission workflow.
- Paper preparation form with required-field, email, abstract-length and PDF type/size validation.
- Live title and abstract character counters.
- Four-item readiness checklist with a dynamic progress indicator.
- Save, search, filter, manually update status and delete local preparation records.
- Dashboard statistics, recent activity, loading/error/empty states.
- Local browser persistence using localStorage and JSON serialization.

## Run in VS Code
1. Extract the ZIP file.
2. Open the `PaperPilot_Final` folder in VS Code.
3. Install the **Live Server** extension (Ritwick Dey) if needed.
4. Right-click `index.html` and select **Open with Live Server**.
5. The application should open at an address similar to `http://127.0.0.1:5500/index.html`.

You can also run `python -m http.server 5500` from this folder and open `http://localhost:5500`.

Do not open `index.html` using a `file://` address because browsers may block the Fetch API request for the JSON file.

## Technology mapping
| CIA requirement | Implementation |
|---|---|
| HTML5 | Semantic header, nav, main, section, form, labels and buttons |
| Tailwind CSS | Tailwind CDN is included; custom CSS provides the branded layout and responsive behaviour |
| JavaScript events | Navigation clicks, search input, form submit/reset, checklist change, file change, filters and status actions |
| Form validation | Required fields, email format, abstract minimum length, PDF MIME type and 5 MB limit, readiness checklist |
| Fetch API | `fetch('./data/conferences.json')` loads conference records |
| JSON | `response.json()` parses conference data; `JSON.stringify()` stores structured records |
| Error/loading/empty states | Conference loading and failure messages, no search results, no submissions yet |
| GitHub/deployment | Static files can be pushed to GitHub and deployed using GitHub Pages, Netlify or Vercel |

## Testing checklist
- [ ] Open the project using Live Server.
- [ ] Confirm four sample conferences load.
- [ ] Search by conference name and location.
- [ ] Select a conference and confirm it appears in the form.
- [ ] Try saving with required fields empty.
- [ ] Try an invalid email address.
- [ ] Try an abstract shorter than 40 characters.
- [ ] Try a non-PDF file or PDF larger than 5 MB.
- [ ] Try saving without completing all checklist items.
- [ ] Complete the form and save a preparation record.
- [ ] Confirm dashboard counts and My submissions update.
- [ ] Search and filter saved records.
- [ ] Mark a record as submitted and delete a record.
- [ ] Refresh the page and confirm records persist in the same browser.

## Important limitations
- Conference records are illustrative sample data, not live conference listings or CMT data.
- Submission records are saved in the current browser using localStorage; there is no backend database or multi-user account system.
- A selected PDF is validated in the browser but is not uploaded or stored.
- “Mark submitted” is a manual tracking action. PaperPilot does not submit papers to conferences or verify external submission status.
- Official deadlines, formatting rules and conference instructions must be checked on the relevant conference website.
- Tailwind CSS and Google Fonts are loaded from CDNs, so an internet connection is needed for those external assets.

## Suggested project explanation
PaperPilot complements a conference management system by focusing on the author-preparation stage. The application helps an author collect paper details, check readiness and maintain a personal record. It does not claim that the benchmark platform lacks these functions; it provides a separate, focused workflow for the selected user group.
