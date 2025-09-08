# Manitos Pintadas School Management Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-blue)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-blue)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-blue)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A comprehensive, multi-role school management system built with modern web technologies. Supports administrators, teachers, parents, and master users with role-based access control, real-time notifications, and responsive design.

## 🌟 Features

### ✅ **Completed Features**

#### 🔐 **Authentication & Authorization**
- Multi-provider authentication (Credentials, Google OAuth)
- Role-based access control (Master, Admin, Profesor, Parent)
- JWT token management with NextAuth.js
- Secure password hashing and validation

#### 📊 **Dashboard System**
- **Master Dashboard**: System-wide monitoring and control
- **Admin Dashboard**: User management and school operations
- **Profesor Dashboard**: Teaching tools and student management
- **Parent Dashboard**: Student progress and communication

#### 🔔 **Real-time Features**
- Server-Sent Events for live notifications
- Real-time dashboard updates
- Instant messaging system
- Live activity feeds

#### 📱 **Mobile & Responsive**
- Mobile-first responsive design
- Touch-optimized interfaces
- Cross-browser compatibility
- Progressive Web App features

#### ⚡ **Performance Optimized**
- Lazy loading and code splitting
- Service worker caching
- Database query optimization
- Image optimization and compression

#### 🧪 **Testing Suite**
- Comprehensive API endpoint tests
- Component testing with React Testing Library
- Integration tests for critical workflows
- Performance and accessibility testing

### 🎯 **Key Capabilities**

1. **User Management**
   - Create, update, and manage user accounts
   - Role assignment and permission management
   - Bulk user operations

2. **Meeting Management**
   - Schedule parent-teacher meetings
   - Meeting templates and automation
   - Meeting history and outcomes

3. **Academic Planning**
   - Lesson planning tools
   - Curriculum management
   - Resource sharing

4. **Communication System**
   - Real-time notifications
   - Parent-teacher messaging
   - System announcements

5. **Calendar Integration**
   - School calendar management
   - Event scheduling
   - Holiday and term management

6. **Reporting & Analytics**
   - Student progress reports
   - Attendance tracking
   - Performance analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- PostgreSQL 13.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/manitos-pintadas.git
   cd manitos-pintadas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed with sample data
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
manitos-pintadas/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (main)/            # Main application pages
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── admin/            # Admin components
│   │   ├── notifications/    # Notification system
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts          # Authentication config
│   │   ├── db.ts            # Database connection
│   │   └── performance-utils.ts # Performance utilities
│   ├── styles/               # Additional stylesheets
│   └── types/                # TypeScript type definitions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── tests/                    # Test files
├── docs/                     # Documentation
└── scripts/                  # Utility scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | JWT secret for NextAuth | Yes |
| `NEXTAUTH_URL` | Base URL for the application | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |

### Database Configuration

The application uses Prisma ORM with PostgreSQL. The schema includes:

- **Users**: Authentication and role management
- **Students**: Student information and progress
- **Meetings**: Parent-teacher meeting scheduling
- **Planning Documents**: Lesson plans and curriculum
- **Calendar Events**: School calendar and events
- **Notifications**: Real-time notification system
- **Activities**: Class activities and events

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main branch

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### Traditional Server

```bash
# Build for production
npm run build

# Start production server
npm start
```

See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- tests/unit/api/dashboard-api.test.ts
```

### Test Structure

- **Unit Tests**: API endpoints, utilities, and components
- **Integration Tests**: Database operations and API workflows
- **E2E Tests**: Critical user journeys and workflows
- **Performance Tests**: Load testing and performance monitoring

## 📚 API Documentation

Complete API documentation is available at [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

### Quick API Examples

```typescript
// Get dashboard data
const dashboard = await fetch('/api/admin/dashboard');
const data = await dashboard.json();

// Create notification
await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Meeting Reminder',
    message: 'You have a meeting tomorrow',
    type: 'info',
    isBroadcast: false,
    recipientIds: ['user-id']
  })
});

// Real-time notifications
const eventSource = new EventSource('/api/notifications/stream');
eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
};
```

## 🎨 Customization

### Themes and Styling

The application uses Tailwind CSS for styling with custom design tokens:

```css
/* Custom CSS variables in globals.css */
:root {
  --primary: 222 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
}
```

### Role-specific Customization

Each user role has customizable dashboard layouts and features:

- **Master**: Supreme control interface
- **Admin**: Administrative tools and user management
- **Profesor**: Teaching tools and student management
- **Parent**: Student progress and communication

## 🔒 Security

### Security Features

- **Authentication**: Secure JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: Protection against abuse
- **HTTPS Only**: Secure communication
- **CSRF Protection**: Cross-site request forgery prevention

### Security Checklist

- [x] Environment variables properly configured
- [x] Database credentials secured
- [x] HTTPS enabled in production
- [x] Rate limiting implemented
- [x] Input validation on all forms
- [x] XSS protection enabled
- [x] CSRF tokens implemented

## 📊 Performance

### Optimization Features

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Caching**: Service worker and browser caching
- **Image Optimization**: Next.js automatic image optimization
- **Database Indexing**: Optimized database queries
- **CDN Support**: Static asset delivery optimization

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Radix UI](https://www.radix-ui.com/) - UI components

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/manitos-pintadas/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/manitos-pintadas/discussions)
- **Email**: support@manitospintadas.com

## 🎉 What's Next

### Planned Features

- [ ] Advanced reporting and analytics
- [ ] Mobile app companion
- [ ] Integration with learning management systems
- [ ] Advanced calendar features
- [ ] Bulk operations and automation
- [ ] Multi-language support
- [ ] Advanced notification templates

### Roadmap

- **Phase 1**: Core functionality ✅
- **Phase 2**: Advanced features (Q1 2024)
- **Phase 3**: Mobile app development (Q2 2024)
- **Phase 4**: Enterprise features (Q3 2024)

---

Built with ❤️ for educational excellence