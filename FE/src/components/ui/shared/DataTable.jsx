import { useState, useMemo } from "react";
import LoadingSpinner from "./LoadingSpinner";

// ── Skeleton cell ─────────────────────────────────────────────
const skStyle = {
  display: "inline-block",
  height: 12,
  borderRadius: 6,
  background:
    "linear-gradient(90deg,rgba(232,201,176,.28) 0%,rgba(212,168,130,.22) 50%,rgba(232,201,176,.28) 100%)",
  animation: "dtSk 1.5s ease-in-out infinite",
};

// ── Sort icon ─────────────────────────────────────────────────
function SortIcon({ active, direction }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 1,
        marginLeft: 5,
        opacity: active ? 1 : 0.3,
        verticalAlign: "middle",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          fontSize: 8,
          lineHeight: 1,
          color: active && direction === "asc" ? "#b87c5a" : "#9a8070",
        }}
      >
        ▲
      </span>
      <span
        style={{
          fontSize: 8,
          lineHeight: 1,
          color: active && direction === "desc" ? "#b87c5a" : "#9a8070",
        }}
      >
        ▼
      </span>
    </span>
  );
}

// ── DataTable ─────────────────────────────────────────────────
export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage,
  onRowClick,
  skeletonRows = 5,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const alignStyle = (align) => ({
    textAlign: align || "left",
  });

  return (
    <>
      <style>{`
        @keyframes dtSk {
          0%,100%{opacity:1} 50%{opacity:.4}
        }
        .dt-row:hover td {
          background: rgba(253,246,239,0.75) !important;
        }
        .dt-row-click {
          cursor: pointer;
        }
      `}</style>

      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(184,124,90,0.12)",
          background: "#fff",
          position: "relative",
        }}
      >
        {/* Loading overlay for in-place reload */}
        {isLoading && data.length > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(250,248,245,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              borderRadius: 18,
            }}
          >
            <LoadingSpinner size="md" variant="pulse" label="Loading…" />
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              tableLayout: "auto",
            }}
          >
            {/* ── HEAD ── */}
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(184,124,90,0.1)",
                  background: "#fdf9f6",
                }}
              >
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    style={{
                      padding: "12px 20px",
                      fontWeight: 400,
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#9a6e62",
                      fontFamily: "var(--font-sans, sans-serif)",
                      whiteSpace: "nowrap",
                      cursor: col.sortable ? "pointer" : "default",
                      userSelect: "none",
                      minWidth: col.width || "auto",
                      ...alignStyle(col.align),
                    }}
                  >
                    {col.label}
                    {col.sortable && (
                      <SortIcon
                        active={sortKey === col.key}
                        direction={sortDir}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── BODY ── */}
            <tbody>
              {isLoading && data.length === 0
                ? // Skeleton rows (initial load)
                  Array.from({ length: skeletonRows }).map((_, ri) => (
                    <tr
                      key={`sk-${ri}`}
                      style={{
                        borderBottom: "1px solid rgba(184,124,90,0.06)",
                      }}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          style={{ padding: "14px 20px", ...alignStyle(col.align) }}
                        >
                          <span
                            style={{
                              ...skStyle,
                              width: `${50 + ((ri * 13 + col.key.length * 7) % 35)}%`,
                              animationDelay: `${ri * 80}ms`,
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                : sorted.length === 0
                ? // Empty state
                  (
                    <tr>
                      <td colSpan={columns.length}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "56px 24px",
                            textAlign: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 32,
                              color: "#c8a090",
                              marginBottom: 12,
                              opacity: 0.5,
                            }}
                          >
                            ◈
                          </span>
                          <p
                            style={{
                              fontSize: 14,
                              fontFamily:
                                "'Playfair Display', Georgia, serif",
                              color: "#2c1f1a",
                              marginBottom: 4,
                            }}
                          >
                            Nothing to show
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: "#9a6e62",
                              fontFamily: "var(--font-sans, sans-serif)",
                            }}
                          >
                            {emptyMessage || "No data available for this view."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                : // Data rows
                  sorted.map((row, ri) => (
                    <tr
                      key={row.id ?? ri}
                      className={`dt-row${onRowClick ? " dt-row-click" : ""}`}
                      onClick={() => onRowClick?.(row)}
                      style={{
                        borderBottom: "1px solid rgba(184,124,90,0.06)",
                        transition: "background 0.12s",
                      }}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            padding: "13px 20px",
                            color: "#2c1f1a",
                            fontFamily: "var(--font-sans, sans-serif)",
                            verticalAlign: "middle",
                            ...alignStyle(col.align),
                          }}
                        >
                          {col.render
                            ? col.render(row[col.key], row)
                            : row[col.key] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Footer row count */}
        {!isLoading && sorted.length > 0 && (
          <div
            style={{
              padding: "10px 20px",
              borderTop: "1px solid rgba(184,124,90,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#b0907e",
                fontFamily: "var(--font-sans, sans-serif)",
              }}
            >
              {sorted.length} {sorted.length === 1 ? "row" : "rows"}
              {sortKey && (
                <span style={{ marginLeft: 8, color: "#c8a090" }}>
                  · sorted by{" "}
                  <span style={{ color: "#b87c5a" }}>
                    {columns.find((c) => c.key === sortKey)?.label || sortKey}
                  </span>{" "}
                  ({sortDir})
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </>
  );
}