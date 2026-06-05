import { useState } from "react";
import Modal from "../../components/ui/admin/Modal";
import ServiceForm from "../../components/ui/admin/ServiceForm";

// ── Static data (replace with hooks) ─────────────────────────────────────────
const CATEGORIES = ["Facial", "Laser", "Injection", "Consultation", "Body"];

const INITIAL_SERVICES = [
  { id: 1, name: "Facial Treatment",     category: "Facial",       price: 350000,  duration: 60, icon: "✦", status: "active",   bookings: 512 },
  { id: 2, name: "Brightening Facial",   category: "Facial",       price: 420000,  duration: 75, icon: "✦", status: "active",   bookings: 284 },
  { id: 3, name: "Laser Therapy",        category: "Laser",        price: 750000,  duration: 45, icon: "◈", status: "active",   bookings: 256 },
  { id: 4, name: "CO2 Laser Resurfacing",category: "Laser",        price: 1500000, duration: 60, icon: "◈", status: "inactive", bookings: 91  },
  { id: 5, name: "Botox Injection",      category: "Injection",    price: 1200000, duration: 30, icon: "◇", status: "active",   bookings: 192 },
  { id: 6, name: "Dermal Filler",        category: "Injection",    price: 2500000, duration: 45, icon: "◇", status: "active",   bookings: 138 },
  { id: 7, name: "Skin Consultation",    category: "Consultation", price: 0,       duration: 30, icon: "◉", status: "active",   bookings: 320 },
];

const fmt = (n) => n === 0 ? "Free" : "Rp " + n.toLocaleString("id-ID");

export default function ServicePage() {
  const [services,    setServices]    = useState(INITIAL_SERVICES);
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("All");
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [isLoading,   setIsLoading]   = useState(false);

  const cats = ["All", ...CATEGORIES];

  const filtered = services.filter((s) => {
    const matchSearch  = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat     = catFilter === "All" || s.category === catFilter;
    return matchSearch && matchCat;
  });

  function openCreate() { setEditTarget(null); setModalOpen(true); }
  function openEdit(s)  { setEditTarget(s);    setModalOpen(true); }
  function closeModal()  { setModalOpen(false); setEditTarget(null); }

  async function handleSubmit(data) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (editTarget) {
      setServices((prev) => prev.map((s) => (s.id === editTarget.id ? { ...s, ...data } : s)));
    } else {
      setServices((prev) => [...prev, { ...data, id: Date.now(), status: "active", bookings: 0 }]);
    }
    setIsLoading(false);
    closeModal();
  }

  async function handleDelete(id) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setServices((prev) => prev.filter((s) => s.id !== id));
    setDeleteId(null);
    setIsLoading(false);
  }

  function toggleStatus(id) {
    setServices((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s)
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5", color: "#2c1f1a" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Admin · Manage</p>
            <h1
              className="text-4xl font-normal"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
            >
              Clinic <span className="italic" style={{ color: "#b87c5a" }}>Services</span>
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}
          >
            + Add Service
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Services",   value: services.length },
            { label: "Active",           value: services.filter((s) => s.status === "active").length },
            { label: "Categories",       value: CATEGORIES.length },
            { label: "Total Bookings",   value: services.reduce((a, s) => a + s.bookings, 0).toLocaleString() },
          ].map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-2xl"
              style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
            >
              <p className="text-2xl font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "#9a6e62" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1"
            style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.15)" }}
          >
            <span style={{ color: "#c0a090" }}>◉</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: "#2c1f1a" }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className="shrink-0 px-4 py-2 rounded-full text-xs transition-all"
                style={{
                  background: catFilter === c ? "linear-gradient(135deg, #c4865f, #a0613e)" : "#fff",
                  color:      catFilter === c ? "#fff" : "#5a3e35",
                  border:     catFilter === c ? "none" : "1px solid rgba(184,124,90,0.2)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl opacity-20" style={{ color: "#b87c5a" }}>◇</span>
            <p className="text-sm" style={{ color: "#c0a090" }}>No services found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="p-6 rounded-2xl flex flex-col gap-3 transition-all hover:-translate-y-0.5 duration-200"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(184,124,90,0.12)",
                  opacity: s.status === "inactive" ? 0.65 : 1,
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <span className="text-2xl" style={{ color: "#b87c5a" }}>{s.icon}</span>
                  <button
                    onClick={() => toggleStatus(s.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition hover:opacity-80"
                    style={{
                      background: s.status === "active" ? "rgba(106,154,106,0.12)" : "rgba(184,124,90,0.08)",
                      color:      s.status === "active" ? "#3a7a3a"                 : "#9a6e62",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.status === "active" ? "#3a7a3a" : "#c0a090" }} />
                    {s.status === "active" ? "Active" : "Inactive"}
                  </button>
                </div>

                {/* Name & category */}
                <div>
                  <p className="text-sm font-medium" style={{ color: "#2c1f1a" }}>{s.name}</p>
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                    style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}
                  >
                    {s.category}
                  </span>
                </div>

                {/* Details */}
                <div
                  className="grid grid-cols-2 gap-2 pt-3"
                  style={{ borderTop: "1px solid rgba(184,124,90,0.08)" }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "#9a6e62" }}>Price</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "#b87c5a" }}>{fmt(s.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#9a6e62" }}>Duration</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "#5a3e35" }}>{s.duration} min</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs" style={{ color: "#9a6e62" }}>Total Bookings</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "#5a3e35" }}>{s.bookings.toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="flex-1 py-2 rounded-xl text-xs transition hover:opacity-80"
                    style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}
                  >
                    ✎ Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    className="w-8 rounded-xl text-xs transition hover:opacity-80"
                    style={{ background: "rgba(200,80,80,0.07)", color: "#9a3030" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <Modal title={editTarget ? "Edit Service" : "Add New Service"} onClose={closeModal}>
          <ServiceForm
            defaultValues={editTarget}
            categories={CATEGORIES}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <Modal title="Remove Service" onClose={() => setDeleteId(null)}>
          <p className="text-sm mb-6" style={{ color: "#5a3e35" }}>
            Remove <strong>{services.find((s) => s.id === deleteId)?.name}</strong>?
            Existing bookings will not be affected.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="px-5 py-2 rounded-full text-sm transition hover:bg-stone-100"
              style={{ color: "#5a3e35", border: "1px solid rgba(90,62,53,0.2)" }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteId)}
              disabled={isLoading}
              className="px-5 py-2 rounded-full text-sm text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#c05050" }}
            >
              {isLoading ? "Removing…" : "Yes, Remove"}
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
      `}</style>
    </div>
  );
}