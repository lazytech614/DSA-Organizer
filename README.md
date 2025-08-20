# DSA Organizer 📚

A comprehensive Data Structures and Algorithms learning platform built with modern web technologies. Track your progress, practice problems, and master DSA concepts with an intuitive and organized approach.

## 🌐 Live Demo

**[Visit DSA Organizer](https://dsa-organizer-chi.vercel.app/)**

## ✨ Features

- 🔐 **Secure Authentication** - User authentication and authorization with Clerk
- 📊 **Progress Tracking** - Visual progress charts and analytics with Recharts
- 🗂️ **Problem Organization** - Categorized DSA problems by topic and difficulty
- 📈 **Performance Analytics** - Track solving time, success rate, and improvement over time
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🌙 **Modern UI** - Clean and intuitive interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[React](https://reactjs.org/)** - UI component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Hook Form](https://react-hook-form.com/)** - Forms with easy validation
- **[React Query](https://tanstack.com/query)** - Data fetching and state management
- **[Recharts](https://recharts.org/)** - Charts and data visualization

### Backend & Database
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Prisma ORM](https://www.prisma.io/)** - Type-safe database client
- **[Clerk](https://clerk.dev/)** - Authentication and user management

### Deployment
- **[Vercel](https://vercel.com/)** - Deployment and hosting

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lazytech614/dsa-organizer.git
   cd dsa-organizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/dsa_organizer"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
dsa-course-website/
├── prisma/ # Database schema and migrations
│ ├── schema.prisma # Prisma database schema
│ └── seed.ts # Database seeding scripts
├── public/ # Static assets
│ ├── icons/ # App icons and favicons
│ └── images/ # Static images
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── (auth)/ # Authentication routes
│ │ ├── api/ # API endpoints
│ │ ├── dashboard/ # Dashboard pages
│ │ ├── courses/ # Course-related pages
│ │ ├── platforms/ # Platform integration pages
│ │ ├── favicon.ico # App favicon
│ │ ├── globals.css # Global styles
│ │ ├── layout.tsx # Root layout component
│ │ └── page.tsx # Home page
│ ├── components/ # Reusable UI components
│ │ ├── admin/ # Admin panel components
│ │ ├── cards/ # Card components
│ │ ├── course/ # Course-related components
│ │ │ ├── course-stats/ # Course statistics components
│ │ │ ├── question-item/ # Individual question components
│ │ │ └── topic-section.tsx # Topic section component
│ │ ├── dialogs/ # Modal and dialog components
│ │ ├── layout/ # Layout components
│ │ ├── platform-integration/ # Platform connection components
│ │ ├── pricing/ # Pricing and subscription components
│ │ ├── providers/ # Context providers
│ │ └── ui/ # Base UI components (shadcn/ui)
│ ├── constants/ # Application constants
│ ├── generated/ # Generated files
│ ├── hooks/ # Custom React hooks
│ │ ├── use-mobile.ts # Mobile detection hook
│ │ ├── useBookmarks.ts # Bookmark management
│ │ ├── useCourses.ts # Course data management
│ │ ├── usePlatformLimits.ts # Platform usage limits
│ │ ├── usePricing.ts # Pricing and subscriptions
│ │ ├── useQuestionParsers.ts # Question parsing utilities
│ │ ├── useQuestions.ts # Question management
│ │ ├── useSolvedQuestions.ts # Solved question tracking
│ │ ├── useSubscription.ts # Subscription management
│ │ └── useUserInfo.ts # User information management
│ ├── lib/ # Utility libraries and configurations
│ │ ├── middleware/ # Custom middleware
│ │ ├── services/ # External service integrations
│ │ │ └── platform/ # Platform service implementations
│ │ │ ├── platforms/ # Individual platform services
│ │ │ │ ├── codeforcesService.ts # Codeforces API integration
│ │ │ │ ├── leetcodeService.ts # LeetCode API integration
│ │ │ │ ├── codechefService.ts # CodeChef API integration
│ │ │ │ └── geeksforgeeksService.ts # GFG integration
│ │ │ └── platformService.ts # Main platform service
│ │ ├── trackers/ # Progress tracking utilities
│ │ │ ├── db.ts # Database utilities
│ │ │ ├── questionParser.ts # Question parsing logic
│ │ │ ├── subscription.ts # Subscription utilities
│ │ │ ├── sync-user.tsx # User synchronization
│ │ │ └── utils.ts # General utilities
│ │ └── types/ # TypeScript type definitions
│ │ └── middleware.ts # Middleware types
├── .env # Environment variables (template)
├── .env.local # Local environment variables (gitignored)
├── .gitignore # Git ignore rules
├── components.json # shadcn/ui configuration
├── eslint.config.mjs # ESLint configuration
├── next-env.d.ts # Next.js TypeScript declarations
├── next.config.js # Next.js configuration
├── package.json # Dependencies and scripts
├── package-lock.json # Lock file for npm
├── postcss.config.js # PostCSS configuration
├── README.md # Project documentation
├── tailwind.config.ts # Tailwind CSS configuration

```

## 🗃️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities include:

- **Users** - User profiles and authentication
- **Problems** - DSA problems with metadata
- **Categories** - Problem categories (Arrays, Trees, etc.)
- **UserProgress** - Individual user progress tracking

## 📊 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma migrate   # Run database migrations
npx prisma generate  # Generate Prisma client

# Deployment
npm run deploy       # Deploy to Vercel
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🐛 Bug Reports

If you encounter any bugs, please create an issue with:
- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

## 🙏 Acknowledgments

- Data structures and algorithms problems inspired by LeetCode, HackerRank, and other platforms
- Design inspiration from modern coding platforms
- Open source community for amazing tools and libraries

## 📞 Support

For support, email [derupanjan2021@gmail.com] or create an issue in this repository.

---

**Happy Coding! 🚀**

Made with ❤️ for DSA learners everywhere.