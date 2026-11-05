import { Star } from "lucide-react";

export function Stars({ value, count, size = 16 }: { value: number; count?: number; size?: number }) {
  if (!count) return <span className="text-xs text-muted">No ratings yet</span>;
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${value} out of 5 from ${count} reviews`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} width={size} height={size} className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-line"} />
        ))}
      </span>
      <span className="text-xs text-muted">{Number(value).toFixed(1)} ({count})</span>
    </span>
  );
}
