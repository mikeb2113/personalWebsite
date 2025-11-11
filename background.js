/***** CONFIG *****/
// 1) Set this to your R2 public bucket URL (no trailing slash).
// Example: const BASE_URL = 'https://pub-abcdef1234567890.r2.dev';
const BASE_URL = 'https://pub-8ce35b80e4b0434b97d156702a7cd77b.r2.dev';

// Folder names in your bucket
const MUSIC_DIR  = 'music';
const SOUNDS_DIR = 'sounds';

// Files inside those folders (note the spaces; we’ll URL-encode them)
const musicNameTemplate = 'City Folk %hour%%ampm%.mp3';
const randomEventFile1  = 'Cicada sounds.mp3';
const randomEventFile2  = 'Mole Cricket.mp3';
const sfxCatchingBug    = 'Catching bug.mp3';
const sfxClapping       = 'Clapping.mp3';
const sfxRain           = 'Rain.mp3';

/***** STATE *****/
let CicadaCaught = 0;
let MoleCricketsCaught = 0;

let lastPlayedHour = null;
let isMusicPlaying = false;
let currentAudio = null;
let musicInterval = null;
let randomEventInterval = null;
let rainEventInterval = null;

/***** HELPERS *****/
// Build a safe URL: encodes each path segment (handles spaces)
function cdnUrl(...segments) {
  const safe = segments.map(s => encodeURIComponent(s));
  return `${BASE_URL}/${safe.join('/')}`;
}

// Compute hourly track URL based on current time
function currentHourMusicUrl() {
  const h = getHour(); // 0..23
  const hour12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  const ampm = h < 12 ? 'am' : 'pm';
  const fileName = musicNameTemplate.replace('%hour%', hour12).replace('%ampm%', ampm);
  return cdnUrl(MUSIC_DIR, fileName);
}

/***** CONTROL *****/
function stopMusicAndEvents() {
  if (!isMusicPlaying) return;
  clearInterval(musicInterval);
  clearInterval(randomEventInterval);
  clearInterval(rainEventInterval);
  musicInterval = randomEventInterval = rainEventInterval = null;
  isMusicPlaying = false;

  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}

function playMusicAndEvents() {
  if (isMusicPlaying) return;
  isMusicPlaying = true;

  // Start immediately
  lastPlayedHour = null;
  playAudio(currentHourMusicUrl());

  // Re-check hour once per minute (not every 600ms)
  musicInterval = setInterval(() => {
    const nowHour = getHour();
    if (lastPlayedHour !== nowHour) {
      lastPlayedHour = nowHour;
      playAudio(currentHourMusicUrl());
    }
  }, 60_000);

  // Random one-shot events (cicada / mole cricket)
  randomEventInterval = setInterval(() => {
    triggerRandomEvent();
  }, 60_000);

  // Occasional looping rain (adjust chance as desired)
  rainEventInterval = setInterval(() => {
    const roll = Math.floor(Math.random() * 100);
    if (roll >= 80) handleRainEvent(cdnUrl(SOUNDS_DIR, sfxRain));
  }, 60_000);
}

/***** EVENTS *****/
function triggerRandomEvent() {
  const r = Math.floor(Math.random() * 100);
  if (r < 5) { // ~5%
    handleEvent(cdnUrl(SOUNDS_DIR, randomEventFile1), () => {
      CicadaCaught++;
      playAudio(cdnUrl(SOUNDS_DIR, sfxCatchingBug));
      playAudio(cdnUrl(SOUNDS_DIR, sfxClapping));
    });
  } else if (r < 18) { // ~13%
    handleEvent(cdnUrl(SOUNDS_DIR, randomEventFile2), () => {
      MoleCricketsCaught++;
      playAudio(cdnUrl(SOUNDS_DIR, sfxCatchingBug));
      playAudio(cdnUrl(SOUNDS_DIR, sfxClapping));
    });
  }
}

function handleEvent(fileUrl, callback) {
  const durationMs = (Math.floor(Math.random() * 120) + 60) * 1000; // 60–179s
  playEventSound(fileUrl);
  setTimeout(() => { if (typeof callback === 'function') callback(); }, durationMs);
}

function playEventSound(fileUrl) {
  const a = new Audio(fileUrl);
  a.play().catch(err => console.error('Event playback error:', fileUrl, err));
}

function handleRainEvent(fileUrl) {
  const a = new Audio(fileUrl);
  a.loop = true;
  a.play().catch(err => console.error('Rain playback error:', fileUrl, err));
  // If you need to stop rain later, store `a` globally.
}

/***** CORE AUDIO *****/
function playAudio(fileUrl) {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentAudio = new Audio(fileUrl);
  currentAudio.loop = false;

  currentAudio.play()
    .then(() => {
      console.log('Playing:', fileUrl);
      lastPlayedHour = getHour();
    })
    .catch(err => {
      console.error('Playback error:', fileUrl, err);
      // Most browsers require a user gesture first. Bind playMusicAndEvents to a button click.
    });

  currentAudio.addEventListener('ended', () => {
    // When the track ends, re-evaluate the hour and play the correct next track
    playAudio(currentHourMusicUrl());
  });
}

/***** UTILS *****/
function getHour() {
  return new Date().getHours();
}