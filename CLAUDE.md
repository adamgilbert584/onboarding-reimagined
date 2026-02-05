# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## shadcn/ui + Helix Design System Template

Modern React template with shadcn/ui components and Veriff design tokens. Full
dark mode support with automatic theme switching.

## Stack

- **Runtime**: Bun 1.2+
- **Build**: Vite 5 + React 18 + TypeScript 5
- **UI**: shadcn/ui (new-york style)
- **Styling**: Tailwind CSS v4 + Helix design system
- **Output**: Static dist/ for deployment

## CRITICAL CONSTRAINTS

**This is a STATIC FRONTEND template. You build production-ready static apps
only.**

### NEVER:

- Start dev servers or any background processes (`bun run dev`, `npm start`,
  etc.)
- Build backend services, APIs, servers, or databases
- Create or modify any backend code
- Launch any long-running processes

### ALWAYS:

- Build static frontend apps that compile to `dist/`
- Use **`bun run build`** to verify changes - this is the ONLY command you run
- Frontend may fetch from existing APIs (user provides URLs), but you never
  create APIs

## Commands

```bash
bun run build    # Build static app - USE THIS to verify changes
```

## GitHub Integration

This project may be connected to GitHub. Check with `git remote -v` - if it
shows a GitHub URL, the project is connected.

If connected:

- **Before major changes**: Run `git pull` to sync latest changes and avoid
  conflicts
- **After changes**: Commit and `git push` to sync back to GitHub
- **Conflict handling**: If pull fails due to conflicts, inform the user

## Architecture

### Design System

- **100% shadcn/ui based** - All components from shadcn registry
- **Helix design tokens** - OKLCH color format in CSS variables
- **Dark mode ready** - `.dark` class toggles theme
- **No custom CSS** - Pure Tailwind utilities
- **Add components**: `bunx shadcn@latest add [component]`

## AI Development Rules

### ALWAYS:

1. **Use shadcn components only** - Never write custom UI components
2. **Tailwind utilities only** - No custom CSS classes or inline styles
3. **CSS variables for colors** - Use `bg-primary`, `text-foreground`, etc.
4. **TypeScript interfaces** - Define props/state types before implementation
5. **Semantic naming** - `UserProfileCard.tsx` not `Card.tsx` or
   `Component1.tsx`
6. **One component per file** - Export default at bottom, name matches filename
7. **Path aliases** - Use `@/` imports:
   `import { Button } from "@/components/ui/button"`

### DOCUMENTATION:

**Always document**:

- Component purpose and props (JSDoc above component)
- Custom hooks with parameters and return values
- Complex types and interfaces with field descriptions
- Non-obvious function parameters

**Keep it concise**:

- 1-3 lines for most cases
- @param and @returns for functions/hooks
- Brief inline comments for complex logic only
- No redundant documentation (code should be self-explanatory)

**Modern patterns**:

- Use JSDoc syntax (`/** */`)
- TypeScript interfaces are self-documenting (add descriptions for non-obvious
  fields)
- Export types from `types/` directory
- Document "why" not "what"

**Usage**:

```tsx
<div className="bg-primary text-primary-foreground">
  <Button variant="outline">Click me</Button>
</div>
```

**Radius**:

- `rounded-lg` (8px default)
- `rounded-md` (6px)
- `rounded-sm` (4px)

### STRUCTURE:

```
src/
  components/
    ui/         # shadcn components (DO NOT MODIFY)
    [custom]/   # Your custom components using shadcn
  lib/
    utils.ts    # cn() helper and utilities
  hooks/        # Custom hooks (create when needed)
  types/        # TypeScript definitions
  App.tsx       # Main app orchestration
  index.css     # Theme tokens only (DO NOT ADD CUSTOM CSS)
```

### CHARTS:

**Use shadcn chart component for all data visualizations**:

- Built on Recharts (Line, Bar, Area, Pie, Radar)
- Import from `@/components/ui/chart` (ChartContainer, ChartTooltip,
  ChartConfig)
- Chart colors use Veriff Teal palette: `--chart-1` to `--chart-5`
  (Teal/700→300)
- Example: `color: "hsl(var(--chart-1))"` in ChartConfig

### BEFORE FINISHING:

- Run `bun run build` to verify no errors (do NOT start dev servers)
- Verify TypeScript types compile correctly
- Ensure all imports resolve properly
