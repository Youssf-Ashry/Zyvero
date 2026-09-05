type SectionEyebrowProps = {
  text: string;
  className?: string;
};

export default function SectionEyebrow({ text, className = '' }: SectionEyebrowProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-primary" />
      {text}
    </div>
  );
}
