# Frequently Asked Questions - Plataforma Astral

**Educational Management SaaS Platform**  
**Common Questions and Answers**  
**Last Updated**: November 20, 2025  
**Status**: Production Ready ✅

---

## 📋 Quick Navigation

| Category                                      | Questions                             |
| --------------------------------------------- | ------------------------------------- |
| **[Getting Started](#🚀-getting-started)**    | Setup, installation, first steps      |
| **[Authentication](#🔐-authentication)**      | Login, roles, permissions             |
| **[Features](#🎯-features)**                  | How to use platform features          |
| **[Technical](#💻-technical)**                | Development, deployment, architecture |
| **[Billing & Pricing](#💰-billing--pricing)** | Pricing, help, contact                |

---

## 🚀 Getting Started

### What is Plataforma Astral?

**Plataforma Astral** is a comprehensive SaaS platform for educational institutions in Chile, built with modern web technologies. It provides:

- **Teacher Planning**: Lesson planning and curriculum management
- **Parent-Teacher Meetings**: Scheduling and coordination system
- **School Calendar**: Institution-wide event management
- **Role-Based Access**: Secure multi-user system (Admin/Teacher/Parent)
- **Centro Consejo Voting**: Digital voting platform for school councils
- **Media Resources**: Photo and video management system
- **Libro de Clases**: MINEDUC-compliant digital class book system

### How do I get started?

1. **Quick Setup (5 minutes):**

   ```bash
   git clone <repository-url>
   cd plataforma-astral
   npm install
   npx convex dev  # Get your Convex URL
   cp .env.example .env  # Add your URLs
   npm run dev
   ```

2. **Create Test Accounts:**
   - Create test accounts through the admin panel or contact your administrator

3. **Read Documentation:**
   - [START_HERE.md](../START_HERE.md) - Setup guide
   - [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md) - All docs

### What are the system requirements?

- **Node.js**: 18+ (20+ recommended)
- **Browser**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Internet**: Stable connection for real-time features
- **Storage**: Minimal local storage requirements

### Is it free to use?

The platform offers:

- **Free Tier**: Development and testing
- **Paid Plans**: Production deployment with support
- **Self-Hosted**: Deploy on your own infrastructure

Contact [sales@plataforma-astral.com](mailto:sales@plataforma-astral.com) for pricing.

---

## 🔐 Authentication

### How do I log in?

1. **Visit the platform** at your institution's URL
2. **Click "Sign In"** in the top navigation
3. **Choose your login method** (typically email/password)
4. **Use your institution-provided credentials**

### What roles are available?

| Role         | Access Level      | Description                         |
| ------------ | ----------------- | ----------------------------------- |
| **MASTER**   | Full System       | Complete administrative access      |
| **ADMIN**    | Institution Admin | School-level administration         |
| **PROFESOR** | Teaching Staff    | Lesson planning, student management |
| **PARENT**   | Parents/Guardians | Meeting requests, progress tracking |
| **PUBLIC**   | Limited           | Public information access           |

### How do I reset my password?

1. **Go to the login page**
2. **Click "Forgot Password?"**
3. **Enter your email address**
4. **Check your email** for reset instructions
5. **Follow the secure link** to set a new password

### Why can't I access certain pages?

Access is controlled by roles. If you can't access a page:

1. **Check your role** in your profile settings
2. **Contact your administrator** to update permissions
3. **Verify you're logged in** with the correct account

### How do I switch between roles? (Development)

In development/testing environments:

1. **Log out** of current account
2. **Use test credentials** for different roles
3. **Or update user metadata** in Clerk dashboard

---

## 🎯 Features

### How do I schedule a parent-teacher meeting?

**For Parents:**

1. **Log in** as a parent
2. **Go to "Meetings"** section
3. **Click "Request Meeting"**
4. **Select teacher** and preferred date/time
5. **Add description** of the meeting topic
6. **Submit request**

**For Teachers:**

1. **Review meeting requests** in your dashboard
2. **Accept/reject** based on availability
3. **Schedule confirmed meetings** with parents

### How does the voting system work?

The Centro Consejo voting system allows:

1. **Admins create votes** with multiple options
2. **Eligible voters** (parents/teachers) receive notifications
3. **Secure voting** with duplicate prevention
4. **Real-time results** after voting closes
5. **Audit trail** of all votes cast

**Key Features:**

- Multiple voting types (single/multiple choice)
- Anonymous or attributed voting
- Configurable deadlines
- Result visualization

### What is the Libro de Clases system?

The **Libro de Clases Digital** is a MINEDUC-compliant digital class book that includes:

- **Student Attendance**: Daily attendance tracking
- **Grades Management**: Chilean grading scale (1.0-7.0)
- **Lesson Content**: Daily lesson plans and materials
- **Observations**: Positive/negative student observations
- **Parent Meetings**: Meeting attendance records
- **Extra-curricular**: Additional activities tracking

### How do I upload media files?

1. **Navigate** to the Media section
2. **Click "Upload"** button
3. **Select files** (images, videos, documents)
4. **Add descriptions** and tags
5. **Choose sharing permissions**
6. **Upload** to Cloudinary storage

**Supported formats:** JPG, PNG, GIF, MP4, PDF, DOC, XLS

### How do I create lesson plans?

**For Teachers:**

1. **Access "Planning"** section
2. **Click "New Plan"**
3. **Select subject** and grade level
4. **Define objectives** and outcomes
5. **Add activities** and materials
6. **Set timeline** and assessment methods
7. **Save and share** with colleagues

---

## 💻 Technical

### What technologies are used?

| Component          | Technology        | Version            |
| ------------------ | ----------------- | ------------------ |
| **Frontend**       | Next.js           | 16.x (App Router)  |
| **Backend**        | Convex            | 1.28+ (Serverless) |
| **Authentication** | Clerk             | 6.34+              |
| **Database**       | Convex            | Real-time          |
| **Styling**        | Tailwind CSS      | 4.x                |
| **UI Components**  | shadcn/ui + Radix | Latest             |
| **Language**       | TypeScript        | 5.9+               |

### How do I deploy the platform?

**Single-Command Deployment:**

```bash
npm run deploy  # Automated deployment with checks
```

**Manual Deployment:**

```bash
npm run convex:deploy  # Deploy backend first
git push origin main    # Deploy frontend (automatic)
```

**Requirements:**

- Vercel account for frontend
- Convex account for backend
- Environment variables configured

### How does real-time data work?

The platform uses **Convex's real-time database**:

- **Automatic Updates**: UI updates instantly when data changes
- **WebSocket Connections**: Efficient real-time communication
- **Offline Support**: Queues changes when offline
- **Conflict Resolution**: Automatic conflict handling

### Is the platform secure?

**Security Features:**

- **End-to-end encryption** for data transmission
- **Role-based access control** (RBAC)
- **Secure authentication** via Clerk
- **Input validation** and sanitization
- **Regular security audits**
- **GDPR compliance** for data protection

### Can I customize the platform?

Yes, the platform is highly customizable:

- **White-labeling**: Custom branding and colors
- **Feature toggles**: Enable/disable features per institution
- **Custom fields**: Add institution-specific data fields
- **API integrations**: Connect with existing school systems
- **Custom workflows**: Adapt to institution processes

---

## 📊 Data & Privacy

### What data is stored?

The platform stores:

- **User Profiles**: Name, email, role, preferences
- **Student Information**: Names, grades, attendance, observations
- **Academic Records**: Grades, lesson plans, assessments
- **Meeting Records**: Scheduling, attendance, notes
- **Media Files**: Photos, videos, documents
- **Voting Records**: Votes cast, results, audit trails

### How is data protected?

- **Encryption**: Data encrypted at rest and in transit
- **Access Controls**: Strict role-based permissions
- **Audit Logs**: All data access tracked
- **Backup**: Regular automated backups
- **Compliance**: MINEDUC and data protection regulations

### Can I export my data?

Yes, data export options include:

- **PDF Reports**: Academic records, attendance reports
- **CSV Exports**: Student data, grades, meeting records
- **API Access**: Programmatic data access
- **Full Backup**: Complete institution data export

### How long is data retained?

- **Academic Records**: 5+ years (Chilean regulations)
- **User Data**: As long as account is active
- **Media Files**: Configurable retention policies
- **Audit Logs**: 7 years minimum

---

## 🆘 Support & Troubleshooting

### Where can I get help?

**Support Channels:**

- **Documentation**: [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md)
- **Troubleshooting Guide**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **GitHub Issues**: Bug reports and feature requests
- **Email Support**: [support@plataforma-astral.com](mailto:support@plataforma-astral.com)

### What if I forget my login?

1. **Use "Forgot Password"** on login page
2. **Contact your administrator** for account recovery
3. **Check spam folder** for password reset emails

### The platform is slow, what can I do?

**Performance Optimization:**

1. **Check internet connection**
2. **Clear browser cache**
3. **Close unnecessary tabs**
4. **Try incognito mode**
5. **Contact support** if persistent

### How do I report a bug?

1. **Check existing issues** on GitHub
2. **Use the bug report template**
3. **Include screenshots** and steps to reproduce
4. **Specify browser/OS** information
5. **Add console errors** if applicable

### I need a new feature, how do I request it?

1. **Check existing requests** on GitHub
2. **Use feature request template**
3. **Describe the problem** and proposed solution
4. **Include use cases** and benefits
5. **Add mockups** if possible

---

## 💰 Billing & Pricing

### How much does it cost?

**Pricing Tiers:**

- **Free**: Development and testing (up to 100 users)
- **Basic**: $XX/month (up to 500 users)
- **Professional**: $XX/month (up to 2000 users)
- **Enterprise**: Custom pricing

**Includes:**

- Platform access
- Technical support
- Regular updates
- Data backup
- Security monitoring

### What payment methods are accepted?

- **Credit Cards**: Visa, Mastercard, American Express
- **Bank Transfers**: For enterprise customers
- **PayPal**: Available for annual plans
- **Invoice**: For organizations with PO systems

### Can I change plans anytime?

Yes, you can:

- **Upgrade**: Immediate access to new features
- **Downgrade**: At the end of billing cycle
- **Cancel**: Anytime with 30-day notice
- **Prorate**: Charges adjusted for mid-cycle changes

### Is there a free trial?

- **14-day free trial** for all paid plans
- **Full feature access** during trial
- **No credit card required** to start
- **Easy upgrade** at trial end

### What about custom development?

We offer:

- **Custom features** development
- **Integration services** with existing systems
- **White-labeling** and branding
- **Dedicated support** and SLAs

Contact [sales@plataforma-astral.com](mailto:sales@plataforma-astral.com)

---

## 🏫 Institution-Specific

### How do I set up for my school?

**Institution Setup:**

1. **Contact sales** to create institution account
2. **Provide school information** (name, address, contact)
3. **Configure user roles** and permissions
4. **Import existing data** (optional)
5. **Train staff** on platform usage

### Can multiple schools use the same instance?

Yes, the platform supports:

- **Multi-tenant architecture**
- **Institution separation** of data
- **Custom configurations** per school
- **Shared infrastructure** with isolated data

### How do I migrate from existing systems?

**Migration Support:**

- **Data import tools** for common formats
- **API integrations** with existing systems
- **Professional services** for complex migrations
- **Step-by-step guides** for self-migration

---

## 🔄 Updates & Maintenance

### How often is the platform updated?

- **Monthly releases** with new features
- **Weekly patches** for bug fixes
- **Emergency updates** for security issues
- **Advance notice** for breaking changes

### Will my data be safe during updates?

- **Zero-downtime deployments**
- **Automatic backups** before updates
- **Rollback capability** if issues occur
- **Data integrity** checks after updates

### How do I stay informed about updates?

- **Email notifications** for important updates
- **Changelog** in documentation
- **Status page** for system health
- **Newsletter** for feature announcements

---

## 📞 Contact Information

**General Support:**

- Email: [support@plataforma-astral.com](mailto:support@plataforma-astral.com)
- Response Time: <24 hours

**Sales & Pricing:**

- Email: [sales@plataforma-astral.com](mailto:sales@plataforma-astral.com)
- Phone: +56 2 XXXX XXXX

**Technical Issues:**

- GitHub Issues: For bug reports
- Emergency: [emergency@plataforma-astral.com](mailto:emergency@plataforma-astral.com)

**Business Hours:** Monday-Friday, 9:00-18:00 CLT

---

_Still have questions? Check our [documentation](../DOCUMENTATION_INDEX.md) or contact support._
