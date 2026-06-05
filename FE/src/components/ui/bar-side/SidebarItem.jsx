import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

/**
 * SidebarItem — single navigation item for the sidebar.
 */
export default function SidebarItem({ icon, label, to, children, collapsed, badge }) {
  const location = useLocation();
  const hasChildren = children && children.length > 0;

  // Auto-expand if any child is active
  const childActive = hasChildren && children.some((c) => location.pathname.startsWith(c.to));
  const [expanded, setExpanded] = useState(childActive);

  const isActive = to && location.pathname === to;
  const isParentActive = hasChildren && childActive;

  const baseStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: collapsed ? "10px 0" : "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
    justifyContent: collapsed ? "center" : "flex-start",
    position: "relative",
    textDecoration: "none",
    width: "100%",
    border: "none",
    background: "transparent",
    textAlign: "left",
  };

  const activeStyle = {
    background: "rgba(184,124,90,0.12)",
    color: "#8b4c34",
  };

  const hoverStyle = {
    background: "rgba(184,124,90,0.07)",
  };

  const inactiveColor = "#7a5a52";

  // Wrapper for tooltip on collapsed
  const TooltipWrapper = ({ children: c }) =>
    collapsed ? (
      <div style={{ position: "relative" }} className="group">
        {c}
        <div
          className="group-hover:opacity-100 opacity-0 pointer-events-none"
          style={{
            position: "absolute",
            left: "calc(100% + 12px)",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#2c1f1a",
            color: "#fff",
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 8,
            whiteSpace: "nowrap",
            transition: "opacity 0.15s",
            zIndex: 100,
          }}
        >
          {label}
        </div>
      </div>
    ) : (
      <>{c}</>
    );

  // Icon container
  const IconBox = ({ active }) => (
    <span
      style={{
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        background: active ? "rgba(184,124,90,0.15)" : "transparent",
        color: active ? "#b87c5a" : inactiveColor,
        fontSize: 15,
        flexShrink: 0,
        transition: "all 0.2s ease",
      }}
    >
      {icon}
    </span>
  );

  // Simple leaf item (no children)
  if (!hasChildren && to) {
    return (
      <TooltipWrapper>
        <NavLink
          to={to}
          style={({ isActive: a }) => ({
            ...baseStyle,
            ...(a ? activeStyle : {}),
            color: a ? "#8b4c34" : inactiveColor,
          })}
          className="sidebar-item"
        >
          {({ isActive: a }) => (
            <>
              {/* Active indicator bar */}
              {a && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 20,
                    borderRadius: "0 4px 4px 0",
                    background: "#b87c5a",
                  }}
                />
              )}

              <IconBox active={a} />

              {!collapsed && (
                <span style={{ fontSize: 13, fontWeight: a ? 500 : 400, flex: 1, transition: "all 0.2s" }}>
                  {label}
                </span>
              )}

              {!collapsed && badge !== undefined && (
                <span
                  style={{
                    background: a ? "#b87c5a" : "rgba(184,124,90,0.15)",
                    color: a ? "#fff" : "#8b4c34",
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "1px 7px",
                    borderRadius: 20,
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      </TooltipWrapper>
    );
  }

  // Parent item with sub-menu
  if (hasChildren) {
    return (
      <div>
        <TooltipWrapper>
          <button
            onClick={() => !collapsed && setExpanded(!expanded)}
            style={{
              ...baseStyle,
              ...(isParentActive ? activeStyle : {}),
              color: isParentActive ? "#8b4c34" : inactiveColor,
            }}
          >
            {isParentActive && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 3,
                  height: 20,
                  borderRadius: "0 4px 4px 0",
                  background: "#b87c5a",
                }}
              />
            )}

            <IconBox active={isParentActive} />

            {!collapsed && (
              <>
                <span style={{ fontSize: 13, fontWeight: isParentActive ? 500 : 400, flex: 1, transition: "all 0.2s" }}>
                  {label}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  style={{
                    color: inactiveColor,
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease",
                    flexShrink: 0,
                  }}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </TooltipWrapper>

        {/* Sub-items */}
        {!collapsed && (
          <div
            style={{
              maxHeight: expanded ? children.length * 48 + "px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.3s ease",
            }}
          >
            <div style={{ paddingLeft: 14, paddingTop: 2 }}>
              {children.map((child) => {
                const childIsActive = location.pathname === child.to;
                return (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    style={({ isActive: a }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: a ? 500 : 400,
                      color: a ? "#8b4c34" : "#9a7065",
                      textDecoration: "none",
                      background: a ? "rgba(184,124,90,0.09)" : "transparent",
                      transition: "all 0.2s",
                      marginBottom: 2,
                    })}
                  >
                    {({ isActive: a }) => (
                      <>
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: a ? "#b87c5a" : "rgba(184,124,90,0.3)",
                            flexShrink: 0,
                            transition: "all 0.2s",
                          }}
                        />
                        {child.label}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}