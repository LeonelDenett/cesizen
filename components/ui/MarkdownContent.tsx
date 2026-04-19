'use client';

function parseMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-900 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-10 mb-4">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 py-1"><span class="text-green-500 mt-1.5 shrink-0">•</span><span>$1</span></li>')
    // Ordered lists
    .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-3 py-1.5"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">$1</span><span>$2</span></li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="text-gray-600 leading-relaxed mb-4">')
    // Single newlines between list items — keep as is
    .replace(/\n/g, '\n');
}

function wrapLists(html: string): string {
  // Wrap consecutive <li> items in <ul> or <ol>
  return html
    .replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="space-y-1 my-4 pl-1">$1</ul>');
}

export default function MarkdownContent({ content }: { content: string }) {
  const html = wrapLists(parseMarkdown(content));

  return (
    <div
      className="text-gray-600 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class="text-gray-600 leading-relaxed mb-4">${html}</p>` }}
    />
  );
}
