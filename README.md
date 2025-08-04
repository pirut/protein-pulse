# Protein Pulse

A simple and intuitive protein tracking web application that helps you monitor your daily protein intake, set goals, and track your progress over time.

## Features

- 🔐 **Secure Authentication** - Powered by Clerk for seamless user management
- 📊 **Daily Tracking** - Log your protein intake with detailed meal information
- 🎯 **Goal Setting** - Set and track daily protein goals
- 🍽️ **Preset Meals** - Create and reuse common meals for quick logging
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 📈 **Progress Visualization** - Visual progress bars and daily summaries

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **API**: tRPC for type-safe API calls
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Clerk account for authentication
- A PostgreSQL database (or use Prisma Data Platform)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd protein-pulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

### 4. Set up Clerk

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your publishable key and secret key to the `.env` file
4. Configure your sign-in and sign-up URLs

### 5. Database Setup

If you're using Prisma Data Platform (recommended):

1. Go to [cloud.prisma.io](https://cloud.prisma.io)
2. Create a new project
3. Copy the connection string to your `.env` file

Or use a local PostgreSQL database:

```bash
# Run the database migration
npx prisma migrate dev
```

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### First Time Setup

1. **Sign Up/In**: Use the authentication system to create your account
2. **Set Daily Goal**: Go to Settings and set your daily protein target
3. **Add Profile**: Optionally add your weight, height, and activity level for personalized recommendations

### Daily Usage

1. **Log Protein**: Click "Add Protein Entry" to log your protein intake
2. **Use Preset Meals**: Create common meals for quick logging
3. **Track Progress**: View your daily progress and remaining protein needs
4. **View History**: Change the date to view past entries

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Main dashboard
│   ├── settings/       # Settings page
│   └── layout.tsx      # Root layout with providers
├── server/             # Backend API
│   ├── api/           # tRPC API routes
│   └── db.ts          # Database connection
├── trpc/              # tRPC client setup
└── styles/            # Global styles
```

## Database Schema

The application uses the following main entities:

- **User**: Authentication and profile information
- **Profile**: User details (weight, height, activity level)
- **DailyGoal**: Daily protein targets
- **ProteinEntry**: Individual protein intake logs
- **PresetMeal**: Reusable meal templates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
