/* =========================================
   CORE LESSON LIST
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
   LESSON CONTENT (CRITICAL FIX)
========================================= */
window.LESSON_CONTENT = {
  1: {
    title: "Introduction to Firearm Safety",
    sections: []
  },
  2: {
    title: "Handgun Basics",
    sections: []
  },
  3: {
    title: "Ammunition Fundamentals",
    sections: []
  },
  4: {
    title: "Fundamentals of Shooting",
    sections: []
  },
  5: {
    title: "Cleaning & Maintenance",
    sections: []
  },
  6: {
    title: "Louisiana Firearm Laws",
    sections: []
  },
  7: {
    title: "Situational Awareness",
    sections: []
  },
  8: {
    title: "Final Readiness Evaluation",
    sections: [] // ← IMPORTANT: prevents crash
  }
};

/* =========================================
   LESSON 8 CAPSTONE
========================================= */
window.LESSON8_CAPSTONE = {
  passScore: 80,

  scenarios: [
    {
      id: "s1",
      title: "Property vs Force",
      weight: 30,
      critical: true,
      gist: [
        "Deadly force requires serious threat",
        "Property alone is not enough"
      ],
      scenario: "Someone steals your property and runs.",
      question: "What do you do?",
      options: [
        { text: "Shoot", weight: 0, autoFail: true },
        { text: "Chase", weight: 20 },
        { text: "Call police", weight: 100 }
      ]
    },
    {
      id: "s2",
      title: "Unknown Approach",
      weight: 25,
      gist: [
        "Distance matters",
        "Not all threats are real"
      ],
      scenario: "Someone approaches quickly at night.",
      question: "Best response?",
      options: [
        { text: "Draw immediately", weight: 0 },
        { text: "Create distance + commands", weight: 100 },
        { text: "Ignore", weight: 20 }
      ]
    },
    {
      id: "s3",
      title: "Argument",
      weight: 25,
      gist: [
        "Avoid escalation",
        "Ego kills"
      ],
      scenario: "Heated argument escalates.",
      question: "What is correct?",
      options: [
        { text: "Escalate", weight: 0 },
        { text: "Leave", weight: 100 },
        { text: "Threaten", weight: 10 }
      ]
    },
    {
      id: "s4",
      title: "Aftermath",
      weight: 20,
      gist: [
        "Call 911",
        "Stay in control"
      ],
      scenario: "Threat is over.",
      question: "What next?",
      options: [
        { text: "Leave scene", weight: 0 },
        { text: "Call 911 + wait", weight: 100 },
        { text: "Call friend", weight: 20 }
      ]
    }
  ]
};
