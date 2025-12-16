import React from "react";
import {
  BaseEdge,
  EdgeProps,
  Position,
  EdgeLabelRenderer,
} from "@xyflow/react";

export default function SelfLoopEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}: EdgeProps) {
  const radiusX = 60;
  const isLeft = sourcePosition === Position.Left;
  const dir = isLeft ? -1 : 1;

  const control1X = sourceX + radiusX * dir;
  const control1Y = sourceY;
  const control2X = targetX + radiusX * dir;
  const control2Y = targetY;

  const edgePath = `M ${sourceX} ${sourceY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${targetX} ${targetY}`;

  const labelX = (control1X + control2X + (isLeft ? 30 : -30)) / 2;
  const labelY = (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      {label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "2px 4px",
              borderRadius: "2px",

              color: "#666",
              fontSize: "11px",
              fontWeight: "bold",
              pointerEvents: "all",
              zIndex: 10,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
