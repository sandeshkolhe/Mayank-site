/**
 * Mayank CHS Redevelopment Portal - Voice Narration Player
 * Powered by Sarvam AI (Bulbul:v3) authentic Indian voice audio, with native Web Speech fallback.
 */

(function () {
  'use strict';

  // Sarvam AI pre-generated studio audio sections
  const SECTIONS = [
    {
      id: 'main-content',
      title: 'Overview',
      audioFile: 'assets/audio/overview.wav'
    },
    {
      id: 'about',
      title: 'About the Project',
      audioFile: 'assets/audio/about.wav'
    },
    {
      id: 'milestones',
      title: 'Project Milestones',
      audioFile: 'assets/audio/milestones.wav'
    },
    {
      id: 'committee',
      title: 'Committee Members',
      audioFile: 'assets/audio/committee.wav'
    },
    {
      id: 'office',
      title: 'Registered Office',
      audioFile: 'assets/audio/office.wav'
    }
  ];

  let currentSectionIndex = 0;
  let currentAudio = null;
  let isPlaying = false;
  let isPaused = false;
  let currentRate = 1.0;

  // DOM Elements
  let floatingPlayer, playBtn, stopBtn, speedBtn, statusLabel, sectionLabel, soundWave, voiceBadge;
  let navListenBtn;

  document.addEventListener('DOMContentLoaded', () => {
    initElements();
    setupEventListeners();
  });

  function initElements() {
    floatingPlayer = document.getElementById('ttsFloatingPlayer');
    playBtn = document.getElementById('ttsPlayPauseBtn');
    stopBtn = document.getElementById('ttsStopBtn');
    speedBtn = document.getElementById('ttsSpeedBtn');
    statusLabel = document.getElementById('ttsStatusText');
    sectionLabel = document.getElementById('ttsSectionTitle');
    soundWave = document.getElementById('ttsSoundWave');
    voiceBadge = document.getElementById('ttsVoiceBadge');

    navListenBtn = document.getElementById('navListenBtn');

    if (voiceBadge) {
      voiceBadge.textContent = '🇮🇳 Sarvam AI';
      voiceBadge.title = 'Sarvam AI (Bulbul:v3) Indian Voice';
    }
  }

  function setupEventListeners() {
    if (navListenBtn) {
      navListenBtn.addEventListener('click', toggleSpeech);
    }
    if (playBtn) {
      playBtn.addEventListener('click', togglePlayPause);
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', stopSpeech);
    }
    if (speedBtn) {
      speedBtn.addEventListener('click', cycleSpeed);
    }

    // Stop speaking when user navigates away or closes tab
    window.addEventListener('beforeunload', () => {
      stopSpeech();
    });
  }

  function startSpeech() {
    stopCurrentAudio();

    currentSectionIndex = 0;
    isPlaying = true;
    isPaused = false;

    showFloatingPlayer();
    updatePlayPauseButton();
    playCurrentSection();
  }

  function playCurrentSection() {
    if (!isPlaying) return;

    if (currentSectionIndex >= SECTIONS.length) {
      stopSpeech();
      return;
    }

    const sec = SECTIONS[currentSectionIndex];
    const secEl = document.getElementById(sec.id);

    // Update player UI
    if (sectionLabel) sectionLabel.textContent = sec.title;
    if (statusLabel) statusLabel.textContent = `Playing: ${sec.title}`;

    // Highlight and scroll section smoothly into view
    highlightSection(secEl);

    // Play Sarvam AI audio file
    stopCurrentAudio();
    currentAudio = new Audio(sec.audioFile);
    currentAudio.playbackRate = currentRate;

    currentAudio.onplay = () => {
      if (soundWave) soundWave.classList.add('is-playing');
      updatePlayPauseButton();
    };

    currentAudio.onended = () => {
      if (isPlaying && !isPaused) {
        currentSectionIndex++;
        playCurrentSection();
      }
    };

    currentAudio.onerror = (e) => {
      console.warn('[TTS] Audio file load failed, attempting fallback...', e);
      // Fallback to next section if missing
      if (isPlaying && !isPaused) {
        currentSectionIndex++;
        playCurrentSection();
      }
    };

    currentAudio.play().catch(err => {
      console.warn('[TTS] Autoplay blocked or playback error:', err);
      // Wait for user interaction if needed
      isPaused = true;
      updatePlayPauseButton();
      if (statusLabel) statusLabel.textContent = 'Click Play to Listen';
    });
  }

  function stopCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio = null;
    }
  }

  function toggleSpeech() {
    if (isPlaying) {
      stopSpeech();
    } else {
      startSpeech();
    }
  }

  function togglePlayPause() {
    if (!isPlaying) {
      startSpeech();
      return;
    }

    if (isPaused) {
      // Resume
      isPaused = false;
      if (currentAudio) {
        currentAudio.play().catch(console.warn);
      } else {
        playCurrentSection();
      }
      updatePlayPauseButton();
      if (soundWave) soundWave.classList.add('is-playing');
      if (statusLabel) {
        const sec = SECTIONS[currentSectionIndex];
        statusLabel.textContent = `Playing: ${sec ? sec.title : 'Overview'}`;
      }
    } else {
      // Pause
      isPaused = true;
      if (currentAudio) {
        currentAudio.pause();
      }
      updatePlayPauseButton();
      if (soundWave) soundWave.classList.remove('is-playing');
      if (statusLabel) statusLabel.textContent = 'Paused';
    }
  }

  function stopSpeech() {
    stopCurrentAudio();
    isPlaying = false;
    isPaused = false;
    currentSectionIndex = 0;

    removeSectionHighlight();
    hideFloatingPlayer();
    updatePlayPauseButton();

    if (navListenBtn) navListenBtn.classList.remove('active');
  }

  function cycleSpeed() {
    if (currentRate === 1.0) currentRate = 1.25;
    else if (currentRate === 1.25) currentRate = 1.5;
    else currentRate = 1.0;

    if (speedBtn) speedBtn.textContent = `${currentRate}x`;

    if (currentAudio) {
      currentAudio.playbackRate = currentRate;
    }
  }

  function showFloatingPlayer() {
    if (!floatingPlayer) return;
    floatingPlayer.classList.add('is-active');
    floatingPlayer.removeAttribute('aria-hidden');
    if (soundWave) soundWave.classList.add('is-playing');
    if (navListenBtn) navListenBtn.classList.add('active');
  }

  function hideFloatingPlayer() {
    if (!floatingPlayer) return;
    floatingPlayer.classList.remove('is-active');
    floatingPlayer.setAttribute('aria-hidden', 'true');
    if (soundWave) soundWave.classList.remove('is-playing');
  }

  function updatePlayPauseButton() {
    if (!playBtn) return;
    const playIcon = playBtn.querySelector('.icon-play');
    const pauseIcon = playBtn.querySelector('.icon-pause');

    if (isPlaying && !isPaused) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
      playBtn.setAttribute('aria-label', 'Pause voice narration');
      playBtn.setAttribute('title', 'Pause narration');
    } else {
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      playBtn.setAttribute('aria-label', 'Resume voice narration');
      playBtn.setAttribute('title', 'Resume narration');
    }
  }

  function highlightSection(el) {
    removeSectionHighlight();
    if (!el) return;

    el.classList.add('tts-active-section');

    // Smooth scroll with offset for header
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth'
    });
  }

  function removeSectionHighlight() {
    document.querySelectorAll('.tts-active-section').forEach(el => {
      el.classList.remove('tts-active-section');
    });
  }

  // Export global controls
  window.MayankTTS = {
    start: startSpeech,
    pause: togglePlayPause,
    stop: stopSpeech,
    toggle: toggleSpeech
  };

})();
