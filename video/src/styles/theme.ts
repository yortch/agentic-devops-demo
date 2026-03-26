// Agentic DevOps — Design tokens & timing constants
// Branded to match docs/index.html (Three Rivers Bank)
// Optimized for 1920×1080 (16:9 landscape — LinkedIn long-form video)

export const COLORS = {
  // Primary brand (from docs/index.html)
  bg: "#09090f",
  surface: "#111118",
  navy: "#003366",
  teal: "#008080",
  accent: "#00d4aa",

  // Terminal
  terminalBg: "#0d1117",
  terminalBar: "#1c2128",

  // Text
  white: "#e0e0e0",
  dimWhite: "#8b949e",
  brightWhite: "#FFFFFF",

  // Semantic
  green: "#3fb950",
  cyan: "#58a6ff",
  yellow: "#d29922",
  red: "#f85149",
  blue: "#58a6ff",
  purple: "#bc8cff",
  orange: "#f0883e",
  gray: "#30363d",

  // Traffic light (terminal chrome)
  trafficRed: "#ff5f57",
  trafficYellow: "#febc2e",
  trafficGreen: "#28c840",

  // Legacy aliases (used by reusable terminal components)
  vscodeBlue: "#58a6ff",
  msRed: "#F25022",
  msGreen: "#7FBA00",
  msBlue: "#00A4EF",
  msYellow: "#FFB900",
  sidebarBg: "#111118",
  lightGreen: "#3fb950",

  // Step colors (matching docs timeline)
  stepRed: "#f85149",
  stepYellow: "#d29922",
  stepTeal: "#00d4aa",
  stepPurple: "#bc8cff",
  stepBlue: "#58a6ff",
  stepGreen: "#3fb950",
};

export const TIMING = {
  CHAR_DELAY: 2,
  LINE_DELAY: 3,
  COMMAND_PAUSE: 15,
  FADE_DURATION: 12,
  TRANSITION_FRAMES: 15,
};

export const FONT = {
  mono: "'Cascadia Code', 'Cascadia Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
};

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
};

// Step metadata for the 8-step agentic loop
export const STEPS = [
  {
    num: 1,
    emoji: "🔴",
    title: "Breaking Change Reaches the Demo App",
    desc: "A GitHub Agentic Workflow autonomously selects a chaos scenario, modifies the target file, and opens a PR with a plausible commit message.",
    actor: "🌪️ GitHub Agentic Workflow",
    color: COLORS.stepRed,
    screenshots: [
      "step-1a-issue-56.png",
      "step-1b-workflow-run.png",
      "step-1c-pr70-changes.png",
    ],
    panScroll: true,
    panHeight: "125%",
    panAlign: "left",
  },
  {
    num: 2,
    emoji: "🟡",
    title: "CI/CD Deploys the Defect",
    desc: "GitHub Actions CD triggers on merge to main. azd up deploys the broken code to Azure Container Apps. The defect is now live.",
    actor: "⚙️ GitHub Actions CD",
    color: COLORS.stepYellow,
    screenshots: ["step-2-cd-deploy.png"],
    panScroll: true,
    panHeight: "125%",
    panAlign: "left",
  },
  {
    num: 3,
    emoji: "🚨",
    title: "Azure Monitor Alert Fires",
    desc: "Within minutes, Azure Monitor detects the anomaly and fires a High Response Time alert. The alert routes to the SRE Agent's response plan.",
    actor: "🤖 Azure Monitor → SRE Agent",
    color: COLORS.stepRed,
    screenshots: ["step-3-azure-alert.png"],
  },
  {
    num: 4,
    emoji: "🔍",
    title: "SRE Agent Investigates",
    desc: "The incident-handler subagent queries ContainerAppConsoleLogs via KQL, reads metrics, and cross-references GitHub to find the exact offending commit.",
    actor: "🤖 SRE Agent — code-analyzer",
    color: COLORS.stepTeal,
    screenshots: ["step-4-sre-investigates.png"],
  },
  {
    num: 5,
    emoji: "📋",
    title: "GitHub Issue Created with Full RCA",
    desc: "The agent creates a structured GitHub Issue with incident timeline, root cause analysis, and fix recommendation — assigned to @copilot.",
    actor: "🤖 SRE Agent — incident-handler",
    color: COLORS.stepTeal,
    screenshots: ["step-5-issue-71.png"],
    panScroll: true,
    panHeight: "125%",
    panAlign: "left",
  },
  {
    num: 6,
    emoji: "🤖",
    title: "Copilot Coding Agent Creates Fix PR",
    desc: "Copilot picks up the assigned issue, reads the RCA, performs code inspection, and opens a PR with the minimal fix — autonomously.",
    actor: "✨ GitHub Copilot Coding Agent",
    color: COLORS.stepPurple,
    screenshots: ["step-6-pr72.png"],
    panScroll: true,
  },
  {
    num: 7,
    emoji: "👁️",
    title: "Human Reviews & Approves",
    desc: "An engineer reviews the Copilot-authored PR. CI runs, tests pass, merge. This is the only human step in the entire pipeline.",
    actor: "👤 Human Review",
    color: COLORS.stepBlue,
    screenshots: ["step-7-pr72-review.png"],
    panScroll: true,
    panHeight: "130%",
    panAlign: "left",
  },
  {
    num: 8,
    emoji: "✅",
    title: "Production Restored",
    desc: "CD deploys the fix. SRE Agent confirms all metrics normal: response times drop, errors return to zero. Incident closed. 🟢",
    actor: "⚙️ GitHub Actions CD → SRE Agent confirms",
    color: COLORS.stepGreen,
    screenshots: ["step-8-production-restored.png"],
  },
];
