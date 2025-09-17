# NewsBuddy UI

A modern, responsive web application built with Next.js that provides an interactive chat interface for news-related conversations.

## Overview

NewsBuddy UI is the client-side component of the NewsBuddy application, designed to provide users with an intuitive interface for interacting with news-related content through a chat-based interface. Built with modern web technologies, it offers a seamless and responsive user experience.

## Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**:
  - Radix UI Primitives
  - Custom shadcn/ui components
- **Font**: Geist (Sans & Mono)
- **Analytics**: Vercel Analytics
- **State Management**: React Hooks

## Features

- Real-time chat interface
- Session management
- Chat history
- Responsive design
- Typing effect animations
- Accessible UI components

## Project Structure

```
client/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main chat page
├── components/            # React components
│   ├── chat-area.tsx     # Chat interface
│   ├── chat-sidebar.tsx  # Chat navigation
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   ├── utils.ts          # Helper functions
│   └── services/         # API services
├── public/               # Static assets
└── styles/              # Additional styles
```

## Setup

1. **Prerequisites**

   - Node.js (LTS version)
   - pnpm package manager

2. **Installation**

   ```bash
   # Clone the repository
   git clone https://github.com/majjikishore007/NewsBuddy-UI.git

   # Navigate to the client directory
   cd NewsBuddy/client

   # Install dependencies
   pnpm install
   ```

3. **Development**

   ```bash
   # Run the development server
   pnpm dev
   ```

4. **Building for Production**

   ```bash
   # Create production build
   pnpm build

   # Start production server
   pnpm start
   ```

## Key Components

### Chat Area

The main chat interface component (`chat-area.tsx`) handles:

- Message display with typing effects
- User input management
- Message sending functionality
- Auto-scrolling to latest messages

### Chat Sidebar

The sidebar component (`chat-sidebar.tsx`) provides:

- Chat session management
- Navigation between different conversations
- Session creation and selection

## Configuration

The application can be configured through various configuration files:

- `next.config.mjs`: Next.js configuration
- `postcss.config.mjs`: PostCSS configuration
- `tsconfig.json`: TypeScript configuration
- `components.json`: UI component configuration

## Development

### Code Style

- TypeScript for type safety
- React functional components with hooks
- CSS modules with Tailwind for styling
- Component-based architecture

### Best Practices

- Accessible UI components
- Responsive design patterns
- Performance optimization
- Type safety

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, please open an issue in the GitHub repository or contact the development team.
