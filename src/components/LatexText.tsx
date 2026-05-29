import { memo, useMemo } from 'react';

// Lazy-load katex — only the first render triggers the import
let katexModule: typeof import('katex') | null = null;
let katexPromise: Promise<typeof import('katex')> | null = null;

function getKatex() {
  if (katexModule) return katexModule;
  if (!katexPromise) {
    katexPromise = import('katex').then((m) => {
      katexModule = m;
      return m;
    });
  }
  return null;
}

// Eagerly start loading katex (but don't block render)
getKatex();

const katexOpts = { throwOnError: false };

// Simple render cache to avoid re-parsing identical strings
const renderCache = new Map<string, string>();
const MAX_CACHE_SIZE = 200;

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

function renderLatex(children: string): string {
  if (!children) return '';

  // Check cache first
  const cached = renderCache.get(children);
  if (cached) return cached;

  const katex = katexModule;

  // To prevent KaTeX throwing errors on unescaped raw HTML formatting
  // we first extract equation parts and clean them
  // We also replace global non-breaking spaces with normal spaces because Quill 
  // sometimes wraps text with &nbsp; which prevents normal line breaking.
  let processed = children.replace(/&nbsp;/g, ' ');

  if (katex) {
    // 1. Convert block math: $$...$$
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
      try {
        const html = katex.default.renderToString(cleanLatexString(p1), { ...katexOpts, displayMode: true });
        return `<div class="katex-block my-2">${html}</div>`;
      } catch (e) {
        return `<span style="color:red" title="${e instanceof Error ? e.message : 'Error'}">${match}</span>`;
      }
    });

    // 2. Convert block math: \[...\]
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, p1) => {
      try {
        const html = katex.default.renderToString(cleanLatexString(p1), { ...katexOpts, displayMode: true });
        return `<div class="katex-block my-2">${html}</div>`;
      } catch (e) {
        return `<span style="color:red" title="${e instanceof Error ? e.message : 'Error'}">${match}</span>`;
      }
    });

    // 3. Convert inline math: $...$
    processed = processed.replace(/\$([^$]+)\$/g, (match, p1) => {
      const cleaned = cleanLatexString(p1);
      if (!cleaned) return match;
      try {
        const html = katex.default.renderToString(cleaned, { ...katexOpts, displayMode: false });
        return `<span class="katex-inline">${html}</span>`;
      } catch (e) {
        return `<span style="color:red" title="${e instanceof Error ? e.message : 'Error'}">${match}</span>`;
      }
    });
  }

  // Handle plain text line breaks if it's not HTML
  const isHtml = /<[a-z][\s\S]*>/i.test(children);
  if (!isHtml) {
    processed = processed.replace(/\n/g, '<br />');
  }

  // Store in cache
  if (renderCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entries (first quarter)
    const keys = Array.from(renderCache.keys()).slice(0, MAX_CACHE_SIZE / 4);
    for (const key of keys) renderCache.delete(key);
  }
  renderCache.set(children, processed);

  return processed;
}

export const LatexText = memo(function LatexText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const html = useMemo(() => {
    if (typeof children !== 'string' || !children) return '';
    return renderLatex(children);
  }, [children]);

  if (!html) return <span className={className} />;

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
