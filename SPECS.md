# 🥚 Protein Pulse – App Spec

**Protein Pulse** is a cross-platform protein tracking app built with React Native. It supports **iOS**, **Android**, and **Web**.

---

## 🎯 Core Features

1. **Set Daily Protein Goal**

    - Users can set and update their daily protein intake goal (e.g., 160g)
    - Value is persisted across sessions and devices

2. **Log Protein Intake**

    - Add individual food entries with:
        - Food name (string)
        - Protein amount (in grams)
        - Time eaten (defaults to current time)
    - Logged entries appear in daily timeline

3. **Saved Foods**

    - Users can save frequently eaten foods
    - Quick-log functionality using saved defaults

4. **Profiles & Sync**
    - Users can sign in via email/password
    - Saved data (goals, logs, saved foods) syncs across devices

---

## 📱 Screens & Layouts

### 1. Home Screen (Dashboard)

**Purpose:** Display progress and daily logs

**Sections:**

-   **Top Bar:**
    -   App logo / title (left)
    -   Profile icon (right)
-   **Progress Display:**
    -   Circular ring or bar showing progress: `Xg / Yg`
    -   Text label below the ring
-   **+ Add Food Button**
-   **Search Bar:**
    -   Type food name (with autocomplete from saved foods)
-   **Saved Foods Carousel:**
    -   Horizontally scrollable chips or buttons
    -   Tap to log with one click
-   **Today’s Log List:**
    -   Scrollable list showing:
        ```
        🕗 8:00 AM – Eggs (18g)
        🕐 12:30 PM – Chicken Salad (35g)
        ```

---

### 2. Add Food Modal

**Fields:**

-   Food Name (text)
-   Protein Amount (number input in grams)
-   Time (defaults to now)
-   Checkbox: `Save this food for future use`

**Actions:**

-   [Save & Log]
-   [Cancel]

---

### 3. Saved Foods Screen

-   List of saved foods:
    -   Name + default protein value
    -   Actions: Edit / Delete
-   `+ Add New` button
-   Optional search/filter input

---

### 4. Profile / Settings Screen

**Sections:**

-   Daily Protein Goal (editable)
-   Email & Sync Status:
    -   "✔ Synced" or "⚠ Offline"
-   Units: grams / ounces
-   Theme toggle: Light / Dark
-   Logout button

---

## 🎨 Visual & UX Style

**Color Palette:**

-   Pastel peachy tones: baby blue, soft sand, mint green
-   White background

**Typography:**

-   Large headings
-   Clean sans-serif (e.g., Inter or SF Pro)

**UI Elements:**

-   Rounded corners (≥12px)
-   Soft drop shadows
-   Intuitive spacing (8pt / 10pt grid)

---

## 🧩 Tech Stack

-   React Native (with Expo if desired)
-   `react-navigation` for routing
-   Component library: `react-native-paper` or `native-base`
-   Cloud sync: Firebase or Supabase
-   Local fallback: AsyncStorage

---

## 🔮 Future Feature Hooks

-   🕑 Reminder notifications
-   🍽 Smart meal suggestions
-   🌐 Social feed (shared meals, badges)
-   🌙 Dark mode toggle

---
