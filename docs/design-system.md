# Eventify Design System

## Color Palette

| Token           | Value     | Usage                       |
| --------------- | --------- | --------------------------- |
| `primary-500`   | `#3b82f6` | Buttons, links, focus rings |
| `primary-600`   | `#2563eb` | Hover state                 |
| `secondary-500` | `#64748b` | Secondary actions           |
| `accent-500`    | `#d946ef` | Highlights, tags            |
| `success-500`   | `#22c55e` | Success alerts              |
| `warning-500`   | `#f59e0b` | Warnings                    |
| `error-500`     | `#ef4444` | Errors, danger              |
| `neutral-900`   | `#111827` | Headings                    |
| `neutral-700`   | `#374151` | Body text                   |
| `neutral-50`    | `#f9fafb` | Page background             |

## Typography

- **Font**: Inter (Google Fonts)
- **Base size**: `1rem` / `16px`
- **Scale**: xs → sm → base → lg → xl → 2xl → 3xl → 4xl

## Spacing (8px grid)

| Class | Value |
| ----- | ----- |
| `p-1` | 4px   |
| `p-2` | 8px   |
| `p-4` | 16px  |
| `p-6` | 24px  |
| `p-8` | 32px  |

## Components

### Button

```tsx
<Button variant="primary" size="md">Click me</Button>
<Button variant="danger" isLoading>Deleting...</Button>
<Button variant="outline" disabled>Disabled</Button>
```

### Input

```tsx
<Input label="Email" type="email" error="Invalid email" />
<Input label="Name" hint="Your full name" required />
```

### Card

```tsx
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>
```

### Modal

```tsx
<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm">
  <p>Are you sure?</p>
</Modal>
```

## Naming Conventions

- Components: PascalCase (`Button`, `CardHeader`)
- Props: camelCase (`isLoading`, `fullWidth`)
- CSS classes: Tailwind only (no custom inline styles)
- Files: `ComponentName.tsx`
