import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/layout/Prose";
export const metadata: Metadata = { title: "Terms and Conditions" };
export default function Terms() {
  return (
    <Prose title="Terms and Conditions" updated="the date you deploy this site — review with legal counsel before launch">
      <p>By using OpenShelf you agree to these terms. This is a template: the site operator must have it reviewed by a qualified lawyer before launch.</p>
      <h2>Your account</h2>
      <p>You are responsible for your account and for the content you upload. Provide accurate information and keep your password secure.</p>
      <h2>Uploading content</h2>
      <ul>
        <li>You may upload only works you have the legal right to distribute: public domain, Creative Commons, your own work, or with the rights holder's explicit permission.</li>
        <li>You must declare the licence and supply evidence for every upload, and confirm your rights before submitting.</li>
        <li>Uploads are reviewed before publication. We may reject, restrict or remove any content.</li>
        <li>Uploading malware or unlawful content is prohibited.</li>
      </ul>
      <h2>Using books</h2>
      <p>Books are provided under the licence stated on each book page. You are responsible for respecting that licence.</p>
      <h2>Enforcement</h2>
      <p>We may suspend accounts that violate these terms, including under our repeat-infringer policy described in the <Link href="/copyright">Copyright Policy</Link>.</p>
      <h2>No warranty</h2>
      <p>The service is provided “as is”. Content is supplied by users; we do not guarantee its accuracy or completeness.</p>
    </Prose>
  );
}
