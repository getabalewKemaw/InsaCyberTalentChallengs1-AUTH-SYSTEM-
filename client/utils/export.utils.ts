/**
 * Exports document content from ProseMirror editor to PDF print window
 */
export function exportToPDF(documentTitle: string = "Document"): void {
  const container = window.document.querySelector(".ProseMirror");
  const bodyHtml = container?.innerHTML || "";

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${documentTitle}</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            color: #333333;
            line-height: 1.6;
            margin: 40px;
            padding: 0;
            background: #ffffff;
          }
          h1 { font-size: 2.25rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #111827; }
          h2 { font-size: 1.75rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #1f2937; }
          h3 { font-size: 1.35rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; color: #374151; }
          p { margin-top: 0.5em; margin-bottom: 0.5em; }
          ul { list-style-type: disc; padding-left: 1.75rem; margin: 0.5em 0; }
          ol { list-style-type: decimal; padding-left: 1.75rem; margin: 0.5em 0; }
          blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; color: #4b5563; font-style: italic; }
          a { color: #2563eb; text-decoration: underline; }
          u { text-decoration: underline; }
          .ProseMirror-yjs-cursor, .ProseMirror-yjs-cursor-label, .ProseMirror-yjs-selection { display: none !important; }
        </style>
      </head>
      <body>
        <h1 style="font-size: 2.5rem; font-weight: 800; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 24px;">${documentTitle}</h1>
        <div>${bodyHtml}</div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

/**
 * Converts ProseMirror editor HTML DOM content to Markdown and downloads as .md file
 */
export function exportToMarkdown(documentTitle: string = "document"): void {
  const container = window.document.querySelector(".ProseMirror");
  const htmlContent = container?.innerHTML ?? "";

  let md = htmlContent;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, "**$2**");
  md = md.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, "*$2*");
  md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<ul[^>]*>(.*?)<\/ul>/gi, "$1\n");
  md = md.replace(/<ol[^>]*>(.*?)<\/ol>/gi, "$1\n");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  const markdownText = md.trim();

  const blob = new Blob([markdownText], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(window.document.createElement("a"), {
    href: url,
    download: `${documentTitle}.md`,
  });
  a.click();
  URL.revokeObjectURL(url);
}
