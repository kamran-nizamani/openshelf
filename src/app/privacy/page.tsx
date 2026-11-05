import type { Metadata } from "next";
import { Prose } from "@/components/layout/Prose";
export const metadata: Metadata = { title: "Privacy Policy" };
export default function Privacy() {
  return (
    <Prose title="Privacy Policy" updated="the date you deploy this site — review with legal counsel before launch">
      <p>This policy describes what OpenShelf collects and why. It is a starting template: the site operator must review it against the laws that apply to them (for example GDPR) before public launch.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account data: name, email address, optional country, bio and profile picture.</li>
        <li>Activity data: books you upload, save, review, download or open in the reader (including your last-read page).</li>
        <li>Reports you file and moderation decisions about your content or account.</li>
      </ul>
      <h2>How it is used</h2>
      <p>To run the library, show your personal dashboard, prevent abuse and enforce our Copyright Policy. We do not sell personal data.</p>
      <h2>What is public</h2>
      <p>Your display name is shown on reviews and as the uploader of books you publish. Your saved books, reading history, downloads and email are private. You can hide your profile in Account settings.</p>
      <h2>Your choices</h2>
      <p>You can edit your profile, change your password, and delete your account at any time. Deleting your account removes your profile, saved books, reviews and uploaded files; anonymised moderation logs may be kept to meet legal obligations.</p>
      <h2>Security</h2>
      <p>Passwords are handled by Supabase Auth. Book files are stored privately and served only through short-lived signed links.</p>
    </Prose>
  );
}
