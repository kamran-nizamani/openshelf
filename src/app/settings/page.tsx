import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { SettingsForms } from "./SettingsForms";

export const metadata: Metadata = { title: "Account settings", robots: { index: false } };

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Account settings</h1>
      <p className="mt-1 text-sm text-muted">{user.email} · Joined {formatDate(profile?.created_at)}</p>
      <SettingsForms
        userId={user.id}
        profile={{
          fullName: profile?.full_name ?? "", country: profile?.country ?? "", bio: profile?.bio ?? "",
          isPublic: profile?.is_public ?? true, avatarUrl: profile?.avatar_url ?? null,
        }}
      />
    </div>
  );
}
