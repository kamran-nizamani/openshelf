interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-500">{eyebrow}</p>
        ) : null}
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
        {description ? <p className="mt-3 max-w-2xl text-base text-slate-600">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
