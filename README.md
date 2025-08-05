# 🥚 Protein Pulse

A cross-platform protein tracking app built with React Native and Expo. Track your daily protein intake, save frequently eaten foods, and monitor your progress towards your protein goals.

## ✨ Features

- **Daily Protein Goal Setting**: Set and update your daily protein intake goal
- **Food Logging**: Log individual food entries with protein amounts and timestamps
- **Saved Foods**: Save frequently eaten foods for quick logging
- **Progress Tracking**: Visual progress bar showing daily protein intake vs goal
- **Search & Filter**: Search through saved foods for quick access
- **Profile Management**: Manage settings, units, and sync status
- **Cross-Platform**: Works on iOS, Android, and Web

## 🎨 Design

- **Color Palette**: Pastel peachy tones (baby blue, soft sand, mint green)
- **Typography**: Clean sans-serif fonts with large headings
- **UI Elements**: Rounded corners, soft shadows, intuitive spacing
- **Theme Support**: Light and dark mode toggle

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pirut/protein-pulse.git
cd protein-pulse
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
- **iOS**: `npm run ios` (requires macOS and Xcode)
- **Android**: `npm run android` (requires Android Studio)
- **Web**: `npm run web`

## 📱 Screens

### Home Screen
- Progress display with circular progress bar
- Search bar for saved foods
- Quick-add chips for saved foods
- Today's food log with timestamps
- FAB for adding new food entries

### Saved Foods Screen
- List of all saved foods
- Search and filter functionality
- Edit and delete saved foods
- Add new saved foods

### Profile Screen
- Daily protein goal management
- Sync status display
- Units toggle (grams/ounces)
- Theme toggle (light/dark)
- Logout functionality

## 🛠 Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **React Native Paper** for UI components
- **AsyncStorage** for local data persistence
- **React Native Safe Area Context** for safe area handling

## 📊 Data Structure

### FoodEntry
```typescript
interface FoodEntry {
  id: string;
  name: string;
  proteinAmount: number;
  timeEaten: Date;
  createdAt: Date;
}
```

### SavedFood
```typescript
interface SavedFood {
  id: string;
  name: string;
  defaultProteinAmount: number;
  createdAt: Date;
}
```

### UserProfile
```typescript
interface UserProfile {
  dailyProteinGoal: number;
  email?: string;
  isSynced: boolean;
  units: 'grams' | 'ounces';
  theme: 'light' | 'dark';
}
```

## 🔮 Future Features

- [ ] Cloud sync with Firebase/Supabase
- [ ] Reminder notifications
- [ ] Smart meal suggestions
- [ ] Social feed and sharing
- [ ] Barcode scanning for food products
- [ ] Nutritional information database
- [ ] Progress charts and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community for the excellent framework
- Expo team for the amazing development tools
- React Native Paper for the beautiful UI components 