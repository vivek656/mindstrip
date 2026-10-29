import { ComicWorld, ComicCharacter, ComicStrip } from '@/types/comic';
import { generateComicStripMock } from './comic-generator';
import { PRESET_SCENARIOS } from './presets';

export const INITIAL_WORLDS: ComicWorld[] = [
  {
    id: 'world-dev-lab',
    title: 'The 2 AM Dev Lab',
    tagline: 'Where one line of code turns into an architectural existential crisis',
    genre: 'Tech Comedy & Engineering',
    artStyle: 'minimalist',
    characters: [
      {
        id: 'char-alex',
        name: 'Alex',
        role: 'protagonist',
        gender: 'male',
        appearance: 'Tired eyes, oversized dark grey hoodie, messy hair, clutching an iced cold brew',
        personality: 'Cynical overthinker, prone to premature optimization',
        catchphrase: 'Maybe we should rewrite the whole backend in Rust...',
        description: 'Lead developer surviving on cold brew and optimism',
        avatarEmoji: '👨‍💻',
        traits: ['Prone to overthinking', 'Tries to rewrite everything', 'Coffee addict']
      },
      {
        id: 'char-goblin',
        name: 'The Microservice Goblin',
        role: 'antagonist',
        gender: 'creature-other',
        appearance: 'Chaotic shadowy goblin with yellow glowing eyes and mischievous grin',
        personality: 'Hyperbolic fearmonger and distributed systems evangelist',
        catchphrase: 'You definitely need a 12-node Kafka cluster for 5 users!',
        description: 'Whispers that a 12-node Kafka cluster is needed for 100 users',
        avatarEmoji: '👾',
        traits: ['Premature optimization', 'Overcomplicates everything']
      },
      {
        id: 'char-maya',
        name: 'Maya',
        role: 'sidekick',
        gender: 'female',
        appearance: 'Crisp denim jacket, stylish glasses, holding a notebook with pragmatic checkmarks',
        personality: 'Level-headed, grounded senior engineer with deadpan humor',
        catchphrase: 'Did you check the logs before rewriting the database?',
        description: 'Pragmatic senior engineer who ships simple code that works',
        avatarEmoji: '👩‍🔬',
        traits: ['Grounded', 'Ship-first mindset', 'Reality anchor']
      }
    ],
    episodes: [
      {
        ...generateComicStripMock(
          PRESET_SCENARIOS[1].rawDump,
          'minimalist',
          'engineer',
          'Meta Muse Spark 2.5'
        ),
        episodeNumber: 1,
        title: 'The 2 AM Refactor Trap'
      }
    ],
    createdAt: '2026-10-28T10:00:00.000Z'
  },
  {
    id: 'world-clinic-care',
    title: 'Clinic & Compass',
    tagline: 'Navigating chronic care, treatment routines, and caregiver resilience with warmth',
    genre: 'Healthcare & Real-Life Drama',
    artStyle: 'newspaper',
    characters: [
      {
        id: 'char-sam',
        name: 'Sam',
        role: 'protagonist',
        gender: 'non-binary',
        appearance: 'Casual flannel shirt, comfortable sneakers, carrying a medical binder covered in color tabs',
        personality: 'Deeply empathetic, hypervigilant, learning to breathe through chaos',
        catchphrase: 'Just need to double-check today\'s lab chart one more time.',
        description: 'Devoted caregiver managing complex clinic routines and fluid balance',
        avatarEmoji: '🩺',
        traits: ['Deeply caring', 'Hypervigilant', 'Learning to breathe']
      },
      {
        id: 'char-metric',
        name: 'The Metric Phantom',
        role: 'antagonist',
        gender: 'creature-other',
        appearance: 'Floating translucent siren shaped like an unstable ECG spike and alarm siren',
        personality: 'Catastrophizes decimal fluctuations into emergencies',
        catchphrase: 'The creatinine went up by 0.05! Sound the alarms!',
        description: 'Magnifies every decimal in lab reports into a panic siren',
        avatarEmoji: '📊',
        traits: ['Anxiety trigger', 'Numbers obsession']
      },
      {
        id: 'char-elena',
        name: 'Mom / Elena',
        role: 'supporting',
        gender: 'female',
        appearance: 'Warm knitted cardigan, reading glasses on a chain, gentle smile and tea mug',
        personality: 'Resilient, wry sense of humor, anchors the family with warmth',
        catchphrase: 'Sit down, drink your tea, the doctors said we\'re fine.',
        description: 'Resilient patient who reminds Sam that life is more than lab charts',
        avatarEmoji: '👵',
        traits: ['Gentle wisdom', 'Humor in adversity']
      }
    ],
    episodes: [
      {
        ...generateComicStripMock(
          PRESET_SCENARIOS[0].rawDump,
          'newspaper',
          'empathetic',
          'Meta Muse Spark 2.5'
        ),
        episodeNumber: 1,
        title: 'The Caregiver’s Compass'
      }
    ],
    createdAt: '2026-10-28T09:00:00.000Z'
  },
  {
    id: 'world-zero-launch',
    title: 'Zero to Launch',
    tagline: '48 hours before public launch, Stripe keys missing, imposter syndrome peaking',
    genre: 'Founder Satire & Indie Hacking',
    artStyle: 'webcomic',
    characters: [
      {
        id: 'char-jordan',
        name: 'Jordan',
        role: 'protagonist',
        gender: 'male',
        appearance: 'Black turtleneck, dual monitor glare on glasses, fidget spinner on desk',
        personality: 'Perfectionist solo founder who avoids talking to users by tweaking CSS',
        catchphrase: 'We can\'t launch yet, the hero button hover shadow is 2px off.',
        description: 'Solo founder tweaking CSS button padding at 3 AM instead of doing sales',
        avatarEmoji: '🚀',
        traits: ['Control illusion', 'Button padding perfectionist']
      },
      {
        id: 'char-specter',
        name: 'The TAM Poltergeist',
        role: 'antagonist',
        gender: 'creature-other',
        appearance: 'Floating spreadsheet specter wielding a pie chart scythe',
        personality: 'Demands Fortune 500 enterprise roadmaps before product-market fit',
        catchphrase: 'What is your defense against Google cloning this next Tuesday?',
        description: 'Demands 5-year financial models before you have user #1',
        avatarEmoji: '👻',
        traits: ['Corporate buzzwords', 'Paralysis by analysis']
      }
    ],
    episodes: [
      {
        ...generateComicStripMock(
          PRESET_SCENARIOS[2].rawDump,
          'webcomic',
          'satirical',
          'Meta Muse Spark 2.5'
        ),
        episodeNumber: 1,
        title: 'The Pre-Launch Panic Orbit'
      }
    ],
    createdAt: '2026-10-28T08:00:00.000Z'
  }
];
