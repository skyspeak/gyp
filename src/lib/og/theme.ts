// Share images are rendered by Satori, which knows nothing about Tailwind or
// CSS variables, so the brand palette is restated here as literal colours.
// These mirror the light theme tokens in globals.css.
export const OG = {
  size: { width: 1200, height: 630 },
  ground: "#f8fbfa",
  card: "#ffffff",
  ink: "#14181c",
  soft: "#4a5551",
  faint: "#79847f",
  rule: "#dfe4e1",
  pine: "#1b5a43",
  earnBg: "#e6f2ec",
  earnInk: "#1f5c43",
  payBg: "#fbe9ec",
  payInk: "#8a2a3b",
  // Map buckets, lightest to darkest, matching the on-site legend.
  buckets: ["#bcd6cb", "#83b19f", "#3f7f69", "#1b5a43"],
  empty: "#e3e9e6",
  notOpen: "#f1dcbd",
} as const;
