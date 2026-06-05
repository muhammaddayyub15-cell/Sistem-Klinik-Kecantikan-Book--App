import { useState } from "react";
import Modal from "../../components/ui/admin/Modal";
import DoctorForm from "../../components/ui/admin/DoctorForm";

// ── Static data (replace with hooks) ─────────────────────────────────────────
const SPECIALIZATIONS = ["Aesthetic Dermatologist", "Laser & Skin Expert", "Cosmetic Physician", "General Dermatologist"];

const INITIAL_DOCTORS = [
  { id: 1, name: "dr. Anisa Putri",   spec: "Aesthetic Dermatologist", email: "anisa@auraclinic.id",  phone: "081234567890", exp: 8,  status: "active"   },
  { id: 2, name: "dr. Ratna Sari",    spec: "Laser & Skin Expert",     email: "ratna@auraclinic.id",  phone: "081234567891", exp: 6,  status: "active"   },
  { id: 3, name: "dr. Maya Dewi",     spec: "Cosmetic Physician",      email: "maya@auraclinic.id",   phone: "081234567892", exp: 10, status: "active"   },
  { id: 4, name: "dr. Hendra Putra",  spec: "General Dermatologist",   email: "hendra@auraclinic.id", phone: "081234567893", exp: 4,  status: "inactive" },
];

function initials(name) {
  return name.replace("dr. ", "").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function DoctorPage() {
  const [doctors,     setDoctors]     = useState(INITIAL_DOCTORS);
  const [search,      setSearch]      = useState("");
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);  // null = create mode
  const [deleteId,    setDeleteId]    = useState(null);
  const [isLoading,   setIsLoading]   = useState(false);

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.spec.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() { setEditTarget(null); setModalOpen(true); }
  function openEdit(d)  { setEditTarget(d);    setModalOpen(true); }
  function closeModal()  { setModalOpen(false); setEditTarget(null); }

  async function handleSubmit(data) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate API
    if (editTarget) {
      setDoctors((prev) => prev.map((d) => (d.id === editTarget.id ? { ...d, ...data } : d)));
    } else {
      setDoctors((prev) => [...prev, { ...data, id: Date.now(), status: "active" }]);
    }
    setIsLoading(false);
    closeModal();
  }

  async function handleDelete(id) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setDoctors((prev) => prev.filter((d) => d.id !== id));
    setDeleteId(null);
    setIsLoading(false);
  }

  function toggleStatus(id) {
    setDoctors((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: d.status === "active" ? "inactive" : "active" } : d)
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
              Doctors <span className="italic" style={{ color: "#b87c5a" }}>& Staff</span>
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}
          >
            + Add Doctor
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Doctors",    value: doctors.length                                    },
            { label: "Active",           value: doctors.filter((d) => d.status === "active").length   },
            { label: "Inactive",         value: doctors.filter((d) => d.status === "inactive").length },
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

        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
          style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.15)" }}
        >
          <span style={{ color: "#c0a090" }}>◉</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialization…"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: "#2c1f1a" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: "#c0a090" }} className="text-xs">✕</button>
          )}
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
        >
          {/* Header row */}
          <div
            className="grid gap-4 px-6 py-3"
            style={{
              gridTemplateColumns: "2fr 2fr 1fr 1fr auto",
              borderBottom: "1px solid rgba(184,124,90,0.08)",
              background: "#fdf8f4",
            }}
          >
            {["Doctor", "Specialization", "Experience", "Status", "Actions"].map((h) => (
              <span key={h} className="text-xs tracking-widest uppercase" style={{ color: "#b87c5a" }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-3xl opacity-20" style={{ color: "#b87c5a" }}>◈</span>
              <p className="text-sm" style={{ color: "#c0a090" }}>No doctors found.</p>
            </div>
          )}

          {filtered.map((d, i) => (
            <div
              key={d.id}
              className="grid items-center gap-4 px-6 py-4 transition-all hover:bg-stone-50"
              style={{
                gridTemplateColumns: "2fr 2fr 1fr 1fr auto",
                borderBottom: i < filtered.length - 1 ? "1px solid rgba(184,124,90,0.06)" : "none",
              }}
            >
              {/* Doctor */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #e8c9b0, #d4a882)",
                    color: "#5a2e12",
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {initials(d.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#2c1f1a" }}>{d.name}</p>
                  <p className="text-xs truncate" style={{ color: "#9a6e62" }}>{d.email}</p>
                </div>
              </div>

              {/* Spec */}
              <p className="text-sm truncate" style={{ color: "#5a3e35" }}>{d.spec}</p>

              {/* Exp */}
              <p className="text-sm" style={{ color: "#5a3e35" }}>{d.exp} yrs</p>

              {/* Status */}
              <button
                onClick={() => toggleStatus(d.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition hover:opacity-80 w-fit"
                style={{
                  background: d.status === "active" ? "rgba(106,154,106,0.12)" : "rgba(184,124,90,0.08)",
                  color:      d.status === "active" ? "#3a7a3a"                 : "#9a6e62",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.status === "active" ? "#3a7a3a" : "#c0a090" }} />
                {d.status === "active" ? "Active" : "Inactive"}
              </button>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(d)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition hover:opacity-70"
                  style={{ background: "rgba(184,124,90,0.1)", color: "#b87c5a" }}
                  title="Edit"
                >
                  ✎
                </button>
                <button
                  onClick={() => setDeleteId(d.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition hover:opacity-70"
                  style={{ background: "rgba(200,80,80,0.08)", color: "#9a3030" }}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <Modal title={editTarget ? "Edit Doctor" : "Add New Doctor"} onClose={closeModal}>
          <DoctorForm
            defaultValues={editTarget}
            specializations={SPECIALIZATIONS}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <Modal title="Remove Doctor" onClose={() => setDeleteId(null)}>
          <p className="text-sm mb-6" style={{ color: "#5a3e35" }}>
            Are you sure you want to remove{" "}
            <strong>{doctors.find((d) => d.id === deleteId)?.name}</strong>?
            This action cannot be undone.
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