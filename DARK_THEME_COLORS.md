# Dark Theme Color Scheme 🎨

## Updated to Soft Black with Opacity

Instead of pure black (#000000), we're now using a sophisticated dark slate color scheme with subtle blue undertones.

## Color Palette

### Background Colors
- **Main Background**: `slate-950` - Very dark slate with slight blue tint
  - HSL: `220° 15% 8%` 
  - RGB: `#0f1419` (approximately)
  - Softer than pure black, easier on eyes

- **Card Background**: `slate-900` - Dark slate for cards
  - HSL: `220° 15% 12%`
  - RGB: `#1a1f29` (approximately)
  - Provides depth and layering

- **Secondary Elements**: `slate-800` - Lighter slate for hover states
  - HSL: `220° 15% 18%`
  - Used for inputs, muted backgrounds

### Border Colors
- **Borders**: `slate-700`
  - HSL: `220° 15% 22%`
  - Subtle separation without harsh lines

### Text Colors
- **Primary Text**: `95% white` - Soft white, not harsh
- **Secondary Text**: `70% white` - Muted for less important text

## Why This Scheme?

### Benefits:
1. **Eye Comfort**: Softer than pure black, reduces eye strain
2. **Depth**: Subtle blue undertone adds sophistication
3. **Contrast**: Still maintains good readability
4. **Modern**: Matches popular apps (Discord, VS Code, etc.)
5. **OLED Friendly**: Dark enough to save battery on OLED screens

### Comparison:

| Element | Pure Black (Before) | Soft Black (Now) |
|---------|-------------------|------------------|
| Background | `#000000` | `#0f1419` (slate-950) |
| Cards | `#0a0a0a` | `#1a1f29` (slate-900) |
| Feel | Harsh, stark | Soft, sophisticated |
| Eye Strain | Higher | Lower |

## Where Applied

### Layout.tsx
- Main background: `dark:bg-slate-950`
- Navbar: `dark:bg-slate-900`
- Footer: `dark:bg-slate-900`
- Borders: `dark:border-slate-700`

### EnhancedQuiz.tsx
- All cards: `dark:bg-slate-900`
- All borders: `dark:border-slate-700`

### Home.tsx
- Background: `dark:bg-slate-950`
- Cards: `dark:bg-slate-900`
- Borders: `dark:border-slate-700`

### index.css
- CSS variables updated with HSL values
- Consistent across all components

## Visual Effect

The dark theme now has:
- ✅ Soft black with blue undertone
- ✅ Subtle depth and layering
- ✅ Professional appearance
- ✅ Reduced eye strain
- ✅ Better readability
- ✅ Modern, sleek look

## Testing

**Refresh your browser** to see the new soft black theme!

The difference is subtle but noticeable:
- Less harsh on eyes
- More sophisticated look
- Better depth perception
- Warmer, more inviting feel

---

**Perfect balance between dark and comfortable!** 🌙
