export function HeroArt() {
  const books = [
    { c: "#315cf5", h: 210, r: -8, x: 0 }, { c: "#14243a", h: 250, r: 0, x: 70 },
    { c: "#6f8cff", h: 190, r: 6, x: 140 }, { c: "#9db3ff", h: 230, r: -3, x: 210 },
  ];
  return (
    <div className="relative mx-auto hidden h-80 w-full max-w-md lg:block" aria-hidden="true">
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/10 to-navy/5" />
      <svg viewBox="0 0 320 300" className="absolute inset-0 h-full w-full">
        <rect x="10" y="262" width="300" height="10" rx="5" fill="#14243a" opacity=".85" />
        {books.map((b, i) => (
          <g key={i} transform={`translate(${30 + b.x},${262 - b.h}) rotate(${b.r} 30 ${b.h})`}>
            <rect width="58" height={b.h} rx="6" fill={b.c} />
            <rect x="8" y="22" width="42" height="4" rx="2" fill="#fff" opacity=".7" />
            <rect x="8" y="34" width="28" height="4" rx="2" fill="#fff" opacity=".45" />
            <rect x="8" y={b.h - 36} width="42" height="14" rx="3" fill="#fff" opacity=".18" />
          </g>
        ))}
      </svg>
    </div>
  );
}
