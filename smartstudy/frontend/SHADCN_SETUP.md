# 🎨 shadcn/ui Setup Guide for AceMind

## ✅ Configuration Complete!

Your project is now configured to use shadcn/ui components!

## 📦 Installation Steps

### 1. Install Required Dependencies

Run these commands in the `frontend` directory:

```bash
cd frontend

# Install shadcn/ui dependencies
npm install class-variance-authority clsx tailwind-merge
npm install tailwindcss-animate
npm install lucide-react

# Install Radix UI primitives (as needed for components)
npm install @radix-ui/react-slot
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install @radix-ui/react-tooltip
npm install @radix-ui/react-accordion
npm install @radix-ui/react-alert-dialog
npm install @radix-ui/react-avatar
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-label
npm install @radix-ui/react-popover
npm install @radix-ui/react-progress
npm install @radix-ui/react-radio-group
npm install @radix-ui/react-scroll-area
npm install @radix-ui/react-separator
npm install @radix-ui/react-slider
npm install @radix-ui/react-switch

# Or install all at once:
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate lucide-react @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch
```

### 2. Add Components Using CLI

You can now add shadcn/ui components using the CLI:

```bash
# Add a button component
npx shadcn-ui@latest add button

# Add a card component
npx shadcn-ui@latest add card

# Add a dialog component
npx shadcn-ui@latest add dialog

# Add multiple components at once
npx shadcn-ui@latest add button card dialog input label select
```

### 3. Or Manually Add Components

I've created some example components for you. See the files in `src/components/ui/`

## 📁 What Was Configured

### 1. TypeScript Configuration (`tsconfig.json`)
- ✅ Added path aliases: `@/*` → `./src/*`
- ✅ Configured for component imports

### 2. Vite Configuration (`vite.config.ts`)
- ✅ Added path resolution for `@` alias
- ✅ Configured for TypeScript paths

### 3. Tailwind Configuration (`tailwind.config.js`)
- ✅ Added shadcn/ui color variables
- ✅ Added animations
- ✅ Added border radius variables
- ✅ Added `tailwindcss-animate` plugin

### 4. CSS Variables (`src/index.css`)
- ✅ Added light mode color variables
- ✅ Added dark mode color variables
- ✅ Configured for theme switching

### 5. Utility Functions (`src/lib/utils.ts`)
- ✅ Created `cn()` function for className merging

### 6. Component Configuration (`components.json`)
- ✅ Created shadcn/ui configuration file

## 🎨 Example Usage

### Using the Button Component

```tsx
import { Button } from "@/components/ui/button"

function MyComponent() {
  return (
    <div>
      <Button>Click me</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Ghost</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </div>
  )
}
```

### Using the Card Component

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  )
}
```

### Using the Dialog Component

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
```

## 🎯 Available Components

You can add any of these components:

- `accordion` - Collapsible content sections
- `alert` - Alert messages
- `alert-dialog` - Modal dialogs for important actions
- `aspect-ratio` - Maintain aspect ratio
- `avatar` - User avatars
- `badge` - Small status indicators
- `button` - Buttons with variants
- `calendar` - Date picker calendar
- `card` - Content containers
- `checkbox` - Checkboxes
- `collapsible` - Collapsible content
- `command` - Command menu
- `context-menu` - Right-click menus
- `dialog` - Modal dialogs
- `dropdown-menu` - Dropdown menus
- `form` - Form components
- `hover-card` - Hover cards
- `input` - Text inputs
- `label` - Form labels
- `menubar` - Menu bars
- `navigation-menu` - Navigation menus
- `popover` - Popovers
- `progress` - Progress bars
- `radio-group` - Radio buttons
- `scroll-area` - Scrollable areas
- `select` - Select dropdowns
- `separator` - Dividers
- `sheet` - Side sheets
- `skeleton` - Loading skeletons
- `slider` - Range sliders
- `switch` - Toggle switches
- `table` - Data tables
- `tabs` - Tabbed interfaces
- `textarea` - Multi-line text inputs
- `toast` - Toast notifications
- `toggle` - Toggle buttons
- `tooltip` - Tooltips

## 🚀 Quick Start Commands

```bash
# Add commonly used components
npx shadcn-ui@latest add button card dialog input label select tabs toast

# Add form components
npx shadcn-ui@latest add form checkbox radio-group switch textarea

# Add navigation components
npx shadcn-ui@latest add dropdown-menu navigation-menu tabs

# Add feedback components
npx shadcn-ui@latest add alert toast progress skeleton
```

## 🎨 Customization

### Change Theme Colors

Edit `src/index.css` to customize colors:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* Change primary color */
  --secondary: 210 40% 96.1%; /* Change secondary color */
  /* ... other colors */
}
```

### Change Border Radius

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    borderRadius: {
      lg: "1rem", // Change from var(--radius)
      md: "0.75rem",
      sm: "0.5rem",
    },
  },
}
```

## 🔧 Troubleshooting

### Import Errors

If you get import errors like `Cannot find module '@/components/ui/button'`:

1. Make sure you installed dependencies
2. Restart your dev server
3. Check that `tsconfig.json` has the path alias
4. Check that `vite.config.ts` has the resolve alias

### Styling Issues

If components don't look right:

1. Make sure `tailwindcss-animate` is installed
2. Check that CSS variables are in `src/index.css`
3. Verify Tailwind config has the shadcn/ui theme extension

### Type Errors

If you get TypeScript errors:

1. Make sure `@types/node` is installed: `npm install -D @types/node`
2. Restart TypeScript server in VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## 🎉 You're Ready!

Your project is now configured for shadcn/ui. Start adding components and building beautiful UIs!

```bash
# Install dependencies first
npm install

# Add your first component
npx shadcn-ui@latest add button

# Start dev server
npm run dev
```
