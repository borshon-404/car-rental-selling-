import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/Shell";
import { ContentForm } from "@/components/admin/ContentForm";
import { getContent, isType } from "@/lib/content";
import { prisma } from "@/lib/db";

export default async function EditContent({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  if (!isType(type)) notFound();
  if (id === "new") {
    return (
      <AdminShell>
        <h1>New {type.slice(0, -1)}</h1>
        <ContentForm type={type} />
      </AdminShell>
    );
  }
  const item = await getContent(type, id);
  if (!item) notFound();
  const revisions = await prisma.revision.findMany({ where: { entityType: type, entityId: id }, orderBy: { createdAt: "desc" }, take: 5 });
  return (
    <AdminShell>
      <h1>Edit</h1>
      <ContentForm type={type} initial={item as never} />
      {revisions.length ? (
        <section>
          <h2>Recent versions</h2>
          <ul>
            {revisions.map((rev) => (
              <li key={rev.id}>{rev.createdAt.toISOString()} · {rev.actorEmail || "system"}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </AdminShell>
  );
}
