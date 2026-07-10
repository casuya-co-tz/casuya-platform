// Single source of truth for which capabilities the Casuya platform actually
// exposes. The homepage renders from this so a feature is only shown when the
// system genuinely provides it — no marketing claims for un-wired features.
//
// `enabled: true` means a corresponding backend router/endpoint exists.
// `aiAssistant` is intentionally disabled: ai_service.py exists but is not
// mounted as an API router, so the feature is not actually available yet.

export const FEATURES = {
  interactiveLessons: {
    enabled: true,
    icon: "📚",
    title: "Interactive Lessons",
    blurb: "Create rich operational HTML lessons bundled with videos, interactive quizzes, and modern rich animations.",
    hero: true,
    trusted: false,
  },
  offlineLearning: {
    enabled: true,
    icon: "📶",
    title: "Offline Learning",
    blurb: "Seamlessly download full structured courses locally and continue learning dynamically even without Internet infrastructure.",
    hero: true,
    trusted: true,
  },
  aiAssistant: {
    enabled: false, // not wired to an API router yet
    icon: "🤖",
    title: "AI Teacher Assistant",
    blurb: "Instantly generate balanced grading frameworks, structural lesson descriptions, and sample interactive workflows.",
    hero: true,
    trusted: false,
  },
  analytics: {
    enabled: true,
    icon: "📊",
    title: "Analytics",
    blurb: "Track comprehensive student performance curves utilizing direct, visual metrics panels.",
    hero: true,
    trusted: false,
  },
  assessments: {
    enabled: true,
    icon: "📝",
    title: "Assessments",
    blurb: "Design specialized dynamic questionnaires, modular assignments, and enterprise testing criteria on the fly.",
    hero: false,
    trusted: false,
  },
  cloudSync: {
    enabled: true,
    icon: "☁️",
    title: "Cloud Sync",
    blurb: "Securely back up all grades, configurations, and core parameters instantly whenever a connection activates.",
    hero: false,
    trusted: true,
  },
  digitalExaminations: {
    enabled: true,
    icon: "🧪",
    title: "Digital Examinations",
    hero: false,
    trusted: true,
  },
  aiLessonCreation: {
    enabled: false, // depends on the un-wired AI assistant
    icon: "✨",
    title: "AI Lesson Creation",
    hero: false,
    trusted: true,
  },
};

// Personas shown in the "Tailored Experiences" section. Parents/Schools are
// served through the student/teacher experience, not separate account roles.
export const PERSONAS = [
  { icon: "👨‍🏫", title: "Teachers", points: ["Create rich digital content", "Coordinate modular cohorts", "Evaluate metrics streams"] },
  { icon: "👩‍🎓", title: "Students", points: ["Study from any location", "Interact with tests offline", "Monitor learning records"] },
  { icon: "👨‍👩‍👧", title: "Parents", points: ["Observe progress trackers", "View localized updates"] },
  { icon: "🏫", title: "Schools", points: ["Optimize staff delegation", "Export complex analytical datasets"] },
];

export function enabledFeatures() {
  return Object.values(FEATURES).filter((f) => f.enabled);
}
