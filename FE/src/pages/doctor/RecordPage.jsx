import { useState } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────

const BOOKINGS = [
  {
    id:        1,
    patient:   { name: "Putri Amelia",    initials: "PA", age: 27 },
    service:   "Laser Therapy",
    date:      "Mon, 2 Jun 2025",
    time:      "13:00",
    status:    "confirmed",
    hasRecord: false,
  },
  {
    id:        2,
    patient:   { name: "Reni Kusumawati", initials: "RK", age: 32 },
    service:   "Aesthetic Injection",
    date:      "Mon, 2 Jun 2025",
    time:      "14:30",
    status:    "confirmed",
    hasRecord: false,
  },
  {
    id:        3,
    patient:   { name: "Sari Widyastuti", initials: "SW", age: 24 },
    service:   "Facial Treatment",
    date:      "Mon, 2 Jun 2025",
    time:      "09:00",
    status:    "done",
    hasRecord: true,
    record: {
      diagnosis:    "Mild hyperpigmentation with oily skin type.",
      treatment:    "Deep cleansing followed by brightening mask and LED therapy.",
      prescription: [
        { name: "Vitamin C 10% Serum",  dosage: "Apply every morning before sunscreen.", qty: 1 },
        { name: "Niacinamide Toner",    dosage: "Use twice daily after cleansing.",      qty: 1 },
      ],
      notes: "Advise patient to avoid direct sun exposure. Follow up in 3 weeks.",
    },
  },
  {
    id:        4,
    patient:   { name: "Dian Rahayu",     initials: "DR", age: 30 },
    service:   "Skin Consultation",
    date:      "Mon, 2 Jun 2025",
    time:      "10:30",
    status:    "done",
    hasRecord: true,
    record: {
      diagnosis:    "Combination skin with mild acne on T-zone.",
      treatment:    "Consultation only. Prescribed topical treatment plan.",
      prescription: [
        { name: "Salicylic Acid 2% Cleanser", dosage: "Use morning and night.",                 qty: 1 },
        { name: "Benzoyl Peroxide 2.5% Gel",  dosage: "Apply on affected areas at night only.", qty: 1 },
      ],
      notes: "Recommend reducing dairy intake. Re-evaluate in 4 weeks.",
    },
  },
];

const STATUS_STYLES = {
  done:      { bg: "rgba(134,180,134,0.12)", color: "#3a7a3a", label: "Done"      },
  confirmed: { bg: "rgba(184,124,90,0.12)",  color: "#8b4c34", label: "Confirmed" },
  pending:   { bg: "rgba(200,180,80,0.12)",  color: "#7a6010", label: "Pending"   },
  cancelled: { bg: "rgba(200,80,80,0.1)",    color: "#9a3030", label: "Cancelled" },
};

const FILTER_OPTIONS = ["all", "confirmed", "done"];

const BOOKING_INFO_FIELDS = (booking) => [
  { label: "Service", value: booking.service                                },
  { label: "Date",    value: booking.date                                   },
  { label: "Status",  value: STATUS_STYLES[booking.status].label,
                      color: STATUS_STYLES[booking.status].color            },
];

const EMPTY_FORM = { diagnosis: "", treatment: "", notes: "", prescription: [] };
const EMPTY_RX   = { name: "", dosage: "", qty: 1 };

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildInitialRecords = () =>
  Object.fromEntries(
    BOOKINGS.filter((b) => b.hasRecord).map((b) => [b.id, b.record])
  );

const buildFormFromRecord = (record) =>
  record
    ? { ...record, prescription: [...(record.prescription ?? [])] }
    : { ...EMPTY_FORM, prescription: [] };

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyDetail() {
  return (
    <div
      className="rounded-2xl flex flex-col items-center justify-center"
      style={{
        background:  "#fff",
        border:      "1px dashed rgba(184,124,90,0.2)",
        minHeight:   "400px",
      }}
    >
      <span className="text-5xl opacity-15 mb-4" style={{ color: "#b87c5a" }}>◈</span>
      <p className="text-base" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#c0a090" }}>
        Select a patient to begin
      </p>
      <p className="text-sm mt-1" style={{ color: "#d0b8ac" }}>
        Choose a booking from the list on the left.
      </p>
    </div>
  );
}

function RecordField({ label, value }) {
  if (!value) return null;
  return (
    <div className="mb-5">
      <p className="text-xs tracking-widest uppercase mb-1.5" style={{ color: "#b87c5a" }}>{label}</p>
      <p className="text-sm leading-relaxed" style={{ color: "#3a2520" }}>{value}</p>
    </div>
  );
}

function FormField({ label, placeholder, value, onChange, rows = 2 }) {
  return (
    <div>
      <label className="text-xs tracking-widest uppercase block mb-1.5" style={{ color: "#b87c5a" }}>
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all"
        style={{
          background: "#faf8f5",
          border:     "1px solid rgba(184,124,90,0.2)",
          color:      "#2c1f1a",
        }}
      />
    </div>
  );
}

function BookingCard({ booking, isActive, hasRecord, onSelect }) {
  const st = STATUS_STYLES[booking.status];
  return (
    <button
      onClick={onSelect}
      className="text-left p-4 rounded-xl transition-all duration-200 w-full"
      style={{
        background: isActive ? "rgba(184,124,90,0.08)" : "#fff",
        border:     isActive ? "1.5px solid #b87c5a" : "1px solid rgba(184,124,90,0.12)",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
          style={{
            background: "linear-gradient(135deg, #e8c9b0, #d4a882)",
            color:      "#5a2e12",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {booking.patient.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "#2c1f1a" }}>{booking.patient.name}</p>
          <p className="text-xs truncate" style={{ color: "#9a6e62" }}>{booking.service}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#b87c5a" }}>{booking.time}</p>
        <div className="flex items-center gap-1.5">
          {hasRecord && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(134,180,134,0.12)", color: "#3a7a3a" }}>
              ✓ Record
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
            {st.label}
          </span>
        </div>
      </div>
    </button>
  );
}

function PrescriptionItem({ rx, index, onRemove }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "#faf8f5", border: "1px solid rgba(184,124,90,0.1)" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "#2c1f1a" }}>
          {rx.name} × {rx.qty}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "#9a6e62" }}>{rx.dosage}</p>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="text-xs w-6 h-6 rounded-full flex items-center justify-center transition hover:opacity-70"
        style={{ color: "#c0a090" }}
      >
        ✕
      </button>
    </div>
  );
}

function AddPrescriptionForm({ rxLine, onChange, onAdd }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: "#faf8f5", border: "1px dashed rgba(184,124,90,0.25)" }}
    >
      <p className="text-xs mb-3" style={{ color: "#9a6e62" }}>Add prescription item</p>
      <div className="flex flex-col gap-2">
        <input
          value={rxLine.name}
          onChange={(e) => onChange({ ...rxLine, name: e.target.value })}
          placeholder="Product / medication name"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.2)", color: "#2c1f1a" }}
        />
        <div className="flex gap-2">
          <input
            value={rxLine.dosage}
            onChange={(e) => onChange({ ...rxLine, dosage: e.target.value })}
            placeholder="Dosage / usage instructions"
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.2)", color: "#2c1f1a" }}
          />
          <input
            type="number"
            min={1}
            value={rxLine.qty}
            onChange={(e) => onChange({ ...rxLine, qty: +e.target.value })}
            className="w-16 px-3 py-2 rounded-lg text-sm outline-none text-center"
            style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.2)", color: "#2c1f1a" }}
          />
        </div>
        <button
          onClick={onAdd}
          className="self-start text-xs px-4 py-1.5 rounded-full transition hover:opacity-80"
          style={{ background: "rgba(184,124,90,0.1)", color: "#8b4c34" }}
        >
          + Add Item
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function RecordPage() {
  const [search,       setSearch]      = useState("");
  const [filterStatus, setFilter]      = useState("all");
  const [selectedId,   setSelectedId]  = useState(null);
  const [mode,         setMode]        = useState("view"); // "view" | "write" | "edit"
  const [form,         setForm]        = useState(EMPTY_FORM);
  const [rxLine,       setRxLine]      = useState(EMPTY_RX);
  const [records,      setRecords]     = useState(buildInitialRecords);
  const [saved,        setSaved]       = useState(false);

  const booking = BOOKINGS.find((b) => b.id === selectedId) ?? null;
  const record  = selectedId ? records[selectedId] ?? null : null;

  const filteredBookings = BOOKINGS.filter((b) => {
    const matchSearch =
      b.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchFilter;
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSelectBooking = (b) => {
    if (selectedId === b.id) return;
    const hasRecord = !!records[b.id];
    setSelectedId(b.id);
    setMode(hasRecord ? "view" : "write");
    setForm(buildFormFromRecord(records[b.id]));
    setSaved(false);
  };

  const handleOpenEdit = () => {
    setForm(buildFormFromRecord(records[selectedId]));
    setMode(records[selectedId] ? "edit" : "write");
    setSaved(false);
  };

  const handleCancel = () => {
    setMode("view");
    setSaved(false);
  };

  const handleAddRx = () => {
    if (!rxLine.name.trim()) return;
    setForm((f) => ({ ...f, prescription: [...f.prescription, { ...rxLine }] }));
    setRxLine(EMPTY_RX);
  };

  const handleRemoveRx = (index) => {
    setForm((f) => ({ ...f, prescription: f.prescription.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    // TODO: call API to persist medical record
    setRecords((prev) => ({ ...prev, [selectedId]: { ...form } }));
    setSaved(true);
    setMode("view");
  };

  const setFormField = (key, val) =>
    setForm((f) => ({ ...f, [key]: val }));

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out both; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#faf8f5", color: "#2c1f1a" }}>
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* ── Header ── */}
          <div className="mb-10">
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Doctor Portal</p>
            <h1
              className="text-4xl font-normal"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
            >
              Patient <span className="italic" style={{ color: "#b87c5a" }}>Records</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: "#9a6e62" }}>
              Select a booking to view or write a medical record.
            </p>
          </div>

          <div className="flex gap-6" style={{ alignItems: "flex-start" }}>

            {/* ── Left: Booking List ── */}
            <div className="w-80 shrink-0 flex flex-col gap-4">

              {/* Search */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.15)" }}
              >
                <span style={{ color: "#c0a090" }}>◉</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patient or service…"
                  className="flex-1 text-sm outline-none bg-transparent"
                  style={{ color: "#2c1f1a" }}
                />
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="flex-1 py-1.5 rounded-full text-xs capitalize transition-all"
                    style={{
                      background: filterStatus === f ? "linear-gradient(135deg, #c4865f, #a0613e)" : "rgba(184,124,90,0.08)",
                      color:      filterStatus === f ? "#fff" : "#8b4c34",
                    }}
                  >
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Booking list */}
              <div className="flex flex-col gap-2.5">
                {filteredBookings.length === 0 && (
                  <p className="text-sm text-center py-8" style={{ color: "#c0a090" }}>No results found.</p>
                )}
                {filteredBookings.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    isActive={selectedId === b.id}
                    hasRecord={!!records[b.id]}
                    onSelect={() => handleSelectBooking(b)}
                  />
                ))}
              </div>
            </div>

            {/* ── Right: Detail / Form ── */}
            <div className="flex-1 min-w-0">
              {!booking ? (
                <EmptyDetail />
              ) : (
                <div
                  className="rounded-2xl p-8 animate-fadeIn"
                  style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
                >
                  {/* Patient header */}
                  <div
                    className="flex items-center gap-5 pb-6 mb-6"
                    style={{ borderBottom: "1px solid rgba(184,124,90,0.1)" }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #e8c9b0, #d4a882)",
                        color:      "#5a2e12",
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {booking.patient.initials}
                    </div>
                    <div className="flex-1">
                      <h2
                        className="text-2xl font-normal"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
                      >
                        {booking.patient.name}
                      </h2>
                      <p className="text-sm mt-0.5" style={{ color: "#9a6e62" }}>
                        {booking.service} · {booking.date} · {booking.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {mode === "view" && (
                        <button
                          onClick={handleOpenEdit}
                          className="text-sm px-4 py-2 rounded-full transition hover:opacity-80"
                          style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)", color: "#fff" }}
                        >
                          {records[selectedId] ? "✎ Edit" : "+ Write Record"}
                        </button>
                      )}
                      {mode !== "view" && (
                        <button
                          onClick={handleCancel}
                          className="text-sm px-4 py-2 rounded-full transition hover:bg-stone-100"
                          style={{ color: "#5a3e35", border: "1px solid rgba(90,62,53,0.2)" }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Booking info row */}
                  <div className="grid grid-cols-3 gap-4 mb-7">
                    {BOOKING_INFO_FIELDS(booking).map((field) => (
                      <div key={field.label} className="p-4 rounded-xl" style={{ background: "#faf8f5" }}>
                        <p className="text-xs" style={{ color: "#9a6e62" }}>{field.label}</p>
                        <p className="text-sm font-medium mt-1" style={{ color: field.color ?? "#2c1f1a" }}>
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* ── VIEW: no record ── */}
                  {mode === "view" && !record && (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                      <span className="text-4xl opacity-20" style={{ color: "#b87c5a" }}>◈</span>
                      <p className="text-sm" style={{ color: "#c0a090" }}>No medical record yet for this session.</p>
                      <button
                        onClick={handleOpenEdit}
                        className="mt-1 text-sm px-5 py-2 rounded-full transition hover:opacity-80"
                        style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)", color: "#fff" }}
                      >
                        + Write Record
                      </button>
                    </div>
                  )}

                  {/* ── VIEW: has record ── */}
                  {mode === "view" && record && (
                    <div className="animate-fadeIn">
                      {saved && (
                        <div
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-sm"
                          style={{ background: "rgba(134,180,134,0.1)", color: "#3a7a3a", border: "1px solid rgba(134,180,134,0.2)" }}
                        >
                          ✓ Record saved successfully.
                        </div>
                      )}
                      <RecordField label="Diagnosis" value={record.diagnosis} />
                      <RecordField label="Treatment" value={record.treatment} />
                      <RecordField label="Notes"     value={record.notes}     />

                      {record.prescription?.length > 0 && (
                        <div className="mt-6">
                          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#b87c5a" }}>Prescriptions</p>
                          <div className="flex flex-col gap-2.5">
                            {record.prescription.map((rx, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-4 p-4 rounded-xl"
                                style={{ background: "#faf8f5" }}
                              >
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0"
                                  style={{ background: "rgba(184,124,90,0.12)", color: "#b87c5a" }}
                                >
                                  {i + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-medium" style={{ color: "#2c1f1a" }}>{rx.name} × {rx.qty}</p>
                                  <p className="text-xs mt-0.5" style={{ color: "#9a6e62" }}>{rx.dosage}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── WRITE / EDIT mode ── */}
                  {(mode === "write" || mode === "edit") && (
                    <div className="animate-fadeIn">
                      <p className="text-xs tracking-widest uppercase mb-5" style={{ color: "#b87c5a" }}>
                        {mode === "edit" ? "Edit Medical Record" : "New Medical Record"}
                      </p>

                      <div className="flex flex-col gap-5">
                        <FormField
                          label="Diagnosis"
                          placeholder="Describe the patient's skin condition…"
                          value={form.diagnosis}
                          onChange={(v) => setFormField("diagnosis", v)}
                          rows={2}
                        />
                        <FormField
                          label="Treatment Performed"
                          placeholder="Describe the treatment carried out today…"
                          value={form.treatment}
                          onChange={(v) => setFormField("treatment", v)}
                          rows={2}
                        />
                        <FormField
                          label="Doctor's Notes"
                          placeholder="Follow-up instructions, lifestyle advice, next appointment…"
                          value={form.notes}
                          onChange={(v) => setFormField("notes", v)}
                          rows={3}
                        />

                        {/* Prescriptions */}
                        <div>
                          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#b87c5a" }}>Prescriptions</p>

                          {form.prescription.length > 0 && (
                            <div className="flex flex-col gap-2 mb-3">
                              {form.prescription.map((rx, i) => (
                                <PrescriptionItem
                                  key={i}
                                  rx={rx}
                                  index={i}
                                  onRemove={handleRemoveRx}
                                />
                              ))}
                            </div>
                          )}

                          <AddPrescriptionForm
                            rxLine={rxLine}
                            onChange={setRxLine}
                            onAdd={handleAddRx}
                          />
                        </div>
                      </div>

                      {/* Save / Cancel */}
                      <div className="flex justify-end gap-3 mt-7">
                        <button
                          onClick={handleCancel}
                          className="px-5 py-2.5 rounded-full text-sm transition hover:bg-stone-100"
                          style={{ color: "#5a3e35", border: "1px solid rgba(90,62,53,0.2)" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={!form.diagnosis.trim() || !form.treatment.trim()}
                          className="px-7 py-2.5 rounded-full text-sm text-white transition hover:opacity-90 disabled:opacity-40"
                          style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}
                        >
                          Save Record
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RecordPage;