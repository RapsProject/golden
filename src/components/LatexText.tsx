import katex from 'katex';
import 'katex/dist/katex.min.css';

const katexOpts = { throwOnError: false };

const OPEN_DISPLAY = '\\[';
const CLOSE_DISPLAY = '\\]';

function renderBlockMath(latex: string, key: string): React.ReactNode {
  const trimmed = latex.trim();
  if (!trimmed) return null;
  try {
    const html = katex.renderToString(trimmed, { ...katexOpts, displayMode: true });
    return <span key={key} className="block my-2" dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span key={key}>\[{trimmed}\]</span>;
  }
}

/**
 * Splits a text segment into parts: plain text (may contain $...$) and \[ ... \] block math.
 */
function splitDisplayBrackets(segment: string): Array<{ type: 'text'; content: string } | { type: 'block'; content: string }> {
  const parts: Array<{ type: 'text'; content: string } | { type: 'block'; content: string }> = [];
  let s = segment;
  while (s.includes(OPEN_DISPLAY)) {
    const openIdx = s.indexOf(OPEN_DISPLAY);
    const before = s.slice(0, openIdx);
    if (before) parts.push({ type: 'text', content: before });
    const afterOpen = s.slice(openIdx + OPEN_DISPLAY.length);
    const closeIdx = afterOpen.indexOf(CLOSE_DISPLAY);
    if (closeIdx === -1) {
      parts.push({ type: 'text', content: OPEN_DISPLAY + afterOpen });
      break;
    }
    parts.push({ type: 'block', content: afterOpen.slice(0, closeIdx) });
    s = afterOpen.slice(closeIdx + CLOSE_DISPLAY.length);
  }
  if (s) parts.push({ type: 'text', content: s });
  return parts;
}

/**
 * Renders a string that may contain LaTeX:
 * - $...$ for inline math (e.g. $x^2 + y^2$)
 * - $$...$$ or \[...\] for block/display math
 */
export function LatexText({ children, className }: { children: string; className?: string }) {
  if (typeof children !== 'string' || !children) {
    return <span className={className} />;
  }

  const segments: React.ReactNode[] = [];
  const blockParts = children.split('$$');
  let keyCounter = 0;

  for (let i = 0; i < blockParts.length; i++) {
    if (i % 2 === 1) {
      // Block math from $$
      const node = renderBlockMath(blockParts[i]!, `b-${keyCounter++}`);
      if (node) segments.push(node);
    } else {
      // Text: may contain \[ ... \] and $ ... $
      const mixed = splitDisplayBrackets(blockParts[i]!);
      for (const part of mixed) {
        if (part.type === 'block') {
          const node = renderBlockMath(part.content, `d-${keyCounter++}`);
          if (node) segments.push(node);
        } else {
          const byDollar = part.content.split('$');
          for (let j = 0; j < byDollar.length; j++) {
            if (j % 2 === 0) {
              if (byDollar[j]) segments.push(byDollar[j]);
            } else {
              const latex = byDollar[j]?.trim() ?? '';
              if (latex) {
                try {
                  const html = katex.renderToString(latex, { ...katexOpts, displayMode: false });
                  segments.push(
                    // eslint-disable-next-line react-hooks/error-boundaries
                    <span key={`i-${keyCounter}`} dangerouslySetInnerHTML={{ __html: html }} />
                  );
                } catch {
                  segments.push(<span key={`i-${keyCounter}`}>${latex}$</span>);
                }
                keyCounter += 1;
              }
            }
          }
        }
      }
    }
  }

  return <span className={className}>{segments}</span>;
}
