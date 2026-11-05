"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { reviewSchema, firstError } from "@/lib/validation/schemas";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

type Review = { id: string; rating: number; body: string | null; createdAt: string; userId: string; name: string };

export function Reviews({ bookId, reviews, signedIn, currentUserId }: { bookId: string; reviews: Review[]; signedIn: boolean; currentUserId: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const mine = reviews.find((r) => r.userId === currentUserId);
  const [rating, setRating] = useState(mine?.rating ?? 0);
  const [editing, setEditing] = useState(!mine);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = String(new FormData(e.currentTarget).get("body") ?? "");
    const parsed = reviewSchema.safeParse({ bookId, rating, body });
    if (!parsed.success) return toast("error", rating ? firstError(parsed.error) : "Choose a star rating");
    setLoading(true);
    const supabase = createClient();
    // Unique(book_id, user_id) guarantees one review per user per book.
    const { error } = await supabase.from("reviews").upsert(
      { book_id: bookId, user_id: currentUserId, rating: parsed.data.rating, body: parsed.data.body || null },
      { onConflict: "book_id,user_id" },
    );
    setLoading(false);
    if (error) return toast("error", error.message);
    toast("success", mine ? "Review updated" : "Thanks for your review!");
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!mine || !confirm("Delete your review?")) return;
    const { error } = await createClient().from("reviews").delete().eq("id", mine.id);
    if (error) return toast("error", error.message);
    setRating(0); setEditing(true);
    toast("success", "Review deleted");
    router.refresh();
  }

  return (
    <section className="mt-14" aria-labelledby="reviews-h">
      <h2 id="reviews-h" className="text-2xl font-bold">Reviews ({reviews.length})</h2>

      <div className="mt-5 rounded-2xl bg-white p-5 shadow-card">
        {!signedIn ? (
          <p className="text-sm text-muted"><Link href={`/login?next=/books/${bookId}`} className="font-semibold text-primary">Log in</Link> to rate and review this book.</p>
        ) : editing ? (
          <form onSubmit={save} className="space-y-4">
            <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
              {[1, 2, 3, 4, 5].map((i) => (
                <button type="button" key={i} role="radio" aria-checked={rating === i} aria-label={`${i} star${i > 1 ? "s" : ""}`} onClick={() => setRating(i)}>
                  <Star className={`h-7 w-7 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-line"}`} />
                </button>
              ))}
            </div>
            <Field label="Your review (optional)"><Textarea name="body" defaultValue={mine?.body ?? ""} maxLength={3000} /></Field>
            <div className="flex gap-2"><Button type="submit" loading={loading}>{mine ? "Update review" : "Post review"}</Button>
              {mine && <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>}</div>
          </form>
        ) : (
          <div className="flex items-center justify-between"><p className="text-sm">You rated this {mine?.rating}/5.</p>
            <div className="flex gap-2"><Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button><Button variant="ghost" onClick={remove}>Delete</Button></div></div>
        )}
      </div>

      {reviews.length === 0 ? <p className="mt-6 text-sm text-muted">No reviews yet. Be the first to share your thoughts.</p> : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{r.name}</p><time className="text-xs text-muted" dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
              </div>
              <div className="mt-1 flex" aria-label={`${r.rating} out of 5`}>{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-line"}`} />)}</div>
              {r.body && <p className="mt-2 whitespace-pre-line text-sm text-muted">{r.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
