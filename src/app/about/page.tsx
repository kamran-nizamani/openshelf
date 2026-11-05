import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/layout/Prose";
export const metadata: Metadata = { title: "About OpenShelf", description: "OpenShelf is a global digital library of legally shareable PDF books." };
export default function About() {
  return (
    <Prose title="About OpenShelf">
      <p>OpenShelf is a free, community-powered digital library. Readers, students, teachers, researchers and authors share books that are legally free to distribute: public-domain works, Creative Commons titles, books uploaded by their own authors, and books shared with the explicit permission of the rights holder.</p>
      <h2>How it works</h2>
      <ul>
        <li>Anyone can browse and read published books online.</li>
        <li>Signed-in members can download books whose rights holders allow it, save books to a personal library, and leave ratings and reviews.</li>
        <li>Every upload declares its licence and is reviewed by a moderator before it is published.</li>
      </ul>
      <h2>Our commitment</h2>
      <p>OpenShelf is not a piracy site. Read our <Link href="/copyright">Copyright Policy</Link> to see how we verify licences, handle takedown requests, and deal with repeat infringers.</p>
    </Prose>
  );
}
