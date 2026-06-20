---
name: clarify-behavior
description: Clarify and document a specific app behavior for the Summer Cup PWA. Use when the user wants to define, adjust, or question how a feature or role should behave. The clarification is written to the relevant docs/ file so it is permanent. Invoke when user says things like "clarify behavior", "document how X works", "update the spec for", "define what happens when".
tools: Read, Glob, Edit, Write
---

# Clarify Behavior

Guide the user through specifying a behavior and write the result to the appropriate `docs/` file.

## Context

The Summer Cup app has documentation in two areas:
- `docs/roles/` — behavior per user profile (jogador, treinador, diretor, arbitro, pavilhao)
- `docs/data-sources/` — column definitions and URLs for each Google Sheet
- `docs/index.md` — overview and access matrix

## Workflow

### Step 1 — Understand what needs clarifying

Read the args passed to this skill. If no args were provided, ask the user:
> "What behavior do you want to clarify? (e.g. 'what the Diretor sees on the home screen', 'how the ARB code maps to a referee group', 'what filters apply to Alimentação for Pavilhão')"

### Step 2 — Find the relevant doc(s)

Based on the topic, identify which file(s) to update:
- Behavior of a role → `docs/roles/<role>.md`
- Data structure or column definition → `docs/data-sources/<sheet>.md`
- Access matrix → `docs/index.md`
- Multiple roles or cross-cutting concern → update each affected file

Read the relevant file(s) before proceeding.

### Step 3 — Present current spec and ask for clarification

Show the user the current documented behavior for that area, then ask specific questions to fill any gaps. Examples:

- "The current spec says X. Is that still correct or should it change?"
- "This behavior is not yet documented — what should happen?"
- "Should this apply to all days or only specific days?"
- "Is this the same for Treinador and Diretor, or different?"

Keep questions focused — one or two at a time, not a list of ten.

### Step 4 — Write the clarification

Once the user confirms the behavior, update the relevant `docs/` file:

- Add or rewrite the relevant section with the clarified behavior
- Be specific: include conditions, edge cases, and filters mentioned
- If there is a "Diferença vs Implementação Atual" section and the clarification reveals a gap in the code, update or add that section
- Do NOT change unrelated sections

### Step 5 — Confirm and summarise

Tell the user:
- Which file(s) were updated
- What changed (one line per change)
- If the clarification implies a code change in `index.html`, mention it explicitly so it can be tracked

## Rules

- Always read the existing doc before editing it
- Never overwrite sections unrelated to the clarified behavior
- If the clarification contradicts something already documented, flag the conflict and ask the user to resolve it before writing
- Keep the docs in Portuguese (same language as the existing content)
