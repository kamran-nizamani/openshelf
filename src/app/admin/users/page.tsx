import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeSearch, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { UserActions } from "@/components/admin/UserActions";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const me = await requireStaff();
  const q = sanitizeSearch((await searchParams).q ?? "");
  const admin = createAdminClient();
  let query = admin.from("profiles").select("id, full_name, country, strikes, suspended, suspended_reason, created_at").order("created_at", { ascending: false }).limit(100);
  if (q) query = query.ilike("full_name", `%${q}%`);
  const { data: users } = await query;
  const ids = (users ?? []).map((u) => u.id);
  const [{ data: uploads }, { data: roles }, { data: reports }, { data: dls }] = ids.length ? await Promise.all([
    admin.from("books").select("uploader_id").in("uploader_id", ids),
    admin.from("user_roles").select("user_id, role").in("user_id", ids).neq("role", "user"),
    admin.from("reports").select("reported_user_id").in("reported_user_id", ids).in("status", ["open", "investigating"]),
    admin.from("downloads").select("user_id").in("user_id", ids),
  ]) : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];
  const tally = (rows: Array<Record<string, string | null>> | null, key: string) => { const m = new Map<string, number>(); (rows ?? []).forEach((r) => { const k = r[key]; if (k) m.set(k, (m.get(k) ?? 0) + 1); }); return m; };
  const up = tally(uploads, "uploader_id"), rp = tally(reports, "reported_user_id"), dl = tally(dls, "user_id");
  const staffIds = new Set((roles ?? []).map((r) => r.user_id));

  return (
    <>
      <h1 className="text-3xl font-bold">Users</h1>
      <form className="mt-4 max-w-sm"><input name="q" defaultValue={q} placeholder="Search by name" className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm" aria-label="Search users" /></form>
      <div className="mt-6 space-y-2">
        {(users ?? []).length === 0 && <EmptyState title="No users found" />}
        {(users ?? []).map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-card">
            <div className="min-w-0">
              <p className="font-semibold">{u.full_name} {staffIds.has(u.id) && <Badge value="approved" label="staff" />} {u.suspended && <Badge value="suspended" />}</p>
              <p className="text-xs text-muted">Joined {formatDate(u.created_at)}{u.country ? ` · ${u.country}` : ""} · {up.get(u.id) ?? 0} uploads · {dl.get(u.id) ?? 0} downloads · {u.strikes} strike(s) · {rp.get(u.id) ?? 0} open report(s)</p>
              {u.suspended_reason && <p className="text-xs text-red-700">Reason: {u.suspended_reason}</p>}
            </div>
            {u.id !== me.id && !staffIds.has(u.id) && <UserActions userId={u.id} suspended={u.suspended} />}
          </div>
        ))}
      </div>
    </>
  );
}
