import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/Shell";
import { isType, listContent, titleOf } from "@/lib/content";

export default async function ContentList({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isType(type)) notFound();
  const rows = await listContent(type);
  return (
    <AdminShell>
      <div className="row">
        <h1 style={{ textTransform: "capitalize" }}>{type}</h1>
        <Link className="btn" href={`/admin/content/${type}/new`}>Add</Link>
      </div>
      <table>
        <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{titleOf(row as { title?: string; name?: string })}</td>
              <td>{row.slug}</td>
              <td>{row.status}</td>
              <td><Link href={`/admin/content/${type}/${row.id}`}>Edit</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
