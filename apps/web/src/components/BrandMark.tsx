// The Reflect wordmark glyph — a simple geometric funnel/arrow mark.
// Inherits color via currentColor so it adapts to whatever text color wraps it.
export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M12 3v18M4 8l8 5 8-5" />
    </svg>
  );
}
