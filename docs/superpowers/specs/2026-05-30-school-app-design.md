# School App — Phase 1 Design Spec
**Date:** 2026-05-30
**Status:** Approved

---

## Overview

A web-based study app for a biology student. Accessible from an iPad or laptop via a browser. No login — the app opens directly to the user's data. Phase 1 covers note-taking and a diagram labeling quiz.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Handwriting canvas | perfect-freehand |
| Diagram canvas | Konva.js |
| Database | Supabase (cloud PostgreSQL) |
| File storage | Supabase Storage (diagram images) |
| Auth | None — Supabase credentials hardcoded in app |

---

## Layout

- **Top tabs** — one tab per class, plus an Add button
- **Left panel** — topics within the selected class
- **Right content area** — notes and diagrams for the selected topic

---

## Feature 1: Note-Taking

### Structure
```
Classes → Topics → Notes
```

### Behaviour
- Create, rename, and delete classes
- Create, rename, and delete topics within a class
- Create, rename, and delete notes within a topic
- Each note has a typed title and a freehand drawing canvas for the body
- Canvas supports Apple Pencil input via perfect-freehand (pressure-sensitive, smooth strokes)
- Pen toolbar: colour picker, pen thickness, eraser
- Note content stored as stroke JSON in Supabase (resolution-independent, editable)
- Notes are searchable by title only — content is not indexed
- Notes list shows title and last edited date, sorted by most recently edited

---

## Feature 2: Diagram Labeling Quiz

### Structure
```
Classes → Topics → Diagrams → Labels
```

### Setup — Mode A: Image Already Has Labels
For textbook diagrams where labels are already printed on the image.

1. Upload an image
2. Draw rectangles over each printed label on the image
3. Type what each label says (this becomes the answer)
4. Save

### Setup — Mode B: Clean Image (No Labels)
For diagrams with no existing labels.

1. Upload an image
2. Click any spot on the image to place a pin
3. Type the label name for that pin
4. Repeat for all structures to be memorised
5. Save

### Quiz Mode (Both Modes)
- **Mode A:** Rectangles render as blank boxes covering the printed labels. User types their answer into each box.
- **Mode B:** Pins are visible but label text is hidden. User types what each pin represents.
- **Reveal:** User submits answers. Each label shows green (correct) or red (incorrect) with the correct answer displayed.

---

## Database Schema

```
classes
  id          uuid PK
  name        text
  color       text

topics
  id          uuid PK
  class_id    uuid FK → classes.id
  name        text

notes
  id          uuid PK
  topic_id    uuid FK → topics.id
  title       text        -- typed
  content     jsonb       -- { strokes: [...], version: 1 }
  updated_at  timestamp

diagrams
  id          uuid PK
  topic_id    uuid FK → topics.id
  name        text
  image_url   text   (Supabase Storage URL)
  mode        text   ('labeled' | 'clean')

diagram_labels
  id          uuid PK
  diagram_id  uuid FK → diagrams.id
  label_text  text
  -- Mode A fields
  x           float
  y           float
  width       float
  height      float
  -- Mode B fields
  pin_x       float
  pin_y       float
```

---

## Auth

No login screen. Supabase `ANON_KEY` and `PROJECT_URL` are hardcoded as environment variables in the frontend build. The app opens directly to the user's data.

---

## Out of Scope (Phase 1)

The following features from the original vault note are deferred to later phases:
- Planner and grade tracker
- AI note summarizer
- Anatomy flashcards
- User authentication / multi-user support

---

## Phase 2 Candidates
- Planner (assignments, deadlines, study sessions)
- Grade tracker
- AI-powered note summarizer
- Anatomy flashcards
