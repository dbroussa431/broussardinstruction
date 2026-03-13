const LESSONS = [
  {
    id: 1,
    slug: 'safety-basics',
    title: 'Firearm Safety Basics',
    estTime: '18 min',
    summary: 'Universal safety rules, muzzle direction, clearance checks, and safe handling principles.',
    sections: [
      {
        heading: 'Lesson Gist',
        body: [
          'Treat every firearm as if it is loaded until you personally verify otherwise.',
          'Never point the muzzle at anything you are not willing to destroy.',
          'Keep your finger off the trigger and outside the trigger guard until you are on target and have made the decision to shoot.',
          'Be sure of your target and what is beyond it.'
        ]
      },
      {
        heading: 'Safe Handling',
        body: [
          'Perform a clearance check every time you pick up a firearm.',
          'Use a safe direction at all times during handling, transport, and storage.',
          'If you do not know the condition of the firearm, pause and verify before doing anything else.'
        ]
      },
      {
        heading: 'Storage Mindset',
        body: [
          'Students should build habits that prevent negligent handling around loved ones and visitors.',
          'Safe handling starts before the firearm is ever fired; it begins when you first touch it.'
        ]
      }
    ],
    scenarios: [
      {
        prompt: 'You pick up a handgun that a friend says is unloaded. What should you do first?',
        choices: [
          'Accept their word and handle it normally',
          'Point it in a safe direction and perform a clearance check',
          'Dry fire it to test whether it is empty',
          'Hand it to someone else to inspect'
        ],
        answer: 1,
        explanation: 'You personally verify the condition of the firearm before doing anything else.'
      },
      {
        prompt: 'At the range, your support-hand thumb starts drifting near the muzzle line during setup. What is the safest response?',
        choices: [
          'Ignore it if the firearm is pointed downrange',
          'Adjust your grip immediately before continuing',
          'Wait until after the string of fire',
          'Move your trigger finger inside the guard to stabilize the gun'
        ],
        answer: 1,
        explanation: 'Grip and hand placement must be corrected before continuing, even on the range.'
      }
    ]
  },
  {
    id: 2,
    slug: 'awareness',
    title: 'Defensive Mindset & Awareness',
    estTime: '20 min',
    summary: 'Color codes of awareness, avoidance, movement, barriers, and recognizing possible threats.',
    sections: [
      { heading: 'Lesson Gist', body: [
        'Stay aware of your surroundings instead of drifting into distraction.',
        'Avoid places, shortcuts, and routines that make you an easier target.',
        'Use movement, distance, barriers, and verbal commands before a situation becomes worse.'
      ]},
      { heading: 'Practical Awareness', body: [
        'Condition White is unaware; Condition Yellow is aware and alert; Condition Orange is focused on a possible threat; Condition Red is action based on a clear trigger.',
        'Your goal is early recognition so you can move, issue commands, and create options.'
      ]}
    ],
    scenarios: [
      { prompt:'You notice someone changing direction to follow you in a parking lot. What is your best first response?', choices:['Ignore it and keep your same pace','Move toward light, people, or a safer route while staying alert','Walk into a darker shortcut to test them','Stop and challenge them immediately'], answer:1, explanation:'Awareness should create safer options, distance, and witnesses.'},
      { prompt:'You see a possible threat near your path home. What mindset best fits Condition Orange?', choices:['Pretend nothing is wrong','Identify a possible threat and make a plan','Take action without thinking','Become distracted by your phone'], answer:1, explanation:'Condition Orange means you have identified a possible threat and are mentally preparing options.'}
    ]
  },
  { id: 3, slug:'operation', title:'Gun Operation & Ammunition', estTime:'22 min', summary:'Actions, magazines, ammunition basics, and common platform understanding.', sections:[{heading:'Lesson Gist', body:['Understand the difference between revolvers, semi-automatics, and common magazine types.', 'Know how ammunition components work together and why handling knowledge matters for safety.']}], scenarios:[{prompt:'A student confuses caliber with the entire cartridge. What is the safer teaching point?', choices:['Caliber only describes the box label','Caliber refers to bullet diameter, not every aspect of the cartridge','Caliber and magazine size mean the same thing','Caliber determines whether a gun is loaded'], answer:1, explanation:'Caliber refers to bullet diameter and helps students use accurate language.'},{prompt:'You find two magazines on a bench and are unsure whether they fit your firearm. What should you do?', choices:['Force one into the gun to test it','Verify fit and type before use','Load both and compare weight','Assume all magazines of similar size work'], answer:1, explanation:'Verify compatibility before use.'}] },
  { id: 4, slug:'shooting-fundamentals', title:'Shooting Fundamentals', estTime:'20 min', summary:'Grip, sight alignment, target focus, and defensive accuracy concepts.', sections:[{heading:'Lesson Gist', body:['A stable grip, proper trigger discipline, and clean sight picture improve safe, consistent shooting.', 'Defensive accuracy means making accountable hits while maintaining control.']}], scenarios:[{prompt:'Your sights are misaligned left and right. What likely happens?', choices:['The bullet still goes exactly where intended','The shot can impact left or right of where intended','Only recoil changes','Nothing changes at close range'], answer:1, explanation:'Misalignment changes impact location.'},{prompt:'During setup, where should your trigger finger be before a decision to shoot?', choices:['Resting lightly on the trigger','Inside the trigger guard','Straight and indexed on the frame','Curled under the grip'], answer:2, explanation:'Keep it straight and outside the trigger guard.'}] },
  { id: 5, slug:'legal-use-of-force', title:'Legal Use of Force', estTime:'24 min', summary:'Reasonable force, de-escalation, retreat principles, and defensive decision-making.', sections:[{heading:'Lesson Gist', body:['Use only the force that is reasonable for the circumstances.', 'Avoid confrontations when possible, seek safety, and do not treat property as worth killing over.']}], scenarios:[{prompt:'Someone is damaging property outside, but no one faces an immediate threat of death or grave bodily harm. What is the safer response?', choices:['Use deadly force to stop the damage','Move to safety, call 911, and be a good witness','Chase the suspect with your firearm','Stand outside and escalate verbally'], answer:1, explanation:'Property alone generally does not justify deadly force; seek safety and call 911.'},{prompt:'Which statement best fits a safer legal mindset?', choices:['If it is not worth dying over, it is not worth killing over','Always stand your ground first','Pointing a firearm is never a use of force issue','Warnings erase poor decisions'], answer:0, explanation:'This phrase reinforces restraint and better judgment.'}] },
  { id: 6, slug:'violent-encounters', title:'Violent Encounters & Aftermath', estTime:'18 min', summary:'Fight-or-flight effects, tunnel vision, auditory exclusion, memory gaps, and command presence.', sections:[{heading:'Lesson Gist', body:['Extreme stress changes how people see, hear, move, and remember events.', 'Students should know these effects so they are not surprised by them afterward.']}], scenarios:[{prompt:'After a high-stress event, a student remembers only fragments. What is the most accurate training takeaway?', choices:['That proves they were careless','Stress can affect memory and perception','It means the event did not happen','It only happens to police officers'], answer:1, explanation:'Stress can distort memory and perception.'},{prompt:'Which physical effect can make fine manipulation harder under stress?', choices:['Improved fingertip precision','Loss of manual dexterity','Perfect hearing','Slower heart rate'], answer:1, explanation:'Adrenaline can reduce fine motor skills.'}] },
  { id: 7, slug:'home-defense', title:'Home Defense Planning', estTime:'16 min', summary:'Safer home planning, family communication, and defensive preparation.', sections:[{heading:'Lesson Gist', body:['A home-defense plan should cover communication, safe rooms, exits, and emergency contacts.', 'Planning reduces panic and confusion if a crisis happens.']}], scenarios:[{prompt:'What is a good reason to create a family code word?', choices:['To replace calling 911','To improve safe communication during stress','To make visitors uncomfortable','To avoid discussing a plan'], answer:1, explanation:'A code word helps with clear communication under stress.'},{prompt:'Which is most important in a home-defense plan?', choices:['Complicated tactics','Clear communication and safe movement','Keeping everyone awake','Hiding the phone'], answer:1, explanation:'Simple, clear, practiced plans are best.'}] },
  { id: 8, slug:'final-prep', title:'Final Review & Range Prep', estTime:'15 min', summary:'Final online review before the live classroom review and range qualification.', sections:[{heading:'Lesson Gist', body:['Finish all online lessons, recheck weak areas, and arrive ready for the in-person review and range portion.', 'Final certificate is only handed in person after successful live completion.']}], scenarios:[{prompt:'A student completed all online work. What is the next step?', choices:['Print the certificate at home','Schedule the live review and range session','Skip the in-person portion','Share the login with a friend'], answer:1, explanation:'The next step is live review and range qualification.'},{prompt:'What status should display after all online work is complete?', choices:['Certified','Online Prerequisite Completed','Range Waived','Instructor Approved Automatically'], answer:1, explanation:'That status makes clear the online portion is complete but the live portion remains.'}] }
];

const QUIZ_BANK = {
  1: [
    { q:'What is the primary defensive target?', choices:['Head only','High-center chest','Hands','Feet'], answer:1, explanation:'High-center chest is the primary defensive target in the course material.' },
    { q:'What is the first universal safety rule?', choices:['Store ammunition separately','Treat all guns as though they are loaded','Always use two hands','Shoot only outdoors'], answer:1, explanation:'Treat every gun as if it is loaded until verified otherwise.' },
    { q:'Your trigger finger should stay where until you have decided to shoot?', choices:['Inside the trigger guard','On the magazine release','Straight and outside the trigger guard','Under the trigger guard'], answer:2, explanation:'Keep your finger straight and indexed outside the trigger guard.' },
    { q:'What should you do every time you pick up a firearm?', choices:['Rack it twice immediately','Perform a clearance check','Dry fire it','Point it upward'], answer:1, explanation:'Perform a proper clearance check.' },
    { q:'What does “be sure of your target and beyond” mean?', choices:['Only shoot paper targets','Know what you are aiming at and what is behind it','Use louder commands','Look only at the front sight'], answer:1, explanation:'You must account for the target and background.' },
    { q:'A firearm just unloaded should be treated how?', choices:['As harmless','As a training prop','With the same respect as a loaded gun','As safe for anyone to handle'], answer:2, explanation:'Safe handling standards do not relax after unloading.' },
    { q:'Which direction is safest during handling?', choices:['Any direction if the magazine is out','A safe direction','Toward the ceiling only','Toward your body'], answer:1, explanation:'Muzzle direction must stay safe at all times.' },
    { q:'If someone tells you a firearm is unloaded, what should you do?', choices:['Trust them','Verify personally','Dry fire it first','Ignore the chamber'], answer:1, explanation:'You verify it yourself.' },
    { q:'What is the safest response if your hand placement becomes unsafe?', choices:['Finish the drill first','Adjust immediately','Shoot one more round','Ignore it'], answer:1, explanation:'Correct unsafe handling before continuing.' },
    { q:'Which habit best prevents negligent handling?', choices:['Fast loading','Consistent safety checks and muzzle awareness','One-handed use','Relying on memory'], answer:1, explanation:'Consistency prevents mistakes.' },
    { q:'True or False: It is acceptable to put your finger on the trigger while deciding what to do.', type:'tf', answer:false, explanation:'Finger stays off the trigger until the decision to shoot is made.' },
    { q:'True or False: A clearance check matters only the first time you pick up a firearm that day.', type:'tf', answer:false, explanation:'It matters every time you pick it up.' },
    { q:'True or False: Safe handling begins before a gun is ever fired.', type:'tf', answer:true, explanation:'It starts the moment you handle it.' },
    { q:'Which is the best description of “safe handling”?', choices:['Only range behavior','A habit of verifying, controlling muzzle direction, and disciplined trigger use','Only cleaning procedures','Only storage procedures'], answer:1, explanation:'Safe handling includes multiple consistent habits.' },
    { q:'If you are unsure of a firearm’s condition, what should you do?', choices:['Assume unloaded','Pause and verify','Pass it to another person','Aim it down and pull trigger'], answer:1, explanation:'Pause and verify before anything else.' },
    { q:'Which action best matches the second universal safety rule?', choices:['Never point your gun at anything you are not willing to destroy','Always use hearing protection','Clean after every use','Carry the largest caliber'], answer:0, explanation:'That is the second rule.' },
    { q:'Why is muzzle direction so important?', choices:['It affects appearance','It controls where an unintended discharge would go','It reduces reload time','It makes storage easier'], answer:1, explanation:'Muzzle direction controls consequences if something goes wrong.' },
    { q:'Which is a safer mindset around others?', choices:['Handle casually if experienced','Maintain the same discipline every time','Relax if among friends','Skip checks when busy'], answer:1, explanation:'Discipline should remain constant.' },
    { q:'True or False: Once the magazine is removed, the firearm cannot still have a round chambered.', type:'tf', answer:false, explanation:'A chambered round can remain even after the magazine is removed.' },
    { q:'A student scores below 80%. What should happen next in this portal?', choices:['Move to next lesson anyway','Retake the quiz and review the lesson','Print a warning certificate','Skip scenarios'], answer:1, explanation:'Scores below 80% require a retake and review.' },
    { q:'What status should appear after the online portion is complete but before range?', choices:['Fully Certified','Online Prerequisite Completed','No Further Action Needed','Range Exempt'], answer:1, explanation:'That status matches the course flow.' },
    { q:'True or False: Students should be allowed to print their final certificate directly from the portal.', type:'tf', answer:false, explanation:'Final certificate is handed in person only.' },
    { q:'Which answer best describes your first responsibility when handling any firearm?', choices:['Shoot accurately','Control and verify it safely','Modify it','Load it'], answer:1, explanation:'Safety and verification come first.' },
    { q:'What is the best reason to re-read the chapter after repeated low quiz scores?', choices:['To delay the student','To reinforce the material before another attempt','Because the portal is broken','To avoid scenario questions'], answer:1, explanation:'Review strengthens understanding before another try.' }
  ],
  2: [
    { q:'Condition Yellow means:', choices:['Unaware','Aware and alert','Panicked','Already fighting'], answer:1, explanation:'Condition Yellow is aware and alert.' },
    { q:'What is one major goal of awareness?', choices:['To look paranoid','To identify problems early enough to create options','To argue with strangers','To move slower'], answer:1, explanation:'Early recognition gives you options.' },
    { q:'Which route is usually safer in a parking area?', choices:['Shortcut alone through an isolated area','Longer route with light and people','Any route while distracted','Route with poor visibility'], answer:1, explanation:'Safer routes usually have light, witnesses, and better visibility.' },
    { q:'True or False: Condition White is a good default when armed in public.', type:'tf', answer:false, explanation:'Students should avoid being unaware in public.' },
    { q:'If a possible threat appears, what does Condition Orange involve?', choices:['Ignoring it','Recognizing a possible threat and making a plan','Immediate shooting','Running blindly'], answer:1, explanation:'Condition Orange is focused awareness and planning.' },
    { q:'What is a smart first response when someone may be following you?', choices:['Walk into a darker area','Move toward a safer, more public area','Confront them face to face immediately','Stop paying attention'], answer:1, explanation:'Move toward safer options and stay alert.' },
    { q:'True or False: Distance and barriers can improve safety before force is needed.', type:'tf', answer:true, explanation:'Movement, distance, and barriers can create safer options.' },
    { q:'Which behavior best matches better awareness?', choices:['Phone in hand, head down','Scanning, noticing exits, and staying present','Wearing headphones loudly','Taking shortcuts alone'], answer:1, explanation:'Awareness means staying mentally present.' },
    { q:'What does “get off the line” mean in simple terms?', choices:['Stand still','Move laterally out of the attack path','Sit down','Walk straight forward'], answer:1, explanation:'Move off the direct line of attack.' },
    { q:'A person is yelling but has not closed distance or shown a weapon. What is the safer first approach?', choices:['De-escalate and create distance','Point a gun immediately','Move closer to dominate','Ignore your surroundings'], answer:0, explanation:'De-escalation and distance come first.' },
    { q:'Which condition represents immediate action based on a known trigger?', choices:['White','Yellow','Orange','Red'], answer:3, explanation:'Condition Red is action.' },
    { q:'True or False: Awareness means you should become fearful of everyone around you.', type:'tf', answer:false, explanation:'Awareness is alertness, not panic.' },
    { q:'Which is a good reason to stay with the crowd instead of taking an isolated shortcut?', choices:['Crowds reduce visibility','Witnesses and activity can reduce risk','It is always faster','It hides you'], answer:1, explanation:'More witnesses and activity can deter criminal behavior.' },
    { q:'What should your first plan usually try to preserve?', choices:['An argument','Safety and escape options','Your pride','A confrontation'], answer:1, explanation:'Safety and escape options matter most.' },
    { q:'True or False: The goal of awareness is to notice problems before they force bad choices.', type:'tf', answer:true, explanation:'Early recognition helps avoid worse situations.' },
    { q:'What is one sign of drifting into Condition White?', choices:['Observing exits','Focused attention on surroundings','Phone distraction and poor awareness','Watching hands and movement'], answer:2, explanation:'Distraction can pull you into Condition White.' },
    { q:'If you issue commands, they should be:', choices:['Quiet and uncertain','Clear and forceful','Profane and threatening','Mumbled'], answer:1, explanation:'Use clear, forceful, simple commands.' },
    { q:'A safer parking-lot habit is to:', choices:['Walk with head down','Keep awareness up and keys ready','Stop between vehicles to text','Choose darker spaces'], answer:1, explanation:'Stay alert and prepared.' },
    { q:'True or False: You should trust your instincts rather than freeze with “this cannot be what I think it is.”', type:'tf', answer:true, explanation:'Trusting early warning signs can help you act sooner.' },
    { q:'Which answer best matches the lesson?', choices:['Awareness is useless without equipment','Awareness, movement, and safer choices matter early','Only force solves problems','You should wait until the threat is on top of you'], answer:1, explanation:'This lesson is about early safer choices.' }
  ]
};
