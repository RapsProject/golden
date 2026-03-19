import { Fragment } from 'react';
import { LatexText } from './LatexText';

interface QuestionTextRendererProps {
  text: string;
  imageUrl?: string | null;
  /** Extra classes applied to the root wrapper */
  className?: string;
  imgClassName?: string;
}

/**
 * Renders question text that may contain an inline image marker `[img]`.
 *
 * Placement rules:
 * - If `[img]` marker is present → image is rendered at the marker position inside the text.
 * - If no marker but `imageUrl` exists → image is rendered after the text (default fallback).
 * - Multiple `[img]` markers all render the same `imageUrl` (useful for positioning only).
 */
export function QuestionTextRenderer({
  text,
  imageUrl,
  className = '',
  imgClassName = 'max-h-64 max-w-full rounded-lg border border-slate-200 bg-slate-50 object-contain',
}: QuestionTextRendererProps) {
  const parts = text.split('[img]');
  const hasMarker = parts.length > 1;

  return (
    <div className={className}>
      {hasMarker ? (
        parts.map((part, idx) => (
          <Fragment key={idx}>
            {part.trim() ? (
              <div className={idx > 0 ? 'mt-4' : undefined}>
                <LatexText className="contents">{part}</LatexText>
              </div>
            ) : null}
            {idx < parts.length - 1 ? (
              imageUrl ? (
                <div className="my-4">
                  <img src={imageUrl} alt="Gambar soal" className={imgClassName} />
                </div>
              ) : (
                /* placeholder shown when marker is set but no image yet */
                <div className="my-3 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-5 text-xs text-slate-400">
                  Gambar akan muncul di sini
                </div>
              )
            ) : null}
          </Fragment>
        ))
      ) : (
        <>
          <LatexText className="contents">{text}</LatexText>
          {imageUrl ? (
            <div className="mt-4">
              <img src={imageUrl} alt="Gambar soal" className={imgClassName} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/** Returns the display text with [img] stripped — useful for truncated table previews */
export function stripImgMarker(text: string) {
  return text.replace(/\[img\]/g, '');
}
