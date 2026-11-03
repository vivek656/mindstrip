const fs = require('fs');
let content = fs.readFileSync('memory.md', 'utf8');
const needle = '- Verified muse-wonder-1.0 for creative dialogue and character voice styling.';
const addition = `
  - Voice Dictation & Multimodal Spoken Brain Dump Engine:
    - Implemented VoiceDictationButton.tsx using browser Web Speech API (webkitSpeechRecognition/SpeechRecognition).
    - Integrated across all core creative entry points: ZenLanding.tsx quick prompt dock, ZenComicReader.tsx Co-Director prompt dock & Writers' Room chat input, and UniverseBuilderStudio.tsx universe launchpad.
    - Features real-time voice-to-text dictation with pulsing recording ripple and seamless transcript appending.
  - Diffusion Safety Vocabulary Sanitization:
    - Updated art-director.ts to eliminate triggers ('submission', 'ankle', 'bare feet') from AI Art Director rewriter guidelines, enforcing safe cinematography vocabulary ('deep respect', 'corporate reverence', 'stiletto resting flat on marble').`;

if (content.includes(needle)) {
  content = content.replace(needle, needle + addition);
  fs.writeFileSync('memory.md', content, 'utf8');
  console.log('Successfully updated memory.md');
} else {
  console.log('Needle not found');
}
