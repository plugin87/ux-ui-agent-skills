# SYNSEERA Design System — Figma MCP Integration Rules

## Project Overview

**SYNSEERA** is an AI-powered event management SaaS platform.
Tagline: *"JOIN. ATTEND. PROVE IT."*
Theme: **Dark mode only** · Supports **Arabic (RTL)**
Primary stack: **React + TypeScript + Tailwind CSS**

This file covers **two portals**:
- **Organizer Portal** — Figma canvas `602:2` (Organizer Dashboard page)
- **Super Admin Portal** — Figma canvas `1482:37` (Super Admin page)

---

## Figma Files

| Portal | File Key | Canvas Node | URL |
|--------|----------|-------------|-----|
| Organizer | `KzBp3ibxvenqiD28OC5DOd` | `602:2` | https://www.figma.com/design/KzBp3ibxvenqiD28OC5DOd/SYNSEERA?node-id=602-2 |
| Super Admin | `KzBp3ibxvenqiD28OC5DOd` | `1482:37` | https://www.figma.com/design/KzBp3ibxvenqiD28OC5DOd/SYNSEERA?node-id=1482-37 |

---

## Figma MCP Required Workflow

**Follow these steps in order for every Figma-driven implementation. Do not skip steps.**

1. Call `get_design_context` with the exact `nodeId` and `fileKey`
2. If the response is too large, call `get_metadata` to get the node map, then re-fetch only the required child nodes with `get_design_context`
3. Call `get_screenshot` for visual reference
4. Only after you have both `get_design_context` and `get_screenshot`, begin implementation
5. Adapt the React + Tailwind reference output to this project's conventions
6. Validate final UI against the Figma screenshot for **1:1 visual parity**

---

## Super Admin Screen Map (node `1482:37`)

| Node | Screen |
|------|--------|
| ADM 01 | Synseera Admin Dashboard — Main Login |
| ADM-02 | Main Dashboard — Expanded |
| ADM-03 | Tenants & Organisations |
| ADM-04 | Add / Edit Tenant |
| ADM-05 | Global Events |
| ADM-06 | Edit Global Event |
| ADM-07 | Team Management |
| ADM-08 | Invite Team Member — Modal |
| ADM-09 | Finance & Payments |
| ADM-10 | Subscription Control — Detail |
| ADM-11 | Payout Wizard — Step 4 |
| ADM-12 | Payout Wizard — Step 5 |
| ADM-13 | Payout Wizard — Step 6 |
| ADM-14 | Payout Wizard — Step 7 |
| ADM 15 | Payments & Revenue Dashboard |
| ADM 16 | Payout Ledger & History |
| ADM-17 | Transaction History |
| ADM-17 | Transaction — Revenue Analysis |
| ADM-18 | Payout Settings |
| ADM-19 | Certificate Templates |
| ADM-20 | Add Certificate |
| ADM-21 | Global Settings |

---

## Organizer Portal Screen Map (node `602:2`)

### Authentication & Onboarding
| Node | Screen |
|------|--------|
| `602:16` | Registration — Step 1: Contact Information |
| `602:13788` | Registration — Step 2: OTP Verification |
| `602:13896` | Registration — Step 3: Details |
| `602:14001` | Registration — Step 4: Organization & Documents |
| `602:14119` | Registration — Step 5: Plan Selection |
| `602:14419` | Login |

### Main Dashboard
| Node | Screen |
|------|--------|
| `602:2055` | Main Organizer Portal |
| `602:2752` | Organizer Dashboard |
| `602:3408` | All Events |

### Event Creation Wizard
| Node | Screen |
|------|--------|
| `602:189` | Step 1: Basic Info |
| `602:374` | Step 2: Details |
| `602:613` | Step 3: Venue |
| `602:824` | Step 3: Venue & Spatial Config |
| `602:1766` | Step 4: Agenda |
| `602:1148` | Step 5: Guests |
| `602:1457` | Step 6: Review |

### Guest & Attendee Management
| Node | Screen |
|------|--------|
| `602:5633` | Attendees List |
| `602:6211` | Add Attendee |
| `602:6721` | Import Guests from Excel |
| `602:7826` | AI Hall Analyzer |

### Seating & Hall Management
| Node | Screen |
|------|--------|
| `602:9630` | Manual Seating Override |
| `602:10234` | AI Seating Designer |
| `602:14719` | AI Seating Rules |
| `602:16185` | Accessibility Options |

### Agenda & Content
| Node | Screen |
|------|--------|
| `602:8768` | Event Agenda Builder |
| `602:9154` | Edit Session |
| `602:17599` | Agenda Builder |
| `602:25988` | Content & Schedule |

### Speakers
| Node | Screen |
|------|--------|
| `602:25200` | Speakers List |
| `602:25599` | Add Speaker |

### Certificates
| Node | Screen |
|------|--------|
| `602:18466` | Certificate Designer |
| `602:19297` | Certificate Editor |

### Scanner & Check-in (Mobile)
| Node | Screen |
|------|--------|
| `602:22402` | Smart Scanner: Live Feed View |
| `602:22552` | Smart Scanner: Focused View |
| `602:22933` | Search & Scan Dashboard |

### Settings & Landing Page
| Node | Screen |
|------|--------|
| `602:12070` | Account Settings |
| `602:23859` | Landing Page Builder Dashboard |

---

## Color Tokens

**IMPORTANT: Never hardcode hex values. Always use the CSS custom properties below.**

### Backgrounds

```css
--color-bg-deepest:     #020618;              /* Page gradient start/end */
--color-bg-deep:        #0f172b;              /* Page gradient mid */
--color-bg-darkest:     #080e21;              /* Cards, inputs */
--color-bg-card:        #1e2330;              /* Elevated cards, inactive elements */
--color-bg-header:      rgba(20, 24, 36, 0.8); /* Navbar */
--color-bg-subheader:   rgba(20, 24, 36, 0.5); /* Step bar */
--color-bg-overlay:     rgba(255, 255, 255, 0.05); /* Subtle overlays */
```

### Brand & Accent

```css
--color-brand-teal:      #38c2d4;              /* Primary CTA, active step circle */
--color-brand-teal-soft: #5bc4c4;             /* Step labels, active text */
--color-brand-blue:      #7eb1fc;             /* Logo tagline, brand accent */
--color-accent-blue:     #2563eb;             /* Selected card border */
--color-accent-blue-bg:  rgba(37, 99, 235, 0.1); /* Selected card fill */
--color-info-teal-bg:    rgba(56, 194, 212, 0.1); /* Info banner bg */
--color-info-teal-text:  rgba(56, 194, 212, 0.5); /* Info banner title */
```

### Gradients

```css
--gradient-page-bg:      linear-gradient(133deg, #020618 0%, #0f172b 50%, #020618 100%);
--gradient-progress:     linear-gradient(180deg, #0052cc 0%, #00d1ff 100%);
--gradient-cta-shadow:   0px 10px 15px rgba(0, 82, 204, 0.2), 0px 4px 6px rgba(0, 82, 204, 0.2);
```

### Text

```css
--color-text-white:       #ffffff;
--color-text-primary:     #d1d5dc;             /* Labels, body */
--color-text-secondary:   #99a1af;             /* Subtitles, helper text */
--color-text-muted:       #6a7282;             /* Inactive steps, optional labels */
--color-text-placeholder: rgba(255, 255, 255, 0.5); /* Input placeholders */
```

### Borders

```css
--color-border-subtle:   rgba(255, 255, 255, 0.05); /* Card borders */
--color-border-default:  rgba(255, 255, 255, 0.1);  /* Input borders */
--color-border-divider:  rgba(255, 255, 255, 0.1);  /* Dividers */
```

### Semantic

```css
--color-error:   #fb2c36;  /* Required asterisk, error states */
--color-success: #38c2d4;  /* Confirmed/verified states */
--color-warning: #f59e0b;  /* Warning banners */
```

---

## Typography

**Font family:** `Inter` (all weights). Arabic fallback: `Noto Sans Arabic`.

```css
font-family: 'Inter', 'Noto Sans Arabic', sans-serif;
```

**IMPORTANT: Follow these Inter font weights exactly — Regular (400), Medium (500), SemiBold (600), Bold (700).**

### Type Scale

| Role | Size | Weight | Line-height | Notes |
|------|------|--------|-------------|-------|
| Logo title | 20px | 700 | 20px | letter-spacing: 4px |
| Logo tagline | 9.6px | 400 | 14.4px | uppercase, letter-spacing: 1.1px, color: `--color-brand-blue` |
| Page heading (H1) | 30px | 700 | 36px | centered |
| Section heading (H2) | 18px | 700 | 28px | |
| Card heading (H3) | 16px | 700 | 24px | |
| Label | 14px | 600 | 20px | color: `--color-text-primary` |
| Body / button text | 14px | 500 | 20px | color: `--color-text-secondary` |
| Input value | 16px | 400 | normal | color: `--color-text-white` |
| Caption / small | 12px | 400 | 16px | color: `--color-text-secondary` |
| Step label | 14px | 600 | 20px | color: `--color-brand-teal-soft` |
| Step number | 12px | 700 | 16px | |
| CTA button | 16px | 700 | 24px | |
| Nav button | 12px | 500 | 16px | |
| Table header | 12px | 600 | 16px | color: `--color-text-muted`, uppercase |
| Table cell | 14px | 400 | 20px | color: `--color-text-primary` |
| Badge / tag | 11px | 600 | 16px | uppercase, letter-spacing: 0.5px |

---

## Spacing & Layout

```
Base unit: 8px
Standard container padding: 24px
Card padding: 32px
Form section gap: 48px
Label-to-input gap: 8px
Table row height: 52px
Sidebar width: 256px
```

### Border Radius

```css
--radius-sm:   8px;
--radius-md:   14px;   /* inputs, cards */
--radius-lg:   16px;   /* large cards */
--radius-xl:   20px;   /* modals */
--radius-full: 9999px; /* pills, badges, step circles */
```

### Breakpoints

| Name | Width |
|------|-------|
| Desktop (primary) | 1260px |
| Dashboard panels | 1019–1280px |
| Admin sidebar layout | min 1280px |
| Tablet | 768px |
| Mobile (scanner) | 390px |

---

## Page Background

All pages use the global gradient background:

```css
background: var(--gradient-page-bg);
min-height: 100vh;
```

---

## Component Patterns

### Sidebar (Admin & Organizer)

- Width: 256px, fixed height, scrollable nav area
- Background: `--color-bg-darkest` with subtle right border
- Top: Logo + wordmark + tagline
- Navigation items: icon (20px) + label, 40px tall rows, 16px horizontal padding
- **Active state:** teal left accent bar (3px) + teal icon + teal text (`--color-brand-teal`)
- **Hover state:** `--color-bg-overlay` background
- Bottom: User avatar + name + role + logout

### Navigation Bar (Header)

- Fixed top, full width
- Background: `--color-bg-header` with `1px solid --color-border-subtle` bottom border
- Left: Logo + vertical divider + page title + breadcrumb
- Right: Search, notifications bell, language switcher, avatar
- Progress accent bar: 4px height, `--gradient-progress`

### Breadcrumb

- Items separated by `/` chevron in `--color-text-muted`
- Active page: `--color-text-white`, weight 600
- Parent pages: `--color-text-secondary`, weight 400

### Cards / Panels

- Background: `--color-bg-darkest`
- Border: `1px solid --color-border-subtle`
- Border radius: `--radius-lg` (16px)
- Padding: 32px
- Shadow: `0 4px 24px rgba(0, 0, 0, 0.4)`

### Data Tables (Admin Portal)

- Container card: `--color-bg-darkest`, `--radius-lg`, `1px solid --color-border-subtle`
- Header row: `--color-bg-card` background, `--color-text-muted` text, 12px/600/uppercase
- Data rows: alternating subtle hover (`--color-bg-overlay`), 52px height
- Row border: `1px solid --color-border-divider` between rows
- Cell text: `--color-text-primary`, 14px/400
- Sortable columns: show sort icon on hover
- Pagination: bottom-right, ghost pill buttons

### Stats / KPI Cards

- Background: `--color-bg-card` with `1px solid --color-border-subtle`
- Icon in teal circle (36px, `--color-brand-teal`, 10% opacity bg)
- Metric value: 24px/700/`--color-text-white`
- Label: 12px/400/`--color-text-secondary`
- Trend badge: green for positive, red for negative

### Step Progress Bar

- Horizontal stepper with numbered circles + connector lines
- **Active step:** teal circle (`--color-brand-teal`), teal label (`--color-brand-teal-soft`)
- **Completed step:** filled teal circle with checkmark
- **Inactive step:** `--color-bg-card` circle, muted number (`--color-text-muted`)
- Connector: 1px line, `--color-bg-card`

### Text Inputs

- Background: `--color-bg-darkest`
- Border: `1px solid --color-border-default`
- Border radius: `--radius-md` (14px)
- Height: 50px
- Padding: 12px 16px
- Placeholder: `--color-text-placeholder`
- Value: `--color-text-white`, 16px/400
- Left icon prefix: 18px icon, 12px from left
- **Focus:** border color `--color-brand-teal`, `0 0 0 3px rgba(56, 194, 212, 0.15)` ring
- **Error:** border color `--color-error`

### Phone Input

- Country picker (dark bg, flag + dial code + chevron, ~128px wide) + number field
- Separated by `1px solid --color-border-default` vertical divider

### Select / Dropdown

- Matches text input style
- Chevron icon right-aligned
- Options list: `--color-bg-card` background, `--radius-md`, `1px solid --color-border-default` border
- Selected option: `--color-brand-teal` checkmark + teal text

### Labels

- 14px/600, `--color-text-primary`
- Required asterisk `*` in `--color-error`
- Optional suffix: `(Optional)` in 12px/400/`--color-text-muted`

### Info / Alert Banner

- Background: `rgba(194, 206, 226, 0.2)`
- Border: `1px solid rgba(56, 194, 212, 0.1)`
- Border radius: `--radius-md` (14px)
- Icon + bold title (`--color-info-teal-text`) + body (`--color-text-primary`)

### Security Alert Banner (Admin)

- Background: `rgba(251, 44, 54, 0.08)`
- Border: `1px solid rgba(251, 44, 54, 0.2)`
- Border radius: `--radius-md`
- Red warning icon + bold title + CTA to resolve

### Primary CTA Button

- Background: `--color-brand-teal`
- Border radius: `--radius-md` (14px)
- Height: 56px
- Font: 16px/700, white
- Shadow: `--gradient-cta-shadow`
- Right-side arrow icon
- **Hover:** `brightness(1.1)` + shadow intensify
- **Disabled:** opacity 0.4, `cursor: not-allowed`

### Ghost / Secondary Button

- Background: `rgba(255, 255, 255, 0.05)`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Border radius: `--radius-full` (pill)
- Font: 12px/500, white

### Destructive Button (Admin)

- Background: transparent
- Border: `1px solid --color-error`
- Color: `--color-error`
- Border radius: `--radius-md`
- Height: 40px
- Font: 14px/600

### Modal / Dialog

- Backdrop: `rgba(0, 0, 0, 0.7)` blur
- Panel: `--color-bg-darkest`, `--radius-xl` (20px), `1px solid --color-border-subtle`
- Padding: 32px
- Close button top-right: 32px icon ghost button
- Title: 18px/700/`--color-text-white`
- Footer: right-aligned action buttons with 12px gap

### Badge / Status Pill

- Border radius: `--radius-full`
- Padding: 4px 10px
- Font: 11px/600/uppercase
- **Active / Success:** green bg `rgba(52, 211, 153, 0.15)`, text `#34d399`
- **Pending / Warning:** amber bg `rgba(245, 158, 11, 0.15)`, text `#f59e0b`
- **Inactive / Error:** red bg `rgba(251, 44, 54, 0.15)`, text `--color-error`
- **Neutral / Draft:** `--color-bg-card` bg, `--color-text-muted` text

### Permissions Matrix (Admin)

- Grid table with feature rows × role columns
- Role header cells: centered, 14px/600/`--color-text-white`
- Toggle cells: teal checkmark for granted, muted dash for denied
- Row alternation: odd rows `--color-bg-overlay`

### Avatar

- Circular crop, `--radius-full`
- Sizes: 32px (table), 40px (header), 48px (profile), 64px (modal)
- Fallback: initials on `--color-bg-card` background

### 2FA Badge

- Small pill appended to user row
- Background: `rgba(56, 194, 212, 0.1)`
- Text: `2FA`, 10px/600/`--color-brand-teal`

### Payout Wizard Steps

- Uses the Step Progress Bar pattern with steps 4–7 for payout flow
- Step content cards with `--color-bg-darkest` background
- Each step has: title, form fields, navigation buttons (Back + Continue)

---

## Asset Handling

- **IMPORTANT:** If the Figma MCP server returns a `figma.com/api/mcp/asset/...` URL for an image or SVG, use that URL directly as the `src`
- **IMPORTANT:** Do NOT install new icon packages — all icons are served from the Figma MCP asset endpoint
- **IMPORTANT:** Do NOT create placeholder images if an asset URL is provided
- Store downloaded static assets in `public/assets/`
- AI-generated portrait images in the Figma designs are placeholders — use appropriate real images or an `<img>` with descriptive `alt` text in production

---

## RTL / Internationalization

- All UI supports **English (LTR)** and **Arabic (RTL)**
- Language toggle always visible in the top-right header
- Use `dir="auto"` on text nodes that may contain Arabic
- Font stack must include `Noto Sans Arabic` as RTL fallback
- In RTL mode: sidebar moves to right, breadcrumb direction reverses, icons flip horizontally where semantically appropriate

---

## Implementation Rules

- **IMPORTANT:** Always use `--color-*` CSS variables — never hardcode hex values
- **IMPORTANT:** All screens are dark mode only — do not add light mode variants unless explicitly requested
- **IMPORTANT:** The `0.833px` border widths in Figma are a scaling artifact — use `1px` in code
- Replace Tailwind absolute positioning with proper `flex` / `grid` layouts
- Reuse existing components before creating new ones
- Validate every implementation against the Figma screenshot for 1:1 visual parity
- All interactive elements must have visible focus rings and `aria-label` where text is absent
- Tables must use semantic `<table>`, `<thead>`, `<tbody>`, `<th scope>` markup
- Modals must trap focus and support `Escape` to close
- Minimum touch target size: 44×44px for primary actions, 24×24px minimum for all

---

## Code Architecture

```
src/
├── components/
│   ├── ui/              ← Atoms: Button, Input, Badge, Avatar, Toggle
│   ├── layout/          ← Sidebar, Header, Breadcrumb, PageShell
│   ├── admin/           ← Super Admin–specific organisms
│   └── organizer/       ← Organizer portal–specific organisms
├── styles/
│   └── tokens.css       ← All CSS custom properties above
├── pages/
│   ├── admin/           ← ADM-01 … ADM-21 screens
│   └── organizer/       ← Registration, Dashboard, Events, etc.
└── public/
    └── assets/          ← Downloaded Figma static assets
```

### Component File Pattern

```tsx
// src/components/ui/Button.tsx
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-teal)] focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-brand-teal)] text-white rounded-[var(--radius-md)] h-14 px-6 text-base shadow-[var(--gradient-cta-shadow)] hover:brightness-110',
        ghost: 'bg-[var(--color-bg-overlay)] border border-[var(--color-border-default)] text-white rounded-full h-9 px-4 text-xs font-medium hover:bg-white/10',
        destructive: 'border border-[var(--color-error)] text-[var(--color-error)] rounded-[var(--radius-md)] h-10 px-4 text-sm font-semibold hover:bg-[var(--color-error)]/10',
      },
    },
    defaultVariants: { variant: 'primary' },
  }
);
```
