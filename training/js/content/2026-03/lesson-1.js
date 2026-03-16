export const LESSON = {
  lessonNumber: 1,
  courseVersion: "2026-03",
  title: "Developing a Personal Protection Plan",
  description:
    "This lesson covers awareness, avoidance, route selection, environmental positioning, and defensive habits that help students recognize danger earlier and create safer options before force becomes necessary.",
  chapterSummary: `
Personal protection starts before a threat becomes immediate. Students should use awareness, avoidance, route choice, and environmental positioning to reduce risk. A good personal protection plan includes noticing unusual behavior early, maintaining personal space, choosing better-lit and more populated routes, and mentally rehearsing safer decisions.

Students should understand that avoidance is not weakness. It is often the smartest and safest decision. Recognizing danger early gives you more choices and more time. The goal is not to win arguments or confront suspicious people. The goal is to stay safe, lawful, and hard to victimize.
  `.trim(),
  estimatedMinutes: 18,
  questionPullCount: 20,
  scenarioPullCount: 2,
  sourceEdition: "BSA / USCCA aligned 2026-03",
  lastReviewed: "2026-03-15",

  scenarioBank: [
    {
      label: "Parking Lot Awareness",
      prompt:
        "You are walking to your car after leaving a grocery store at dusk. A man changes direction and begins mirroring your path while glancing around the lot.",
      choices: [
        "Continue walking normally and unlock your car at the door.",
        "Move toward a better-lit area with more people while keeping the person in view.",
        "Immediately draw your firearm to show you are prepared.",
        "Look down at your phone and ignore the behavior."
      ],
      correct: 1,
      explanation:
        "The safer decision is to create distance, improve your environment, and maintain awareness. The lesson teaches avoidance and repositioning before escalation."
    },
    {
      label: "Crowded Exit",
      prompt:
        "You are leaving a concert venue and notice two people arguing aggressively near the walkway you planned to use.",
      choices: [
        "Walk right between them so you do not look scared.",
        "Choose a different route and maintain awareness of both individuals.",
        "Step in and tell both people to calm down.",
        "Record them closely on your phone."
      ],
      correct: 1,
      explanation:
        "Changing your route and maintaining distance is consistent with a personal protection plan."
    },
    {
      label: "Gas Station Distance",
      prompt:
        "At a gas station late at night, a stranger walks directly toward you asking for help while continuing to close distance.",
      choices: [
        "Step back, maintain distance, and keep an exit path available.",
        "Allow them inside your personal space so you can hear them better.",
        "Turn your back to search your car for something helpful.",
        "Immediately threaten them verbally."
      ],
      correct: 0,
      explanation:
        "Managing distance and keeping options open is one of the core skills taught in the lesson."
    }
  ],

  quizBank: [
    {
      question: "What is usually the first layer of personal protection?",
      choices: [
        "Owning a firearm",
        "Situational awareness",
        "Verbal confrontation",
        "Physical strength"
      ],
      correct: 1,
      explanation:
        "This lesson teaches that awareness is the first layer because it helps you identify danger early."
    },
    {
      question: "Why is avoidance an important part of a personal protection plan?",
      choices: [
        "Because it guarantees no one will ever target you",
        "Because it helps reduce the chance that force will become necessary",
        "Because it is legally required in every situation",
        "Because it replaces awareness"
      ],
      correct: 1,
      explanation:
        "Avoidance helps reduce exposure to unnecessary danger."
    },
    {
      question: "What is one benefit of mental rehearsal?",
      choices: [
        "It teaches caliber identification",
        "It helps prepare safer decisions before stress hits",
        "It replaces practical training",
        "It makes every route safe"
      ],
      correct: 1,
      explanation:
        "Mental rehearsal helps students think through safer options before they are under pressure."
    }
  ]
};
