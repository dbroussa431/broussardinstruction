/* =========================================
   CORE LESSON LIST (USED BY DASHBOARD)
========================================= */
window.LESSONS = [
  { id: 1, title: "Introduction to Firearm Safety", estTime: "20–30 min", summary: "Core safety rules and mindset." },
  { id: 2, title: "Handgun Basics", estTime: "20–30 min", summary: "Parts, function, and safe handling." },
  { id: 3, title: "Ammunition Fundamentals", estTime: "20–30 min", summary: "Types, storage, and safe use." },
  { id: 4, title: "Fundamentals of Shooting", estTime: "30–45 min", summary: "Grip, stance, trigger control." },
  { id: 5, title: "Cleaning & Maintenance", estTime: "20–30 min", summary: "Care and upkeep of firearms." },
  { id: 6, title: "Louisiana Firearm Laws", estTime: "30–45 min", summary: "Legal use of force and carry laws." },
  { id: 7, title: "Situational Awareness", estTime: "30–45 min", summary: "Threat recognition and avoidance." },
  { id: 8, title: "Final Readiness Evaluation", estTime: "30–45 min", summary: "Capstone decision-based evaluation." }
];

/* =========================================
   LESSON CONTENT (OPTIONAL – USED BY LESSON PAGES)
========================================= */
window.LESSON_CONTENT = {
  8: {
    title: "Final Readiness Evaluation",
    intro: "This final capstone evaluates your ability to apply judgment, restraint, and legal understanding under realistic conditions."
  }
};

/* =========================================
   LESSON 8 CAPSTONE (FULL SYSTEM)
========================================= */
window.LESSON8_CAPSTONE = {
  title: "Lesson 8: Final Readiness Capstone",
  intro: "This capstone evaluates legal judgment, de-escalation, and responsible decision-making.",
  passScore: 80,

  scenarios: [

    /* ===================== SCENARIO 1 ===================== */
    {
      id: "law_property",
      title: "Scenario 1: Property vs Deadly Force",
      domain: "law",
      weight: 30,
      critical: true,

      gist: [
        "Deadly force requires an immediate serious threat",
        "Property alone does NOT justify deadly force",
        "Avoid escalation whenever possible"
      ],

      scenario: "Someone grabs your property and runs away. They are not threatening you directly.",

      question: "What is the safest and legally sound response?",

      options: [
        { text: "Chase and physically engage", weight: 20 },
        { text: "Draw your weapon immediately", weight: 0, autoFail: true },
        { text: "Create distance and call authorities", weight: 100 },
        { text: "Fire a warning shot", weight: 0, autoFail: true }
      ]
    },

    /* ===================== SCENARIO 2 ===================== */
    {
      id: "mental_unknown",
      title: "Scenario 2: Unknown Approach",
      domain: "mental",
      weight: 25,

      gist: [
        "Not every approach is a threat",
        "Distance gives you time and control",
        "Use verbal commands before escalation"
      ],

      scenario: "At night, someone approaches you quickly in a parking lot. Their hands are visible, but intent is unclear.",

      question: "What is the best immediate response?",

      options: [
        { text: "Draw immediately due to uncertainty", weight: 0 },
        { text: "Create distance and issue verbal commands", weight: 100 },
        { text: "Ignore the person completely", weight: 20 },
        { text: "Close distance and confront them", weight: 10 }
      ]
    },

    /* ===================== SCENARIO 3 ===================== */
    {
      id: "deescalation_argument",
      title: "Scenario 3: Heated Argument",
      domain: "deescalation",
      weight: 25,

      gist: [
        "Ego leads to bad decisions",
        "Verbal conflict is NOT justification for force",
        "Disengagement is often the correct choice"
      ],

      scenario: "A verbal argument escalates in public. The other person is angry but has not attacked.",

      question: "What is the correct response?",

      options: [
        { text: "Escalate verbally to dominate", weight: 0 },
        { text: "Leave and create distance", weight: 100 },
        { text: "Threaten with your weapon", weight: 0 },
        { text: "Push them first", weight: 15 }
      ]
    },

    /* ===================== SCENARIO 4 ===================== */
    {
      id: "aftermath",
      title: "Scenario 4: Aftermath Responsibility",
      domain: "responsibility",
      weight: 20,

      gist: [
        "Your responsibility continues after the incident",
        "Call 911 and report clearly",
        "Do not make emotional or panic-driven decisions"
      ],

      scenario: "After a defensive situation ends, the threat is no longer active.",

      question: "What should you do next?",

      options: [
        { text: "Leave the scene immediately", weight: 0 },
        { text: "Call 911 and wait safely", weight: 100 },
        { text: "Call a friend first", weight: 20 },
        { text: "Post online about the incident", weight: 0 }
      ]
    }

  ]
};
