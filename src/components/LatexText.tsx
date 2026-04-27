import katex from 'katex';
import 'katex/dist/katex.min.css';

const katexOpts = { throwOnError: false };

/**
 * Renders a string that may contain HTML and LaTeX:
 * - $...$ for inline math (e.g. $x^2 + y^2$)
 * - $$...$$ or \[...\] for block/display math
 */
function cleanLatexString(latex: string) {
  return latex
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .trim();
}

export function LatexText({ children, className }: { children: string; className?: string }) {
  if (typeof children !== 'string' || !children) {
    return <span className={className} />;
  }

  // To prevent KaTeX throwing errors on unescaped raw HTML formatting
  // we first extract equation parts and clean them
  // We also replace global non-breaking spaces with normal spaces because Quill 
  // sometimes wraps text with &nbsp; which prevents normal line breaking.
  let processed = children.replace(/&nbsp;/g, ' ');

  // 1. Convert block math: $$...$$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
    try {
      const html = katex.renderToString(cleanLatexString(p1), { ...katexOpts, displayMode: true });
      return `<div class="katex-block my-2">${html}</div>`;
    } catch (e) {
      // Return original text in red to indicate error
      return `<span style="color:red" title="${e instanceof Error ? e.message : 'Error'}">${match}</span>`;
    }
  });

  // 2. Convert block math: \[...\]
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, p1) => {
    try {
      const html = katex.renderToString(cleanLatexString(p1), { ...katexOpts, displayMode: true });
      return `<div class="katex-block my-2">${html}</div>`;
    } catch (e) {
      return `<span style="color:red" title="${e instanceof Error ? e.message : 'Error'}">${match}</span>`;
    }
  });

  // 3. Convert inline math: $...$
  // Matches $ followed by characters not containing $ followed by $
  processed = processed.replace(/\$([^$]+)\$/g, (match, p1) => {
    const cleaned = cleanLatexString(p1);
    if (!cleaned) return match;
    try {
      const html = katex.renderToString(cleaned, { ...katexOpts, displayMode: false });
      return `<span class="katex-inline">${html}</span>`;
    } catch (e) {
      return `<span style="color:red" title="${e instanceof Error ? e.message : 'Error'}">${match}</span>`;
    }
  });

  // Handle plain text line breaks if it's not HTML
  const isHtml = /<[a-z][\s\S]*>/i.test(children);
  if (!isHtml) {
    processed = processed.replace(/\n/g, '<br />');
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
