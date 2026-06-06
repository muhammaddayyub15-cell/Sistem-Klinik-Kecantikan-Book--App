import { useState, useEffect, useCallback } from "react";
import Modal from "../../components/ui/admin/Modal";
import ServiceForm from "../../components/ui/admin/ServiceForm";
import {
    getServices, createService, updateService,
    deleteService, toggleService, getServiceCategories,
} from "../../api/serviceApi";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
    Number(n) === 0 ? "Free" : "Rp " + Number(n).toLocaleString("id-ID");

function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded-xl bg-[rgba(184,124,90,0.08)] ${className}`} />;
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ServicePage() {
    const [services,    setServices]    = useState([]);
    const [categories,  setCategories]  = useState([]);
    const [search,      setSearch]      = useState("");
    const [catFilter,   setCatFilter]   = useState("All");
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [error,       setError]       = useState("");

    // Modal state — null = tertutup
    const [serviceModal, setServiceModal] = useState(null); // null | { mode: 'create'|'edit', service?: obj }
    const [deleteTarget, setDeleteTarget] = useState(null); // service obj

    // ── Fetch services + categories ───────────────────────────────────────
    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [sRes, cRes] = await Promise.all([getServices({ all: true }), getServiceCategories()]);
            setServices(sRes.data?.data   ?? sRes.data   ?? []);
            setCategories(cRes.data?.data ?? cRes.data   ?? []);
        } catch {
            setError("Gagal memuat data layanan.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Filter ────────────────────────────────────────────────────────────
    // catFilter pakai category_id — "All" untuk tampilkan semua
    const filtered = services.filter((s) => {
        const q        = search.toLowerCase();
        const matchQ   = !q || (s.service_name ?? "").toLowerCase().includes(q);
        const matchCat = catFilter === "All" || String(s.category_id) === String(catFilter);
        return matchQ && matchCat;
    });

    // ── Create / Edit service ─────────────────────────────────────────────
    const handleServiceSubmit = async (payload) => {
        setSaving(true);
        setError("");
        try {
            if (serviceModal.mode === "create") {
                await createService(payload);
            } else {
                await updateService(serviceModal.service.service_id, payload);
            }
            setServiceModal(null);
            await fetchAll();
        } catch (err) {
            setError(err?.response?.data?.message ?? "Gagal menyimpan layanan.");
        } finally {
            setSaving(false);
        }
    };

    // ── Delete service ────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSaving(true);
        try {
            await deleteService(deleteTarget.service_id);
            setDeleteTarget(null);
            await fetchAll();
        } catch (err) {
            setError(err?.response?.data?.message ?? "Gagal menghapus layanan.");
        } finally {
            setSaving(false);
        }
    };

    // ── Toggle is_active ──────────────────────────────────────────────────
    // PATCH /services/:id/toggle — flip is_active di backend
    const handleToggle = async (serviceId) => {
        try {
            await toggleService(serviceId);
            await fetchAll();
        } catch {
            setError("Gagal mengubah status layanan.");
        }
    };

    // ── Derived stats ─────────────────────────────────────────────────────
    const totalActive = services.filter((s) => s.is_active).length;

    return (
        <div className="min-h-screen" style={{ background: "#faf8f5", color: "#2c1f1a" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');`}</style>

            <div className="max-w-5xl mx-auto px-6 py-10">

                {/* ── Header ── */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Admin · Manage</p>
                        <h1 className="text-4xl font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Clinic <span className="italic" style={{ color: "#b87c5a" }}>Services</span>
                        </h1>
                    </div>
                    <button onClick={() => setServiceModal({ mode: "create" })}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm transition hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add Service
                    </button>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
                )}

                {/* ── Stats ── */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Services", value: services.length  },
                        { label: "Active",          value: totalActive      },
                        { label: "Categories",      value: categories.length },
                    ].map((s) => (
                        <div key={s.label} className="p-5 rounded-2xl"
                            style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>
                            {loading
                                ? <div className="h-7 w-12 rounded-lg bg-[rgba(184,124,90,0.08)] animate-pulse mb-1" />
                                : <p className="text-2xl font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{s.value}</p>
                            }
                            <p className="text-xs mt-0.5" style={{ color: "#9a6e62" }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    {/* Search */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1"
                        style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.15)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0a090" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search services…"
                            className="flex-1 text-sm outline-none bg-transparent text-[#2c1f1a] placeholder-[#c4a898]" />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-xs text-[#c0a090]">✕</button>
                        )}
                    </div>
                    {/* Category filter pills — pakai category_id sebagai value */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <button onClick={() => setCatFilter("All")}
                            className="shrink-0 px-4 py-2 rounded-full text-xs transition-all"
                            style={{
                                background: catFilter === "All" ? "linear-gradient(135deg, #c4865f, #a0613e)" : "#fff",
                                color:      catFilter === "All" ? "#fff" : "#5a3e35",
                                border:     catFilter === "All" ? "none" : "1px solid rgba(184,124,90,0.2)",
                            }}>
                            All
                        </button>
                        {categories.map((c) => (
                            <button key={c.category_id} onClick={() => setCatFilter(String(c.category_id))}
                                className="shrink-0 px-4 py-2 rounded-full text-xs transition-all"
                                style={{
                                    background: catFilter === String(c.category_id) ? "linear-gradient(135deg, #c4865f, #a0613e)" : "#fff",
                                    color:      catFilter === String(c.category_id) ? "#fff" : "#5a3e35",
                                    border:     catFilter === String(c.category_id) ? "none" : "1px solid rgba(184,124,90,0.2)",
                                }}>
                                {c.category_name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Cards Grid ── */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1,2,3,4,5,6].map((k) => (
                            <div key={k} className="p-6 rounded-2xl flex flex-col gap-3"
                                style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/3" />
                                <div className="grid grid-cols-2 gap-2 pt-3" style={{ borderTop: "1px solid rgba(184,124,90,0.08)" }}>
                                    <Skeleton className="h-8" />
                                    <Skeleton className="h-8" />
                                </div>
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <span className="text-4xl opacity-20" style={{ color: "#b87c5a" }}>◇</span>
                        <p className="text-sm" style={{ color: "#c0a090" }}>No services found.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((s) => (
                            <div key={s.service_id}
                                className="p-6 rounded-2xl flex flex-col gap-3 transition-all hover:-translate-y-0.5 duration-200"
                                style={{
                                    background: "#fff",
                                    border: "1px solid rgba(184,124,90,0.12)",
                                    opacity: s.is_active ? 1 : 0.65,
                                }}>

                                {/* Top row */}
                                <div className="flex items-start justify-between">
                                    <span className="text-xl" style={{ color: "#b87c5a" }}>◈</span>
                                    {/* Toggle is_active — langsung hit API */}
                                    <button onClick={() => handleToggle(s.service_id)}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition hover:opacity-80"
                                        style={{
                                            background: s.is_active ? "rgba(106,154,106,0.12)" : "rgba(184,124,90,0.08)",
                                            color:      s.is_active ? "#3a7a3a"                 : "#9a6e62",
                                        }}>
                                        <span className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: s.is_active ? "#3a7a3a" : "#c0a090" }} />
                                        {s.is_active ? "Active" : "Inactive"}
                                    </button>
                                </div>

                                {/* Name & category */}
                                <div>
                                    <p className="text-sm font-medium text-[#2c1f1a]">{s.service_name}</p>
                                    <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                                        style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}>
                                        {s.category?.category_name ?? "—"}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-2 pt-3"
                                    style={{ borderTop: "1px solid rgba(184,124,90,0.08)" }}>
                                    <div>
                                        <p className="text-xs" style={{ color: "#9a6e62" }}>Price</p>
                                        <p className="text-sm font-semibold mt-0.5" style={{ color: "#b87c5a" }}>
                                            {fmt(s.base_price)}
                                        </p>
                                    </div>
                                    {s.unit && (
                                        <div>
                                            <p className="text-xs" style={{ color: "#9a6e62" }}>Unit</p>
                                            <p className="text-sm font-semibold mt-0.5 text-[#5a3e35]">{s.unit}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-1">
                                    <button onClick={() => setServiceModal({ mode: "edit", service: s })}
                                        className="flex-1 py-2 rounded-xl text-xs transition hover:opacity-80"
                                        style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}>
                                        ✎ Edit
                                    </button>
                                    <button onClick={() => setDeleteTarget(s)}
                                        className="w-8 rounded-xl text-xs transition hover:opacity-80"
                                        style={{ background: "rgba(200,80,80,0.07)", color: "#9a3030" }}>
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Add/Edit Modal ── */}
            {/* isOpen selalu true — conditional render dijaga serviceModal !== null */}
            {serviceModal && (
                <Modal
                    isOpen={true}
                    title={serviceModal.mode === "create" ? "Add New Service" : "Edit Service"}
                    onClose={() => setServiceModal(null)}
                >
                    <ServiceForm
                        mode={serviceModal.mode}
                        defaultValues={serviceModal.service ?? null}
                        categories={categories}
                        onSubmit={handleServiceSubmit}
                        onCancel={() => setServiceModal(null)}
                        isLoading={saving}
                    />
                </Modal>
            )}

            {/* ── Delete Confirm Modal ── */}
            {/* isOpen selalu true — conditional render dijaga deleteTarget !== null */}
            {deleteTarget && (
                <Modal
                    isOpen={true}
                    title="Remove Service"
                    onClose={() => setDeleteTarget(null)}
                >
                    <p className="text-sm mb-6 text-[#5a3e35]">
                        Remove <strong>{deleteTarget.service_name}</strong>?
                        Existing bookings will not be affected.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeleteTarget(null)} disabled={saving}
                            className="px-5 py-2 rounded-xl text-sm transition hover:bg-stone-100"
                            style={{ color: "#5a3e35", border: "1px solid rgba(90,62,53,0.2)" }}>
                            Cancel
                        </button>
                        <button onClick={handleDelete} disabled={saving}
                            className="px-5 py-2 rounded-xl text-sm text-white transition disabled:opacity-50"
                            style={{ background: "#c05050" }}>
                            {saving ? "Removing…" : "Yes, Remove"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}