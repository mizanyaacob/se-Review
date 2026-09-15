/**
 * Single source of truth for every fact shown in the presentation.
 * Everything here is taken from Amizan_Self_Evaluation_Review_2026.pdf.
 * Components only arrange and animate this data; they must not add facts.
 */

export const person = {
  name: 'Muhammad Amizan',
  shortName: 'Amizan',
  role: 'Game Engineer',
  studio: 'Passion Republic',
  review: 'SE Review 2026',
}

export type ChapterId = 'prologue' | 'working' | 'retaining' | 'personal' | 'departmental' | 'organizational' | 'epilogue'

export interface ChapterMeta {
  id: ChapterId
  /** Goal number (priority order). Prologue and epilogue have none. */
  goal?: number
  label: string
  title: string
  subtitle: string
  accent: string
}

export const chapters: ChapterMeta[] = [
  { id: 'prologue', label: 'Prologue', title: 'The Plan Changed', subtitle: 'I had a plan for this year. Then the project changed.', accent: '#E9E6DF' },
  { id: 'working', goal: 1, label: 'Working Knowledge', title: 'Working Knowledge', subtitle: 'Growing as an engineer through an engine migration', accent: '#F5A83C' },
  { id: 'retaining', goal: 2, label: 'Retaining Experience', title: 'Retaining Experience', subtitle: 'Sharing knowledge instead of keeping it to myself', accent: '#A5B4FC' },
  { id: 'personal', goal: 3, label: 'Personal', title: 'Getting Back Outdoors', subtitle: 'An engineer is still a person', accent: '#86D9A8' },
  { id: 'departmental', goal: 4, label: 'Departmental', title: 'Learning DevOps from the Ground Up', subtitle: 'Understanding the pipeline around the code I write', accent: '#67D4E6' },
  { id: 'organizational', goal: 5, label: 'Organizational', title: 'Connecting Students with Passion Republic', subtitle: 'Contributing beyond my team', accent: '#F2A0BE' },
  { id: 'epilogue', label: 'Epilogue', title: 'Bringing It Together', subtitle: 'Knowledge became experience. Experience became contribution.', accent: '#E9E6DF' },
]

export const chapterById = (id: ChapterId) => chapters.find((c) => c.id === id)!

export interface FourQuestions {
  wanted: string
  happened: string
  did: string
  changed: string
}

/* ------------------------------------------------------------------ */
/* Prologue                                                            */
/* ------------------------------------------------------------------ */

export const originalPlan = [
  'Deepen my engine knowledge',
  'Become more independent',
  'Build tools for the team',
  'Retain what I learn by sharing it',
  'Contribute more effectively',
]

export const productionQuestions = [
  'Why does this scale?',
  'How will someone else maintain this?',
  'What happens when requirements change?',
]

/* ------------------------------------------------------------------ */
/* Goal 1 — Working Knowledge                                          */
/* ------------------------------------------------------------------ */

export const working = {
  goal: 'Gain deeper knowledge of Unreal Engine, or any engine and tools the project needs. Become more independent. Improve my overall engineering knowledge.',
  wantedShort: ['Deeper engine knowledge', 'More independence', 'Systems that consider future needs', 'Tools the team keeps using'],
  learningLoop: ['Question', 'Learning', 'Experiment', 'Implementation', 'Problem', 'Rebuild', 'Better understanding', 'Reusable tool'],
  migrationStates: [
    { state: 'Unknown', note: 'The studio is mostly Unreal-focused. Little internal Unity support.' },
    { state: 'Learning', note: 'Picked up Unity courses on my own initiative.' },
    { state: 'Rebuilding', note: 'Rebuilt and restructured systems and project folders.' },
    { state: 'Adapting', note: 'Unlearned student habits. Relearned for production.' },
    { state: 'Working', note: 'Migration completed with Syarif, faster than initially projected.' },
  ],
  courses: {
    count: 4,
    detail: 'Started the year on Unreal Engine courses. When the project migrated, I switched my learning to Unity without being told to.',
  },
  /**
   * Facts below are read from the certificates. Originals: public/Assets.
   * The carousel loads optimized 1800px copies from public/certificates/<id>.jpg.
   */
  certificates: [
    {
      id: 'unreal-cpp',
      title: 'Unreal Engine 5 C++ Game Development',
      track: 'Unreal',
      instructors: 'GameDev.tv Team, Kaan Alpar',
      date: 'May 20, 2026',
      hours: 26.5,
      relevance: 'The engine the project started the year on.',
    },
    {
      id: 'unity-patterns',
      title: 'Programming Design Patterns For Unity',
      track: 'Unity',
      instructors: 'GameDev.tv Team',
      date: 'July 18, 2026',
      hours: 3.5,
      relevance: 'Part of switching my learning to Unity after the migration.',
    },
    {
      id: 'teamcity',
      title: 'CI/CD with TeamCity From Beginner to Advanced',
      track: 'CI/CD',
      instructors: 'Aref Karimi',
      date: 'July 28, 2026',
      hours: 4,
      relevance: 'The tool behind the BKT build pipeline.',
    },
    {
      id: 'unity-systems',
      title: 'Advanced Unity Game Development and Systems Design',
      track: 'Unity',
      instructors: 'MKCL India',
      date: 'August 27, 2026',
      hours: 19.5,
      relevance: 'Taking my Unity knowledge from student level toward industry standard.',
    },
  ],
  migrationFlow: ['Unreal project', 'Migration', 'Self-study', 'Trial & error', 'Rebuild', 'Working Unity project'],
  migrationNote: 'Completed together with Syarif, faster than initially projected.',
  tools: [
    { id: 'dialogue', name: 'Dialogue Tree Editor', area: 'Dialogue', description: 'A custom editor tool, built instead of relying on a plugin.' },
    { id: 'input', name: 'Input State Debugger', area: 'Input', description: 'A custom debugging tool, built instead of relying on a plugin.' },
    { id: 'datatable', name: 'Data Table Editor', area: 'Data', description: 'A custom editor tool, built instead of relying on a plugin.' },
    { id: 'review', name: 'Project Review Editor', area: 'Project review', description: 'A custom editor tool, built instead of relying on a plugin.' },
    { id: 'assets', name: 'Asset Browser Tools', area: 'Assets', description: 'Custom asset tooling, built instead of relying on a plugin.' },
    { id: 'sfx', name: 'SFX Mixer', area: 'Audio', description: 'A custom audio tool, built instead of relying on a plugin.' },
    { id: 'vfx', name: 'VFX Forge', area: 'VFX', description: 'Lets non-VFX artists create their own visual effects.' },
  ],
  toolOrigin: 'Built whenever I spotted a repetitive task or a gap in our workflow.',
  challenges: [
    { title: 'Limited Unity-specific support', body: 'The studio is primarily Unreal-focused, so there were very few people to ask early on.' },
    { title: 'Trial and error', body: 'Many Unity-specific problems had to be solved through self-directed learning.' },
    { title: 'Rebuilding', body: 'No senior was hands-on with the project at the start. The project went through 3 rounds of rebuilding and restructuring, including during the migration.' },
  ],
  rebuildRounds: 3,
  pac: {
    beats: ['Learning', 'Application', 'Team', 'Pressure'],
    facts: [
      'My first time working closely with animators, designers and artists',
      'Contributed my Unreal knowledge to gameplay features',
      'The team won the Token Prize',
    ],
    reflection: 'One of the moments that reminded me that what I learn can make the team stronger under pressure.',
  },
  learning: [
    'Completed 4 Udemy courses across Unreal Engine, Unity and CI/CD',
    'Pivoted my learning path mid-year to match the migration',
    'Unity knowledge from student level to closer to industry standard',
    'Exposure to tools and workflows I had never used before',
  ],
  metrics: [
    { value: 4, label: 'Courses', context: 'Udemy: Unreal, Unity and CI/CD' },
    { value: 7, label: 'Internal tools', context: 'Custom-built, not plugins' },
    { value: 1, label: 'Engine migration', context: 'Unreal to Unity, with Syarif' },
    { value: 1, label: 'Token Prize', context: 'Won as a team at PAC' },
  ],
  recap: {
    wanted: 'Deeper engine knowledge and more independence.',
    happened: 'The project migrated from Unreal to Unity.',
    did: 'Self-studied, rebuilt systems, and built tools.',
    changed: 'More versatile, with reusable tools the team can use.',
  } satisfies FourQuestions,
}

/* ------------------------------------------------------------------ */
/* Goal 2 — Retaining Experience                                       */
/* ------------------------------------------------------------------ */

export const retaining = {
  goal: 'Retain and consolidate the experience I gain by proactively sharing it, rather than only absorbing it for myself.',
  target: 2,
  loop: ['Learn', 'Do', 'Explain', 'Understand better', 'Share'],
  sessions: [
    { id: 'diversion', kind: 'Tool', title: 'Diversion', summary: 'An alternative version control tool that handles Blueprint conflict resolution in Unreal. Useful for the department and future workflows.' },
    { id: 'ai', kind: 'Workflow', title: 'AI Rapid Prototyping Workflow', summary: 'How the team uses an AI workflow to prototype design tasks: validate ideas early and cut implementation time before touching the engine.' },
    { id: 'tools', kind: 'Process', title: 'Internal Engineering Tools', summary: 'The tools I built for the team, which help engineers keep the codebase clean and flag potential technical debt early.' },
  ],
  // from → to: Syarif learned the Unity workflow until he could work independently; Irfan joined and was onboarded onto it.
  people: [
    { name: 'Syarif', from: 'Unity workflow', to: 'Independent work', role: 'Teammate' },
    { name: 'Irfan', from: 'New joiner', to: 'Unity workflow', role: 'New joiner' },
  ],
  alsoShared: ['Programmer Weeklies: project status updates', 'Biweekly updates: team resourcing status'],
  metrics: [
    { value: 2, label: 'Teammates ramped up on Unity', context: 'Syarif and Irfan' },
    { value: 3, label: 'Engineers Weekly sessions', context: 'Target was 2' },
  ],
  recap: {
    wanted: 'Share what I learn instead of keeping it to myself.',
    happened: 'I was entrusted with the migration, and teammates needed the Unity workflow.',
    did: 'Presented 3 Engineers Weekly sessions. Helped Syarif, onboarded Irfan.',
    changed: '2 teammates ramped up on Unity. Target of 2 sessions exceeded.',
  } satisfies FourQuestions,
}

/* ------------------------------------------------------------------ */
/* Goal 3 — Personal                                                   */
/* ------------------------------------------------------------------ */

export const personal = {
  goal: 'Fill my free time with meaningful and healthy activities.',
  targetMeters: 500,
  summitMeters: 700,
  mountain: 'Mount Alai',
  region: 'Perak',
  activities: ['Hiking', 'Camping'],
  recap: {
    wanted: 'Get active again, with at least one 500m+ hike.',
    happened: 'Since university, mostly indoors and in front of screens.',
    did: 'Went hiking again, and picked up camping.',
    changed: 'Better stress levels and mood on weeks I got outdoors.',
  } satisfies FourQuestions,
}

/* ------------------------------------------------------------------ */
/* Goal 4 — Departmental                                               */
/* ------------------------------------------------------------------ */

export const departmental = {
  goal: 'Learn how DevOps works and understand its processes and tools, so I can assist the DevOps team when needed.',
  confusingTerms: ['Build agent?', 'Pipeline?', 'Automation?'],
  flow: ['Question', 'Chris', 'TeamCity', 'Experiment', 'Pipeline', 'Automated build'],
  timeline: [
    { label: 'Zero knowledge', note: 'Chris explained pipelines, build agents and automation. I had no idea what they meant.' },
    { label: 'Asked questions', note: 'Curiosity kicked in. Chris answered all my newbie questions.' },
    { label: 'Learned TeamCity', note: 'Chris offered me the BKT CI/CD pipeline and pointed me to TeamCity.' },
    { label: 'Unreal pipeline', note: 'Got the build pipeline working while BKT was on Unreal.' },
    { label: 'Project migrated', note: 'The project switched to Unity before everything was finished.' },
    { label: 'Rebuilt for Unity', note: 'Redid the pipeline for Unity.' },
    { label: 'Automated build', note: 'The automated build is still working today.' },
  ],
  metrics: [
    { display: '0 → 1', label: 'DevOps knowledge → working pipeline' },
    { display: '2', label: 'Engines supported' },
    { display: 'LIVE', label: 'Automated build' },
  ],
  message: 'I became an engineer who understands more of the pipeline around the code I write.',
  recap: {
    wanted: 'Understand DevOps well enough to assist when needed.',
    happened: 'Chris offered me the BKT CI/CD pipeline.',
    did: 'Learned TeamCity, built the pipeline, rebuilt it for Unity.',
    changed: 'I can maintain and troubleshoot the build pipeline on my own.',
  } satisfies FourQuestions,
}

/* ------------------------------------------------------------------ */
/* Goal 5 — Organizational                                             */
/* ------------------------------------------------------------------ */

export const organizational = {
  goal: 'Introduce Passion Republic to students, especially from my former university, and share industry experience.',
  target: 1,
  scopes: ['Myself', 'My team', 'My department', 'The studio'],
  events: [
    { id: 'connect', name: 'Passion Connect Event 2025', role: 'Volunteer', note: 'My first real chance this year to represent the studio to students.' },
    { id: 'iium', name: 'IIUM Game Jam', role: 'Judge', note: 'Hands-on: seeing their work and giving feedback, not just talking at them.' },
    { id: 'uitm', name: 'UiTM Puncak Alam Game Showcase', role: 'Volunteer', note: 'Extending my involvement beyond my own university.' },
  ],
  why: 'I would be happy to see more fresh grads, especially my juniors, find a place in the game industry.',
  metrics: [
    { value: 3, label: 'Outreach events', context: 'Target was 1 session' },
    { value: 1, label: 'Game jam judged', context: 'IIUM' },
  ],
  recap: {
    wanted: 'Introduce Passion Republic to students and share industry experience.',
    happened: 'Outreach events gave me chances to meet students directly.',
    did: 'Volunteered at 2 events and judged the IIUM Game Jam.',
    changed: 'Passion Republic reached students beyond my own university.',
  } satisfies FourQuestions,
}

/* ------------------------------------------------------------------ */
/* Mission briefings — short context shown after each chapter title    */
/* ------------------------------------------------------------------ */

export type GoalChapterId = Exclude<ChapterId, 'prologue' | 'epilogue'>

export interface Briefing {
  heading: string
  blocks: Array<{ label: string; text: string }>
}

export const briefings: Record<GoalChapterId, Briefing> = {
  working: {
    heading: 'Where the year started',
    blocks: [
      { label: 'Starting point', text: 'Our project was built on Unreal, so I started the year on Unreal Engine courses, going deeper into the engine the project needed.' },
      { label: 'The turn', text: 'A few months in, the project migrated to Unity. Most of the studio’s expertise is in Unreal, so there wasn’t much internal support to lean on.' },
      { label: 'My approach', text: 'Take the initiative: switch to Unity courses, self-teach through trial and error, and build my own tools instead of relying on plugins.' },
      { label: 'Why it matters', text: 'It makes me more versatile, able to contribute across a wider range of game types and problem domains, not just familiar systems.' },
    ],
  },
  retaining: {
    heading: 'Learning is only half of it',
    blocks: [
      { label: 'The situation', text: 'I was entrusted with the Unity migration because I had prior Unity experience, while teammates were getting familiar with the new workflow.' },
      { label: 'My approach', text: 'Pick topics from day-to-day work (things I struggled with, solved or learned during the migration) and present them at Engineers Weekly.' },
      { label: 'Why it matters', text: 'Presenting forces a deeper understanding, which helps me retain what I learn, and builds confidence in explaining technical work.' },
    ],
  },
  personal: {
    heading: 'Too long indoors',
    blocks: [
      { label: 'Before', text: 'Since my final year of university I hadn’t done much outdoors. Most of my time was spent in front of a screen, with no real outlet to recharge.' },
      { label: 'The plan', text: 'Join community-organised hiking trips, or invite colleagues along, and hike at least one mountain or hill of 500m or more.' },
      { label: 'Why it matters', text: 'Better fitness and stamina, less stress, and better mental well-being.' },
    ],
  },
  departmental: {
    heading: 'A totally different skillset',
    blocks: [
      { label: 'How it started', text: 'Soon after joining PR, I asked Chris what he was working on. Pipelines, build agents and automation meant nothing to me yet, but it sparked my curiosity.' },
      { label: 'My approach', text: 'Talk to Chris from time to time, research and practise the DevOps tools our projects use, and track progress with a roadmap and skills checklist.' },
      { label: 'Why it matters', text: 'It broadens my skillset beyond game development and gives me a more holistic understanding of project workflows.' },
    ],
  },
  organizational: {
    heading: 'Giving back',
    blocks: [
      { label: 'Why it matters to me', text: 'It’s a way to contribute back to my university. I’d be happy to see more fresh grads, especially my juniors, find a place in the game industry.' },
      { label: 'My approach', text: 'Attend and conduct sharing sessions, share my industry experience, and attract more potential talent to apply to Passion Republic.' },
      { label: 'The timeline', text: 'A long-term goal over the next 2–3 years, starting with at least one sharing session this year.' },
    ],
  },
}

/* ------------------------------------------------------------------ */
/* Game layer — every entry restates a fact from the sections above    */
/* ------------------------------------------------------------------ */

export type AchievementIcon = 'migration' | 'courses' | 'tools' | 'rebuild' | 'trophy' | 'sessions' | 'team' | 'summit' | 'build' | 'outreach'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: AchievementIcon
  chapter: ChapterId
  /** Unlocks when the presenter reaches this scene + step. */
  trigger: { scene: string; beat: number }
  /** Wait for the scene's own animation to land before announcing. */
  delayMs: number
}

export const achievements: Achievement[] = [
  { id: 'courses', title: 'Course Completed ×4', description: '4 Udemy courses, 53.5 hours: Unreal, Unity and CI/CD.', icon: 'courses', chapter: 'working', trigger: { scene: 'wk-certificates', beat: 3 }, delayMs: 1000 },
  { id: 'migration', title: 'Migration Complete', description: 'Unreal → Unity with Syarif, faster than initially projected.', icon: 'migration', chapter: 'working', trigger: { scene: 'wk-challenge', beat: 4 }, delayMs: 1100 },
  { id: 'tools', title: 'Toolsmith', description: '7 internal tools built for the team.', icon: 'tools', chapter: 'working', trigger: { scene: 'wk-toolbelt', beat: 1 }, delayMs: 1900 },
  { id: 'rebuild', title: 'Rebuilt ×3', description: '3 rounds of restructuring, including the migration.', icon: 'rebuild', chapter: 'working', trigger: { scene: 'wk-not-clean', beat: 3 }, delayMs: 3600 },
  { id: 'token-prize', title: 'Token Prize', description: 'Won as a team at PAC.', icon: 'trophy', chapter: 'working', trigger: { scene: 'wk-pac', beat: 4 }, delayMs: 1400 },
  { id: 'sharer', title: 'Knowledge Sharer', description: '3 Engineers Weekly sessions. Target was 2.', icon: 'sessions', chapter: 'retaining', trigger: { scene: 're-sessions', beat: 4 }, delayMs: 1200 },
  { id: 'party', title: 'Party Ramped Up', description: '2 teammates ramped up on Unity: Syarif and Irfan.', icon: 'team', chapter: 'retaining', trigger: { scene: 're-transfer', beat: 3 }, delayMs: 1200 },
  { id: 'summit', title: 'Summit 700m+', description: 'Mount Alai, Perak. Target was 500m.', icon: 'summit', chapter: 'personal', trigger: { scene: 'pg-climb', beat: 2 }, delayMs: 2300 },
  { id: 'build', title: 'Build Successful', description: 'BKT automated build, still working today.', icon: 'build', chapter: 'departmental', trigger: { scene: 'dg-pipeline', beat: 3 }, delayMs: 3400 },
  { id: 'outreach', title: 'Three Stops', description: '3 outreach events. Target was 1 session.', icon: 'outreach', chapter: 'organizational', trigger: { scene: 'og-outreach', beat: 2 }, delayMs: 1000 },
]

export type QuestStatus = 'Ongoing' | 'Complete' | 'Exceeded'

export const quests: Record<Exclude<ChapterId, 'prologue' | 'epilogue'>, { status: QuestStatus; objective: string; result: string[] }> = {
  working: {
    status: 'Ongoing',
    objective: working.goal,
    result: ['4 Udemy courses (53.5 hours)', 'Unreal → Unity migration, faster than projected', '7 internal tools', 'PAC Token Prize (team)'],
  },
  retaining: {
    status: 'Exceeded',
    objective: retaining.goal,
    result: ['3 Engineers Weekly sessions (target 2)', 'Helped Syarif work independently in Unity', 'Onboarded Irfan onto the Unity workflow'],
  },
  personal: {
    status: 'Exceeded',
    objective: 'Hike at least one mountain or hill of 500m+ this year.',
    result: ['Mount Alai, Perak: 700m+', 'Picked up camping too'],
  },
  departmental: {
    status: 'Complete',
    objective: departmental.goal,
    result: ['Built the BKT CI/CD pipeline in TeamCity', 'Rebuilt it for Unity', 'Automated build still working today'],
  },
  organizational: {
    status: 'Exceeded',
    objective: 'Conduct at least one sharing session with students this year.',
    result: ['Passion Connect Event 2025', 'Judge at IIUM Game Jam', 'UiTM Puncak Alam Game Showcase'],
  },
}

export const loadingTips: Record<ChapterId, string> = {
  prologue: 'Press Space to advance. Press Q any time to open the quest log.',
  working: 'The project migrated from Unreal to Unity mid-year.',
  retaining: 'Presenting forces a deeper understanding.',
  personal: 'Mount Alai in Perak stands over 700m.',
  departmental: 'Chris pointed me toward TeamCity.',
  organizational: 'The target was one sharing session. It became three events.',
  epilogue: 'Knowledge became experience. Experience became contribution.',
}

export const credits: Array<{ role: string; name: string }> = [
  { role: 'Story & presentation', name: 'Muhammad Amizan' },
  { role: 'Continuous guidance', name: 'Lin · Senior Game Engineer' },
  { role: 'Engine migration partner', name: 'Syarif' },
  { role: 'DevOps guidance', name: 'Chris' },
  { role: 'Newest party member', name: 'Irfan' },
  { role: 'PAC teammates', name: 'Animators, designers & artists' },
  { role: 'Engineers Weekly', name: 'Everyone who listened' },
  { role: 'Outreach stops', name: 'Passion Connect · IIUM · UiTM Puncak Alam' },
  { role: 'Studio', name: 'Passion Republic' },
]

/* ------------------------------------------------------------------ */
/* Epilogue                                                            */
/* ------------------------------------------------------------------ */

export const epilogue = {
  chain: ['Working Knowledge', 'Retaining Experience', 'Team contribution', 'Department contribution', 'Organizational contribution'],
  thesis: ['Knowledge became experience.', 'Experience became contribution.', 'Contribution became impact.'],
  reveal: [
    'I started the year wanting to become more independent.',
    'Then the project changed.',
    'So I had to learn.',
    'Then I had to rebuild.',
    'Then I had to explain what I learned.',
    'Then I started building tools around the problems I kept seeing.',
    'And eventually, the scope of my contribution became bigger than my original goal.',
  ],
  finalA: "I didn't just gain experience this year.",
  finalB: 'I learned how to turn experience into contribution.',
  verbs: ['Learned', 'Adapted', 'Built', 'Shared', 'Contributed'],
  nextA: "The next step isn't simply knowing more.",
  nextB: "It's becoming capable of taking on more.",
}
