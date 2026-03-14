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
  3: [
    { q:'What best describes caliber?', choices:['The full cartridge in every detail','The bullet diameter or bore designation','The magazine capacity','The firearm serial number'], answer:1, explanation:'Caliber refers to bullet diameter or cartridge designation, not every aspect of the cartridge.' },
    { q:'Which is a main difference between a revolver and a semi-automatic pistol?', choices:['Revolvers use no ammunition','Semi-automatics typically feed from a magazine','Revolvers cannot fire centerfire ammunition','Semi-automatics have no moving slide'], answer:1, explanation:'Semi-automatic pistols commonly use detachable magazines.' },
    { q:'What is the safest step if you are unsure a magazine fits your firearm?', choices:['Force it in to test it','Verify compatibility before use','Load it halfway first','Strike it into place'], answer:1, explanation:'Verify fit and type before using any magazine.' },
    { q:'Which component actually ignites the powder charge?', choices:['The magazine spring','The primer','The extractor','The sight'], answer:1, explanation:'The primer initiates ignition when struck.' },
    { q:'True or False: Removing the magazine always means the chamber is empty.', type:'tf', answer:false, explanation:'A round may still remain in the chamber.' },
    { q:'What does a cartridge include?', choices:['Only the bullet','Bullet, case, primer, and powder','Only powder and primer','Bullet and magazine'], answer:1, explanation:'A cartridge is made of multiple components working together.' },
    { q:'Why should students know the difference between caliber and cartridge?', choices:['To sound technical only','To communicate and handle ammunition correctly','To increase recoil','To avoid using hearing protection'], answer:1, explanation:'Correct language supports safer handling and better decisions.' },
    { q:'Which statement about ammunition is safest?', choices:['If it looks close, it is probably fine','Only use the ammunition appropriate for the firearm','Any 9mm box works in any handgun','Damaged rounds are fine for practice'], answer:1, explanation:'Only correct, undamaged ammunition should be used in the firearm it is intended for.' },
    { q:'A semi-automatic pistol cycle normally includes feeding, firing, extracting, and what?', choices:['Painting','Ejecting','Polishing','Unlocking the safe'], answer:1, explanation:'Ejection is part of the operating cycle.' },
    { q:'True or False: A squib load can be dangerous because a projectile may remain in the barrel.', type:'tf', answer:true, explanation:'A projectile stuck in the barrel is dangerous and must be addressed immediately.' },
    { q:'What is the purpose of the magazine?', choices:['To ignite the cartridge','To hold and feed cartridges','To improve sight alignment','To replace the chamber'], answer:1, explanation:'The magazine stores and feeds ammunition into the firearm.' },
    { q:'Which action is safest with questionable ammunition?', choices:['Use it on the range anyway','Set it aside and do not use it','Load only one round','Mix it with good rounds'], answer:1, explanation:'Do not use questionable or damaged ammunition.' },
    { q:'What is one reason to inspect ammunition before loading?', choices:['To make it shinier','To spot damage or incorrect caliber','To reduce cleaning time','To increase capacity'], answer:1, explanation:'Inspection helps catch damage and wrong ammunition before use.' },
    { q:'True or False: Rimfire and centerfire ammunition are the same thing.', type:'tf', answer:false, explanation:'They are different ignition systems.' },
    { q:'What does the chamber do?', choices:['Stores magazines','Holds the cartridge ready to fire','Controls the trigger finger','Measures recoil'], answer:1, explanation:'The chamber holds the round in firing position.' },
    { q:'Which statement is safest when learning a new firearm platform?', choices:['Assume all platforms work the same','Learn its controls and operation before loading','Skip the manual if experienced','Test controls while pointing at yourself'], answer:1, explanation:'Learn the controls and operation first.' },
    { q:'True or False: Ammunition left loose in pockets or bags should still be inspected before use.', type:'tf', answer:true, explanation:'Loose rounds should be inspected before loading.' },
    { q:'What is the extractor designed to do?', choices:['Insert a fresh round','Remove the fired case from the chamber','Prevent recoil','Lock the slide open permanently'], answer:1, explanation:'The extractor helps pull the spent case from the chamber.' },
    { q:'If a student says “all small magazines fit all small pistols,” the best correction is:', choices:['That is correct','Magazine fit must be verified by firearm model and type','Only color matters','Capacity determines fit'], answer:1, explanation:'Magazines must be matched to the firearm.' },
    { q:'Which answer best fits safe gun operation?', choices:['Use correct ammunition, verify controls, and understand the platform','Rely on guesswork and appearance','Swap parts until something works','Ignore markings on the firearm and ammunition box'], answer:0, explanation:'Safe operation begins with proper platform and ammunition knowledge.' }
  ],

  4: [
    { q:'Which shooting fundamental most directly helps control recoil?', choices:['Loose grip','Stable grip','Closed eyes','Fast talking'], answer:1, explanation:'A stable grip helps manage recoil and maintain control.' },
    { q:'Sight alignment refers to:', choices:['Lining the front and rear sights up correctly','Looking only at the target','Pointing by instinct only','Holding breath forever'], answer:0, explanation:'Sight alignment means the front and rear sights are properly aligned.' },
    { q:'Which statement best matches trigger control?', choices:['Press the trigger straight to the rear without disturbing the sights','Slap the trigger quickly','Move the whole hand as you press','Use only the fingertip joint every time'], answer:0, explanation:'A smooth rearward press helps maintain sight alignment.' },
    { q:'True or False: Defensive accuracy means accountable hits while maintaining control.', type:'tf', answer:true, explanation:'Defensive accuracy is about responsible, controlled hits.' },
    { q:'What is the safest place for your finger before the decision to shoot?', choices:['On the trigger','Indexed on the frame','Inside the guard lightly','On the magazine release'], answer:1, explanation:'Keep the trigger finger indexed on the frame until you decide to shoot.' },
    { q:'What usually happens if the front sight is ignored?', choices:['Nothing changes','Accuracy may suffer','Recoil disappears','The target gets larger'], answer:1, explanation:'Ignoring the sights can reduce accuracy.' },
    { q:'Which is the best description of follow-through?', choices:['Dropping the gun immediately after the shot','Maintaining control and visual discipline through the shot','Closing your eyes at ignition','Reloading before assessing'], answer:1, explanation:'Follow-through means maintaining control and awareness after the shot breaks.' },
    { q:'True or False: A rushed grip can lead to poor hand placement and inconsistent shooting.', type:'tf', answer:true, explanation:'Poor grip setup can undermine safety and consistency.' },
    { q:'If shots impact low-left for a right-handed shooter, one likely cause is:', choices:['Perfect trigger press','Trigger control issues such as jerking or anticipating','Too much hearing protection','Standing too tall'], answer:1, explanation:'Jerking or anticipating can disturb the sights and push shots off target.' },
    { q:'What does a good stance support?', choices:['Balance and recoil control','Magazine capacity','Bullet weight','Range lighting'], answer:0, explanation:'A stable stance supports balance and recoil management.' },
    { q:'Which statement is safest about speed?', choices:['Speed matters more than control','Control comes first; speed is built correctly afterward','Fast misses still count','Fire before you see the sights'], answer:1, explanation:'Safe, accountable hits matter more than raw speed.' },
    { q:'True or False: Grip pressure should help control the firearm without causing unsafe handling.', type:'tf', answer:true, explanation:'Grip should be firm and controlled, not unsafe or inconsistent.' },
    { q:'What is a sight picture?', choices:['The relationship of aligned sights on the intended target area','The target only','A picture on the wall','The serial number'], answer:0, explanation:'Sight picture combines aligned sights with the intended target area.' },
    { q:'If the muzzle dips just before the shot, what is a likely issue?', choices:['Excellent follow-through','Anticipation of recoil','Improved sight focus','Proper compression'], answer:1, explanation:'Dipping the muzzle often indicates anticipation.' },
    { q:'Which is best for new students?', choices:['Build clean mechanics before chasing speed','Skip fundamentals and practice speed only','Shoot one-handed first','Ignore stance entirely'], answer:0, explanation:'Good fundamentals should come first.' },
    { q:'True or False: Trigger reset and follow-through are part of consistent shooting habits.', type:'tf', answer:true, explanation:'Both support consistency and control.' },
    { q:'What should your visual focus generally prioritize when using iron sights?', choices:['Rear sight only','Front sight clarity with acceptable target awareness','Holster position','Ejection port'], answer:1, explanation:'Front sight focus is a foundational skill with iron sights.' },
    { q:'Which answer best reflects safe range shooting?', choices:['Maintain grip, sights, trigger discipline, and follow-through','Fire as soon as the gun is up','Ignore misses during practice','Keep your finger on the trigger while moving'], answer:0, explanation:'These fundamentals work together to produce safe, accurate shooting.' },
    { q:'What is one benefit of dry practice done safely?', choices:['It reinforces grip, sights, and trigger press without live fire','It replaces all live fire forever','It removes the need for safety rules','It improves magazine capacity'], answer:0, explanation:'Safe dry practice can build foundational mechanics.' },
    { q:'True or False: Good shooting fundamentals are optional in defensive shooting.', type:'tf', answer:false, explanation:'They remain essential in defensive shooting.' }
  ],

  5: [
    { q:'Which phrase best captures a safer legal mindset?', choices:['If it is not worth dying over, it is not worth killing over','Always escalate first','Property always justifies deadly force','Warnings erase bad decisions'], answer:0, explanation:'This phrase reinforces restraint and better judgment.' },
    { q:'What should you usually do if you can safely avoid a confrontation?', choices:['Move toward the conflict','Avoid and disengage','Argue until you win','Display a firearm to control the scene'], answer:1, explanation:'Avoidance and disengagement are safer first choices.' },
    { q:'True or False: Property damage alone generally does not justify deadly force.', type:'tf', answer:true, explanation:'Deadly force is generally tied to an immediate threat of death or grave bodily harm, not property alone.' },
    { q:'What does “reasonable force” most closely mean?', choices:['The maximum force available','The amount of force justified by the circumstances','Whatever feels fair afterward','Force used because someone was rude'], answer:1, explanation:'Reasonable force depends on the circumstances and threat.' },
    { q:'Which is a safer first response when no immediate deadly threat exists?', choices:['Move to safety and call 911','Draw immediately','Chase the person','Issue threats'], answer:0, explanation:'Move to safety and call 911 when possible.' },
    { q:'True or False: Brandishing or threatening with a firearm can create legal consequences.', type:'tf', answer:true, explanation:'Displaying a firearm irresponsibly can create serious legal problems.' },
    { q:'What is de-escalation?', choices:['Increasing pressure to dominate','Actions and words intended to reduce conflict','Ignoring safety','Winning the argument'], answer:1, explanation:'De-escalation aims to reduce tension and avoid worse outcomes.' },
    { q:'What should matter more than pride during a confrontation?', choices:['Looking tough','Getting home safely','Winning the argument','Recording the event'], answer:1, explanation:'Personal safety matters more than ego or pride.' },
    { q:'Which statement best fits a safer use-of-force mindset?', choices:['Use force only when reasonably necessary','Force ends every problem','Drawing a gun solves verbal disputes','Retreat is always illegal'], answer:0, explanation:'Force should only be used when reasonably necessary.' },
    { q:'True or False: You should continue using force after the threat has ended.', type:'tf', answer:false, explanation:'Force must stop when the threat stops.' },
    { q:'A person is stealing something from a vehicle outside, but no one is under immediate deadly threat. What is the safer response?', choices:['Go outside and confront with gun in hand','Move to safety, observe if possible, and call 911','Fire warning shots','Chase them by car'], answer:1, explanation:'Safer action is to prioritize life and call law enforcement.' },
    { q:'What is one risk of angry verbal escalation?', choices:['It can increase danger and reduce options','It always improves control','It guarantees witnesses','It proves innocence'], answer:0, explanation:'Escalation can make a situation worse.' },
    { q:'True or False: Legal knowledge should support restraint, not bravado.', type:'tf', answer:true, explanation:'The point is safer, wiser decision-making.' },
    { q:'Which answer is best if you are unsure whether force is justified?', choices:['Force first and explain later','Create distance, seek safety, and reassess','Move closer to confirm','Issue insults'], answer:1, explanation:'If safe, create distance and reassess.' },
    { q:'What does “imminent threat” generally refer to?', choices:['A vague future possibility','A threat that is immediate and about to happen','Any suspicious feeling','Property loss only'], answer:1, explanation:'Imminent means immediate or about to occur.' },
    { q:'True or False: Calling 911 after a defensive incident is part of responsible aftermath behavior.', type:'tf', answer:true, explanation:'Notifying law enforcement is part of responsible response.' },
    { q:'What is a safer attitude toward legal consequences?', choices:['Ignore them if you felt right','Understand that every force decision may be scrutinized','Assume witnesses do not matter','Post about it online immediately'], answer:1, explanation:'Force decisions can be closely examined afterward.' },
    { q:'Which is most consistent with self-defense law education?', choices:['Avoid, escape, de-escalate, and use only necessary force','Stand in place no matter what','Protect reputation first','Argue while drawing'], answer:0, explanation:'Avoidance and proportionality are key.' },
    { q:'True or False: Shooting to protect pride or teach someone a lesson is defensible.', type:'tf', answer:false, explanation:'Force is not for ego, pride, or punishment.' },
    { q:'Which answer best summarizes the lesson?', choices:['Use only reasonable force, avoid if possible, and protect life over property','Deadly force solves uncertainty','Property and pride are equal to life','A firearm should be part of every argument'], answer:0, explanation:'That best reflects the lesson.' }
  ],

  6: [
    { q:'What can high stress do to memory?', choices:['Make it perfect','Cause gaps or distortions','Remove all emotion','Guarantee exact sequence recall'], answer:1, explanation:'Stress can affect memory and recall.' },
    { q:'True or False: Tunnel vision can occur in violent encounters.', type:'tf', answer:true, explanation:'Tunnel vision is a known stress effect.' },
    { q:'What is auditory exclusion?', choices:['Improved hearing range','Reduced perception of sound under stress','Hearing only sirens','Ignoring commands on purpose'], answer:1, explanation:'Auditory exclusion is reduced sound perception under stress.' },
    { q:'Which physical effect can reduce fine motor skill under stress?', choices:['Lower pulse','Adrenaline surge','Improved finger dexterity','Better handwriting'], answer:1, explanation:'Adrenaline can reduce fine motor control.' },
    { q:'Why should students learn about stress effects?', choices:['To excuse recklessness','To understand what may happen physically and mentally during and after an event','To avoid training','To ignore commands'], answer:1, explanation:'Understanding stress effects prepares students for real human responses.' },
    { q:'True or False: Command presence can include clear, simple verbal commands.', type:'tf', answer:true, explanation:'Clear commands are part of command presence.' },
    { q:'Which is a good verbal command under stress?', choices:['Maybe stop if you want','Stop! Don’t come any closer!','I am not sure what is happening','Do whatever you want'], answer:1, explanation:'Commands should be simple, loud, and clear.' },
    { q:'What is one reason post-incident statements may be incomplete at first?', choices:['Because stress can affect recall','Because nobody remembers anything ever','Because hearing protection causes it','Because only police experience stress'], answer:0, explanation:'Stress can affect memory and sequencing.' },
    { q:'True or False: Elevated heart rate can affect perception and coordination.', type:'tf', answer:true, explanation:'Heart rate and adrenaline can affect performance.' },
    { q:'Which response best fits aftermath awareness?', choices:['Expect normal stress reactions and regain composure','Assume you will feel nothing','Laugh it off immediately','Ignore law enforcement'], answer:0, explanation:'Stress reactions are common in the aftermath.' },
    { q:'What does command presence help accomplish?', choices:['Creates confusion','Communicates intent and may help stop escalation','Guarantees compliance every time','Replaces awareness'], answer:1, explanation:'Clear presence and commands can shape the encounter.' },
    { q:'True or False: Fine motor skills are often easier under adrenaline.', type:'tf', answer:false, explanation:'Fine motor skill often degrades under stress.' },
    { q:'Which statement about stress is most accurate?', choices:['Only untrained people experience it','Even trained people can experience stress effects','Stress means cowardice','Stress can be turned off completely'], answer:1, explanation:'Training helps, but human stress effects can still occur.' },
    { q:'What is one reason to practice verbal commands in training?', choices:['To sound aggressive','To make them more available under stress','To intimidate friends','To avoid learning legal issues'], answer:1, explanation:'Practicing commands makes them easier to access under stress.' },
    { q:'True or False: A student may focus so narrowly on a threat that they miss other information.', type:'tf', answer:true, explanation:'That is a known form of tunnel vision.' },
    { q:'Which answer best reflects a realistic aftermath expectation?', choices:['You may feel shaken, incomplete in memory, or physically affected','Nothing happens after stress','Memory becomes photographic','Every event feels routine'], answer:0, explanation:'Stress reactions can affect perception, body, and memory.' },
    { q:'What is one danger of assuming perfect memory after a critical incident?', choices:['None','You may be surprised by normal memory gaps','It improves reporting','It lowers heart rate'], answer:1, explanation:'Expecting perfect recall is unrealistic under extreme stress.' },
    { q:'True or False: Stress effects mean training is useless.', type:'tf', answer:false, explanation:'Training still matters; it helps students function more effectively under stress.' },
    { q:'What is one better training takeaway from violent encounters?', choices:['Prepare for human stress responses and practice clear actions','Ignore physiology','Depend on luck','Train only for speed'], answer:0, explanation:'Students should prepare for realistic human responses under stress.' },
    { q:'Which summary best matches the lesson?', choices:['Stress changes perception, memory, and motor skills; training should account for that','Stress has no effect on shooters','Aftermath never matters','Only command presence matters'], answer:0, explanation:'That best reflects the lesson.' }
  ],

  7: [
    { q:'Why should a family have a home-defense plan?', choices:['To add drama','To reduce confusion and improve safe response under stress','To avoid talking to each other','To replace calling 911'], answer:1, explanation:'Planning improves communication and safer action during crisis.' },
    { q:'What is a family code word useful for?', choices:['Replacing emergency services','Clear communication during stress','Showing visitors your system','Avoiding any plan'], answer:1, explanation:'A code word can help communicate clearly and quickly.' },
    { q:'True or False: A safe room plan can be part of a home-defense plan.', type:'tf', answer:true, explanation:'Safe rooms can be part of home planning.' },
    { q:'Which is most important in a home-defense plan?', choices:['Complicated tactics','Clear communication and safe movement','Keeping lights off all the time','Hiding the phone'], answer:1, explanation:'Simple, clear communication and movement plans are best.' },
    { q:'If you hear a possible break-in, what should your plan prioritize?', choices:['Immediate wandering through the house','Safety, communication, and emergency response','Opening exterior doors','Turning off all lights and separating'], answer:1, explanation:'A plan should prioritize safety and coordinated action.' },
    { q:'True or False: Family members should know where to move and what to do in an emergency.', type:'tf', answer:true, explanation:'Clear roles reduce confusion.' },
    { q:'What is one reason to identify exits and choke points in advance?', choices:['To decorate the home','To understand safe movement and likely access routes','To avoid ever locking doors','To make guests uncomfortable'], answer:1, explanation:'Knowing layout improves planning and safer movement.' },
    { q:'Which answer is best about children and home plans?', choices:['They should guess what to do','Plans should be age-appropriate and clear','They do not need any guidance','They should run outside every time'], answer:1, explanation:'Plans should be simple and appropriate for the household.' },
    { q:'True or False: A charged phone and emergency contacts matter in home defense planning.', type:'tf', answer:true, explanation:'Communication tools matter.' },
    { q:'What is one benefit of practicing the plan?', choices:['It removes all fear permanently','It helps the family respond with less confusion','It means locks are unnecessary','It replaces all training'], answer:1, explanation:'Practice can reduce confusion during stress.' },
    { q:'Which is safer than searching every unknown noise aggressively?', choices:['Calling out, gathering loved ones, and following the plan','Ignoring all noises forever','Opening the front door immediately','Separating family members'], answer:0, explanation:'Gathering and following the plan is generally safer than reckless searching.' },
    { q:'True or False: A home-defense plan should include what to say to 911.', type:'tf', answer:true, explanation:'A communication plan can include 911 basics.' },
    { q:'What does a good plan reduce?', choices:['Need for locks','Panic and confusion','Importance of communication','Responsibility'], answer:1, explanation:'Planning reduces confusion and panic.' },
    { q:'Which answer best fits safer home preparation?', choices:['Know the layout, communicate clearly, and rehearse simple actions','Keep the plan secret from everyone','Change the plan every week','Never discuss emergency contacts'], answer:0, explanation:'Simple, known, practiced plans work best.' },
    { q:'True or False: Home-defense planning is only for people who live alone.', type:'tf', answer:false, explanation:'Anyone can benefit from planning.' },
    { q:'What is one good reason to establish a rally point inside the home?', choices:['To confuse an intruder','To know where family members should move during an emergency','To store magazines','To avoid ever using lights'], answer:1, explanation:'A rally point helps coordinate movement under stress.' },
    { q:'What should a student avoid in home planning?', choices:['Clear communication','Overly complicated plans no one can remember','Knowing exits','Practicing simple roles'], answer:1, explanation:'Overly complicated plans often fail under stress.' },
    { q:'True or False: A plan can include who calls 911 and who gathers family members.', type:'tf', answer:true, explanation:'Assigning roles can reduce confusion.' },
    { q:'Which answer best matches the lesson?', choices:['Plan, communicate, simplify, and prioritize safety','Complicate the plan so intruders cannot guess it','Ignore communication','Assume panic will guide you'], answer:0, explanation:'That is the clearest summary of the lesson.' },
    { q:'What is one advantage of discussing the plan before an emergency?', choices:['It makes emergencies happen less','People are more likely to remember what to do under stress','It replaces locks and alarms','It means no one needs training'], answer:1, explanation:'Pre-planning increases the chance of coordinated action.' }
  ],

  8: [
    { q:'What does “Online Prerequisite Completed” mean?', choices:['The student is fully certified','The online portion is done, but live review and range still remain','The student can skip the range','The certificate has already been issued'], answer:1, explanation:'The online portion is complete, but the live portion still remains.' },
    { q:'What is the next step after finishing the online portal?', choices:['Print the final certificate at home','Attend the live review and range qualification','Share the access code with a friend','Retake every lesson automatically'], answer:1, explanation:'The next step is the live review and range session.' },
    { q:'True or False: The final certificate should be issued only after successful in-person completion.', type:'tf', answer:true, explanation:'Final completion is tied to the in-person portion.' },
    { q:'Why should students review weak areas before the live session?', choices:['To waste time','To arrive more prepared and confident','To avoid listening during class','To skip the range'], answer:1, explanation:'Reviewing weak spots helps students arrive prepared.' },
    { q:'Which answer best matches final preparation?', choices:['Finish online work, review weak areas, and arrive ready for live qualification','Show up without reviewing anything','Skip lesson summaries','Bring another student’s code'], answer:0, explanation:'That is the intended preparation path.' },
    { q:'True or False: The portal’s quizzes are meant to reinforce learning, not replace the live instructor portion.', type:'tf', answer:true, explanation:'The live instructor and range work remain essential.' },
    { q:'What should a student do after repeated low quiz scores?', choices:['Ignore the material and keep guessing','Review the lesson summary and retake the quiz','Jump to the certificate page','Skip the scenarios'], answer:1, explanation:'Review and retake is the correct response.' },
    { q:'Why does the portal randomize quiz questions?', choices:['To frustrate students','To reinforce understanding from a larger bank instead of memorizing order','To make grading impossible','To avoid explanations'], answer:1, explanation:'Randomization encourages actual learning rather than memorization.' },
    { q:'True or False: A student can be marked complete online even if they have not met the passing score.', type:'tf', answer:false, explanation:'Students still need to pass the quizzes according to the portal rules.' },
    { q:'What is one reason to arrive prepared for the live portion?', choices:['It supports safer, smoother in-person review and range time','It removes the need for instructor supervision','It allows skipping qualification','It guarantees perfect shooting'], answer:0, explanation:'Prepared students get more from the live session.' },
    { q:'Which portal behavior is correct after failing a quiz?', choices:['Proceed anyway','Retake after review','Print a certificate','Unlock all lessons'], answer:1, explanation:'Students should review and retake.' },
    { q:'True or False: The live range portion can be replaced by scoring high online.', type:'tf', answer:false, explanation:'High online scores do not replace live qualification.' },
    { q:'What should instructors use the online portal for?', choices:['Reinforcement, preparation, and progress tracking','Replacing all classroom teaching forever','Public certificate printing without verification','Letting students share codes'], answer:0, explanation:'The portal supports preparation and tracking.' },
    { q:'What should happen when a student completes the online lessons successfully?', choices:['They move to the live review/range step','They are automatically mailed a permit','They never need the instructor','They unlock instructor-only screens'], answer:0, explanation:'Online success moves them to the live step.' },
    { q:'True or False: Final course completion should be instructor verified.', type:'tf', answer:true, explanation:'Instructor verification is part of proper completion control.' },
    { q:'Which answer best matches your portal design?', choices:['Lesson, scenario, quiz, pass, then live completion','Certificate first, training later','Quiz only, no lessons','Live range first, then random login'], answer:0, explanation:'That matches the flow shown in your portal files.' },
    { q:'What is the safest meaning of “prerequisite complete”?', choices:['Ready for the next required step','Completely certified','No more oversight needed','Exempt from range rules'], answer:0, explanation:'It means the prerequisite is complete, not the whole course.' },
    { q:'True or False: Students should keep their own access code private.', type:'tf', answer:true, explanation:'Access codes should be private to the student.' },
    { q:'What is one reason to track progress digitally?', choices:['To make things look modern only','To see what students completed and where they need review','To remove instructors','To replace all records'], answer:1, explanation:'Digital progress helps track readiness and follow-up.' },
    { q:'Which answer best summarizes the final-prep lesson?', choices:['Complete the online work, review weak areas, then finish with instructor-led live review and range qualification','Online work alone is final certification','Skip weak areas and hope for the best','Anyone with a code is automatically done'], answer:0, explanation:'That is the correct summary.' }
  ]
};
