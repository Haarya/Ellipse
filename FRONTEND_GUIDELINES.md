# Ellipse Authority Command Center: Frontend Guidelines

This document serves as the single source of truth for the **UI/UX Design System** of the Ellipse project. 
Mobile app developers and future web engineers should strictly adhere to these guidelines to maintain a unified "Tactical Command Center" aesthetic across all platforms (Web, iOS, Android).

---

## 1. Core Theme Logic
The application operates entirely in a **Forced Dark Mode**. Light mode has been deprecated to maintain the tactical, high-contrast aesthetic required for emergency response and command operations. Do not implement light mode variants in the mobile application.

---

## 2. Color Palette (Design Tokens)

These are the exact Hex values to be used across the app. 

### Backgrounds
- **Void Black (`#041411`)**: The absolute deepest background color. Used for the main app canvas/body.
- **Abyssal Dark (`#06231D`)**: Slightly elevated background. Used for sidebars, bottom sheets, and top navigation bars.
- **Surface Deep (`#09332A`)**: Used for the interior of cards and content modules.
- **Surface Elevated (`#0C4237`)**: Used for hovered cards, active states, or elevated modals.

### Accents & Highlights
- **Accent Lime (Golden Yellow) (`#E3EF26`)**: The primary highlight color. Used for active navigation items, primary buttons, borders of focused elements, and severe warnings.
- **Accent Teal (`#2ED573`)**: The secondary highlight color. Used for success states, secondary buttons, and less critical highlights.

### Borders
- **Border Subtle (`rgba(46, 213, 115, 0.15)`)**: Used for separating sections and outlining standard cards.
- **Border Inner (`rgba(227, 239, 38, 0.1)`)**: Used for inner structural dividers.
- **Border Highlight (`rgba(227, 239, 38, 0.3)`)**: Used for hovered elements or active selections.

### Text & Typography
- **Text Primary (`#F0F0F0`)**: Main body text and standard headings.
- **Text Muted (`#B0B0B0`)**: Secondary text, descriptions, and inactive states.

---

## 3. Typography Rules

We use a two-font system to balance tactical utility with aesthetic elegance.

- **Primary Headings (Logos, Big Numbers, Major Titles)**
  - Font: `Philosopher`
  - Weight: Bold (700)
- **Data & UI Elements (Body, Buttons, Badges, Labels)**
  - Font: `Inter`
  - Weights: Regular (400), Medium (500), Bold (700)

---

## 4. Glassmorphism & UI Effects

The UI heavily relies on a "frosted glass" effect to create depth on top of the deep green/black canvas. 
For mobile environments (like React Native), you should achieve this using `BlurView` (expo-blur) or similar native blurring implementations.

**Glass Panel Spec:**
- **Background**: `rgba(6, 35, 29, 0.6)` (Abyssal Dark at 60% opacity)
- **Backdrop Blur**: `12px` (Web) / `tint="dark" intensity={60}` (React Native Expo BlurView)
- **Border**: `1px solid rgba(46, 213, 115, 0.15)`

**Elevated Glass Panel Spec:**
- **Background**: `rgba(9, 51, 42, 0.75)` (Surface Deep at 75% opacity)
- **Backdrop Blur**: `16px`
- **Border**: `1px solid rgba(46, 213, 115, 0.25)`

**Ambient Background Glows:**
To make the app feel alive, we place large, highly blurred circles behind the main layers.
- Example: A `500x500` circle with `rgba(227, 239, 38, 0.1)` (Lime at 10%) and a `140px` blur, positioned in the top-left corner.

---

## 5. Component Anatomy Examples

### Sidebar / Bottom Tab Navigation Active State
When a navigation item is active, it should draw immediate attention without being blinding.
- **Background**: Linear Gradient from `rgba(227, 239, 38, 0.2)` (Lime 20%) to `Transparent`.
- **Left Border / Top Border (Mobile)**: `4px solid #E3EF26` (Lime).
- **Icon & Text Color**: `#F0F0F0` (Text Primary).

### Topbar & Search Inputs
- **Idle Border**: Transparent or `rgba(46, 213, 115, 0.15)`.
- **Focus Border**: `1px solid #E3EF26`.
- **Background**: `rgba(6, 35, 29, 0.6)` (Glass Panel).

### Metric Cards (Overview)
- Metric cards should float. They use the **Glass Panel** spec but include a `gradient-border-top`.
- **Top Border**: A `2px` linear gradient from Lime (`#E3EF26`) to Teal (`#2ED573`).
- **Hover/Press State**: Translate slightly upwards (Y -4px) and increase the border opacity.

---

## 6. Role Badges (Color Coding)
Users in the system are color-coded based on their role for immediate visual identification.

- **DISPATCHER**: `#FF9F43` (Orange)
- **OFFICER**: `#54A0FF` (Blue)
- **ADMIN**: `#E3EF26` (Lime)

(On UI components, render these badges using the base color for text, and the base color at 15% opacity for the background pill).
