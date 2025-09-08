# CSS Keyframe Animations Guide

This guide implements the comprehensive keyframe animation concepts from [Josh Comeau's Interactive Guide to Keyframe Animations](https://www.joshwcomeau.com/animation/keyframe-animations/) in our Manitos Pintadas School website.

## Table of Contents

1. [Basic Keyframe Syntax](#basic-keyframe-syntax)
2. [Timing Functions](#timing-functions)
3. [Looped Animations](#looped-animations)
4. [Multi-Step Animations](#multi-step-animations)
5. [Alternating Animations](#alternating-animations)
6. [Fill Modes](#fill-modes)
7. [Dynamic Animations](#dynamic-animations)
8. [School-Specific Animations](#school-specific-animations)
9. [Accessibility](#accessibility)
10. [Performance Optimization](#performance-optimization)
11. [Usage Examples](#usage-examples)

## Basic Keyframe Syntax

### Slide Animations

```css
/* Basic slide-in from left */
.animate-slide-in {
  animation: slide-in 1s ease-out;
}

/* Slide from different directions */
.animate-slide-in-right  /* From right */
.animate-slide-in-up     /* From bottom */
.animate-slide-in-down   /* From top */
```

**Usage in React:**
```tsx
<div className="animate-slide-in">
  Content that slides in from the left
</div>
```

## Timing Functions

### Available Timing Functions

```css
.animate-slide-in-ease          /* Default ease */
.animate-slide-in-ease-in-out   /* Smooth start and end */
.animate-slide-in-cubic-bezier  /* Custom bounce effect */
```

### Custom Cubic Bezier
```css
.animate-slide-in-cubic-bezier {
  animation: slide-in-cubic-bezier 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Looped Animations

### Infinite Loops

```css
.animate-spin-linear     /* Consistent linear spin */
.animate-spin-reverse    /* Reverse direction spin */
.animate-pulse-infinite  /* Opacity pulse */
```

**Perfect for:**
- Loading spinners
- Progress indicators
- Breathing effects

## Multi-Step Animations

### Complex Sequences

```css
.animate-multi-step-spin      /* 4-step rotation */
.animate-entrance-multi-step  /* Scale + translate + opacity */
```

**Example - Multi-step entrance:**
```css
@keyframes entrance-multi-step {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.8);
  }
  50% {
    opacity: 0.7;
    transform: translateY(25px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

## Alternating Animations

### Ping-Pong Effects

```css
.animate-breathe           /* Scale: 1 → 1.1 → 1 */
.animate-grow-and-shrink   /* Scale: 1 → 1.5 → 1 */
.animate-bounce           /* Translate Y bounce */
```

**Key concept:** Uses `animation-direction: alternate` for automatic reversal.

## Fill Modes

### Controlling Animation Persistence

```css
.animate-fade-out {
  animation: fade-out 1s ease-out forwards;
  /* Persists the final opacity: 0 state */
}

.animate-delayed-entrance {
  animation: delayed-entrance 1s ease-out 500ms both;
  /* Applies initial state backwards in time + persists final state */
}
```

**Fill mode values:**
- `forwards` - Persists final keyframe state
- `backwards` - Applies initial keyframe state before animation starts
- `both` - Combines forwards and backwards

## Dynamic Animations

### CSS Variables for Customization

```css
/* Bounce height controlled by CSS variable */
.animate-bounce-dynamic {
  animation: bounce-dynamic 1s ease-in-out infinite alternate;
}

:root {
  --bounce-offset: -20px; /* Change this to customize bounce height */
}
```

**Available dynamic animations:**
- `animate-bounce-dynamic` - Customizable bounce height
- `animate-slide-dynamic` - Customizable slide distance
- `animate-scale-dynamic` - Customizable scale range
- `animate-rotate-dynamic` - Customizable rotation range

**React usage with inline styles:**
```tsx
<div
  className="animate-bounce-dynamic"
  style={{ '--bounce-offset': '30px' } as React.CSSProperties}
>
  Custom bounce height
</div>
```

## School-Specific Animations

### Educational Context Animations

```css
.animate-mascot-bounce    /* School mascot bounce */
.animate-calendar-day     /* Calendar day entrance */
.animate-bell-ring        /* Notification bell */
.animate-page-turn        /* Book page turning */
.animate-progress-fill    /* Student progress bars */
```

**Mascot bounce example:**
```css
@keyframes mascot-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-10px) scale(1.05);
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
  75% {
    transform: translateY(-15px) scale(1.08);
  }
}
```

## Accessibility

### Respecting User Preferences

All animations automatically respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-slide-in,
  .animate-bounce,
  /* ... all animation classes ... */ {
    animation: none;
  }
}
```

### Best Practices

1. **Always provide fallback states** for users who prefer reduced motion
2. **Use semantic animation names** that describe the purpose, not just the effect
3. **Test animations at different speeds** to ensure they're not disorienting
4. **Provide animation controls** for long-running animations

## Performance Optimization

### Hardware Acceleration

```css
.will-change-transform {
  will-change: transform;
}

.hardware-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### Staggered Animations

```css
.grid-staggered > :nth-child(1) { animation-delay: 0ms; }
.grid-staggered > :nth-child(2) { animation-delay: 100ms; }
.grid-staggered > :nth-child(3) { animation-delay: 200ms; }
/* ... and so on */
```

## Usage Examples

### Basic Component Animation

```tsx
import { AnimatedCard, StudentCard, AchievementCard } from '@/components/ui/AnimatedCard';

// Basic animated card
<AnimatedCard
  title="Welcome Message"
  animationType="slide-in"
  animationDelay={200}
>
  <p>Welcome to our school!</p>
</AnimatedCard>

// Specialized student card
<StudentCard
  student={{ name: "Ana García", grade: "3rd Grade" }}
  animationDelay={100}
/>

// Achievement card with scale animation
<AchievementCard
  achievement={{
    title: "Perfect Attendance",
    description: "30 consecutive days",
    icon: "⭐"
  }}
  animationDelay={300}
/>
```

### Dynamic Animation Controls

```tsx
function CustomAnimationComponent() {
  const [bounceHeight, setBounceHeight] = useState('20px');

  return (
    <div
      className="animate-bounce-dynamic"
      style={{ '--bounce-offset': bounceHeight } as React.CSSProperties}
    >
      <input
        type="range"
        value={parseInt(bounceHeight)}
        onChange={(e) => setBounceHeight(`${e.target.value}px`)}
        min="5"
        max="50"
      />
    </div>
  );
}
```

### Page Load Animations

```tsx
function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-staggered">
      <AnimatedCard animationType="grid-entrance" className="animate-grid-entrance">
        <h3>Students</h3>
        <p>Manage student information</p>
      </AnimatedCard>

      <AnimatedCard animationType="grid-entrance" className="animate-grid-entrance">
        <h3>Teachers</h3>
        <p>Teacher management</p>
      </AnimatedCard>

      <AnimatedCard animationType="grid-entrance" className="animate-grid-entrance">
        <h3>Calendar</h3>
        <p>School events and schedules</p>
      </AnimatedCard>
    </div>
  );
}
```

### Shorthand Animation Syntax

```css
/* Complex animation in one line */
.animate-complex {
  animation: slide-in 1000ms cubic-bezier(0.68, -0.55, 0.265, 1.55) 2s infinite alternate both;
}

/* Separate delay for better control */
.animate-delayed-complex {
  animation: slide-in 1000ms ease-out infinite alternate both;
  animation-delay: 500ms;
}
```

## Animation Performance Checklist

- [ ] Use `transform` and `opacity` for animations (GPU-accelerated)
- [ ] Avoid animating `width`, `height`, `top`, `left` (causes layout shifts)
- [ ] Use `will-change` property for heavy animations
- [ ] Test on low-end devices
- [ ] Respect `prefers-reduced-motion`
- [ ] Provide animation controls where appropriate
- [ ] Use appropriate timing functions for the animation purpose

## Browser Support

All animations use modern CSS features with fallbacks:

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 12+)
- **Fallback**: Animations gracefully degrade to static states

## Demo Page

Visit `/animation-demo` to see all animations in action with interactive controls.

## Contributing

When adding new animations:

1. Follow the naming convention: `animate-[purpose]-[variant]`
2. Include accessibility considerations
3. Add performance optimizations
4. Document usage examples
5. Test across different devices and browsers

---

**Reference:** [Josh Comeau's Interactive Guide to Keyframe Animations](https://www.joshwcomeau.com/animation/keyframe-animations/)