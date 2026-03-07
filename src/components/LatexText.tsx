import katex from 'katex';

const katexOpts = { throwOnError: false };

/**
 * Renders a string that may contain LaTeX:
 * - $...$ for inline math (e.g. $x^2 + y^2$)
 * - $$...$$ for block/display math (e.g. $$\frac{a}{b}$$)
 */
export function LatexText({ children, className }: { children: string; className?: string }) {
  if (typeof children !== 'string' || !children) {
    return <span className={className} />;
  }

  const segments: React.ReactNode[] = [];
  const blockParts = children.split('$$');

  for (let i = 0; i < blockParts.length; i++) {
    if (i % 2 === 1) {
      // Block math
      const latex = blockParts[i]!.trim();
      if (latex) {
        try {
          const html = katex.renderToString(latex, { ...katexOpts, displayMode: true });
          segments.push(
            <span key={`b-${i}`} className="block my-2" dangerouslySetInnerHTML={{ __html: html }} />
          );
        } catch {
          segments.push(<span key={`b-${i}`}>$${latex}$$</span>);
        }
      }
    } else {
      // Text that may contain inline $...$; split by '$' -> odd indices are math
      const byDollar = blockParts[i]!.split('$');
      for (let j = 0; j < byDollar.length; j++) {
        if (j % 2 === 0) {
          if (byDollar[j]) segments.push(byDollar[j]);
        } else {
          const latex = byDollar[j]?.trim() ?? '';
          if (latex) {
            try {
              const html = katex.renderToString(latex, { ...katexOpts, displayMode: false });
              segments.push(
                <span key={`i-${i}-${j}`} dangerouslySetInnerHTML={{ __html: html }} />
              );
            } catch {
              segments.push(<span key={`i-${i}-${j}`}>${latex}$</span>);
            }
          }
        }
      }
    }
  }

  return <span className={className}>{segments}</span>;
}
