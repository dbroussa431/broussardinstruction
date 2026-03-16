// Broussard Shooting Academy - Full Firebase Portal Dataset
// Rebuilt to remove giveaway questions, reduce repetition, and support randomized quiz delivery.
// Educational content only; not legal advice.

export const LESSONS = [
  {
    "lessonNumber": 1,
    "title": "Developing a Personal Protection Plan",
    "description": "Situational awareness, avoidance, route planning, environmental positioning, and defensive decision-making before force becomes necessary.",
    "chapterSummary": "Personal protection starts before danger becomes immediate. Students are taught that awareness, route choice, distance management, lighting, barriers, habits, and mental rehearsal reduce the chances of being surprised or cornered. The safest defensive win is often avoiding the event entirely. Students should notice exits, keep their head up, avoid distraction, preserve personal space, and move toward light, people, and better positions when something feels wrong. Awareness is not paranoia; it is disciplined attention that creates time, options, and safer choices.",
    "estimatedMinutes": 18,
    "quizQuestionCount": 15,
    "sections": [
      {
        "heading": "Awareness and Positioning",
        "body": [
          "Condition White is distracted and unaware; Condition Yellow is calm, alert awareness in public.",
          "Early recognition creates time to change direction, create distance, and use better positioning.",
          "Good positioning means keeping exits, barriers, light, witnesses, and mobility in mind."
        ]
      },
      {
        "heading": "Avoidance and Route Selection",
        "body": [
          "Avoidance is not weakness; it is often the smartest defensive decision.",
          "Bad routes, isolated spots, and unnecessary shortcuts reduce your options and increase risk.",
          "Moving toward people, light, cameras, and open space is usually safer than continuing into uncertainty."
        ]
      },
      {
        "heading": "Habits and Mental Rehearsal",
        "body": [
          "Students should build habits such as locking doors, keeping alarms set, parking wisely, and limiting distraction.",
          "Mental rehearsal helps students think through decisions before stress hits.",
          "Preparedness means having a plan for what to do if conditions begin to change."
        ]
      }
    ],
    "scenarios": [
      {
        "label": "Scenario A",
        "prompt": "You are walking to your vehicle after leaving a grocery store at night. A man near the carts begins matching your direction of travel and looking around the lot as he closes distance. What is the best first response?",
        "choices": [
          "Keep walking directly to your car and hope he passes by.",
          "Move toward a better-lit area with witnesses, keep him in view, and be ready to re-enter the store.",
          "Immediately draw your handgun to warn him away.",
          "Stop to ask him what he wants."
        ],
        "answer": 1,
        "explanation": "Lesson 1 teaches that awareness, movement, distance, and better positioning come before escalation. A safer route and more witnesses improve your options."
      },
      {
        "label": "Scenario B",
        "prompt": "You park at the far end of a poorly lit lot because it is more convenient. As you get out, you notice several people lingering between vehicles. Which lesson principle best applies?",
        "choices": [
          "Convenience matters more than positioning if you are armed.",
          "Route and parking choices can create or reduce risk before a problem begins.",
          "You should immediately confront anyone in the area.",
          "Once parked, the safest move is to ignore the environment."
        ],
        "answer": 1,
        "explanation": "The lesson teaches that parking, route choice, lighting, and environmental awareness matter long before force would ever be considered."
      },
      {
        "label": "Scenario C",
        "prompt": "A stranger steps too close while asking for directions outside a gas station. What is the best lesson-based response?",
        "choices": [
          "Maintain personal space, angle off, and answer briefly while keeping an exit route available.",
          "Turn your back and look at your phone for the address.",
          "Close distance so you can hear the question more clearly.",
          "Grab the stranger before they can move closer."
        ],
        "answer": 0,
        "explanation": "Distance, positioning, and route awareness are part of a personal protection plan. The lesson favors controlled spacing and an available exit."
      },
      {
        "label": "Scenario D",
        "prompt": "You are walking through a parking garage while texting. Why is that a problem under Lesson 1?",
        "choices": [
          "Texting improves reaction time.",
          "Texting can put you into a distracted, unaware condition and delay your recognition of danger.",
          "Phones make you look more confident.",
          "Texting is safe as long as your vehicle is nearby."
        ],
        "answer": 1,
        "explanation": "The lesson treats distraction as a major problem because it removes awareness and shortens your decision time."
      },
      {
        "label": "Scenario E",
        "prompt": "While entering your apartment building, you realize someone unknown is waiting just outside the locked door and trying to follow you in. What best fits the chapter?",
        "choices": [
          "Hold the door and let them in to avoid appearing rude.",
          "Maintain the security barrier and do not let an unknown person tailgate through controlled access.",
          "Prop the door open so you can move faster.",
          "Ignore them because locks are never important."
        ],
        "answer": 1,
        "explanation": "Home and habit security are part of personal protection. Preserving barriers and access control creates safer choices."
      }
    ]
  },
  {
    "lessonNumber": 2,
    "title": "Firearm Safety and Defensive Operation",
    "description": "Safe handling, loading and unloading, platform knowledge, ammunition basics, storage, and defensive operation.",
    "chapterSummary": "Students must understand that safe gun handling begins before a shot is fired. The four safety rules always apply. Students verify a firearm’s condition personally, not by assumption or someone else’s statement. They learn chambers, magazine wells, revolver and semi-automatic controls, compatible ammunition, loading and unloading procedures, secure storage, and why careless handling around others is unacceptable. A defensive firearm is a serious responsibility that demands deliberate, repeatable safety habits.",
    "estimatedMinutes": 20,
    "quizQuestionCount": 15,
    "sections": [
      {
        "heading": "Core Safety Rules",
        "body": [
          "Treat every firearm as if it is loaded.",
          "Keep the muzzle pointed in a safe direction.",
          "Keep your finger off the trigger until your sights are on target and you have decided to fire.",
          "Be sure of your target, its foreground, and its background."
        ]
      },
      {
        "heading": "Verification and Operation",
        "body": [
          "Students must visually and physically verify chamber and feeding source condition.",
          "Removing a magazine alone does not guarantee a pistol is unloaded.",
          "Platform knowledge matters: revolvers and semi-automatics use different controls and operating systems."
        ]
      },
      {
        "heading": "Ammunition, Storage, and Responsibility",
        "body": [
          "Only use correct, compatible, undamaged ammunition.",
          "Safe storage depends on environment, access by others, and preventing unauthorized handling.",
          "Slow down when unsure; guessing with firearms is unsafe."
        ]
      }
    ],
    "scenarios": [
      {
        "label": "Scenario A",
        "prompt": "A friend hands you a pistol and says, 'It's clear.' What is the best first action?",
        "choices": [
          "Accept the statement and put your finger on the trigger.",
          "Point it in a safe direction and personally verify the chamber and magazine well.",
          "Set it in your waistband until you need it.",
          "Immediately rack the slide and dry fire it."
        ],
        "answer": 1,
        "explanation": "The lesson teaches personal verification. No one else's statement replaces your own safe check."
      },
      {
        "label": "Scenario B",
        "prompt": "You remove the magazine from a semi-automatic pistol. Which statement is correct?",
        "choices": [
          "The gun cannot still have a round chambered.",
          "The gun may still have a round in the chamber and must still be checked.",
          "The gun is safe as long as the safety is on.",
          "The muzzle direction no longer matters."
        ],
        "answer": 1,
        "explanation": "Removing the magazine alone does not clear the chamber."
      },
      {
        "label": "Scenario C",
        "prompt": "You find loose ammunition in a range bag and are not sure it matches your firearm. What should you do?",
        "choices": [
          "Load it anyway if it looks close enough.",
          "Verify the correct caliber and condition before using it.",
          "Use only the first round and see what happens.",
          "Mix it with other rounds and sort it later."
        ],
        "answer": 1,
        "explanation": "Correct, compatible, undamaged ammunition is a basic safety requirement."
      },
      {
        "label": "Scenario D",
        "prompt": "A student keeps sweeping classmates with the muzzle while talking about their new handgun. Which rule is being violated most obviously?",
        "choices": [
          "Be sure of your target and what is beyond it.",
          "Treat every firearm as loaded.",
          "Keep the muzzle pointed in a safe direction.",
          "Use only compatible ammunition."
        ],
        "answer": 2,
        "explanation": "Muzzle discipline is a non-negotiable safety rule."
      },
      {
        "label": "Scenario E",
        "prompt": "You are unfamiliar with a revolver someone asks you to unload. What is the best lesson-based response?",
        "choices": [
          "Guess how it works and try to force it open.",
          "Slow down, identify the controls, and handle it safely instead of guessing.",
          "Point it at the ground and pull the trigger repeatedly.",
          "Hand it to another beginner."
        ],
        "answer": 1,
        "explanation": "The lesson emphasizes slowing down and learning the platform instead of guessing."
      },
      {
        "label": "Scenario F",
        "prompt": "A child sometimes visits your home. Which statement best fits Lesson 2?",
        "choices": [
          "Storage is only about protecting the firearm from rust.",
          "Safe storage must account for unauthorized access, especially by children or prohibited persons.",
          "A gun under a pillow is secure enough.",
          "Storage does not matter if the gun is unloaded."
        ],
        "answer": 1,
        "explanation": "Storage is part of responsible defensive ownership and must consider who could access the firearm."
      }
    ]
  },
  {
    "lessonNumber": 3,
    "title": "Defensive Shooting Fundamentals",
    "description": "Grip, stance, sight picture, trigger control, recoil management, and accountable hits under realistic pressure.",
    "chapterSummary": "Good defensive shooting starts with repeatable fundamentals. Students learn stable stance, a consistent grip, sight alignment, sight picture, controlled trigger press, follow-through, recoil management, and accountable hits. Defensive shooting is not reckless speed; it is safe, timely, accurate performance. The lesson stresses that equipment does not replace fundamentals and that students should build consistency before attempting more advanced speed or complexity.",
    "estimatedMinutes": 20,
    "quizQuestionCount": 15,
    "sections": [
      {
        "heading": "Body Position and Grip",
        "body": [
          "A stable stance supports recoil control, balance, and movement.",
          "A proper grip helps keep the gun consistent during the shot.",
          "Defensive shooting still requires accountable hits, not uncontrolled speed."
        ]
      },
      {
        "heading": "Sights and Trigger",
        "body": [
          "Sight alignment and sight picture matter because the gun must be pointed where the shot is intended to go.",
          "Trigger control means pressing the trigger without disturbing the sights.",
          "Follow-through and recoil management support faster, more accountable follow-up shots."
        ]
      },
      {
        "heading": "Practice and Performance",
        "body": [
          "Students build the basics before trying to chase advanced speed.",
          "Dry practice and disciplined repetition improve consistency.",
          "The goal is practical, safe performance under pressure."
        ]
      }
    ],
    "scenarios": [
      {
        "label": "Scenario A",
        "prompt": "A new shooter wants to skip grip, stance, and trigger work and move straight to speed drills. What is the best instruction?",
        "choices": [
          "Speed automatically builds fundamentals.",
          "Start with repeatable basics, then build toward speed.",
          "Only stance matters; grip and trigger can wait.",
          "Practice speed first because it feels more realistic."
        ],
        "answer": 1,
        "explanation": "Lesson 3 teaches that advanced speed should be built on solid fundamentals."
      },
      {
        "label": "Scenario B",
        "prompt": "A student jerks the trigger and the front sight dips off target every shot. What concept is most directly involved?",
        "choices": [
          "Trigger control",
          "Ammunition compatibility",
          "Route selection",
          "Castle doctrine"
        ],
        "answer": 0,
        "explanation": "Trigger control is about pressing the trigger without moving the sights off target."
      },
      {
        "label": "Scenario C",
        "prompt": "What is the best reason to maintain a stable stance during defensive shooting?",
        "choices": [
          "It makes the gun look more tactical.",
          "It helps balance, recoil control, and consistent hits.",
          "It guarantees you will never miss.",
          "It replaces the need for sight picture."
        ],
        "answer": 1,
        "explanation": "A stable stance supports balance and recoil management."
      },
      {
        "label": "Scenario D",
        "prompt": "A student keeps looking over the sights instead of actually aligning them. What principle is being neglected?",
        "choices": [
          "Safe storage",
          "Sight alignment and sight picture",
          "Magazine compatibility",
          "Legal articulation"
        ],
        "answer": 1,
        "explanation": "Sight alignment and sight picture are part of accountable shooting fundamentals."
      },
      {
        "label": "Scenario E",
        "prompt": "Why does follow-through matter after the shot breaks?",
        "choices": [
          "It helps maintain control and supports accurate follow-up shots.",
          "It removes recoil completely.",
          "It allows you to ignore your sights.",
          "It only matters in competition, not self-defense."
        ],
        "answer": 0,
        "explanation": "Follow-through helps keep the gun controlled and the shooter prepared for the next accountable shot."
      },
      {
        "label": "Scenario F",
        "prompt": "A shooter says, 'My expensive pistol makes fundamentals less important.' What is the best correction?",
        "choices": [
          "High-end gear replaces fundamentals.",
          "Equipment does not replace grip, sights, trigger control, and practice.",
          "Only stance matters with good gear.",
          "The statement is correct if the sights are upgraded."
        ],
        "answer": 1,
        "explanation": "Lesson 3 repeatedly teaches that equipment does not replace sound mechanics."
      }
    ]
  },
  {
    "lessonNumber": 4,
    "title": "Legal Use of Force — General Principles to Louisiana Reality",
    "description": "General self-defense principles, Gulf South practical realities, Louisiana rule-of-thumb guidance, and local New Orleans/Metairie/Kenner considerations.",
    "chapterSummary": "Legal notice: Broussard Shooting Academy is not a law firm and does not provide legal advice. This lesson is educational only and is taught as a practical rule-of-thumb framework that moves from general self-defense principles, to Gulf South regional realities, to Louisiana guidance, and then to local New Orleans, Metairie, and Kenner considerations. Students learn that legal outcomes depend on specific facts, changing law, witnesses, evidence, and professional legal review. The safest defensive principle is to use only the force reasonably believed necessary to stop an immediate unlawful threat.\n\nGeneral principles: self-defense claims are usually judged through reasonableness, imminence, proportionality, innocence, and necessity. Students are taught to think in terms of ability, opportunity, and jeopardy, along with whether a threat is immediate and whether the person claiming self-defense was acting as an innocent party.\n\nGulf South realities: self-defense incidents are often reviewed closely by law enforcement, prosecutors, and juries. Articulation matters. Students should be able to explain what they saw, why they believed the threat was immediate, and why their response matched the danger instead of exceeding it.\n\nLouisiana rule of thumb: Louisiana generally recognizes self-defense, defense of others, and stronger protection for lawful defense in the home or habitation, but students should never assume a slogan or internet quote replaces legal analysis. Defense of life is treated more seriously than protection of property alone. Deadly force is a grave matter and may still be investigated even when the defender believes the action was justified.\n\nLocal environment: New Orleans, Metairie, and Kenner create additional practical issues: crowded parking lots, cameras, witnesses, bars, festivals, gas stations, apartment complexes, and late-night traffic patterns. Urban density means bystanders and evidence are everywhere. Students should avoid escalating ordinary disputes, avoid chasing fleeing property thieves, and understand that calling 911, preserving evidence, and articulating why the threat was immediate may matter greatly afterward.",
    "estimatedMinutes": 26,
    "quizQuestionCount": 15,
    "sections": [
      {
        "heading": "General Legal Principles",
        "body": [
          "Reasonableness asks what a reasonable person would believe under the circumstances.",
          "Imminence focuses on whether the threat is immediate, not speculative or already over.",
          "Proportionality asks whether the force used matched the seriousness of the threat.",
          "Necessity and innocence matter; students should not unlawfully start or escalate the confrontation."
        ]
      },
      {
        "heading": "Gulf South and Louisiana Guidance",
        "body": [
          "This class is not legal advice; it teaches general rule-of-thumb principles and local defensive realities.",
          "Articulation matters: students may need to explain what they saw, what the threat was doing, and why they believed serious harm was immediate.",
          "Defense of life is different from defense of property alone; students should be cautious about internet myths."
        ]
      },
      {
        "heading": "New Orleans, Metairie, and Kenner Practical Issues",
        "body": [
          "Crowds, cameras, traffic, bars, festivals, and witnesses are common in local defensive environments.",
          "Avoid escalating arguments, road-rage incidents, and property disputes when no immediate deadly threat exists.",
          "Calling 911, preserving the scene, and avoiding careless statements are practical local lessons."
        ]
      }
    ],
    "scenarios": [
      {
        "label": "Scenario A",
        "prompt": "You are leaving a busy restaurant area in Metairie when two strangers begin fighting in a parking lot. One pushes the other, but you have no clear sign of a weapon or a deadly threat. What is the best course of action?",
        "choices": [
          "Immediately draw your firearm and order both people to the ground.",
          "Move to safety, keep distance, and call 911 instead of stepping into a non-deadly fight with a gun.",
          "Join the fight to help the weaker person physically.",
          "Walk closer to get a better view before deciding."
        ],
        "answer": 1,
        "explanation": "The lesson stresses reasonableness, distance, and avoiding escalation. In a crowded local environment, moving to safety and calling police is usually safer than introducing a firearm into an unclear situation."
      },
      {
        "label": "Scenario B",
        "prompt": "Someone snatches a bag from a table in a busy New Orleans entertainment district and runs away. No one is facing immediate deadly harm. Which answer best fits the chapter?",
        "choices": [
          "Deadly force is generally not justified for property alone when there is no immediate deadly threat.",
          "You should chase and shoot because theft is always violent.",
          "Any felony automatically justifies deadly force.",
          "Urban settings create fewer legal problems than rural ones."
        ],
        "answer": 0,
        "explanation": "The lesson distinguishes defense of life from protection of property alone and warns students not to rely on slogans or myths."
      },
      {
        "label": "Scenario C",
        "prompt": "A man in a Kenner parking lot charges at you from close range while yelling he is going to kill you and reaching behind his back. Which legal concepts are most relevant?",
        "choices": [
          "Only property ownership.",
          "Ability, opportunity, jeopardy, and immediate threat.",
          "Only caliber choice.",
          "Only whether you have witnesses."
        ],
        "answer": 1,
        "explanation": "Lesson 4 teaches students to think through immediate threat, ability, opportunity, and jeopardy as part of reasonableness."
      },
      {
        "label": "Scenario D",
        "prompt": "After a defensive incident, a student says, 'My friends think I was justified, so I'm legally fine.' What is the best correction?",
        "choices": [
          "Friends decide the legal standard.",
          "Law enforcement, prosecutors, and juries may still review the facts and reasonableness of the event.",
          "If your intentions were good, no review occurs.",
          "Social media support is more important than physical evidence."
        ],
        "answer": 1,
        "explanation": "Gulf South and Louisiana realities include post-incident review. Private opinions do not decide legal outcomes."
      },
      {
        "label": "Scenario E",
        "prompt": "You hear someone trying to force entry into an occupied home at night. Which rule-of-thumb idea is most relevant in the lesson?",
        "choices": [
          "The law generally treats defense of habitation more seriously than defense of unattended property alone.",
          "Home defense is always illegal in Louisiana.",
          "The only legal issue is whether the intruder is armed.",
          "Reasonableness never matters inside a home."
        ],
        "answer": 0,
        "explanation": "The lesson explains that Louisiana gives stronger defensive weight to occupied-home situations than to property alone, while still warning students that facts matter."
      },
      {
        "label": "Scenario F",
        "prompt": "A driver curses at you during traffic in New Orleans and gets out of the vehicle while recording you on a phone. They remain at a distance and make no deadly move. Which is the best response?",
        "choices": [
          "Exit your car and challenge them.",
          "Avoid escalating a road-rage encounter and maintain safety if no immediate deadly threat is present.",
          "Display your gun to win the argument.",
          "Approach them quickly before they can speak again."
        ],
        "answer": 1,
        "explanation": "The lesson specifically warns students against escalating ordinary disputes in dense urban environments."
      },
      {
        "label": "Scenario G",
        "prompt": "A student asks whether this class is giving legal advice. What is the correct answer?",
        "choices": [
          "Yes, the class acts as legal counsel.",
          "No, the class teaches practical educational guidance and general rule-of-thumb principles, not legal representation.",
          "Yes, all scenario answers are binding legal opinions.",
          "Only Louisiana residents receive legal advice."
        ],
        "answer": 1,
        "explanation": "The lesson begins with a legal disclaimer that BSA is not a law firm and does not provide legal advice."
      },
      {
        "label": "Scenario H",
        "prompt": "Why does the lesson focus specifically on New Orleans, Metairie, and Kenner?",
        "choices": [
          "Because local defensive incidents often occur in crowded, camera-heavy, witness-rich urban environments.",
          "Because state law only applies in those cities.",
          "Because there are no rural defensive incidents in Louisiana.",
          "Because local conditions remove the need for articulation."
        ],
        "answer": 0,
        "explanation": "The lesson highlights dense local environments, witnesses, cameras, bars, festivals, and traffic patterns as practical realities."
      },
      {
        "label": "Scenario I",
        "prompt": "A person who threatened you a minute ago is now running away and no longer presents an immediate threat. What is the strongest lesson-based statement?",
        "choices": [
          "Imminence matters; force analysis changes when the threat is no longer immediate.",
          "You may always use deadly force if you were angry enough.",
          "Running away increases your right to shoot.",
          "Once threatened, legal review no longer matters."
        ],
        "answer": 0,
        "explanation": "Lesson 4 teaches imminence and necessity. An ended or fleeing threat is not the same as an immediate deadly threat."
      },
      {
        "label": "Scenario J",
        "prompt": "Why does articulation matter after a defensive event in the Gulf South?",
        "choices": [
          "Because students may need to explain what they observed and why they believed serious harm was immediate.",
          "Because silence is always proof of guilt.",
          "Because the law only cares about caliber size.",
          "Because witnesses never matter."
        ],
        "answer": 0,
        "explanation": "The chapter stresses articulation as part of surviving legal scrutiny after an event."
      }
    ]
  },
  {
    "lessonNumber": 5,
    "title": "Violent Encounters, Stress Response, and Mental Wellness",
    "description": "Stress physiology, fight-flight-freeze, trauma responses, coping, substance risks, crisis warning signs, and responsible intervention.",
    "chapterSummary": "Violent encounters affect both body and mind. Students learn how the sympathetic nervous system, adrenaline, fear, and survival stress can influence perception, movement, hearing, vision, memory, and decision-making. Tunnel vision, auditory exclusion, shaky hands, and time distortion can happen to ordinary people under threat. After an event, people may experience shock, sleep disruption, intrusive thoughts, guilt, anger, hypervigilance, emotional swings, or physical stress responses.\n\nMental wellness is part of responsible armed citizenship. Students learn that trauma responses vary, that coping strategies can include support systems, talking with trusted people, prayer or meditation, music and art, stretching or yoga, journaling, counseling, and community connection. Students are also taught to avoid worsening stress through alcohol, drugs, nicotine overuse, sleep disruption, and poor habits. Alcohol and drugs can slow reaction time, impair judgment, increase aggression, worsen memory, and intensify mental health problems.\n\nThe lesson also addresses suicide prevention and crisis response in a responsible, non-stigmatizing way. Students are taught that talking about suicide does not plant the idea, that suicide is preventable, and that access to lethal means increases risk. Warning signs may include talking about wanting to die, guilt, shame, hopelessness, being a burden, emotional pain, mood swings, dangerous behavior, giving away important items, or increased substance use. Intervention basics include asking direct questions, listening, supporting, encouraging professional help, and separating the person from lethal means. If a suicide attempt seems imminent, call 911; for emotional crisis and suicidal distress, the 988 Suicide & Crisis Lifeline provides free, confidential support 24/7. Students also learn that firearm owners should treat crisis planning, secure storage, and temporary separation from lethal means as part of responsible life preservation.",
    "estimatedMinutes": 24,
    "quizQuestionCount": 15,
    "sections": [
      {
        "heading": "Stress and Survival Response",
        "body": [
          "Fight, flight, or freeze responses can affect perception, memory, and motor performance.",
          "Auditory exclusion, tunnel vision, shaky hands, and time distortion can happen under adrenaline.",
          "Drawing a firearm does not remove the need for judgment."
        ]
      },
      {
        "heading": "Trauma and Coping",
        "body": [
          "Normal trauma responses may include shock, hypervigilance, emotional swings, nightmares, intrusive thoughts, sleep disruption, guilt, anger, and physical stress symptoms.",
          "Helpful coping strategies may include support systems, talking, counseling, journaling, prayer, meditation, music, art, exercise, stretching, or yoga.",
          "Students should avoid worsening stress through alcohol, drug misuse, nicotine overuse, stimulant abuse, and wrecking sleep or diet."
        ]
      },
      {
        "heading": "Mental Health and Crisis Response",
        "body": [
          "Talking about suicide does not cause suicide; asking direct questions can be part of intervention.",
          "Warning signs, risk factors, protective factors, and crisis resources matter for responsible firearm ownership.",
          "Use 911 for imminent life-threatening emergencies and 988 for emotional crisis and suicidal distress support."
        ]
      }
    ],
    "scenarios": [
      {
        "label": "Scenario A",
        "prompt": "After a defensive incident, your hands are shaking, sounds seem muffled, and you feel like time is moving strangely. What is the best explanation?",
        "choices": [
          "A normal stress response can affect perception, hearing, and motor control.",
          "You are automatically unfit to remember anything ever again.",
          "Your firearm malfunction caused the symptoms.",
          "Only police officers experience these effects."
        ],
        "answer": 0,
        "explanation": "The lesson teaches that adrenaline and survival stress can change hearing, time perception, and movement."
      },
      {
        "label": "Scenario B",
        "prompt": "A student says, 'If I draw my gun, I have no choice but to shoot.' Which answer best matches the chapter?",
        "choices": [
          "Correct, drawing removes judgment.",
          "Drawing does not erase decision-making; judgment and changing conditions still matter.",
          "Only caliber decides whether shooting is required.",
          "The statement is always legally true."
        ],
        "answer": 1,
        "explanation": "Lesson 5 stresses that stress is real, but judgment still matters."
      },
      {
        "label": "Scenario C",
        "prompt": "A friend who went through a traumatic event is sleeping poorly, isolating, and having intrusive thoughts. What is the best chapter-based response?",
        "choices": [
          "Tell them to get over it immediately.",
          "Recognize these can be normal trauma responses and encourage support, coping strategies, or professional help.",
          "Suggest heavy drinking to relax.",
          "Tell them trauma only affects weak people."
        ],
        "answer": 1,
        "explanation": "The lesson describes trauma responses and appropriate support and coping strategies."
      },
      {
        "label": "Scenario D",
        "prompt": "Why is alcohol use a major concern in defensive decision-making?",
        "choices": [
          "It can slow reaction time, impair judgment, worsen memory, and increase reckless behavior.",
          "It improves threat recognition.",
          "It makes legal outcomes easier.",
          "It reduces aggression in every person."
        ],
        "answer": 0,
        "explanation": "The lesson explicitly teaches the adverse effects of alcohol and drug use on judgment and behavior."
      },
      {
        "label": "Scenario E",
        "prompt": "A person says, 'Everyone would be better off without me,' has been giving away valuables, and has increased alcohol use. What best fits the lesson?",
        "choices": [
          "Those are warning signs that should be taken seriously.",
          "Those signs are unrelated to crisis.",
          "The safest response is to ignore it unless they mention a firearm.",
          "Only professionals are allowed to ask direct questions."
        ],
        "answer": 0,
        "explanation": "The lesson includes warning signs such as burden statements, giving away items, and increased substance use."
      },
      {
        "label": "Scenario F",
        "prompt": "What is the most appropriate distinction between 911 and 988 in the lesson?",
        "choices": [
          "Use 911 for immediate life-threatening emergencies; use 988 for emotional crisis and suicidal distress support.",
          "Use 988 for traffic accidents and 911 for sadness.",
          "Use only 911 for all emotional issues.",
          "Use neither if the person owns guns."
        ],
        "answer": 0,
        "explanation": "The lesson clearly distinguishes imminent emergencies from crisis support."
      },
      {
        "label": "Scenario G",
        "prompt": "A close family member is in severe emotional crisis and has access to firearms. Which action best matches the chapter?",
        "choices": [
          "Do nothing because access to weapons is a private issue.",
          "Take the crisis seriously and work toward separation from lethal means while seeking help.",
          "Argue with them until they calm down.",
          "Assume mentioning suicide will make things worse."
        ],
        "answer": 1,
        "explanation": "The lesson teaches that access to lethal means increases suicide risk and that separation from lethal means is a valid intervention step."
      },
      {
        "label": "Scenario H",
        "prompt": "A student responds to stress after an incident by isolating, drinking heavily, and sleeping very little. Why is that dangerous?",
        "choices": [
          "Those choices can worsen trauma, impair judgment, and deepen mental health problems.",
          "Those are recommended coping tools.",
          "Sleep loss improves resilience.",
          "Alcohol and isolation reduce trauma symptoms for most people."
        ],
        "answer": 0,
        "explanation": "The chapter warns against alcohol/drug misuse and sleep disruption as unhealthy coping methods."
      },
      {
        "label": "Scenario I",
        "prompt": "A shooting witness feels guilt and shame even though they were not physically harmed. Which answer best matches the chapter?",
        "choices": [
          "Trauma responses can affect witnesses too, not just the primary victim.",
          "Only the injured person can have emotional fallout.",
          "Guilt proves they caused the event.",
          "Witnesses should never seek counseling."
        ],
        "answer": 0,
        "explanation": "The supplement and lesson note that trauma responses can affect witnesses and those close to the event."
      },
      {
        "label": "Scenario J",
        "prompt": "You ask a struggling friend directly whether they are thinking about suicide. According to the lesson, what is true?",
        "choices": [
          "Talking about suicide causes suicide.",
          "Asking directly does not create suicidality and can be part of intervention.",
          "Only hospitals may use the word suicide.",
          "Direct questions always make things worse."
        ],
        "answer": 1,
        "explanation": "The lesson specifically teaches that asking about suicide does not put the idea into someone’s head."
      }
    ]
  },
  {
    "lessonNumber": 6,
    "title": "Carry Gear and Defensive Equipment",
    "description": "Holsters, carry methods, flashlights, lasers, belts, clothing, retention, and practical defensive setup choices.",
    "chapterSummary": "Defensive gear should support safety, access, and realistic daily use. Students learn that holsters should cover the trigger guard, secure the firearm, support consistent access, and match the way the gun is actually carried. The lesson reviews carry positions, retention, quality belts, flashlights, lasers, spare magazines, and why equipment must be tested and practiced with. Good gear supports skill; it does not replace judgment, safety, or training.",
    "estimatedMinutes": 18,
    "quizQuestionCount": 15,
    "sections": [
      {
        "heading": "Holsters and Carry",
        "body": [
          "A holster should protect the trigger guard, secure the firearm, and support consistent safe access.",
          "Carry positions involve trade-offs in concealment, comfort, speed, and access.",
          "Retention matters, especially in public and active environments."
        ]
      },
      {
        "heading": "Support Equipment",
        "body": [
          "Belts, lights, spare magazines, and practical clothing can affect access and control.",
          "Flashlights help with identification; lasers may help in some positions but do not replace fundamentals.",
          "Students should train with the gear they actually intend to use."
        ]
      },
      {
        "heading": "Practical Mindset",
        "body": [
          "Choose reliable, practical gear instead of gimmicks.",
          "Test gear before trusting it for carry.",
          "A good setup supports safety and realistic daily function."
        ]
      }
    ],
    "scenarios": [
      {
        "label": "Scenario A",
        "prompt": "A student wants to carry with no holster and place a loaded pistol directly into a bag. What is the best correction?",
        "choices": [
          "That is fine if the bag stays zipped.",
          "A proper holster should cover the trigger guard and secure the firearm.",
          "Only revolvers need holsters.",
          "Trigger coverage matters only at the range."
        ],
        "answer": 1,
        "explanation": "The lesson teaches that a holster must protect the trigger guard and secure the firearm."
      },
      {
        "label": "Scenario B",
        "prompt": "Why is a handheld flashlight useful in defensive carry?",
        "choices": [
          "It helps identify what you are seeing without pointing a firearm at everything.",
          "It replaces sight alignment.",
          "It guarantees legal justification.",
          "It eliminates the need for awareness."
        ],
        "answer": 0,
        "explanation": "Identification is a major reason to carry a light."
      },
      {
        "label": "Scenario C",
        "prompt": "A student buys a new holster and carries with it immediately without any practice. What is the concern?",
        "choices": [
          "Practice is unnecessary if the holster is expensive.",
          "Students should test and practice with actual carry gear before relying on it.",
          "Holster fit does not matter after purchase.",
          "Only law enforcement needs retention practice."
        ],
        "answer": 1,
        "explanation": "Gear should be tested and practiced with before trusting it for daily carry."
      },
      {
        "label": "Scenario D",
        "prompt": "What is the best summary of the lesson’s view of lasers?",
        "choices": [
          "Lasers are useful in some contexts but do not replace fundamentals.",
          "Lasers make sight training obsolete.",
          "Lasers guarantee hits under stress.",
          "Lasers are only decorative."
        ],
        "answer": 0,
        "explanation": "The lesson treats lasers as a support tool, not a substitute for fundamentals."
      },
      {
        "label": "Scenario E",
        "prompt": "Why can a sturdy belt matter to concealed carry?",
        "choices": [
          "It supports the weight and stability of the holster and firearm.",
          "It increases caliber.",
          "It changes the law.",
          "It makes retention unnecessary."
        ],
        "answer": 0,
        "explanation": "Belts affect stability, comfort, and consistency."
      },
      {
        "label": "Scenario F",
        "prompt": "A student chooses gear only because it 'looks tactical' online. Which correction best fits the chapter?",
        "choices": [
          "Appearance is more important than reliability and function.",
          "Practicality, safety, and realistic use matter more than appearance.",
          "Any gear with extra attachments is automatically better.",
          "Training matters less when the setup looks advanced."
        ],
        "answer": 1,
        "explanation": "The lesson emphasizes practical, reliable gear over gimmicks or aesthetics."
      }
    ]
  },
  {
    "lessonNumber": 7,
    "title": "Skill Development and Continuing Training",
    "description": "Dry practice, live fire, safe improvement, defensive drills, continued education, and maintaining proficiency over time.",
    "chapterSummary": "Skill fades without practice. Students learn that safe, consistent dry practice and live-fire work help maintain handling, accuracy, and decision-making. The lesson encourages students to train with a purpose, document weaknesses, and continue learning after the first class. Safe development means working from fundamentals upward, avoiding ego-driven training, and understanding that education is ongoing. Students are reminded that owning gear is not the same as maintaining skill.",
    "estimatedMinutes": 18,
    "quizQuestionCount": 15,
    "sections": [
      {
        "heading": "Practice Fundamentals",
        "body": [
          "Dry practice should be safe, structured, and separated from live ammunition when appropriate.",
          "Live-fire practice should reinforce fundamentals and accountable performance.",
          "Students should work from basics upward rather than trying to look advanced."
        ]
      },
      {
        "heading": "Ongoing Development",
        "body": [
          "Identify weak areas honestly and train them deliberately.",
          "Further classes, coaching, and reputable training opportunities are logical next steps.",
          "Documentation, notes, and measurable goals help maintain progress."
        ]
      },
      {
        "heading": "Mindset and Discipline",
        "body": [
          "Training should be driven by safety and competence, not ego.",
          "A permit or class certificate does not make practice unnecessary.",
          "Responsible owners maintain skill, judgment, and habits over time."
        ]
      }
    ],
    "scenarios": [
      {
        "label": "Scenario A",
        "prompt": "A student says, 'I passed one class, so I don't really need to practice anymore.' What is the best answer?",
        "choices": [
          "Initial training replaces the need for maintenance.",
          "Skills fade without practice; responsible owners continue training.",
          "Practice only matters for competition.",
          "Only marksmanship matters after class."
        ],
        "answer": 1,
        "explanation": "Lesson 7 emphasizes continued skill development after the first class."
      },
      {
        "label": "Scenario B",
        "prompt": "Why should dry practice be structured and safety-focused?",
        "choices": [
          "Because careless repetition can reinforce unsafe habits.",
          "Because dry practice is only for experts.",
          "Because live ammo should always be nearby.",
          "Because speed is the only purpose of dry practice."
        ],
        "answer": 0,
        "explanation": "The lesson stresses safe, deliberate practice and habit formation."
      },
      {
        "label": "Scenario C",
        "prompt": "A student hides weaknesses out of pride instead of training them honestly. Why is that a problem?",
        "choices": [
          "Honest assessment helps guide useful, safe improvement.",
          "Weaknesses disappear if ignored.",
          "Documentation is never useful.",
          "Confidence matters more than competence."
        ],
        "answer": 0,
        "explanation": "The chapter encourages honest evaluation and deliberate work on weak areas."
      },
      {
        "label": "Scenario D",
        "prompt": "Which statement best matches Lesson 7?",
        "choices": [
          "Good training is ongoing, practical, and built on fundamentals.",
          "Advanced drills should always replace fundamentals.",
          "A permit proves skill forever.",
          "Buying more gear is the same as training."
        ],
        "answer": 0,
        "explanation": "The lesson emphasizes progression from fundamentals and ongoing work."
      },
      {
        "label": "Scenario E",
        "prompt": "Why might a student keep notes after training?",
        "choices": [
          "To identify patterns, weaknesses, and goals for future practice.",
          "Because notes replace live practice.",
          "Because memory is always perfect.",
          "To prove they train more than others."
        ],
        "answer": 0,
        "explanation": "Documenting strengths and weaknesses helps guide future practice."
      },
      {
        "label": "Scenario F",
        "prompt": "A student wants to train only the fun parts and skip basic safety checks. Which answer best fits the chapter?",
        "choices": [
          "That is fine if the student has enthusiasm.",
          "Training should remain disciplined and rooted in safe fundamentals.",
          "Safety checks matter only in formal classes.",
          "Basic habits slow improvement."
        ],
        "answer": 1,
        "explanation": "Safe development begins with fundamentals and discipline."
      }
    ]
  },
  {
    "lessonNumber": 8,
    "title": "BSA Final Review, Live-Class Prep, and Final Mental Readiness",
    "description": "Course integration, local prep, live-range expectations, when not to carry, and final mental readiness for responsible completion.",
    "chapterSummary": "The online portal prepares students for the live class; it does not replace instructor observation, safety verification, or range performance. Students should arrive for the live phase with their material reviewed, gear understood, and weak areas honestly identified. The final lesson also reinforces that responsible carry includes knowing when not to carry: when impaired, emotionally unstable, exhausted, reckless, or otherwise unfit to make good decisions. Final mental readiness means humility, safe conduct, lawful thinking, and willingness to slow down and ask for clarification. Certificates come after successful live completion, not from simply clicking through a website.",
    "estimatedMinutes": 16,
    "quizQuestionCount": 15,
    "sections": [
      {
        "heading": "What the Online Portion Does",
        "body": [
          "The portal builds knowledge, vocabulary, and decision-making before the live class.",
          "Online work does not replace safe live handling or instructor evaluation.",
          "Students should arrive ready to review, ask questions, and perform safely."
        ]
      },
      {
        "heading": "Final Readiness",
        "body": [
          "Bring required documents, required safety gear, and the equipment specified by the academy.",
          "Review weak areas honestly before live class instead of hiding uncertainty.",
          "Humility and safe conduct matter more than looking fast or experienced."
        ]
      },
      {
        "heading": "When Not to Carry",
        "body": [
          "Do not carry or handle firearms when impaired by alcohol, drugs, emotional crisis, extreme fatigue, or reckless judgment.",
          "Responsible ownership includes crisis planning, support, and knowing when to pause access.",
          "Completion means safe, lawful, competent performance—not just passing a website."
        ]
      }
    ],
    "scenarios": [
      {
        "label": "Scenario A",
        "prompt": "A student passed the online quizzes but arrives at live class with unsafe gun handling. What best fits the chapter?",
        "choices": [
          "Online scores override live safety problems.",
          "The live phase still requires safe conduct and instructor-verified performance.",
          "Unsafe handling is acceptable if the student studied hard.",
          "Certificates are automatic after online completion."
        ],
        "answer": 1,
        "explanation": "Lesson 8 stresses that online work does not replace live safety evaluation."
      },
      {
        "label": "Scenario B",
        "prompt": "A student had very little sleep, has been drinking heavily, and still wants to carry because they 'know the law.' What is the best answer?",
        "choices": [
          "Legal knowledge cancels impairment.",
          "Responsible carry includes knowing when not to carry because impairment and poor judgment make things more dangerous.",
          "Carrying while exhausted is safer than leaving the gun home.",
          "Only illegal drugs matter, not alcohol or exhaustion."
        ],
        "answer": 1,
        "explanation": "The final chapter reinforces that responsible students know when not to carry."
      },
      {
        "label": "Scenario C",
        "prompt": "A student is nervous about the live range and wants to rush through preparation. What is the best advice?",
        "choices": [
          "Rush so you can get it over with.",
          "Slow down, review weak areas, and arrive teachable and safety-focused.",
          "Pretend to understand everything to avoid embarrassment.",
          "Focus only on equipment and skip mindset."
        ],
        "answer": 1,
        "explanation": "Lesson 8 emphasizes humility, review, and teachability before live class."
      },
      {
        "label": "Scenario D",
        "prompt": "Why does the final chapter revisit mental wellness and crisis planning?",
        "choices": [
          "Because final completion should reinforce responsible judgment, including when not to carry or handle firearms.",
          "Because mental wellness is unrelated to firearms responsibility.",
          "Because only law enforcement needs crisis planning.",
          "Because online students are never affected by stress."
        ],
        "answer": 0,
        "explanation": "The final review ties safety, judgment, and mental readiness together."
      }
    ]
  }
];

export const QUIZ_BANK = {
  "1": [
    {
      "q": "What is the safest mindset for moving through a public place?",
      "choices": [
        "Stay calmly alert and keep track of exits, people, and distance",
        "Act suspicious so others avoid you",
        "Focus only on your phone unless something obvious happens",
        "Assume trouble cannot happen in familiar places"
      ],
      "answer": 0,
      "explanation": "Lesson 1 teaches calm awareness, not distraction or paranoia."
    },
    {
      "q": "True or False: Avoidance can be a successful defensive outcome if it keeps a problem from escalating.",
      "type": "tf",
      "answer": true,
      "explanation": "Avoiding the encounter entirely is often the smartest win."
    },
    {
      "q": "Which route choice best matches the lesson?",
      "choices": [
        "Take the darkest shortcut because it saves time",
        "Choose the path with better lighting, visibility, and people nearby",
        "Walk between parked cars so fewer people notice you",
        "Ignore the route because being armed solves the problem"
      ],
      "answer": 1,
      "explanation": "Lighting, visibility, and witnesses usually improve safety and options."
    },
    {
      "q": "You notice someone changing direction to match your movement in a parking lot. What is your best first action?",
      "choices": [
        "Close distance and demand an explanation",
        "Move toward light, people, or the store while keeping the person in view",
        "Keep walking to your car without changing anything",
        "Turn your back so the person knows you are calm"
      ],
      "answer": 1,
      "explanation": "Lesson 1 favors movement, awareness, and better positioning before escalation."
    },
    {
      "q": "True or False: Looking down at your phone while moving through a garage can reduce your ability to notice danger early.",
      "type": "tf",
      "answer": true,
      "explanation": "Distraction cuts into early recognition and decision time."
    },
    {
      "q": "Why does Lesson 1 emphasize maintaining personal space?",
      "choices": [
        "Distance gives you more time and options to react",
        "Distance always ends the encounter by itself",
        "Distance matters only if you are unarmed",
        "Distance is mainly about being polite"
      ],
      "answer": 0,
      "explanation": "More space can improve reaction time, movement options, and awareness."
    },
    {
      "q": "Which example best reflects condition yellow?",
      "choices": [
        "Calm alertness in public without acting fearful",
        "Constant panic and scanning every second",
        "Relaxing only when carrying a firearm",
        "Ignoring surroundings unless someone speaks to you"
      ],
      "answer": 0,
      "explanation": "Condition yellow is calm, alert awareness."
    },
    {
      "q": "What is one useful purpose of mental rehearsal?",
      "choices": [
        "It replaces all live instruction",
        "It helps you think through choices before stress hits",
        "It guarantees the law will favor you",
        "It removes the need to stay aware in public"
      ],
      "answer": 1,
      "explanation": "Mental rehearsal helps prepare decisions in advance."
    },
    {
      "q": "You are unlocking your apartment door and notice an unknown person trying to slip in behind you. What lesson principle applies most directly?",
      "choices": [
        "Let them in to avoid being rude",
        "Preserve barriers and controlled access",
        "Ignore them because locked doors are only for property",
        "Turn your back and finish texting"
      ],
      "answer": 1,
      "explanation": "Barriers and access control are part of a personal protection plan."
    },
    {
      "q": "True or False: Preparedness and paranoia are the same thing.",
      "type": "tf",
      "answer": false,
      "explanation": "The lesson specifically separates disciplined preparedness from paranoia."
    },
    {
      "q": "Which statement best matches the lesson on parking choices?",
      "choices": [
        "Parking location can create or reduce risk before anything happens",
        "Parking choice matters only after a confrontation begins",
        "Convenience is always the safest option",
        "Where you park does not affect your defensive choices"
      ],
      "answer": 0,
      "explanation": "Route and parking decisions shape your options before trouble starts."
    },
    {
      "q": "If something feels wrong near an exit of a store, what should you generally favor?",
      "choices": [
        "Drifting into a more isolated area to avoid embarrassment",
        "Moving toward better visibility, witnesses, and escape routes",
        "Standing still so you do not look suspicious",
        "Ignoring the feeling unless you see a weapon"
      ],
      "answer": 1,
      "explanation": "Lesson 1 favors better positions, exits, and witnesses."
    },
    {
      "q": "True or False: Home security habits like locking doors and setting alarms are part of a broader personal protection plan.",
      "type": "tf",
      "answer": true,
      "explanation": "The lesson includes daily habits and barriers as part of preparedness."
    },
    {
      "q": "Which person is acting most like condition white?",
      "choices": [
        "A shopper calmly watching entrances while walking to the car",
        "A person texting with earbuds in and no awareness of nearby people",
        "A student who notices lighting and keeps an exit path open",
        "A driver who parks under lights near other occupied vehicles"
      ],
      "answer": 1,
      "explanation": "Condition white is distracted and unaware."
    },
    {
      "q": "What is the core message of Lesson 1?",
      "choices": [
        "Good awareness and positioning create time, options, and safer decisions",
        "Carrying a gun removes most need for planning",
        "The best route is whichever is fastest",
        "If a place feels wrong, stay there so you do not look afraid"
      ],
      "answer": 0,
      "explanation": "The chapter ties awareness, route choice, barriers, and decision-making together."
    }
  ],
  "2": [
    {
      "q": "What is the safest way to treat any firearm you handle?",
      "choices": [
        "As unloaded until someone says otherwise",
        "As loaded until you personally verify its condition",
        "As safe if the magazine is removed",
        "As harmless if the action is open"
      ],
      "answer": 1,
      "explanation": "The first safety rule is to treat every firearm as if it is loaded."
    },
    {
      "q": "True or False: Removing the magazine from a semi-automatic pistol automatically means the chamber is empty.",
      "type": "tf",
      "answer": false,
      "explanation": "A round can still remain in the chamber after the magazine is removed."
    },
    {
      "q": "A friend says, 'It's clear.' What should you do first?",
      "choices": [
        "Accept the statement because it is their firearm",
        "Point it safely and personally verify the chamber and feeding source",
        "Dry fire it to prove it is empty",
        "Put it away until later"
      ],
      "answer": 1,
      "explanation": "Personal verification is required; do not rely on assumptions."
    },
    {
      "q": "Which rule is most directly violated when someone sweeps others with the muzzle?",
      "choices": [
        "Use only factory ammunition",
        "Keep the muzzle pointed in a safe direction",
        "Store firearms unloaded only",
        "Use eye and ear protection"
      ],
      "answer": 1,
      "explanation": "Muzzle discipline is a core safety rule."
    },
    {
      "q": "True or False: Your trigger finger should stay off the trigger until your sights are on target and you have decided to fire.",
      "type": "tf",
      "answer": true,
      "explanation": "Trigger discipline is one of the core safety rules."
    },
    {
      "q": "You find loose cartridges and are not sure whether they match your gun. What is the right move?",
      "choices": [
        "Load one and test it carefully",
        "Use only ammunition you know is correct and undamaged for the firearm",
        "Mix them with other ammo and sort later",
        "Assume any round that looks close will work"
      ],
      "answer": 1,
      "explanation": "Only correct, compatible, undamaged ammunition should be used."
    },
    {
      "q": "Why does Lesson 2 emphasize visual and physical checks?",
      "choices": [
        "Because safeties make checks unnecessary",
        "Because you need to verify both chamber condition and feeding source yourself",
        "Because only beginners need to check guns",
        "Because range officers handle all verification for you"
      ],
      "answer": 1,
      "explanation": "Visual and physical checks reduce dangerous assumptions."
    },
    {
      "q": "Which storage choice best fits responsible ownership?",
      "choices": [
        "Leave the handgun where visitors can reach it if it is unloaded",
        "Use a storage method that limits unauthorized access and fits the home environment",
        "Hide the firearm under a pillow for fast access",
        "Store ammo in the chamber so the gun stays ready"
      ],
      "answer": 1,
      "explanation": "Secure storage must consider unauthorized access, especially by children or prohibited persons."
    },
    {
      "q": "True or False: If you are unsure how a particular firearm operates, slowing down and learning the controls is safer than guessing.",
      "type": "tf",
      "answer": true,
      "explanation": "The lesson stresses slowing down rather than forcing unfamiliar controls."
    },
    {
      "q": "What does being sure of your target include?",
      "choices": [
        "Only knowing what you want to shoot",
        "Knowing the target, the foreground, and the background",
        "Firing quickly before the target moves",
        "Trusting that indoor walls will stop rounds"
      ],
      "answer": 1,
      "explanation": "Safe shooting includes awareness of the target and what is around and beyond it."
    },
    {
      "q": "Which statement about a defensive firearm is most accurate?",
      "choices": [
        "It is a serious responsibility that requires repeatable safety habits",
        "It is safe once the owner gets comfortable handling it",
        "It becomes less dangerous after the first range trip",
        "It is mainly an equipment issue, not a behavior issue"
      ],
      "answer": 0,
      "explanation": "Lesson 2 frames ownership as a continuing responsibility."
    },
    {
      "q": "You unload a semi-automatic pistol. Which sequence is safest in principle?",
      "choices": [
        "Point safely, remove source of ammunition, then verify chamber condition",
        "Pull the trigger first, then check later",
        "Look away from the muzzle while working the slide",
        "Start by putting your finger on the trigger for control"
      ],
      "answer": 0,
      "explanation": "The lesson centers on safe direction, removing the feeding source, and personal verification."
    },
    {
      "q": "True or False: Good safety habits matter even when practicing with an unloaded firearm.",
      "type": "tf",
      "answer": true,
      "explanation": "The rules always apply; unloaded practice is not an excuse for careless handling."
    },
    {
      "q": "Why is platform knowledge important?",
      "choices": [
        "Because revolvers and semi-automatics use the same controls",
        "Because each design has different controls, checks, and handling steps",
        "Because once you know one firearm, you know them all",
        "Because storage rules change but handling rules do not"
      ],
      "answer": 1,
      "explanation": "Different platforms require different operating knowledge."
    },
    {
      "q": "What is the main lesson of Chapter 2?",
      "choices": [
        "Safety is deliberate and repeatable, not casual or assumed",
        "Defensive guns are safe if they stay expensive",
        "Confidence matters more than verification",
        "Most accidents come from bad ammunition only"
      ],
      "answer": 0,
      "explanation": "The chapter focuses on deliberate safety, personal verification, and responsibility."
    }
  ],
  "3": [
    {
      "q": "What should come before trying to shoot faster?",
      "choices": [
        "A stronger flashlight",
        "Repeatable fundamentals like grip, sights, and trigger control",
        "A bigger magazine",
        "More advanced drills on day one"
      ],
      "answer": 1,
      "explanation": "Lesson 3 teaches students to build speed on top of fundamentals."
    },
    {
      "q": "True or False: Defensive shooting means reckless speed as long as shots stay on paper.",
      "type": "tf",
      "answer": false,
      "explanation": "The lesson stresses accountable hits, not reckless speed."
    },
    {
      "q": "Why does a stable stance matter?",
      "choices": [
        "It helps with balance, recoil control, and movement",
        "It makes the gun lighter",
        "It guarantees perfect accuracy",
        "It matters only for competition shooters"
      ],
      "answer": 0,
      "explanation": "A stable stance supports recoil control and practical movement."
    },
    {
      "q": "What is trigger control?",
      "choices": [
        "Pulling the trigger as fast as possible",
        "Pressing the trigger without disturbing the sights",
        "Using two fingers for more strength",
        "Jerking through the break to beat recoil"
      ],
      "answer": 1,
      "explanation": "Good trigger control keeps the sights stable through the shot."
    },
    {
      "q": "True or False: Equipment can replace weak fundamentals if the sights are expensive enough.",
      "type": "tf",
      "answer": false,
      "explanation": "The chapter makes clear that gear does not replace fundamentals."
    },
    {
      "q": "A shooter dips the muzzle low every time the trigger breaks. What concept needs work most directly?",
      "choices": [
        "Trigger control",
        "Holster retention",
        "Caliber selection",
        "Legal articulation"
      ],
      "answer": 0,
      "explanation": "Moving the sights during the trigger press points to a trigger-control problem."
    },
    {
      "q": "What is the value of follow-through after a shot?",
      "choices": [
        "It supports recoil management and faster accountable follow-up shots",
        "It lets you relax your grip immediately",
        "It is mainly for style points on the range",
        "It matters only when shooting one-handed"
      ],
      "answer": 0,
      "explanation": "Follow-through helps maintain control and readiness for additional accurate shots."
    },
    {
      "q": "Which statement best reflects the lesson on sights?",
      "choices": [
        "Sight picture and alignment matter because the gun must be pointed where the shot should go",
        "Looking over the top of the gun is usually enough at any distance",
        "Only trigger speed matters once the gun is drawn",
        "The rear sight matters, but the front sight does not"
      ],
      "answer": 0,
      "explanation": "The chapter ties sighting and trigger control to accountable hits."
    },
    {
      "q": "True or False: Dry practice can help improve consistency when it is done safely and deliberately.",
      "type": "tf",
      "answer": true,
      "explanation": "The lesson encourages disciplined dry practice to reinforce fundamentals."
    },
    {
      "q": "A student wants to skip fundamentals because they want 'realistic' speed. What should the instructor say?",
      "choices": [
        "Start with controlled basics, then build toward realistic speed",
        "Speed will automatically fix poor trigger control",
        "Grip and stance do not matter under stress",
        "Only moving drills matter for self-defense"
      ],
      "answer": 0,
      "explanation": "The chapter teaches that advanced performance grows from solid basics."
    },
    {
      "q": "What does accountable shooting mean?",
      "choices": [
        "Every shot should be deliberate and justified, not just fast",
        "Any hit on the berm counts as success",
        "Shots only matter if they impress others",
        "A fast miss is better than a careful hit"
      ],
      "answer": 0,
      "explanation": "Accountable hits are central to defensive shooting."
    },
    {
      "q": "Which habit supports better recoil management?",
      "choices": [
        "A consistent grip and body position",
        "Closing your eyes before the shot",
        "Relaxing your hands after each trigger press",
        "Leaning backward to resist recoil"
      ],
      "answer": 0,
      "explanation": "Consistent grip and stance help control the gun during recoil."
    },
    {
      "q": "True or False: Defensive shooting still requires accuracy and responsibility, even under time pressure.",
      "type": "tf",
      "answer": true,
      "explanation": "The lesson balances timeliness with safety and accuracy."
    },
    {
      "q": "Why is consistency more valuable than showing off?",
      "choices": [
        "Because repeatable mechanics hold up better under pressure",
        "Because style is more important than safety",
        "Because defensive shooters never need follow-up shots",
        "Because one lucky drill proves long-term skill"
      ],
      "answer": 0,
      "explanation": "Repeatable fundamentals are more reliable under realistic stress."
    },
    {
      "q": "What is the main takeaway from Lesson 3?",
      "choices": [
        "Build safe, accurate, repeatable shooting before chasing complexity",
        "Buy upgrades before fixing technique",
        "Fastest always means best",
        "Only live fire matters; dry work is useless"
      ],
      "answer": 0,
      "explanation": "The chapter focuses on safe, repeatable fundamentals leading to accountable performance."
    }
  ],
  "4": [
    {
      "q": "What does 'reasonableness' generally ask in a use-of-force analysis?",
      "choices": [
        "What a reasonable person would have believed under those circumstances",
        "Whether the person owned a permit",
        "Whether the firearm was expensive",
        "Whether the event happened in public"
      ],
      "answer": 0,
      "explanation": "Lesson 4 presents reasonableness as a fact-based standard."
    },
    {
      "q": "True or False: Imminence focuses on whether the threat is immediate rather than speculative or already over.",
      "type": "tf",
      "answer": true,
      "explanation": "Imminence asks whether the threat is happening now, not someday or after the fact."
    },
    {
      "q": "What does proportionality deal with?",
      "choices": [
        "Whether the response matched the seriousness of the threat",
        "Whether the defender had enough training hours",
        "Whether the person called 911 first",
        "Whether the encounter happened indoors"
      ],
      "answer": 0,
      "explanation": "Proportionality compares the force used to the threat presented."
    },
    {
      "q": "Which action most clearly harms an innocence claim?",
      "choices": [
        "Trying to disengage from an argument",
        "Unlawfully starting or escalating the confrontation",
        "Calling 911 after the event",
        "Moving to cover while avoiding bystanders"
      ],
      "answer": 1,
      "explanation": "The lesson warns students not to unlawfully start or escalate conflict."
    },
    {
      "q": "True or False: The chapter teaches legal advice tailored to every student's exact facts.",
      "type": "tf",
      "answer": false,
      "explanation": "The lesson specifically says BSA is not a law firm and the material is educational only."
    },
    {
      "q": "Why does articulation matter after a defensive incident?",
      "choices": [
        "You may need to explain what you saw, what the threat did, and why you believed serious harm was immediate",
        "It matters only if no cameras were nearby",
        "It replaces evidence and witness statements",
        "It guarantees no charges will follow"
      ],
      "answer": 0,
      "explanation": "Students are taught to think in terms of clear, factual articulation."
    },
    {
      "q": "Which statement best fits the chapter on property disputes?",
      "choices": [
        "Deadly force questions are different when the issue is property alone and no immediate deadly threat exists",
        "Property arguments always justify drawing a gun",
        "Cameras eliminate legal uncertainty",
        "Road-rage disputes are safer if you win the argument"
      ],
      "answer": 0,
      "explanation": "The chapter cautions students about myths involving property disputes and escalation."
    },
    {
      "q": "In a crowded New Orleans festival area, what lesson-based concern should be especially on your mind?",
      "choices": [
        "Crowds, cameras, bystanders, and witness issues complicate everything",
        "The law stops applying in crowded places",
        "Only traffic matters in the city",
        "Your permit lets you ignore bystanders"
      ],
      "answer": 0,
      "explanation": "Local realities include crowds, traffic, cameras, witnesses, and chaotic scenes."
    },
    {
      "q": "True or False: Calling 911, preserving the scene, and avoiding careless statements are practical post-incident steps discussed in the lesson.",
      "type": "tf",
      "answer": true,
      "explanation": "These are part of the practical local guidance in Lesson 4."
    },
    {
      "q": "What does necessity generally ask?",
      "choices": [
        "Whether force was needed under the circumstances rather than avoidable",
        "Whether the firearm had a mounted light",
        "Whether the defender had prior military training",
        "Whether the bystanders agreed with the defender"
      ],
      "answer": 0,
      "explanation": "Necessity deals with whether force was actually needed under the circumstances."
    },
    {
      "q": "Which response best fits a heated road-rage exchange when no immediate deadly threat exists?",
      "choices": [
        "Disengage and avoid escalating the dispute",
        "Win the argument before leaving",
        "Follow the other driver to get answers",
        "Display the firearm to control the conversation"
      ],
      "answer": 0,
      "explanation": "The chapter repeatedly warns against escalating road-rage incidents."
    },
    {
      "q": "Why does the lesson repeatedly say outcomes depend on specific facts?",
      "choices": [
        "Because use-of-force cases turn on details, evidence, witnesses, and changing law",
        "Because all self-defense cases come out the same",
        "Because the city where it happens never matters",
        "Because internet comments are enough to know the law"
      ],
      "answer": 0,
      "explanation": "Lesson 4 emphasizes fact-specific legal outcomes."
    },
    {
      "q": "True or False: A justified use-of-force claim is strengthened by careful avoidance of unnecessary escalation before the event.",
      "type": "tf",
      "answer": true,
      "explanation": "Innocence, necessity, and reasonableness are helped when the defender did not escalate the conflict."
    },
    {
      "q": "Which statement best captures the goal of Lesson 4?",
      "choices": [
        "Use a practical framework to think about force carefully, lawfully, and factually",
        "Memorize one-line internet slogans and rely on them later",
        "Assume every threatening word automatically justifies deadly force",
        "Treat carrying as a shield against legal scrutiny"
      ],
      "answer": 0,
      "explanation": "The chapter offers a practical educational framework, not myths or slogans."
    },
    {
      "q": "After a defensive incident, which attitude best fits the lesson?",
      "choices": [
        "Be factual, preserve evidence, and avoid reckless statements",
        "Tell everyone your full story immediately on social media",
        "Argue with witnesses before police arrive",
        "Assume the cameras prove everything without context"
      ],
      "answer": 0,
      "explanation": "The lesson teaches care, factual articulation, and scene preservation."
    }
  ],
  "5": [
    {
      "q": "What body system is most associated with the fight, flight, or freeze response?",
      "choices": [
        "The sympathetic nervous system",
        "The digestive system",
        "The skeletal system",
        "The endocrine system only"
      ],
      "answer": 0,
      "explanation": "Lesson 5 explains how survival stress affects body and mind."
    },
    {
      "q": "True or False: Under sudden threat, ordinary people may experience tunnel vision, auditory exclusion, or shaky hands.",
      "type": "tf",
      "answer": true,
      "explanation": "These are common examples of stress effects discussed in the chapter."
    },
    {
      "q": "What is one reason stress matters in a violent encounter?",
      "choices": [
        "It can affect perception, memory, movement, and decision-making",
        "It makes every decision legally justified",
        "It removes the need for training",
        "It only affects people with no experience"
      ],
      "answer": 0,
      "explanation": "The lesson explains that stress can alter how people perceive and act."
    },
    {
      "q": "Which reaction after a traumatic event can still be normal?",
      "choices": [
        "Nightmares, intrusive thoughts, or emotional swings",
        "Instant perfect memory of every detail",
        "No physical stress response at all",
        "Total immunity to anxiety"
      ],
      "answer": 0,
      "explanation": "The chapter lists many normal post-event stress responses."
    },
    {
      "q": "True or False: Drawing a firearm eliminates the effects of adrenaline and stress.",
      "type": "tf",
      "answer": false,
      "explanation": "Having a gun does not cancel physiological stress effects."
    },
    {
      "q": "Which coping choice best fits the chapter?",
      "choices": [
        "Use support systems, counseling, journaling, exercise, or prayer as helpful outlets",
        "Rely on alcohol to calm down after a crisis",
        "Hide symptoms and isolate from everyone",
        "Increase stimulant use and stop sleeping"
      ],
      "answer": 0,
      "explanation": "The lesson recommends healthy support and coping tools, not harmful ones."
    },
    {
      "q": "What does the lesson teach about asking someone directly about suicide?",
      "choices": [
        "It can be part of responsible intervention and does not cause suicide",
        "It should never be done under any circumstance",
        "It only matters for law enforcement officers",
        "It always makes the situation worse"
      ],
      "answer": 0,
      "explanation": "The chapter states that asking direct questions can be part of intervention."
    },
    {
      "q": "When should 988 be considered according to the lesson?",
      "choices": [
        "For emotional crisis or suicidal distress support",
        "For ordering replacement gear",
        "For reporting a stolen vehicle only",
        "Only after a criminal case is closed"
      ],
      "answer": 0,
      "explanation": "Lesson 5 distinguishes 988 crisis support from 911 life-threatening emergencies."
    },
    {
      "q": "True or False: Responsible firearm ownership includes taking warning signs, risk factors, and crisis resources seriously.",
      "type": "tf",
      "answer": true,
      "explanation": "Mental wellness and crisis planning are presented as part of responsible ownership."
    },
    {
      "q": "Which behavior may worsen recovery after a violent event?",
      "choices": [
        "Heavy alcohol or drug misuse",
        "Talking with a trusted support person",
        "Getting rest and exercise",
        "Seeking counseling when needed"
      ],
      "answer": 0,
      "explanation": "The chapter warns against harmful coping through substance misuse and poor self-care."
    },
    {
      "q": "What is auditory exclusion?",
      "choices": [
        "A stress effect where sound may seem muted or altered during a crisis",
        "A hearing condition caused by range noise only",
        "A deliberate choice to ignore instructions",
        "A legal term for witness confusion"
      ],
      "answer": 0,
      "explanation": "Auditory exclusion is one example of stress distortion under threat."
    },
    {
      "q": "Which statement best fits the lesson's mental-health approach?",
      "choices": [
        "Mental wellness is part of safe, responsible carry and storage decisions",
        "Mental health issues matter only to professionals, not students",
        "Talking about stress shows weakness",
        "Ownership has nothing to do with crisis planning"
      ],
      "answer": 0,
      "explanation": "The chapter treats mental wellness as part of responsible judgment."
    },
    {
      "q": "True or False: A person may remember events imperfectly after severe stress without necessarily lying.",
      "type": "tf",
      "answer": true,
      "explanation": "Stress can affect memory and perception, which the chapter explains directly."
    },
    {
      "q": "Which emergency number is for immediate life-threatening danger?",
      "choices": [
        "911",
        "988",
        "411",
        "311"
      ],
      "answer": 0,
      "explanation": "Lesson 5 says 911 is for imminent life-threatening emergencies; 988 is for crisis support."
    },
    {
      "q": "What is the main lesson of Chapter 5?",
      "choices": [
        "Stress, trauma, and mental wellness all affect responsible defensive behavior before and after an event",
        "Stress disappears with enough confidence",
        "Only the law matters after a violent encounter",
        "Post-event symptoms prove someone was unfit beforehand"
      ],
      "answer": 0,
      "explanation": "The chapter combines stress response, trauma awareness, and crisis responsibility."
    }
  ],
  "6": [
    {
      "q": "What should a quality holster do first and foremost?",
      "choices": [
        "Protect the trigger guard and secure the firearm",
        "Make the gun look larger",
        "Allow the trigger to stay exposed for speed",
        "Replace the need for safe handling"
      ],
      "answer": 0,
      "explanation": "Lesson 6 emphasizes trigger coverage and secure retention."
    },
    {
      "q": "True or False: Carry position always involves trade-offs among concealment, comfort, speed, and access.",
      "type": "tf",
      "answer": true,
      "explanation": "The lesson teaches there is no perfect carry position for every person and context."
    },
    {
      "q": "Why does retention matter for carry gear?",
      "choices": [
        "It helps keep the firearm secure during normal movement and public activity",
        "It makes the gun easier for strangers to grab",
        "It is only for uniformed duty carry, never concealed carry",
        "It replaces the need for a good belt"
      ],
      "answer": 0,
      "explanation": "Retention supports security and control, especially in active environments."
    },
    {
      "q": "Which support item most directly helps with identifying what you are looking at in poor light?",
      "choices": [
        "A flashlight",
        "A spare magazine",
        "A sticker on the holster",
        "An optic cover"
      ],
      "answer": 0,
      "explanation": "Flashlights aid identification; they do not replace judgment."
    },
    {
      "q": "True or False: Lasers may help in some positions, but they do not replace fundamentals.",
      "type": "tf",
      "answer": true,
      "explanation": "The chapter treats lasers as a supplement, not a substitute for skill."
    },
    {
      "q": "What is the best reason to train with the gear you actually intend to carry?",
      "choices": [
        "Because access, concealment, and handling change with real equipment",
        "Because range gear and carry gear always feel the same",
        "Because gear practice only matters for police",
        "Because any holster works the same once broken in"
      ],
      "answer": 0,
      "explanation": "Realistic practice matters because equipment affects access and control."
    },
    {
      "q": "Which setup best fits Lesson 6?",
      "choices": [
        "Reliable practical gear that has been tested before being trusted",
        "Whatever looks most tactical online",
        "A bargain holster that leaves the trigger exposed",
        "Gear chosen mainly to impress others"
      ],
      "answer": 0,
      "explanation": "The chapter favors practical, tested equipment over gimmicks."
    },
    {
      "q": "What role can a sturdy belt play?",
      "choices": [
        "It can support access, stability, and consistent carry position",
        "It makes any bad holster safe",
        "It replaces the need for retention",
        "It matters only for open carry"
      ],
      "answer": 0,
      "explanation": "Belts affect control and consistency of the carried firearm."
    },
    {
      "q": "True or False: Good gear can support skill, but it cannot replace judgment or training.",
      "type": "tf",
      "answer": true,
      "explanation": "Lesson 6 repeatedly makes this point."
    },
    {
      "q": "Which statement about gimmicks best matches the chapter?",
      "choices": [
        "Practical reliability matters more than novelty",
        "More accessories always equal more safety",
        "Unproven gear is fine if marketed well",
        "Testing gear is unnecessary if reviews are positive"
      ],
      "answer": 0,
      "explanation": "The lesson tells students to choose reliable, practical gear instead of gimmicks."
    },
    {
      "q": "Why should a student test gear before carrying it daily?",
      "choices": [
        "To see whether it actually works safely and consistently for their body and routine",
        "Because the law requires weekly equipment inspections",
        "Because all new holsters fail eventually",
        "Because only expensive brands need testing"
      ],
      "answer": 0,
      "explanation": "Trust should be earned through realistic testing, not assumed."
    },
    {
      "q": "What is one limitation of lasers that students should remember?",
      "choices": [
        "They can supplement aiming in some cases but do not replace safe fundamentals or identification",
        "They eliminate the need for practice",
        "They make flashlights unnecessary",
        "They guarantee accurate hits from any position"
      ],
      "answer": 0,
      "explanation": "The lesson presents lasers as optional aids with limits."
    },
    {
      "q": "True or False: Clothing choice can affect concealment and access to your defensive gear.",
      "type": "tf",
      "answer": true,
      "explanation": "Practical clothing is part of making daily carry work realistically."
    },
    {
      "q": "Which holster feature is unacceptable for safe carry?",
      "choices": [
        "An exposed trigger area",
        "Secure retention",
        "Consistent access",
        "A design matched to the firearm"
      ],
      "answer": 0,
      "explanation": "A holster should cover the trigger guard; exposed triggers are unsafe."
    },
    {
      "q": "What is the main lesson of Chapter 6?",
      "choices": [
        "Choose practical, safe, tested gear that supports realistic daily use",
        "Use the most accessories possible",
        "Gear matters more than training",
        "Comfort is the only factor in daily carry"
      ],
      "answer": 0,
      "explanation": "The chapter centers on gear that supports safety, access, and realistic use."
    }
  ],
  "7": [
    {
      "q": "Why does Lesson 7 emphasize ongoing practice?",
      "choices": [
        "Because skill fades without maintenance",
        "Because a permit replaces skill development",
        "Because only beginners need refreshers",
        "Because gear improves automatically over time"
      ],
      "answer": 0,
      "explanation": "The chapter states that skill fades without practice."
    },
    {
      "q": "True or False: Dry practice should be structured and separated from live ammunition when appropriate.",
      "type": "tf",
      "answer": true,
      "explanation": "Safety and structure are core dry-practice principles in Lesson 7."
    },
    {
      "q": "What should live-fire practice reinforce?",
      "choices": [
        "Fundamentals and accountable performance",
        "Only speed and entertainment",
        "Mostly gear testing with no scoring",
        "Random drills without goals"
      ],
      "answer": 0,
      "explanation": "The lesson ties live fire back to basics and accountability."
    },
    {
      "q": "Which training attitude best fits the chapter?",
      "choices": [
        "Work from basics upward instead of trying to look advanced",
        "Skip fundamentals once you pass a class",
        "Train mainly for ego and social-media clips",
        "Measure success by how complicated the drill looks"
      ],
      "answer": 0,
      "explanation": "Lesson 7 pushes purposeful development, not ego."
    },
    {
      "q": "True or False: Owning quality gear is the same thing as maintaining skill.",
      "type": "tf",
      "answer": false,
      "explanation": "The chapter says equipment ownership does not replace practice."
    },
    {
      "q": "What is the value of identifying weak areas honestly?",
      "choices": [
        "It lets you train those weaknesses deliberately",
        "It proves you should stop practicing",
        "It matters only for competitive shooters",
        "It removes the need for coaching"
      ],
      "answer": 0,
      "explanation": "Students are encouraged to document and address weak points honestly."
    },
    {
      "q": "Which is a logical next step after a first class?",
      "choices": [
        "Further classes, coaching, and reputable training opportunities",
        "Assuming no further learning is needed",
        "Avoiding all feedback from instructors",
        "Training only with internet videos and no live oversight"
      ],
      "answer": 0,
      "explanation": "The lesson encourages continued education through reputable sources."
    },
    {
      "q": "Why keep notes or measurable goals in training?",
      "choices": [
        "They help track progress and maintain focus",
        "They impress people at the range",
        "They replace live-fire practice",
        "They are only useful for law enforcement"
      ],
      "answer": 0,
      "explanation": "Documentation and goals support consistent improvement."
    },
    {
      "q": "True or False: Safe development means fundamentals first, then more complexity over time.",
      "type": "tf",
      "answer": true,
      "explanation": "The chapter repeatedly returns to this progression."
    },
    {
      "q": "A student says, 'I passed the portal, so I do not need more practice.' What is the best response?",
      "choices": [
        "Practice and development should continue after the first class",
        "The portal permanently locks in skill",
        "Only legal study matters after class",
        "Dry practice becomes unsafe after certification"
      ],
      "answer": 0,
      "explanation": "Lesson 7 frames learning as ongoing, not finished."
    },
    {
      "q": "Which statement best reflects disciplined training?",
      "choices": [
        "Train with purpose, safety, and competence rather than ego",
        "Try to impress everyone with the hardest drills first",
        "Ignore weak points so confidence stays high",
        "Treat every range visit as unstructured entertainment"
      ],
      "answer": 0,
      "explanation": "The chapter prioritizes purpose and humility over ego-driven training."
    },
    {
      "q": "What is one benefit of coaching or reputable instruction?",
      "choices": [
        "It can help identify mistakes and build better habits",
        "It makes personal practice unnecessary",
        "It guarantees perfect performance under stress",
        "It matters only for experts"
      ],
      "answer": 0,
      "explanation": "Good instruction can improve skill by correcting weak habits."
    },
    {
      "q": "True or False: Responsible owners maintain not only technical skill, but also judgment and safety habits over time.",
      "type": "tf",
      "answer": true,
      "explanation": "Lesson 7 treats competence as a combination of skill, judgment, and habits."
    },
    {
      "q": "Which dry-practice behavior would violate the lesson?",
      "choices": [
        "Handling the firearm around live ammunition carelessly",
        "Using a safe routine in a controlled area",
        "Focusing on one skill at a time",
        "Stopping when attention drops"
      ],
      "answer": 0,
      "explanation": "Dry practice must stay structured and separate from live ammo when appropriate."
    },
    {
      "q": "What is the main point of Lesson 7?",
      "choices": [
        "Real skill requires safe, honest, ongoing training after the first class",
        "Buying new gear is enough to stay sharp",
        "Certificates end the need for fundamentals",
        "Advanced drills matter more than consistency"
      ],
      "answer": 0,
      "explanation": "The chapter is about continued, disciplined skill development."
    }
  ],
  "8": [
    {
      "q": "What is the main purpose of the online portal according to the final lesson?",
      "choices": [
        "To prepare students for the live class, not replace it",
        "To replace all instructor observation",
        "To issue automatic certificates",
        "To remove the need for safe gun handling in person"
      ],
      "answer": 0,
      "explanation": "Lesson 8 says the portal prepares students but does not replace live evaluation."
    },
    {
      "q": "True or False: Passing online quizzes alone is enough to prove safe live-class gun handling.",
      "type": "tf",
      "answer": false,
      "explanation": "The final lesson says live safety and performance still matter."
    },
    {
      "q": "Which student attitude best fits final readiness?",
      "choices": [
        "Arrive teachable, reviewed, and honest about weak areas",
        "Hide confusion so you look experienced",
        "Rush through prep because the online part is done",
        "Focus only on gear and ignore mindset"
      ],
      "answer": 0,
      "explanation": "Humility and honest preparation are central themes of Lesson 8."
    },
    {
      "q": "What should a student bring to live class?",
      "choices": [
        "Required documents, required safety gear, and reviewed course material",
        "Only confidence and a firearm",
        "Nothing except the access code",
        "Whatever gear seems interesting that morning"
      ],
      "answer": 0,
      "explanation": "The lesson stresses showing up prepared with the required items."
    },
    {
      "q": "True or False: Responsible carry includes recognizing times when you should not carry or handle firearms.",
      "type": "tf",
      "answer": true,
      "explanation": "The final lesson revisits judgment, impairment, and readiness."
    },
    {
      "q": "Which condition is specifically given as a reason not to carry?",
      "choices": [
        "Impairment, emotional crisis, or extreme fatigue",
        "Owning only one holster",
        "Being new to the city",
        "Wanting a smaller flashlight"
      ],
      "answer": 0,
      "explanation": "The chapter says not to carry when judgment is impaired."
    },
    {
      "q": "Why does the course revisit humility at the end?",
      "choices": [
        "Because safe conduct matters more than looking fast or experienced",
        "Because humility is legally required for a permit",
        "Because confidence automatically creates skill",
        "Because final review is only about appearance"
      ],
      "answer": 0,
      "explanation": "The final lesson values safe conduct and teachability over ego."
    },
    {
      "q": "What should a student do with weak areas before live class?",
      "choices": [
        "Review them honestly and ask questions",
        "Ignore them so confidence stays up",
        "Hide them from the instructor",
        "Assume the range will fix them automatically"
      ],
      "answer": 0,
      "explanation": "Students are told to review weak areas instead of pretending they do not exist."
    },
    {
      "q": "True or False: Completion means safe, lawful, competent performance, not just clicking through the website.",
      "type": "tf",
      "answer": true,
      "explanation": "The final chapter makes this point directly."
    },
    {
      "q": "A student arrives exhausted and emotionally unstable but insists on carrying because they already know the rules. What is the best answer?",
      "choices": [
        "Responsible judgment means knowing when not to carry",
        "Rules matter more than condition",
        "Exhaustion affects speed but not judgment",
        "Only alcohol counts as impairment"
      ],
      "answer": 0,
      "explanation": "Lesson 8 links readiness to judgment, impairment, and mental condition."
    },
    {
      "q": "What does final mental readiness include?",
      "choices": [
        "Safe conduct, lawful thinking, humility, and willingness to slow down",
        "Acting confident even when confused",
        "Finishing the portal with no further reflection",
        "Owning enough accessories"
      ],
      "answer": 0,
      "explanation": "The chapter defines mental readiness broadly, not as confidence alone."
    },
    {
      "q": "Why is instructor verification still necessary after online training?",
      "choices": [
        "Because safe handling and live performance must still be observed in person",
        "Because online lessons have no value",
        "Because students cannot learn anything online",
        "Because range work is optional"
      ],
      "answer": 0,
      "explanation": "Online preparation supports but does not replace live observation."
    },
    {
      "q": "True or False: Certificates come after successful live completion, not simply after online access.",
      "type": "tf",
      "answer": true,
      "explanation": "The lesson states certificates follow successful live completion."
    },
    {
      "q": "Which statement best matches the final lesson?",
      "choices": [
        "The course ends by tying together safety, law, readiness, and honest preparation",
        "The portal is the whole class and the live part is a formality",
        "Students should avoid asking questions at the live phase",
        "Final review is mainly about speed on the draw"
      ],
      "answer": 0,
      "explanation": "Lesson 8 integrates the full course into responsible live-class readiness."
    },
    {
      "q": "What is the main goal of the final chapter?",
      "choices": [
        "Send students into live class prepared, teachable, and safety-focused",
        "Replace all future training with one final checklist",
        "Make every student feel like an expert before class",
        "Turn online scores into automatic permits"
      ],
      "answer": 0,
      "explanation": "The chapter prepares students for safe and honest live completion."
    }
  ]
};


export function shuffleArray(input) {
  const array = Array.isArray(input) ? [...input] : [];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function randomizeQuestion(question) {
  if (!question || question.type === 'tf' || !Array.isArray(question.choices)) {
    return { ...question };
  }

  const indexedChoices = question.choices.map((choice, index) => ({
    choice,
    isCorrect: index === question.answer
  }));

  const shuffled = shuffleArray(indexedChoices);

  return {
    ...question,
    choices: shuffled.map((entry) => entry.choice),
    answer: shuffled.findIndex((entry) => entry.isCorrect)
  };
}

export function getQuizForLesson(lessonNumber, count = null) {
  const key = String(lessonNumber);
  const source = Array.isArray(QUIZ_BANK[key]) ? QUIZ_BANK[key] : [];
  const randomized = shuffleArray(source).map((question) => randomizeQuestion(question));
  const lesson = LESSONS.find((entry) => Number(entry.lessonNumber) === Number(lessonNumber));
  const desiredCount = Number.isInteger(count) && count > 0
    ? count
    : (lesson?.quizQuestionCount || randomized.length);

  return randomized.slice(0, Math.min(desiredCount, randomized.length));
}

export function isLessonComplete(progress = {}, lessonNumber) {
  const key = String(lessonNumber);
  return Boolean(
    progress[`lesson${lessonNumber}`] ??
    progress[key] ??
    progress?.lessons?.[key]?.completed ??
    progress?.lessons?.[key]?.passed ??
    progress?.completedLessons?.includes?.(Number(lessonNumber)) ??
    progress?.completedLessons?.includes?.(key)
  );
}

export function isLessonUnlocked(progress = {}, lessonNumber) {
  if (Number(lessonNumber) <= 1) return true;
  return isLessonComplete(progress, Number(lessonNumber) - 1);
}

export function getOverallProgress(progress = {}, totalLessons = LESSONS.length) {
  const completed = LESSONS.filter((lesson) => isLessonComplete(progress, lesson.lessonNumber)).length;
  return {
    completed,
    total: totalLessons,
    ratioText: `${completed}/${totalLessons}`,
    percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0
  };
}

if (typeof window !== 'undefined') {
  window.LESSONS = LESSONS;
  window.QUIZ_BANK = QUIZ_BANK;
  window.shuffleArray = shuffleArray;
  window.randomizeQuestion = randomizeQuestion;
  window.getQuizForLesson = getQuizForLesson;
  window.isLessonComplete = isLessonComplete;
  window.isLessonUnlocked = isLessonUnlocked;
  window.getOverallProgress = getOverallProgress;
}
