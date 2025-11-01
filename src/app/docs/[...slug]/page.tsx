import { readFileSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import DocsArticleContent from "../DocsArticleContent";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

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
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^(.+?)(<br\/>|$)/gm, "<p>$1</p>");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fileName = slug.join("/") + ".md";

  return {
    title: `${fileName} - Plataforma Astral Documentation`,
    description: `Documentation for ${fileName} in Plataforma Astral`,
  };
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;
  const fileName = slug.join("/") + ".md";
  const filePath = join(process.cwd(), "docs", fileName);

  let htmlContent = "";

  try {
    const markdown = readFileSync(filePath, "utf-8");
    htmlContent = markdownToHtml(markdown);
  } catch (error) {
    notFound();
  }

  const githubUrl = `https://github.com/hinoki-ai/plataforma-DEV/blob/main/docs/${fileName}`;

  return (
    <DocsArticleContent
      htmlContent={htmlContent}
      fileName={fileName}
      githubUrl={githubUrl}
    />
  );
}
