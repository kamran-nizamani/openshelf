import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, Prose } from "@/components/layout/Prose";
export const metadata: Metadata = { title: "Contact" };
export default function Contact() {
  return (
    <Prose title="Contact us">
      {CONTACT_EMAIL ? <p>Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p> : <p>The site operator has not configured a public contact address yet.</p>}
      <h2>Reporting content</h2>
      <p>To report a book — including a copyright complaint — open the book and use the <strong>Report</strong> button, or use the <Link href="/report">report form</Link>. Reports go straight to our moderators and are logged.</p>
      <h2>Account help</h2>
      <p>See the <Link href="/help">Help Center</Link>.</p>
    </Prose>
  );
}
