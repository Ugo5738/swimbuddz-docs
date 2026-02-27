# 🚀 The Antigravity Orchestration Playbook

**Role:** Orchestrator (Human)  
**Tool:** Google Antigravity (Agent-First IDE)  
**Objective:** To build enterprise-grade software by managing a fleet of AI agents rather than writing code manually.

## 1. Workspace Setup (The "Office")

_Do this once at the start of every project._

In the **Agent Manager** sidebar, create 5 distinct conversation threads. **Rename them immediately** to represent your departments. Do not mix them.

- 📁 **Strategy & Product** (PM, BA, Scrum Master)
- 📐 **Architecture & DevOps** (Solution Architect, SRE)
- ⚙️ **Backend Engineering** (Python/API/Database Agents)
- 🎨 **Frontend & Design** (UI/UX, Browser Surface Agents)
- 🛡️ **QA & Security** (The Tester, The Auditor)

## 2. The "C-Suite" Prompts (Strategy Phase)

_Run these in the **Strategy & Product** thread before writing code._

### 🧠 The Product Manager (Vision)

**Trigger:** New project start or new major feature.

```
code
Text
@Planning Act as a Senior Product Manager.
Context: I want to build [Describe Feature/App].
Task:
1. Critique: Why might this fail? What are the risks?
2. MVP Definition: Define the absolute minimum scope for V1.
3. User Journey: Step-by-step flow from the user's perspective.
4. Success Metrics: Define 3 quantifiable goals.
```

### 📋 The Business Analyst (Specs)

**Trigger:** After the PM defines the feature.

```
code
Text
@Planning Act as a Technical Business Analyst.
Input: We are building the feature defined above.
Task: Create a 'Requirements Artifact'.
1. Write User Stories ("As a user, I want to...").
2. Define strict Acceptance Criteria (The "Definition of Done").
3. List Validation Rules (e.g., "Password must be 8 chars").
4. Define the Data Dictionary (Fields and Types needed).
```

## 3. The "Foundation" Prompts (Architecture Phase)

_Run these in the **Architecture & DevOps** thread._

### 🏗️ The Solution Architect (Blueprints)

**Trigger:** Before implementation begins.

```
code
Text
@Codebase Act as a Senior Solution Architect.
Goal: We are implementing [Feature Name].
Constraints: Scalable, Secure, Maintainable.
Task:
1. Analyze the current file structure.
2. Propose the specific Design Pattern to use (e.g., Service Layer, MVC).
3. Schema Design: Propose the exact database models/SQL.
4. Implementation Plan: List the files to create/edit in order.
```

### ☁️ The DevOps Engineer (Infrastructure)

**Trigger:** Project setup or deployment prep.

```
code
Text
@Codebase Act as a Site Reliability Engineer (SRE).
Goal: Production readiness.
Task:
1. Audit/Create the Dockerfile for minimal image size.
2. Create a CI/CD pipeline file (GitHub Actions) to run tests on push.
3. List necessary Environment Variables for Production.
4. Security Scan: Check settings.py/config for exposed secrets or debug modes.
```

## 4. The "Builder" Prompts (Execution Phase)

_Run these simultaneously in separate threads._

### ⚙️ The Backend Specialist

_Thread:_ Backend Engineering  
_Trigger:_ Executing the Architect's plan.

```
code
Text
@Codebase Act as a Senior Python Backend Engineer.
Goal: Implement the logic for [Feature].
Reference: Use the Architect's plan from the Artifact.
Task:
1. Write the core logic/services with strict Type Hinting.
2. Implement Error Handling (try/except) with logging.
3. Optimize for database query efficiency (avoid N+1).
```

### 🎨 The UI/UX Designer

**Thread:** Frontend & Design  
**Trigger:** Visualizing the data. **(Must have Browser Surface open)**

```
code
Text
@Browser Act as a UI/UX Designer and Frontend Expert.
Goal: Build/Refine the [Component Name].
Style Guide: Follow [Material/Tailwind/Theme] strictly.
Task:
1. Analyze the current view in the browser. Identify alignment/spacing issues.
2. Implement the code to fix it.
3. Ensure Mobile Responsiveness.
4. Verification: Take a screenshot after changes to confirm.
```

## 5. The "Guardian" Prompts (Quality Phase)

Run these in the **QA & Security** thread. Never skip this.

### 🕵️ The QA Engineer (The Janitor)

**Trigger:** When Builders say "Done."

```
code
Text
@Codebase Act as a QA Automation Engineer.
Goal: Break the code in [File/Folder].
Task:
1. Analyze the code for edge cases (Null inputs, massive data, network fail).
2. Write a test file `tests/test_[feature].py`.
3. Include: 1 Happy Path test, 3 Negative/Edge Case tests.
4. Run the tests and report results.
```

### 📝 The Documentation Manager

**Thread:** Strategy & Product (or dedicated Doc thread)  
**Trigger:** End of a session.

```
code
Text
@Codebase Act as a Technical Writer.
Task: Update documentation.
1. Update README.md with new setup instructions if changed.
2. Update CHANGELOG.md with today's work.
3. Add Docstrings to any function missing them in [Modified Files].
```

## 6. The Orchestration Loop (Your Workflow)

To maintain "Idempotency" (consistent success), run your day in this loop:

1. **The Stand-up (15 mins)**
   - Go to **Strategy Thread.**
   - Run **Scrum Master Prompt:** _"Summarize status and list top 3 priorities."_

2. **The Dispatch (5 mins)**
   - Open **Architecture Thread**: Get the plan for Priority #1.
   - Open **Backend Thread**: Paste plan, command _"Execute backend logic."_
   - Open **Frontend Thread**: Command _"Build UI stub for Priority #1."_

3. **The Monitoring (Deep Work)**
   - Watch the **Terminal/Logs**.
   - **Approve Artifacts**: Review the plans/diffs the agents submit.
   - **Unblock**: If an agent errors, step in (Editor Mode), fix the one line, tell them to retry.

4. **The Gatekeeping (Closing)**
   - Open **QA Thread**.
   - Command: "Run full test suite."
   - **Rule**: Do not deploy or merge until all tests pass.

## 7. The Golden Rules of the Orchestrator

1. **Never write code first.** Always ask for a **Plan Artifact** first.
2. **One Agent, One Context.** Don't ask the Backend agent to fix CSS. It degrades the model's performance. Switch threads.
3. **Trust but Verify.** Use the **QA Agent** to verify the **Builder Agent's** work. Never trust the Builder to test themselves (they hallucinate success).
4. **Commit Frequently.** Instruct agents to commit their work to git often so you can roll back if an agent goes rogue.
