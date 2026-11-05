import Image from "next/image";
import { BookOpen } from "lucide-react";

export function BookCover({ url, title, priority = false, sizes = "(max-width:768px) 45vw, 220px" }:
  { url: string | null; title: string; priority?: boolean; sizes?: string }) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-navy/10">
      {url ? (
        <Image src={url} alt={`Cover of ${title}`} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-muted">
          <BookOpen className="h-8 w-8" /><span className="line-clamp-3 text-xs font-medium">{title}</span>
        </div>
      )}
    </div>
  );
}
