"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

export function LibraryItemActions({ bookId, userId, favorite }: { bookId: string; userId: string; favorite: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function toggleFav() {
    setBusy(true);
    const { error } = await createClient().from("saved_books").update({ is_favorite: !favorite }).eq("book_id", bookId).eq("user_id", userId);
    setBusy(false);
    if (error) return toast("error", error.message);
    router.refresh();
  }
  async function remove() {
    setBusy(true);
    const { error } = await createClient().from("saved_books").delete().eq("book_id", bookId).eq("user_id", userId);
    setBusy(false);
    if (error) return toast("error", error.message);
    toast("success", "Removed from My Library"); router.refresh();
  }
  return (
    <div className="mt-2 flex gap-2">
      <button disabled={busy} onClick={toggleFav} aria-pressed={favorite} className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-medium hover:border-primary">
        <Heart className={`h-3.5 w-3.5 ${favorite ? "fill-red-500 text-red-500" : ""}`} /> {favorite ? "Favourite" : "Favourite?"}
      </button>
      <button disabled={busy} onClick={remove} className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-medium hover:border-red-400"><X className="h-3.5 w-3.5" /> Remove</button>
    </div>
  );
}
