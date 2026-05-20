<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI components — MANDATORY rules

## Always use shadcn/ui components

Every interactive element MUST use the components from `apps/ui/src/components/ui/`:

| Element | Component to use |
|---------|-----------------|
| Button, icon button | `Button` from `@/components/ui/button` |
| Text input | `Input` from `@/components/ui/input` |
| Textarea | `Textarea` from `@/components/ui/textarea` |
| Label | `Label` from `@/components/ui/label` |
| Dropdown select | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` from `@/components/ui/select` |
| Toggle | `Switch` from `@/components/ui/switch` |
| Modal / dialog | `Dialog`, `DialogClose` from `@/components/ui/dialog` |

**Never build form elements from scratch with `styled.button`, `styled.input`, etc.**
Use `styled(Button)`, `styled(Input)`, etc. when you need to extend styles on top of a shadcn component.

`styled-components` is only for layout/structural containers (wrappers, grids, cards, panels) — never for interactive controls.
