type SectionEyebrowProps = {
  text: string;
  className?: string;
};

export default function SectionEyebrow({ text, className = '' }: SectionEyebrowProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-[#252936] bg-[#101218] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#969BAA] ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-[#7C5CFC]" />
      {text}
    </div>
  );
}
