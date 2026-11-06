import React, { useCallback, useMemo, useState } from "react"

export interface AccessibilityNode {
  id: string | number
  class?: string
  className?: string
  text?: string
  resourceId?: string
  clickable?: boolean
  enabled?: boolean
  visible?: boolean
  x?: number
  y?: number
  width?: number
  height?: number
  bounds?: {
    left: number
    top: number
    right: number
    bottom: number
  }
  children?: AccessibilityNode[]
}

export interface AccessibilityOverlayPanelProps {
  frame: string | null
  stream: "connecting" | "live" | "reconnecting"
  isOnline?: boolean
  hierarchy: any
  onSendCommand: (action: string, extra?: Record<string, any>) => void
  busy: boolean
  token?: string | null
}

const CYBER_COLORS = [
  "#ff4d6d", "#22d3ee", "#ff2e5d", "#ff3b6b", "#6366f1", "#a21caf",
  "#ec4899", "#f43f5e", "#ef4444", "#f59e0b", "#22c55e", "#ff4757",
  "#14b8a6", "#8698ff", "#ff4757", "#ff4757"
]

export default function AccessibilityOverlayPanel({
  frame,
  stream,
  isOnline,
  hierarchy,
  onSendCommand,
  busy,
}: AccessibilityOverlayPanelProps) {
  const [showOverlay, setShowOverlay] = useState(true)
  const [filterClickable, setFilterClickable] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [opacity, setOpacity] = useState(85)
  const [borderWidth, setBorderWidth] = useState(2)
  const [borderRadius, setBorderRadius] = useState(6)
  const [scaleFactor, setScaleFactor] = useState(1.0)
  const [selectedColor, setSelectedColor] = useState("#ff4d6d")
  const [selectedNode, setSelectedNode] = useState<AccessibilityNode | null>(null)
  const [showInspector, setShowInspector] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  const rootNode: AccessibilityNode | null = useMemo(() => {
    if (!hierarchy) return null
    if (hierarchy.root) return hierarchy.root
    if (Array.isArray(hierarchy) && hierarchy.length > 0) return hierarchy[0]
    if (hierarchy.node) return hierarchy.node
    return hierarchy as AccessibilityNode
  }, [hierarchy])

  const getBounds = (node: AccessibilityNode): { left: number; top: number; right: number; bottom: number } | null => {
    if (node.bounds) return node.bounds
    if (node.x !== undefined && node.y !== undefined && node.width !== undefined && node.height !== undefined) {
      return {
        left: node.x,
        top: node.y,
        right: node.x + node.width,
        bottom: node.y + node.height,
      }
    }
    return null
  }

  const centerOf = (node: AccessibilityNode): { x: number; y: number } | null => {
    const b = getBounds(node)
    if (!b) return null
    return {
      x: (b.left + b.right) / 2 / 1000.0,
      y: (b.top + b.bottom) / 2 / 1000.0,
    }
  }

  const handleSendClick = useCallback(() => {
    if (!selectedNode) return
    const center = centerOf(selectedNode)
    const cmd = {
      action: "click",
      nodeId: selectedNode.id,
      scale: "vnc_norm",
      ...(center || {}),
    }
    onSendCommand("CLICK", { ...cmd, scaled: true, x: center?.x, y: center?.y })
  }, [selectedNode, onSendCommand])

  const renderOverlay = useCallback(
    (node: AccessibilityNode, depth: number = 0): React.ReactNode => {
      const b = getBounds(node)
      if (!b) return null
      if (filterClickable && !node.clickable) {
        return node.children?.map((c) => renderOverlay(c, depth + 1))
      }
      const width = (b.right - b.left) * scaleFactor
      const height = (b.bottom - b.top) * scaleFactor
      const left = b.left * scaleFactor
      const top = b.top * scaleFactor
      const isClickable = !!node.clickable
      const isSelected = selectedNode?.id === node.id
      const borderColor = isSelected ? "#ff003c" : selectedColor
      const bgColor = isSelected ? "rgba(255,0,60,0.25)" : isClickable ? "rgba(59,130,246,0.15)" : "rgba(148,163,184,0.08)"

      return (
        <React.Fragment key={node.id + "-" + depth}>
          <div
            className="absolute pointer-events-auto transition-all duration-150"
            style={{
              left,
              top,
              width,
              height,
              borderWidth: borderWidth,
              borderStyle: isClickable ? "solid" : "dashed",
              borderColor,
              borderRadius: borderRadius,
              backgroundColor: bgColor,
              opacity: opacity / 100,
              cursor: isClickable ? "pointer" : "default",
              boxShadow: isClickable ? "0 0 20px -8px rgba(59,130,246,0.9)" : "none",
              zIndex: isSelected ? 20 : 10 + depth,
            }}
            onMouseEnter={() => setSelectedNode(node)}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedNode(node)
            }}
            title={`${node.class || node.className || "unknown"}${node.text ? ": " + node.text : ""}`}
          >
            {showLabels && (node.text || node.resourceId) && (
              <span className="absolute -top-5 left-0 text-[9px] px-1 py-0.5 bg-black/80 text-pink-300 whitespace-nowrap max-w-full overflow-hidden text-ellipsis pointer-events-none">
                {node.text || node.resourceId}
              </span>
            )}
          </div>
          {node.children?.map((c) => renderOverlay(c, depth + 1))}
        </React.Fragment>
      )
    },
    [filterClickable, scaleFactor, borderWidth, borderRadius, selectedColor, selectedNode, showLabels, opacity]
  )

  return (
    <div className="device-page-container" style={{ height: "100vh", backgroundColor: darkMode ? "#0f172a" : "#111", color: "#f8fafc", display: "flex", flexDirection: "column" }}>
      <header className="device-toolbar" style={{ padding: "0.75rem 1.5rem", background: darkMode ? "#1e293b" : "#1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em" }}>VNC FULL CONTROL + SCREEN READER MODE</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setDarkMode((v) => !v)} className="btn" style={{ padding: "6px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", border: "1px solid #334155", background: darkMode ? "#0f172a" : "#2a2a2a", color: "#fff" }}>
            {darkMode ? "LIGHT" : "DARK"}
          </button>
          <button onClick={() => setShowInspector((v) => !v)} className="btn" style={{ padding: "6px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", border: "1px solid #334155", background: darkMode ? "#0f172a" : "#2a2a2a", color: "#fff" }}>
            {showInspector ? "HIDE INSPECTOR" : "SHOW INSPECTOR"}
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", gap: "1.5rem", padding: "1.5rem" }}>
        <div style={{ flex: 2, display: "flex", justifyContent: "center", alignItems: "center", background: "#090d16", borderRadius: 12, position: "relative", overflow: "hidden", border: "1px solid #334155" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
            {frame ? (
              <img
                src={frame}
                alt="Tela ao vivo do dispositivo"
                style={{ maxWidth: "100%", maxHeight: "calc(100vh - 140px)", objectFit: "contain", pointerEvents: "none" }}
              />
            ) : (
              <div style={{ color: "#aaa", fontSize: "12px" }}>
                {isOnline ? "Aguardando o primeiro frame..." : "Dispositivo offline"}
              </div>
            )}
            {showOverlay && rootNode && (
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                {renderOverlay(rootNode)}
              </div>
            )}
            <div style={{ position: "absolute", left: 10, top: 10, padding: "4px 6px", background: "#111d", color: stream === "live" ? "#00ff9d" : "#aaa", borderRadius: 4, fontSize: "9px", letterSpacing: "0.12em", pointerEvents: "none", textTransform: "uppercase" }}>
              ? {stream}
            </div>
            <div style={{ position: "absolute", right: 10, top: 10, padding: "4px 6px", background: "#111d", color: "#aaa", borderRadius: 4, fontSize: "9px", letterSpacing: "0.12em", pointerEvents: "none", textTransform: "uppercase" }}>
              VNC · {isOnline ? "ONLINE" : "OFFLINE"}
            </div>
          </div>
        </div>

        {showInspector && (
          <div style={{ flex: 1, background: darkMode ? "#1e293b" : "#1a1a1a", borderRadius: 12, border: "1px solid #334155", display: "flex", flexDirection: "column", overflow: "hidden", maxWidth: 420 }}>
            <div style={{ padding: "0.9rem 1rem", borderBottom: "1px solid #334155", background: "linear-gradient(90deg, rgba(59,130,246,0.2), transparent)" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#ff3b6b", fontWeight: 700 }}>Screen Reader Inspector</div>
            </div>
            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#aaa" }}>
                  <input type="checkbox" checked={showOverlay} onChange={(e) => setShowOverlay(e.target.checked)} />
                  Show Overlay
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#aaa" }}>
                  <input type="checkbox" checked={filterClickable} onChange={(e) => setFilterClickable(e.target.checked)} />
                  Only Clickable
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#aaa" }}>
                  <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
                  Show Labels
                </label>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#aaa" }}>Opacity: {opacity}%</label>
                <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
                <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#aaa" }}>Border Width: {borderWidth}px</label>
                <input type="range" min={1} max={6} value={borderWidth} onChange={(e) => setBorderWidth(Number(e.target.value))} />
                <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#aaa" }}>Border Radius: {borderRadius}px</label>
                <input type="range" min={0} max={20} value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} />
                <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#aaa" }}>Scale Factor: {scaleFactor.toFixed(2)}x</label>
                <input type="range" min={0.5} max={2.0} step={0.05} value={scaleFactor} onChange={(e) => setScaleFactor(Number(e.target.value))} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#aaa" }}>Overlay Color</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CYBER_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        background: c,
                        border: selectedColor === c ? "2px solid #fff" : "1px solid #334155",
                        boxShadow: selectedColor === c ? "0 0 12px -2px " + c : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "0.75rem", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#ff3b6b", fontWeight: 700 }}>Selected Node Properties</div>
                {selectedNode ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "11px", color: "#cbd5e1" }}>
                    <div><strong>Class:</strong> {(selectedNode as any).class || (selectedNode as any).className || "N/A"}</div>
                    <div><strong>Text:</strong> {selectedNode.text || "N/A"}</div>
                    <div><strong>Resource ID:</strong> {selectedNode.resourceId || "N/A"}</div>
                    <div><strong>Clickable:</strong> {selectedNode.clickable ? "Sim" : "Não"}</div>
                    <div><strong>Bounds:</strong> {(() => { const b = getBounds(selectedNode); return b ? `${b.left},${b.top},${b.right},${b.bottom}` : "N/A" })()}</div>
                    <button
                      disabled={busy || !isOnline}
                      onClick={handleSendClick}
                      style={{
                        marginTop: 6,
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid rgba(59,130,246,0.8)",
                        background: "linear-gradient(90deg, rgba(59,130,246,0.3), transparent)",
                        color: "#fff",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        fontWeight: 700,
                        cursor: busy ? "not-allowed" : "pointer",
                      }}
                    >
                      Disparar Clique Remoto
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Passe o mouse ou clique em um elemento do overlay para selecionar.</div>
                )}
              </div>

              <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "0.75rem", flex: 1, overflow: "auto" }}>
                <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#ff3b6b", fontWeight: 700, marginBottom: 8 }}>Hierarchy (JSON)</div>
                <pre style={{ fontSize: "9px", color: "#94a3b8", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
                  {hierarchy ? JSON.stringify(hierarchy, null, 2) : "Sem dados de hierarquia."}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



