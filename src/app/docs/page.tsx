"use client";

import DocsLandingContent from "./DocsLandingContent";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

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

export default function DocsPage() {
  const { t, language } = useDivineParsing(["common"]);

  // Generate markdown content based on language
  const staticMarkdown = `# ${t("docs.content.title", "common")}

**${t("docs.content.system_name", "common")}**  
**${t("docs.content.last_updated", "common")}**: October 13, 2025  
**${t("docs.content.status", "common")}**: ${t("docs.content.status_value", "common")}

---

## ${t("docs.content.index_title", "common")}

### ${t("docs.content.core_systems", "common")}
- **[${t("docs.content.ai_kb", "common")}](AI_KNOWLEDGE_BASE.md)** - **${t("docs.content.ai_kb_desc", "common")}** (includes authentication)
- **[${t("docs.content.animation_guide", "common")}](ANIMATION_GUIDE.md)** - ${t("docs.content.animation_guide_desc", "common")}

### ${t("docs.content.specialized_features", "common")}
- **[${t("docs.content.voting_system", "common")}](VOTING_SYSTEM.md)** - ${t("docs.content.voting_system_desc", "common")}
- **[${t("docs.content.role_system", "common")}](ROLE_SYSTEM.md)** - ${t("docs.content.role_system_desc", "common")}

### ${t("docs.content.operations", "common")}
- **[${t("docs.content.env_setup", "common")}](ENVIRONMENT.md)** - ${t("docs.content.env_setup_desc", "common")}
- **[${t("docs.content.troubleshooting", "common")}](AI_KNOWLEDGE_BASE.md)** - ${t("docs.content.troubleshooting_desc", "common")} (see troubleshooting sections)
- **[${t("docs.content.emergency", "common")}](EMERGENCY_ACCESS_PROCEDURES.md)** - ${t("docs.content.emergency_desc", "common")}

---

## ${t("docs.content.quick_start", "common")}

1. **${t("docs.content.dev", "common")}**: \`npm run dev\` - ${t("docs.content.dev_desc", "common")}
2. **${t("docs.content.build", "common")}**: \`npm run build\` - ${t("docs.content.build_desc", "common")}
3. **${t("docs.content.deploy", "common")}**: \`npm run deploy\` - ${t("docs.content.deploy_desc", "common")}

## ${t("docs.content.key_features", "common")}

- **${t("docs.content.multi_role", "common")}** - ${t("docs.content.multi_role_desc", "common")}
- **${t("docs.content.realtime", "common")}** - ${t("docs.content.realtime_desc", "common")}
- **${t("docs.content.responsive", "common")}** - ${t("docs.content.responsive_desc", "common")}
- **${t("docs.content.apis", "common")}** - ${t("docs.content.apis_desc", "common")}
- **${t("docs.content.security", "common")}** - ${t("docs.content.security_desc", "common")}

## ${t("docs.content.tech_stack", "common")}

- **${t("docs.content.frontend", "common")}**: ${t("docs.content.frontend_value", "common")}
- **${t("docs.content.backend", "common")}**: ${t("docs.content.backend_value", "common")}
- **${t("docs.content.auth_tech", "common")}**: ${t("docs.content.auth_tech_value", "common")}
- **${t("docs.content.deployment_tech", "common")}**: ${t("docs.content.deployment_tech_value", "common")}
- **${t("docs.content.monitoring", "common")}**: ${t("docs.content.monitoring_value", "common")}

---

*${t("docs.content.detailed_info", "common")}*
`;

  const htmlContent = markdownToHtml(staticMarkdown);

  return <DocsLandingContent htmlContent={htmlContent} />;
}
