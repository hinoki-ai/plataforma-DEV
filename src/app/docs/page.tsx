import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation - Plataforma Astral",
  description:
    "Complete documentation for Plataforma Astral - SaaS educational platform",
};

// Simple markdown to HTML converter (basic implementation)
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
    .replace(
      /^## (.+)$/gm,
      '<h2 class="text-2xl font-semibold mb-3 mt-6">$1</h2>',
    )
    .replace(
      /^### (.+)$/gm,
      '<h3 class="text-xl font-semibold mb-2 mt-4">$1</h3>',
    )
    .replace(
      /^#### (.+)$/gm,
      '<h4 class="text-lg font-semibold mb-2 mt-3">$1</h4>',
    )
    .replace(
      /^##### (.+)$/gm,
      '<h5 class="text-base font-semibold mb-1 mt-2">$1</h5>',
    )
    .replace(
      /^###### (.+)$/gm,
      '<h6 class="text-sm font-semibold mb-1 mt-2">$1</h6>',
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /`(.+?)`/g,
      '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>',
    )
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code>$1</code></pre>',
    )
    .replace(/^\- (.+)$/gm, '<li class="ml-4">• $1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(
      /^\| (.+)\|$/gm,
      '<table class="border-collapse border border-gray-300 my-4"><tr>$1</tr></table>',
    )
    .replace(/\|[:-]+\|/g, "")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^(.+?)(<br\/>|$)/gm, "<p>$1</p>");
}

// Static content for the docs page
const staticMarkdown = `# Technical Documentation

**Plataforma Astral Educational Management System**  
**Last Updated**: October 13, 2025  
**Status**: Production ready with full Convex integration ✅

---

## 📚 Documentation Index

### Core Systems
- **[Architecture](ARCHITECTURE.md)** - System design and data flow
- **[Authentication](AUTHENTICATION_COMPLETE_GUIDE.md)** - Login, roles, and security
- **[Frontend](FRONTEND.md)** - UI components and user experience
- **[API Documentation](API_DOCUMENTATION.md)** - Backend endpoints and integration

### Specialized Features
- **[Voting System](VOTING_SYSTEM.md)** - Democratic decision-making tools
- **[Role System](ROLE_SYSTEM.md)** - User permissions and access control
- **[Animation Guide](ANIMATION_GUIDE.md)** - Motion design and interactions

### Operations & Troubleshooting
- **[Environment Setup](ENVIRONMENT.md)** - Development and deployment configs
- **[Troubleshooting](TROUBLESHOOTING_AUTH.md)** - Common issues and solutions
- **[Emergency Procedures](EMERGENCY_ACCESS_PROCEDURES.md)** - Critical system recovery

---

## 🚀 Quick Start

1. **Development**: \`npm run dev\` - Start local development server
2. **Build**: \`npm run build\` - Create production build
3. **Deploy**: \`npm run deploy\` - Full automated deployment

## 📖 Key Features

- **Multi-role Authentication** - Admin, Teacher, Parent, and Master roles
- **Real-time Collaboration** - Live updates with Convex backend
- **Responsive Design** - Mobile-first educational platform
- **Comprehensive APIs** - REST and GraphQL endpoints
- **Advanced Security** - Role-based access control and encryption

## 🔧 Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database and functions)
- **Authentication**: Clerk (OAuth + custom flows)
- **Deployment**: Vercel (frontend), Convex Cloud (backend)
- **Monitoring**: Custom analytics and error tracking

---

*For detailed information, please refer to the specific documentation files linked above.*
`;

export default function DocsPage() {
  const htmlContent = markdownToHtml(staticMarkdown);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <nav className="mb-6">
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Home
          </a>
        </nav>

        <article className="prose prose-lg max-w-none">
          <div
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            className="text-foreground"
          />
        </article>

        <footer className="mt-12 pt-8 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <p>
              For complete documentation, visit the{" "}
              <a
                href="https://github.com/hinoki-ai/plataforma-DEV/tree/main/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                docs folder on GitHub
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
