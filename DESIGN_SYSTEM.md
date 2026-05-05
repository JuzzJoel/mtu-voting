# MTU Voting App - Design System Guide

## Overview

The MTU Voting App has been redesigned with a modern, edgy, and institutional design system combining Apple-level cleanliness, Stripe dashboard precision, and Gen-Z political campaign energy.

## Design Philosophy

**Core Brand Personality:**
- Secure • Youthful • Democratic • Competitive • Institutional • Bold

**Visual Tone:**
- Sharp corners mixed with selective rounded-xl
- Glassmorphism accents
- Gradient energy
- Neon edge highlights
- Dark/light mode ready
- Motion-heavy but professional

## Color Palette

### Primary Colors
- **Primary Green:** `#16C47F` - Trust, Growth, Success
- **Deep Green:** `#0E9F6E`
- **Primary Purple:** `#7C3AED` - Creativity, Leadership
- **Deep Purple:** `#5B21B6`

### Accent Colors
- **Lime Glow:** `#A3E635`
- **Electric Violet:** `#A855F7`
- **Success Mint:** `#34D399`
- **Warning Gold:** `#FACC15`
- **Danger Red:** `#F43F5E`

### Neutral Colors
- **Background Dark:** `#0B0F19`
- **Surface Dark:** `#111827`
- **Card Dark:** `#1F2937`
- **Background Light:** `#F8FAFC`
- **Surface Light:** `#FFFFFF`
- **Border Gray:** `#334155`
- **Text Primary:** `#E2E8F0`
- **Text Secondary:** `#94A3B8`

## Typography

### Font Pairing
- **Headings:** Space Grotesk / Sora (Bold, Sharp, Futuristic)
- **Body:** Inter (Clean, Readable, Dashboard-friendly)

### Type Scale
- Display XL: 64px / 700
- Display LG: 48px / 700
- H1: 36px / 700
- H2: 30px / 600
- H3: 24px / 600
- Body LG: 18px / 400
- Body MD: 16px / 400
- Body SM: 14px / 400
- Caption: 12px / 500

## Components

### UI Components Available

#### Button
```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="lg">
  Send OTP
</Button>
```

**Variants:** `primary`, `secondary`, `tertiary`, `ghost`  
**Sizes:** `sm`, `md`, `lg`

#### Input
```tsx
import { Input } from "@/components/ui";

<Input 
  type="email" 
  label="Email Address" 
  placeholder="Enter email"
  error={errorMessage}
/>
```

#### Card
```tsx
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui";

<Card variant="dark" glow="purple">
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

**Variants:** `default`, `glass`, `dark`  
**Glow:** `green`, `purple`, `none`

#### OTPInput
```tsx
import { OTPInput } from "@/components/ui";

<OTPInput 
  length={6} 
  onComplete={(otp) => handleVerification(otp)}
/>
```

#### ProgressBar & ProgressRing
```tsx
import { ProgressBar, ProgressRing } from "@/components/ui";

<ProgressBar value={votes} max={totalVotes} color="gradient" />
<ProgressRing value={percentage} size="md" color="purple" />
```

#### Badge
```tsx
import { Badge } from "@/components/ui";

<Badge variant="primary">Active Voter</Badge>
```

#### Modal
```tsx
import { Modal } from "@/components/ui";

<Modal isOpen={open} onClose={() => setOpen(false)} title="Title">
  Content
</Modal>
```

#### ContestantCard
```tsx
import { ContestantCard } from "@/components/ui";

<ContestantCard 
  name="Candidate Name"
  position="Position"
  image="/image.jpg"
  onVote={handleVote}
  isSelected={selected}
  votes={42}
/>
```

### Animations & Transitions

**Durations:**
- Fast: 200ms
- Medium: 400ms
- Slow: 600ms

**Pre-built Animations:**
- `animate-pulse-border` - Border color pulse (green → purple)
- `animate-glow-pulse` - Glow effect pulse
- `animate-vote-success` - Vote submission success animation
- `animate-fade-slide-up` - Fade and slide up entrance

### Gradient System

**Hero Gradient:**
```css
linear-gradient(135deg, #16C47F 0%, #7C3AED 100%)
```

**CTA Gradient:**
```css
linear-gradient(90deg, #16C47F, #A855F7)
```

## Usage Examples

### Login Page
The redesigned login page features:
- Animated gradient mesh background
- Glassmorphic card design
- Smooth entrance animations
- Professional error handling

### OTP Verification
- Large square OTP input cells with pulse animation
- Auto-advance between fields
- Resend timer functionality
- Accessible numeric keypad input

### Voting Interface
- Swipeable candidate cards (mobile)
- Gradient borders on hover
- Vote success animations
- Live voting counts with progress bars

### Admin Dashboard
- Purple/green themed charts
- Glass-effect cards
- Live counters with animations
- Department and level filters
- Progress rings for statistics

## Layout & Spacing

### Spacing Scale
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px

### Grid
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3–4 columns

### Container
- Max-width: 7xl (1280px)
- Padding: 16px (sm), 24px (md), 32px (lg)

### Border Radius
- sm: 8px
- md: 14px
- lg: 20px
- xl: 28px

## Accessibility

### Standards
- WCAG AA contrast ratios
- Focus states on interactive elements
- Keyboard navigation support
- OTP autofill support
- Screen-reader friendly labels
- Semantic HTML structure

### Focus Indicators
All interactive elements have:
```css
focus:ring-4 focus:ring-primary-purple/25 focus:border-primary-purple
```

## Dark Mode

The application is built with dark mode as the primary experience. Light mode can be enabled via Tailwind's `dark:` prefix.

All colors are optimized for dark backgrounds with sufficient contrast for accessibility.

## Motion System

### Micro-interactions
- **Hover:** Scale 1.03
- **Tap:** Scale 0.98
- **Success:** Checkmark burst animation
- **Error:** Shake or slide animation
- **Page transitions:** Fade + slide-up

### Framer Motion Integration

The app uses Framer Motion for:
- Component animations
- Page transitions
- Loading states
- Success/error states
- Interactive elements

Example:
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  Click me
</motion.button>
```

## Signature UI Elements

### "Pulse Democracy" Animation
A subtle animated green-purple line that moves across buttons and cards to symbolize live participation.

### Glassmorphism Accents
Used for:
- Navbar
- Floating cards
- Modals
- Overlays

### Gradient Borders
Cards and buttons feature gradient borders on hover state using CSS gradients.

## Custom CSS Classes

### Utility Classes
- `.glass` - Glassmorphism effect
- `.gradient-text` - Gradient text effect
- `.focus-ring` - Focus ring styling
- `.container-custom` - Custom container with padding
- `.animate-pulse-border` - Border pulse animation
- `.animate-glow` - Glow animation
- `.animate-shimmer` - Shimmer effect

## Tailwind Configuration

All design tokens are configured in `tailwind.config.ts`:

```typescript
colors: {
  primary: { green: "#16C47F", purple: "#7C3AED" },
  accent: { lime: "#A3E635", red: "#F43F5E" },
  neutral: { "bg-dark": "#0B0F19", ... }
}

fontSize: {
  "display-xl": ["64px", { lineHeight: "1.2", fontWeight: "700" }],
  ...
}

borderRadius: {
  sm: "8px", md: "14px", lg: "20px", xl: "28px"
}
```

## Getting Started

### Import Components
```tsx
import { Button, Card, Input } from "@/components/ui";
```

### Use Animations
```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  Content
</motion.div>
```

### Apply Colors
```tsx
<div className="bg-primary-green text-neutral-text-primary">
  Styled content
</div>
```

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Use Tailwind's responsive prefixes:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Content
</div>
```

## Best Practices

1. **Use design tokens** - Always use predefined colors, spacing, and typography
2. **Prioritize accessibility** - Ensure proper contrast and keyboard navigation
3. **Keep animations subtle** - Use transitions for guidance, not distraction
4. **Mobile-first design** - Design for mobile, then enhance for larger screens
5. **Semantic HTML** - Use proper heading hierarchy and semantic elements
6. **Consistent spacing** - Use the spacing scale for margins and padding
7. **Focus states** - Always provide visible focus indicators

## Resources

- **Tailwind Config:** `tailwind.config.ts`
- **Global Styles:** `src/app/globals.css`
- **UI Components:** `src/components/ui/`
- **Design Reference:** This guide and the Figma file

## Future Enhancements

- [ ] Light mode theme
- [ ] Custom theme switcher
- [ ] Animation presets library
- [ ] Component storybook
- [ ] Accessibility testing
- [ ] Performance optimization
