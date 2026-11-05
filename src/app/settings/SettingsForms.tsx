"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { passwordChangeSchema, profileSchema, firstError } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

type Profile = { fullName: string; country: string; bio: string; isPublic: boolean; avatarUrl: string | null };
const card = "mt-6 rounded-2xl bg-white p-6 shadow-card";

export function SettingsForms({ userId, profile }: { userId: string; profile: Profile }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [avatar, setAvatar] = useState(profile.avatarUrl);
  const [deleting, setDeleting] = useState(false);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse({
      fullName: f.get("fullName"), country: f.get("country"), bio: f.get("bio"), isPublic: f.get("isPublic") === "on",
    });
    if (!parsed.success) return toast("error", firstError(parsed.error));
    setSaving(true);
    const { error } = await createClient().from("profiles").update({
      full_name: parsed.data.fullName, country: parsed.data.country || null,
      bio: parsed.data.bio || null, is_public: parsed.data.isPublic,
    }).eq("id", userId);
    setSaving(false);
    if (error) return toast("error", error.message);
    toast("success", "Profile updated");
    router.refresh();
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast("error", "Use a JPG, PNG or WebP image");
    if (file.size > 2 * 1024 * 1024) return toast("error", "Image must be under 2 MB");
    const supabase = createClient();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) return toast("error", error.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: e2 } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", userId);
    if (e2) return toast("error", e2.message);
    setAvatar(data.publicUrl);
    toast("success", "Profile picture updated");
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const parsed = passwordChangeSchema.safeParse({ password: f.get("password"), confirmPassword: f.get("confirmPassword") });
    if (!parsed.success) return toast("error", firstError(parsed.error));
    setPwLoading(true);
    const { error } = await createClient().auth.updateUser({ password: parsed.data.password });
    setPwLoading(false);
    if (error) return toast("error", error.message);
    form.reset();
    toast("success", "Password changed");
  }

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? Your uploads, reviews and library will be removed. This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    if (!res.ok) { setDeleting(false); return toast("error", (await res.json().catch(() => ({}))).error ?? "Could not delete account"); }
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <section className={card}>
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {avatar ? <img src={avatar} alt="Your profile picture" className="h-16 w-16 rounded-full object-cover" /> :
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">{profile.fullName.slice(0, 1).toUpperCase()}</div>}
          <label className="cursor-pointer text-sm font-semibold text-primary">
            Change picture
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={uploadAvatar} />
          </label>
        </div>
        <form onSubmit={saveProfile} className="mt-5 space-y-4">
          <Field label="Full name"><Input name="fullName" defaultValue={profile.fullName} required /></Field>
          <Field label="Country (optional)"><Input name="country" defaultValue={profile.country} /></Field>
          <Field label="Bio" hint="Up to 500 characters"><Textarea name="bio" defaultValue={profile.bio} maxLength={500} /></Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublic" defaultChecked={profile.isPublic} />
            Make my profile visible to other readers (privacy setting)
          </label>
          <Button type="submit" loading={saving}>Save profile</Button>
        </form>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold">Change password</h2>
        <form onSubmit={changePassword} className="mt-4 space-y-4">
          <Field label="New password"><Input name="password" type="password" autoComplete="new-password" required /></Field>
          <Field label="Confirm new password"><Input name="confirmPassword" type="password" autoComplete="new-password" required /></Field>
          <Button type="submit" loading={pwLoading}>Update password</Button>
        </form>
      </section>

      <section className={`${card} border border-red-200`}>
        <h2 className="text-lg font-semibold text-red-700">Delete account</h2>
        <p className="mt-1 text-sm text-muted">Permanently removes your profile, uploads, reviews and saved books.</p>
        <Button variant="danger" className="mt-4" loading={deleting} onClick={deleteAccount}>Delete my account</Button>
      </section>
    </>
  );
}
