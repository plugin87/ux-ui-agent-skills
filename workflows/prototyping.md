# Prototyping & User Research Workflow

A structured approach to prototyping at the right fidelity, gathering user feedback, and iterating toward validated solutions.

---

## 5-Level Fidelity Ladder

Move up the ladder as confidence increases. Never jump to high fidelity before validating the concept.

### Level 1: Content-First (Text Only)
**Output:** Plain text outline, bullet points, content hierarchy
**Time:** 15–30 minutes
**Tools:** Text editor, markdown
**Purpose:** Validate information architecture and content strategy before any visual work

```markdown
# Dashboard
## KPI Section
- Total Revenue: $X (↑ 12% from last month)
- Active Users: X (↓ 3% from last week)
- Conversion Rate: X% (→ stable)
- Support Tickets: X (↑ 5 new today)

## Primary Chart
- Revenue over time (last 30 days)
- Comparison toggle: vs. previous period

## Recent Activity
- Table: [User] did [Action] on [Object] at [Time]
- Max 10 rows, "View all" link
```

**Validate:** Does the content answer the user's questions? Is anything missing? Is the order right?

### Level 2: Wireframe (Layout)
**Output:** Box-and-line layout, grayscale, no visual design
**Time:** 1–2 hours
**Tools:** Figma (wireframe), Excalidraw, paper sketches
**Purpose:** Validate layout, information hierarchy, and navigation flow

**What to include:**
- Content zones with correct proportions
- Navigation structure
- Interactive elements (buttons, inputs) as gray boxes
- Annotations for behavior ("this opens a modal", "this filters the list")

**What NOT to include:**
- Colors, typography choices, icons
- Pixel-perfect spacing
- Animations or transitions

**Validate:** Can users find what they need? Is the navigation intuitive? Do the content zones make sense?

### Level 3: Low-Fidelity Prototype (Interactive)
**Output:** Clickable wireframes with basic navigation flow
**Time:** 2–4 hours
**Tools:** Figma prototyping, HTML/CSS rough prototype
**Purpose:** Validate user flows and task completion

**What to include:**
- Clickable navigation between screens
- Form flows (multi-step)
- Key interactions (open/close, expand/collapse)
- Error states and empty states
- Real-ish content (not Lorem Ipsum)

**Validate:** Can users complete the primary task? Where do they get stuck? How many steps does it take?

### Level 4: High-Fidelity Mockup (Visual Design)
**Output:** Pixel-perfect designs with design tokens applied
**Time:** 4–8 hours per page
**Tools:** Figma with design system components
**Purpose:** Validate visual design, brand alignment, and design system compliance

**What to include:**
- All design tokens applied (colors, typography, spacing, shadows)
- All component states (default, hover, focus, disabled, error, loading)
- Responsive layouts (mobile, tablet, desktop)
- Dark mode (if applicable)
- All edge cases (empty, overflow, error)

**Validate:** Does it feel right? Is the brand consistently applied? Are there any accessibility issues?

### Level 5: Production Prototype (Code)
**Output:** Working code with real interactions, fake data
**Time:** 1–3 days
**Tools:** React/Next.js with design system components
**Purpose:** Validate technical feasibility, real-device behavior, performance, and accessibility

**What to include:**
- Real components from the design system
- Realistic data (seeded, not Lorem Ipsum)
- Real interactions (forms submit, lists filter, modals open)
- Responsive behavior on real devices
- Keyboard navigation and screen reader support

**Validate:** Does it perform well? Does it feel responsive? Are there technical constraints that require design changes?

---

## User Journey Mapping

### Template

```
Journey: [User Goal — e.g., "Purchase a subscription"]
Persona: [Who — e.g., "Small business owner, non-technical"]
Context: [Where/When — e.g., "Mobile, during commute"]

Phase 1: Awareness
├── Action: Sees ad / lands on homepage
├── Touchpoint: Landing page
├── Thought: "Does this solve my problem?"
├── Emotion: Curious (neutral) 
├── Opportunity: Clear value prop above the fold
└── Metric: Bounce rate

Phase 2: Exploration
├── Action: Browses features, reads case studies
├── Touchpoint: Features page, testimonials
├── Thought: "How does this compare to alternatives?"
├── Emotion: Evaluating (unsure) 
├── Opportunity: Comparison table, social proof
└── Metric: Pages per session, time on site

Phase 3: Decision
├── Action: Views pricing, starts trial
├── Touchpoint: Pricing page, sign-up flow
├── Thought: "Is it worth it? What if I don't like it?"
├── Emotion: Anxious (unhappy) 
├── Opportunity: Free trial, money-back guarantee, simple pricing
└── Metric: Trial sign-up rate

Phase 4: Onboarding
├── Action: Sets up account, imports data
├── Touchpoint: Onboarding wizard, dashboard
├── Thought: "How do I get started?"
├── Emotion: Overwhelmed → Relieved (anxious) →(satisfied) 
├── Opportunity: Progressive disclosure, guided setup, quick wins
└── Metric: Onboarding completion rate, time to first value

Phase 5: Retention
├── Action: Regular use, discovers advanced features
├── Touchpoint: Dashboard, notifications, reports
├── Thought: "This is part of my workflow now"
├── Emotion: Confident (satisfied) 
├── Opportunity: Feature discovery, personalization, integrations
└── Metric: DAU/MAU, feature adoption, NPS
```

---

## Information Architecture Methodology

### Card Sorting (Discover Mental Models)

**Open Card Sort** — Users group and label content themselves
1. Write each content item / feature on a card (30–60 cards)
2. Ask 5–15 users to group cards into categories they define
3. Analyze: Look for common groupings and label patterns
4. Use findings to inform navigation structure

**Closed Card Sort** — Users sort content into predefined categories
1. Define your proposed categories (navigation labels)
2. Give users the same cards
3. Ask them to place each card in the most appropriate category
4. Measure: % agreement per card. < 60% agreement = confusing category

### Tree Testing (Validate Navigation)

1. Create a text-only hierarchy of your navigation (no visual design)
2. Give users tasks: "Where would you find [X]?"
3. Measure:
   - **Success rate**: % who found the right location
   - **Directness**: % who went straight there (no backtracking)
   - **Time**: How long to complete each task
4. Target: > 80% success rate, > 60% directness

---

## Usability Testing Script Template

### Before the Session (5 min)

```
"Hi [Name], thanks for joining today. I'm [Your Name].

We're testing [product/feature], not testing you — there are no wrong answers.

I'll ask you to complete some tasks while thinking out loud. Tell me what you're
looking at, what you're thinking, and what you expect to happen.

I might not answer questions during the tasks because I want to see how you'd
figure things out on your own. I'll answer everything after.

This session will take about [30-45] minutes. Any questions before we start?"
```

### Task Format

```
Task [N]: [Clear, goal-oriented instruction]
─────────────────────────────────────────
Scenario: "Imagine you're [context]. You want to [goal]."
Task: "Starting from this page, [specific action]."
Success criteria: [What "done" looks like]
Observe:
  □ Did they find the right path?
  □ How long did it take?
  □ Did they hesitate or backtrack?
  □ Any verbal confusion or frustration?
  □ Did they use the expected interaction pattern?
```

### Example Tasks

```
Task 1: Find Information
Scenario: "You're a new user who just signed up."
Task: "Find the setting to change your notification preferences."
Success: User navigates to Settings → Notifications
Time limit: 2 minutes

Task 2: Complete an Action
Scenario: "You need to add a new team member to your project."
Task: "Invite alex@example.com as an editor to the 'Q1 Campaign' project."
Success: Invitation sent with correct role
Time limit: 3 minutes

Task 3: Recover from Error
Scenario: "You accidentally deleted an important item."
Task: "Recover the item you just deleted."
Success: Item restored from trash/undo
Time limit: 2 minutes
```

### Post-Task Questions
After each task:
1. "How easy or difficult was that?" (1–5 scale)
2. "Was there anything confusing?"
3. "What did you expect to happen when you clicked [X]?"

### Post-Session Questions (5 min)
1. "What was your overall impression?"
2. "What was the easiest part? The hardest?"
3. "Is there anything you expected to find but didn't?"
4. "Would you use this? Why or why not?"
5. "Any other feedback?"

### Synthesis Template

| Task | Success Rate | Avg Time | Avg Difficulty | Key Observations |
|------|-------------|----------|---------------|-----------------|
| 1. Find notifications | 4/5 (80%) | 45s | 2.1/5 | 1 user looked in Profile first |
| 2. Invite team member | 3/5 (60%) | 2m 10s | 3.8/5 | Role picker was confusing |
| 3. Recover deleted item | 5/5 (100%) | 15s | 1.2/5 | Undo toast worked well |

**Top Findings:**
1. **Critical:** Role picker needs clearer labels (60% success → target 90%)
2. **Major:** Notification settings should be accessible from notification bell
3. **Minor:** Users expected drag-and-drop for reordering

**Recommended Actions:**
1. Redesign role picker with descriptions per role
2. Add "Notification settings" link to notification dropdown
3. Add drag-and-drop as enhancement in next sprint

---

## Research Methods Cheat Sheet

| Method | When | Sample Size | Time | Output |
|--------|------|-------------|------|--------|
| Stakeholder interviews | Project kickoff | 3–5 | 30 min each | Requirements, constraints |
| Competitive analysis | Discovery | 3–5 competitors | 2–4 hours | Feature matrix, patterns |
| Card sorting | IA design | 15–30 users | 15 min each | Navigation structure |
| Tree testing | IA validation | 30–50 users | 10 min each | Findability scores |
| Usability testing | Any fidelity | 5 users | 30–45 min each | Task success, pain points |
| A/B testing | Optimization | 1000+ users | 1–2 weeks | Conversion data |
| Surveys | Broad feedback | 100+ users | 5 min each | Quantitative satisfaction |
| Diary studies | Usage patterns | 10–15 users | 1–2 weeks | Behavioral insights |
