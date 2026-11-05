import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, Prose } from "@/components/layout/Prose";
export const metadata: Metadata = { title: "Copyright and Content Policy", description: "How OpenShelf keeps its library legal: licence checks, takedowns and repeat-infringer enforcement." };
export default function CopyrightPolicy() {
  return (
    <Prose title="Copyright and Content Policy" updated="the date you deploy this site — review with legal counsel before launch">
      <p>OpenShelf only hosts books that may be legally distributed. We do not tolerate piracy.</p>
      <h2>What may be uploaded</h2>
      <ul><li>Public-domain works</li><li>Works under a Creative Commons licence that allows redistribution</li><li>Works uploaded by their author or owner</li><li>Works shared with the explicit permission of the copyright holder</li></ul>
      <h2>How we enforce it</h2>
      <ul>
        <li>Every uploader must declare their rights and give licence evidence.</li>
        <li>A moderator reviews each submission before it is published.</li>
        <li>Uploaders can restrict a book to online reading only.</li>
        <li>Every moderation decision is written to an audit log.</li>
      </ul>
      <h2>Reporting infringement (takedown requests)</h2>
      <p>If you believe a book infringes your copyright, use the <strong>Report</strong> button on the book page or the <Link href="/report">report form</Link>, choose “Copyright infringement”, and provide: the work you own, why the listed book infringes it, and your name and contact details. {CONTACT_EMAIL && <>You can also email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</>}</p>
      <p>Moderators can restrict access to a disputed book immediately while they investigate, and will record their decision. If the claim is upheld the book is removed.</p>
      <h2>Repeat-infringer policy</h2>
      <p>Each upheld copyright removal adds a strike to the uploader's account. Three strikes result in automatic account suspension.</p>
      <h2>Other content</h2>
      <p>Malicious files, unlawful content and misleading metadata are removed and may lead to suspension.</p>
    </Prose>
  );
}
