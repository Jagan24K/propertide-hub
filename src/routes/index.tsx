import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, IndianRupee, CheckCircle2, BadgeCheck, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PropertyFormDialog } from "@/components/PropertyFormDialog";
import {
  createProperty,
  deleteProperty,
  fetchProperties,
  formatINR,
  updateProperty,
  type Property,
  type PropertyInput,
} from "@/lib/properties-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Property Management Dashboard" },
      {
        name: "description",
        content:
          "Manage and monitor property listings: add, edit, and track availability, pricing, and sales.",
      },
      { property: "og:title", content: "Property Management Dashboard" },
      {
        property: "og:description",
        content:
          "Manage and monitor property listings: add, edit, and track availability, pricing, and sales.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function StatusBadge({ status }: { status: string }) {
  const sold = status?.toLowerCase() === "sold";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
        (sold
          ? "bg-destructive/10 text-destructive"
          : "bg-emerald-100 text-emerald-700")
      }
    >
      {status || "Unknown"}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Building2;
}) {
  return (
    <Card className="rounded-xl border-border/70 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Index() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchProperties();
      setProperties(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while loading properties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const available = properties.filter((p) => p.STATUS?.toLowerCase() === "available").length;
    const sold = properties.filter((p) => p.STATUS?.toLowerCase() === "sold").length;
    const total = properties.reduce((sum, p) => sum + (Number(p.PRICE) || 0), 0);
    return { available, sold, total };
  }, [properties]);

  async function handleSubmit(values: PropertyInput) {
    setSaving(true);
    try {
      if (editing) {
        await updateProperty(editing.ROWID, values);
        toast.success("Property updated successfully");
      } else {
        await createProperty(values);
        toast.success("Property added successfully");
      }
      setFormOpen(false);
      setEditing(null);
      await load(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the property.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProperty(pendingDelete.ROWID);
      toast.success("Property deleted successfully");
      setPendingDelete(null);
      await load(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the property.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Property Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and monitor your property listings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={"size-4 " + (loading ? "animate-spin" : "")} />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add Property
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total Properties" value={String(properties.length)} icon={Building2} />
          <SummaryCard label="Available" value={String(stats.available)} icon={CheckCircle2} />
          <SummaryCard label="Sold" value={String(stats.sold)} icon={BadgeCheck} />
          <SummaryCard label="Total Value" value={formatINR(stats.total)} icon={IndianRupee} />
        </section>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <p className="font-medium">We couldn&apos;t load your properties</p>
            <p className="mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void load()}
              disabled={loading}
            >
              Try again
            </Button>
          </div>
        )}

        <Card className="overflow-hidden rounded-xl border-border/70 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center gap-3 p-12 text-sm text-muted-foreground">
                <RefreshCw className="size-4 animate-spin" />
                Loading properties...
              </div>
            ) : properties.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-medium text-foreground">No properties yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first listing to see it here.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 font-medium">Property Name</th>
                        <th className="px-5 py-3 font-medium">Location</th>
                        <th className="px-5 py-3 font-medium">Price</th>
                        <th className="px-5 py-3 font-medium">Type</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p) => (
                        <tr key={p.ROWID} className="border-t border-border/70">
                          <td className="px-5 py-3 font-medium text-foreground">
                            {p.PROPERTY_NAME}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{p.LOCATION}</td>
                          <td className="px-5 py-3 font-medium">{formatINR(p.PRICE)}</td>
                          <td className="px-5 py-3 text-muted-foreground">{p.PROPERTY_TYPE}</td>
                          <td className="px-5 py-3">
                            <StatusBadge status={p.STATUS} />
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditing(p);
                                  setFormOpen(true);
                                }}
                              >
                                <Pencil className="size-3.5" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setPendingDelete(p)}
                              >
                                <Trash2 className="size-3.5" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-border/70 md:hidden">
                  {properties.map((p) => (
                    <div key={p.ROWID} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{p.PROPERTY_NAME}</p>
                          <p className="text-sm text-muted-foreground">{p.LOCATION}</p>
                        </div>
                        <StatusBadge status={p.STATUS} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{formatINR(p.PRICE)}</span>
                        <span className="text-muted-foreground">{p.PROPERTY_TYPE}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditing(p);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(p)}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <PropertyFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!saving) {
            setFormOpen(open);
            if (!open) setEditing(null);
          }
        }}
        editing={editing}
        saving={saving}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.PROPERTY_NAME} will be permanently removed from your listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
