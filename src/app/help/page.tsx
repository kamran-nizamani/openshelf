import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/layout/Prose";
export const metadata: Metadata = { title: "Help Center" };
const faqs: Array<[string, React.ReactNode]> = [
  ["Do I need an account to read?", "No. Published books can be read online without signing in. Downloading, saving, reviewing and uploading need a free account."],
  ["Why can't I download a particular book?", "Uploaders choose whether downloads are allowed. Some rights holders permit online reading only."],
  ["Why is my upload pending?", "Every upload is reviewed by a moderator who checks the licence information. You can follow its status under Dashboard → My Uploads."],
  ["Why was my upload rejected?", "The moderator's reason appears on the upload. You can edit the details and contact the team, or upload a version with clearer licence evidence."],
  ["What can I upload?", <>Only public-domain, Creative Commons, author-owned or explicitly permitted works. See the <Link key="c" href="/copyright">Copyright Policy</Link>.</>],
  ["I forgot my password.", <>Use <Link key="f" href="/forgot-password">Forgot password</Link> on the login page.</>],
  ["How do I delete my account?", "Account settings → Delete account. This removes your profile, saved books, reviews and uploads."],
];
export default function Help() {
  return (
    <Prose title="Help Center">
      {faqs.map(([q, a]) => <div key={q}><h2>{q}</h2><p>{a}</p></div>)}
    </Prose>
  );
}
