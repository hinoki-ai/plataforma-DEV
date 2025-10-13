import { readFileSync } from 'fs';
import { join } from 'path';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation - Plataforma Astral',
  description: 'Complete documentation for Plataforma Astral - SaaS educational platform',
};

// Simple markdown to HTML converter (basic implementation)
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mb-3 mt-6">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mb-2 mt-4">$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-semibold mb-2 mt-3">$1</h4>')
    .replace(/^##### (.+)$/gm, '<h5 class="text-base font-semibold mb-1 mt-2">$1</h5>')
    .replace(/^###### (.+)$/gm, '<h6 class="text-sm font-semibold mb-1 mt-2">$1</h6>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code>$1</code></pre>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4">• $1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^\| (.+)\|$/gm, '<table class="border-collapse border border-gray-300 my-4"><tr>$1</tr></table>')
    .replace(/\|[:-]+\|/g, '')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^(.+?)(<br\/>|$)/gm, '<p>$1</p>');
}

export default function DocsPage() {
  const filePath = join(process.cwd(), 'DOCUMENTATION_INDEX.md');
  const markdown = readFileSync(filePath, 'utf-8');
  const htmlContent = markdownToHtml(markdown);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <nav className="mb-6">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
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
              File: <code className="bg-muted px-2 py-1 rounded">DOCUMENTATION_INDEX.md</code>
            </p>
            <p className="mt-2">
              <a
                href="https://github.com/hinoki-ai/plataforma-DEV/blob/main/DOCUMENTATION_INDEX.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View on GitHub →
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
