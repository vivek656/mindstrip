import { PresetScenario } from '@/types/comic';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'healthcare-caregiver',
    domain: 'healthcare',
    title: 'Caregiver & Treatment Overwhelm',
    tagline: 'Balancing dialysis clinic routines, fluid limits, lab tracking, and caregiver exhaustion',
    icon: 'HeartPulse',
    recommendedStyle: 'webcomic',
    recommendedLens: 'empathetic',
    rawDump: `I feel like I'm drowning in numbers and clinic schedules. Every single morning starts with weighing my mom, calculating exact fluid intake down to the milliliter, tracking phosphorus and potassium levels from yesterday's lab report, and packing the dialysis travel bag. 
Then the vascular access site looked slightly swollen today and my stomach dropped into my shoes. Is it an infection? A stenosis? The nephrologist said to monitor it, but what does "monitor" even mean when your anxiety is at 10/10?
Meanwhile I haven't answered 42 work emails, my own doctor appointment got canceled, and I feel guilty for feeling exhausted because she is the one in the chair 4 hours three times a week. I can't hold all these medical variables in my head anymore without freezing up.`
  },
  {
    id: 'engineering-refactor',
    domain: 'engineering',
    title: 'The 2 AM Refactor Trap',
    tagline: 'Paralysis between a 1-line hack vs rewriting an entire microservice architecture',
    icon: 'Cpu',
    recommendedStyle: 'cyberpunk',
    recommendedLens: 'engineer',
    rawDump: `We have a race condition in the payment webhook handler when two webhooks hit within 4ms of each other. 
Option A: Add a distributed Redis mutex lock with 12 lines of code. But my brain whispers that Redis locks are prone to split-brain edge cases and eventual consistency nightmares. 
Option B: Re-architect the entire ingress pipeline with Apache Kafka, event sourcing, idempotent transaction outbox pattern, and partitioned consumer groups. 
It's 2:15 AM. I have 18 browser tabs open on Raft consensus protocols, distributed transaction deadlocks, and Martin Kleppmann quotes. We process only 120 payments a day. Why am I trying to build NYSE-grade high frequency settlement when my pull request was just supposed to stop a duplicate charge?`
  },
  {
    id: 'founder-launch',
    domain: 'founder',
    title: 'Launch Day Panic Spiral',
    tagline: '48 hours before public launch, Stripe keys missing, imposter syndrome peaking',
    icon: 'Rocket',
    recommendedStyle: 'newspaper',
    recommendedLens: 'satirical',
    rawDump: `We launch on Product Hunt and Twitter in 48 hours. The landing page copy sounds like a buzzword salad written by a corporate robot. 
Stripe webhook works in sandbox but failed on live mode once. The demo video has my dog barking in the background at minute 1:12. 
An investor emailed asking for our "updated 5-year TAM model with moat analysis" and I haven't even figured out if our pricing toggle switches from monthly to yearly properly without refreshing the DOM. 
I have a sticky note list with 38 "urgent" tasks and I've spent the last 45 minutes obsessively tweaking the border-radius on the primary CTA button from 8px to 12px because that's the only thing I can control.`
  },
  {
    id: 'adhd-paralysis',
    domain: 'personal',
    title: 'Executive Dysfunction Impasse',
    tagline: '14 tasks queued, 5 browser windows, brain refuses to start any single one',
    icon: 'BrainCircuit',
    recommendedStyle: 'manga',
    recommendedLens: 'candid',
    rawDump: `I sat down at 9:00 AM with complete determination to finish my tax documents, clean the kitchen counter, reply to my landlord, and write the project RFC. 
It is now 2:40 PM. I have successfully organized my Chrome bookmarks by color, researched the historical breeding lineage of Maine Coon cats, reorganized my desktop icons into a Fibonacci spiral, and eaten half a block of cold cheese over the sink. 
Every time I look at the tax document, a physical weight presses on my chest and my brain screams that opening the PDF will require 8 hours of agony. The guilt of wasting the day is paralyzing me from even taking a 10-minute walk.`
  },
  {
    id: 'tough-conversation',
    domain: 'executive',
    title: 'The Unspoken Dilemma',
    tagline: 'Dreading telling a brilliant collaborator that their feature plan breaks the product',
    icon: 'MessageSquareWarning',
    recommendedStyle: 'minimalist',
    recommendedLens: 'stoic',
    rawDump: `My co-founder spent three weeks coding an elaborate 3D interactive user onboarding world in Three.js. It looks spectacular in isolation, but our target customers are 50+ year old inventory managers on low-bandwidth warehouse tablets with integrated barcode scanners. It takes 14 seconds to load and crashes their Safari tab.
I have a 1-on-1 scheduled in 3 hours. If I tell them honestly, they might feel demoralized and think I don't appreciate their artistry. If I don't tell them, our pilot users will churn on day 1. My stomach has been in knots since yesterday evening, rehearsing 50 different ways to soften the blow without sounding patronizing.`
  }
];
