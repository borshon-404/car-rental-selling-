import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap hero">
      <h1>Page not found</h1>
      <p>That address is not published.</p>
      <p><Link href="/">Back to the home page</Link></p>
    </main>
  );
}
