import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./FamilyTree.css";
import demoData from "../data/familyData";

// simple tree layout helper (compute x,y positions)
function layoutTree(root, levelGap = 120, nodeGap = 140) {
  // root = { id, name, children: [...] }
  // do DFS, compute positions by level
  const levels = [];
  function dfs(node, depth = 0) {
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);
    (node.children || []).forEach((c) => dfs(c, depth + 1));
  }
  dfs(root);
  // assign x positions
  const coords = new Map();
  levels.forEach((nodesAtLevel, depth) => {
    const total = nodesAtLevel.length;
    nodesAtLevel.forEach((node, i) => {
      const x = (i - (total - 1) / 2) * nodeGap; // center
      const y = depth * levelGap;
      coords.set(node, { x, y });
    });
  });
  return coords;
}

function pathBetween(a, b) {
  // cubic Bezier for smooth curve
  const dx = 0;
  const dy = (b.y - a.y) / 2;
  const cx1 = a.x;
  const cy1 = a.y + dy;
  const cx2 = b.x;
  const cy2 = b.y - dy;
  return `M ${a.x} ${a.y} C ${cx1} ${cy1} ${cx2} ${cy2} ${b.x} ${b.y}`;
}

export default function FamilyTree({ data = demoData }) {
  const [expanded, setExpanded] = useState(new Set()); // expanded node ids
  const root = useMemo(() => data, [data]);
  const coords = useMemo(() => layoutTree(root), [root]);

  // flatten nodes
  function collect(node) {
    const arr = [node];
    (node.children || []).forEach((c) => arr.push(...collect(c)));
    return arr;
  }
  const nodes = useMemo(() => collect(root), [root]);

  const toggle = (id) => {
    const s = new Set(expanded);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setExpanded(s);
  };

  // visible nodes: root + children of expanded nodes (simple rule)
  function isVisible(node) {
    if (node === root) return true;
    // find parent chain
    let p = node.parent;
    while (p) {
      if (p === root) return true;
      if (!expanded.has(p.id)) return false;
      p = p.parent;
    }
    return true;
  }

  // build parent references (one-time)
  const withParent = useMemo(() => {
    function attach(node, parent = null) {
      const copy = { ...node, parent };
      if (node.children) {
        copy.children = node.children.map((c) => attach(c, copy));
      }
      return copy;
    }
    return attach(root, null);
  }, [root]);

  // recalc coords with parent-aware nodes
  const coords2 = useMemo(() => {
    const map = layoutTree(withParent);
    return map;
  }, [withParent]);

  const flat = useMemo(() => collect(withParent), [withParent]);

  return (
    <div className="ft-wrapper">
      <svg className="ft-svg" viewBox="-600 -40 1200 700" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* links */}
        <g className="ft-links">
          {flat.map((n) => {
            if (!n.children || n.children.length === 0) return null;
            const a = coords2.get(n);
            return n.children.map((c, i) => {
              const b = coords2.get(c);
              if (!a || !b) return null;
              // show link only if child is visible
              return (
                <motion.path
                  key={n.id + "-" + c.id}
                  d={pathBetween(a, b)}
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.05 * i }}
                />
              );
            });
          })}
        </g>

        {/* nodes */}
        <g className="ft-nodes" transform="translate(0,40)">
          {flat.map((node) => {
            const p = coords2.get(node);
            if (!p) return null;
            const visible = true; // keep all visible for demo; modify if collapse logic desired
            return (
              <g key={node.id} transform={`translate(${p.x},${p.y})`} className="ft-node-group">
                <motion.circle
                  className="ft-node"
                  r={36}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.08, filter: "url(#glow)" }}
                  onClick={() => toggle(node.id)}
                  style={{ cursor: "pointer", fill: node.fill || "#fff", stroke: "#1e3a8a", strokeWidth: 3 }}
                />
                <motion.text
                  className="ft-label"
                  textAnchor="middle"
                  y={56}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {node.name}
                </motion.text>

                <motion.text
                  className="ft-sub"
                  textAnchor="middle"
                  y={72}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {node.role}
                </motion.text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="ft-legend">
        <div><span className="dot" style={{background:"#fff", border:"3px solid #1e3a8a"}}></span> Family Member</div>
        <div><span className="dot" style={{background:"#f59e0b"}}></span> Wealth Contributor</div>
        <div><span className="dot" style={{background:"#059669"}}></span> Active Saver</div>
      </div>
    </div>
  );
}
