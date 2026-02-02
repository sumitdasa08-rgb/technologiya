
# Technologiya Website - Complete Rebuild Plan

## Overview
Building a complete Technologiya landing page with an interactive 3D robot hero featuring gradient glow effects, using a custom Black and Grays color palette, glassmorphism navigation, and all service sections.

---

## Color Palette Implementation

The new design uses the **Black and Grays** color scheme:

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Authentic Black | `#080808` | Primary background |
| Sport Black | `#141414` | Card backgrounds, secondary surfaces |
| Bold Grey | `#676767` | Muted text, subtle borders |
| Gray | `#808080` | Secondary text |
| Dark Gray | `#A9A9A9` | Primary text highlights |
| Gray (X11) | `#BEBEBE` | Headings, important text |

Accent color: Keep the existing purple (`hsl(258 90% 66%)`) for CTAs and highlights.

---

## File Changes

### 1. Update CSS Variables (`src/index.css`)

Replace the current color system with the Black and Grays palette:

```text
CSS Variable Mapping:
--background: #080808 (Authentic Black)
--card: #141414 (Sport Black)
--foreground: #BEBEBE (Gray X11)
--muted-foreground: #808080 (Gray)
--border: #676767 at 30% opacity
--primary: Keep purple accent
```

---

### 2. Hero Section with 3D Robot + Glow Effects (`src/pages/Index.tsx`)

Transform into a full landing page with all sections.

**Hero Layout:**

```text
+----------------------------------------------------------+
|  [Navbar - glassmorphism]                                |
+----------------------------------------------------------+
|                                                          |
|  +------------------------+  +------------------------+  |
|  |                        |  |                        |  |
|  | "Transform Your        |  |  ┌─────────────────┐  |  |
|  |  Device Problems       |  |  │ PURPLE GLOW     │  |  |
|  |  into Solutions"       |  |  │  ┌───────────┐  │  |  |
|  |                        |  |  │  │ 3D ROBOT  │  │  |  |
|  | Premium computer       |  |  │  │ (Spline)  │  │  |  |
|  | repair services        |  |  │  └───────────┘  │  |  |
|  |                        |  |  │ BLUE ACCENT     │  |  |
|  | [Get Started] [Track]  |  |  └─────────────────┘  |  |
|  |                        |  |                        |  |
|  +------------------------+  +------------------------+  |
|                                                          |
+----------------------------------------------------------+
```

**Glow Effect Layers (behind robot):**
1. **Large purple radial gradient** - 600x600px, blur-3xl, opacity 40%, centered
2. **Blue accent glow** - 400x400px, blur-2xl, opacity 30%, offset bottom-right
3. **Animated pulsing orb** - 300x300px, subtle pulse animation, opacity 20%

---

### 3. Navigation Updates (`src/components/Navbar.tsx`)

Update with new color palette:
- Background: `#080808` with 90% opacity when scrolled
- Border: `#676767` at 30% opacity
- Text: `#808080` (muted) transitioning to `#BEBEBE` on hover
- Logo box: `#141414` background with `#676767` border

---

### 4. Frame Border Updates (`src/components/FrameBorder.tsx`)

Change from white border to subtle gray:
- Border color: `#676767` at 40% opacity
- Creates a refined, premium frame effect

---

### 5. Section Components Updates

All existing sections need color updates to match the new palette:

**Components to update:**
- `AboutSection.tsx` - Background colors, text colors
- `ServicesSection.tsx` - Card backgrounds, hover states
- `PricingSection.tsx` - Tier cards, popular badge
- `FAQSection.tsx` - Accordion styling
- `BookingSection.tsx` - Form inputs, buttons
- `Footer.tsx` - Background, link colors

**Color changes for all sections:**
- Section backgrounds: Alternate between `#080808` and `#141414`
- Text: `#BEBEBE` for headings, `#808080` for body
- Cards: `#141414` background with `#676767` subtle border
- Hover effects: Border transitions to purple accent

---

## Page Structure

```text
Index.tsx Layout:
├── FrameBorder (fixed gray border overlay)
├── Navbar (glassmorphism with gray palette)
├── ScrollToTop
│
├── <main>
│   ├── Hero Section
│   │   ├── Left: Headline + CTA buttons
│   │   └── Right: 3D Robot + Glow effects
│   │
│   ├── LogoMarquee (trusted brands)
│   ├── AboutSection
│   ├── ServicesSection
│   ├── PricingSection
│   ├── ProcessSection (how it works)
│   ├── FAQSection
│   └── BookingSection
│
└── Footer
```

---

## Technical Details

### Animation Classes (from existing CSS)
- `animate-fade-up` - Entrance animation
- `animate-pulse-soft` - Glow pulsing
- `hover-lift` - Card hover effect
- `glass-card` - Glassmorphism styling

### Responsive Breakpoints
- Mobile: Full-width stacked layout
- Tablet (md): Two-column hero
- Desktop (lg): Full layout with larger robot

### Glow Effect CSS

```css
/* Primary glow behind robot */
.robot-glow-primary {
  background: radial-gradient(
    circle at center,
    rgba(139, 92, 246, 0.4) 0%,
    transparent 70%
  );
  filter: blur(60px);
  width: 600px;
  height: 600px;
}

/* Secondary blue accent */
.robot-glow-accent {
  background: radial-gradient(
    circle at center,
    rgba(59, 130, 246, 0.3) 0%,
    transparent 70%
  );
  filter: blur(40px);
  width: 400px;
  height: 400px;
}
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/index.css` | Modify | Update CSS variables with Black and Grays palette |
| `src/pages/Index.tsx` | Rewrite | Full landing page with hero + all sections |
| `src/components/Navbar.tsx` | Modify | Update colors to new palette |
| `src/components/FrameBorder.tsx` | Modify | Change to gray border |
| `src/components/AboutSection.tsx` | Modify | Update colors |
| `src/components/ServicesSection.tsx` | Modify | Update colors |
| `src/components/PricingSection.tsx` | Modify | Update colors |
| `src/components/FAQSection.tsx` | Modify | Update colors |
| `src/components/BookingSection.tsx` | Modify | Update colors |
| `src/components/Footer.tsx` | Modify | Update colors |
| `src/components/LogoMarquee.tsx` | Modify | Update colors |
| `src/components/ProcessSection.tsx` | Modify | Update colors |

---

## Expected Result

A polished Technologiya landing page with:

1. Interactive 3D robot hero with beautiful layered gradient glow effects (purple + blue)
2. Custom Black and Grays color palette creating a sleek, modern aesthetic
3. All service sections: About, Services, Pricing, Process, FAQ, Booking
4. Subtle gray fixed border frame
5. Glassmorphism navigation with smooth scroll behavior
6. Smooth animations on scroll (fade-up, scale, hover effects)
7. Fully mobile-responsive design
