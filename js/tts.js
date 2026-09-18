/**
 * Mayank CHS Redevelopment Portal - Text-to-Speech (Voice Narration)
 * Uses browser Web Speech API (speechSynthesis) to read front page content aloud.
 */

(function () {
  'use strict';

  // Check Web Speech API support
  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn('Text-to-speech not supported in this browser.');
    return;
  }

  let voices = [];
  let preferredVoice = null;
  let currentSectionIndex = 0;
  let currentSentenceIndex = 0;
  let sentences = [];
  let isPlaying = false;
  let isPaused = false;
  let currentRate = 1.0;
  let sections = [];

  // DOM Elements
  let floatingPlayer, playBtn, stopBtn, speedBtn, statusLabel, sectionLabel, soundWave;
  let navListenBtn, heroListenBtn;

  document.addEventListener('DOMContentLoaded', () => {
    initVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = initVoices;
    }

    initElements();
    setupEventListeners();
  });

  function initVoices() {
    voices = synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer Indian English voice, then British/American, then any English
    preferredVoice =
      voices.find(v => v.lang === 'en-IN') ||
      voices.find(v => v.lang.startsWith('en-IN')) ||
      voices.find(v => v.lang === 'en-GB' && !v.name.includes('Compact')) ||
      voices.find(v => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Online'))) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];
  }

  function initElements() {
    floatingPlayer = document.getElementById('ttsFloatingPlayer');
    playBtn = document.getElementById('ttsPlayPauseBtn');
    stopBtn = document.getElementById('ttsStopBtn');
    speedBtn = document.getElementById('ttsSpeedBtn');
    statusLabel = document.getElementById('ttsStatusText');
    sectionLabel = document.getElementById('ttsSectionTitle');
    soundWave = document.getElementById('ttsSoundWave');

    navListenBtn = document.getElementById('navListenBtn');
    heroListenBtn = document.getElementById('heroListenBtn');
  }

  function setupEventListeners() {
    if (navListenBtn) {
      navListenBtn.addEventListener('click', toggleSpeech);
    }
    if (heroListenBtn) {
      heroListenBtn.addEventListener('click', toggleSpeech);
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
      synth.cancel();
    });
  }

  /**
   * Build clean, naturally read sections from the live DOM content.
   */
  function buildSections() {
    const list = [];

    // 1. Hero / Overview
    const heroEl = document.getElementById('main-content');
    if (heroEl) {
      const title1 = document.querySelector('[data-content="home.hero.titleLine1"]')?.textContent?.trim() || 'Redefining the Skyline of';
      const title2 = document.querySelector('[data-content="home.hero.titleLine2"]')?.textContent?.trim() || 'Airoli';
      const desc = document.getElementById('heroSocietyDescription')?.textContent?.trim() || '';
      const tagline = document.querySelector('[data-content="home.hero.tagline"]')?.textContent?.trim() || '';

      const text = `Welcome to Mayank Co-operative Housing Society redevelopment portal. ${title1} ${title2}. ${desc} ${tagline}`;
      list.push({
        id: 'main-content',
        title: 'Overview',
        element: heroEl,
        text: cleanText(text)
      });
    }

    // 2. About the Project
    const aboutEl = document.getElementById('about');
    if (aboutEl) {
      const p1 = document.querySelector('[data-society-about-1]')?.textContent?.trim() || '';
      const p2 = document.querySelector('[data-society-about-2]')?.textContent?.trim() || '';
      const p3 = document.querySelector('[data-society-about-3]')?.textContent?.trim() || '';

      // Highlights
      let featuresText = '';
      const features = aboutEl.querySelectorAll('.feature');
      features.forEach(f => {
        const title = f.querySelector('h4')?.textContent?.trim() || '';
        const fDesc = f.querySelector('p')?.textContent?.trim() || '';
        if (title) featuresText += ` Key highlight: ${title}. ${fDesc}.`;
      });

      // Herbal Garden
      const gardenTitle = document.querySelector('[data-content="home.herbal.title"]')?.textContent?.trim() || '';
      const gardenDesc = document.querySelector('[data-content="home.herbal.desc"]')?.textContent?.trim() || '';
      const gardenText = gardenTitle ? ` Amenities envisioned include ${gardenTitle}. ${gardenDesc}.` : '';

      const text = `About the Project. Shaping the Future. ${p1} ${p2} ${p3} ${featuresText} ${gardenText}`;
      list.push({
        id: 'about',
        title: 'About the Project',
        element: aboutEl,
        text: cleanText(text)
      });
    }

    // 3. Project Milestones
    const milestonesEl = document.getElementById('milestones');
    if (milestonesEl) {
      let timelineText = 'Project Milestones. A transparent record of how our redevelopment process is progressing. ';
      const items = milestonesEl.querySelectorAll('.tl-item');
      items.forEach(item => {
        const stepTitle = item.querySelector('.tl-top h3')?.textContent?.trim() || '';
        const status = item.querySelector('.tl-status')?.textContent?.trim() || '';
        const date = item.querySelector('.tl-date')?.textContent?.trim() || '';
        let points = [];
        item.querySelectorAll('.tl-points li').forEach(li => {
          points.push(li.textContent.trim());
        });
        timelineText += ` ${stepTitle}, dated ${date}, status ${status}: ${points.join(', ')}.`;
      });

      list.push({
        id: 'milestones',
        title: 'Milestones',
        element: milestonesEl,
        text: cleanText(timelineText)
      });
    }

    // 4. Committee & Governance
    const committeeEl = document.getElementById('committee');
    if (committeeEl) {
      const posterImg = committeeEl.querySelector('.committee-poster img');
      const altText = posterImg?.getAttribute('alt') || 'Managing and Redevelopment Committee members.';
      const text = `Leadership and Governance. ${altText}`;
      list.push({
        id: 'committee',
        title: 'Committee Members',
        element: committeeEl,
        text: cleanText(text)
      });
    }

    // 5. Registered Office
    const officeEl = document.getElementById('office');
    if (officeEl) {
      const address = document.querySelector('[data-society-address]')?.textContent?.trim() || '';
      const regNo = document.querySelector('[data-society-reg]')?.textContent?.trim() || '';
      const classification = document.querySelector('[data-society-classification]')?.textContent?.trim() || '';
      const note = document.querySelector('[data-society-officenote]')?.textContent?.trim() || '';

      const text = `Registered Office. ${note} Society Registered Address: ${address}. Registration Number: ${regNo}. Classification: ${classification}.`;
      list.push({
        id: 'office',
        title: 'Registered Office',
        element: officeEl,
        text: cleanText(text)
      });
    }

    return list;
  }

  function cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/&middot;/g, '·')
      .replace(/&ndash;/g, '-')
      .replace(/&mdash;/g, ', ')
      .replace(/&amp;/g, '&')
      .trim();
  }

  function splitIntoSentences(text) {
    // Split on full stops, colons, or semicolons followed by space or end
    const raw = text.match(/[^.!?:]+[.!?:]+/g) || [text];
    return raw.map(s => s.trim()).filter(s => s.length > 0);
  }

  function startSpeech() {
    synth.cancel();
    sections = buildSections();
    if (sections.length === 0) return;

    currentSectionIndex = 0;
    currentSentenceIndex = 0;
    isPlaying = true;
    isPaused = false;

    showFloatingPlayer();
    updatePlayPauseButton();
    readCurrentSection();
  }

  function readCurrentSection() {
    if (!isPlaying) return;

    if (currentSectionIndex >= sections.length) {
      stopSpeech();
      return;
    }

    const sec = sections[currentSectionIndex];
    sentences = splitIntoSentences(sec.text);
    currentSentenceIndex = 0;

    // Update player UI
    if (sectionLabel) sectionLabel.textContent = sec.title;
    if (statusLabel) statusLabel.textContent = `Reading: ${sec.title}`;

    // Highlight and scroll section smoothly into view
    highlightSection(sec.element);

    speakNextSentence();
  }

  function speakNextSentence() {
    if (!isPlaying || isPaused) return;

    if (currentSentenceIndex >= sentences.length) {
      currentSectionIndex++;
      readCurrentSection();
      return;
    }

    const sentence = sentences[currentSentenceIndex];
    const utterance = new SpeechSynthesisUtterance(sentence);

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = currentRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (isPlaying && !isPaused) {
        currentSentenceIndex++;
        speakNextSentence();
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      if (isPlaying && !isPaused) {
        currentSentenceIndex++;
        speakNextSentence();
      }
    };

    synth.speak(utterance);
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
      synth.resume();
      updatePlayPauseButton();
      if (soundWave) soundWave.classList.add('is-playing');
      if (statusLabel) {
        const sec = sections[currentSectionIndex];
        statusLabel.textContent = `Reading: ${sec ? sec.title : 'Page'}`;
      }
      // If resume fails on some browsers, re-trigger sentence
      if (!synth.speaking) {
        speakNextSentence();
      }
    } else {
      // Pause
      isPaused = true;
      synth.pause();
      updatePlayPauseButton();
      if (soundWave) soundWave.classList.remove('is-playing');
      if (statusLabel) statusLabel.textContent = 'Paused';
    }
  }

  function stopSpeech() {
    synth.cancel();
    isPlaying = false;
    isPaused = false;
    currentSectionIndex = 0;
    currentSentenceIndex = 0;

    removeSectionHighlight();
    hideFloatingPlayer();
    updatePlayPauseButton();

    if (navListenBtn) navListenBtn.classList.remove('active');
    if (heroListenBtn) heroListenBtn.classList.remove('active');
  }

  function cycleSpeed() {
    if (currentRate === 1.0) currentRate = 1.25;
    else if (currentRate === 1.25) currentRate = 1.5;
    else currentRate = 1.0;

    if (speedBtn) speedBtn.textContent = `${currentRate}x`;

    // Restart current sentence with new rate
    if (isPlaying && !isPaused) {
      synth.cancel();
      speakNextSentence();
    }
  }

  function showFloatingPlayer() {
    if (!floatingPlayer) return;
    floatingPlayer.classList.add('is-active');
    floatingPlayer.removeAttribute('aria-hidden');
    if (soundWave) soundWave.classList.add('is-playing');
    if (navListenBtn) navListenBtn.classList.add('active');
    if (heroListenBtn) heroListenBtn.classList.add('active');
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

  // Export global controls if needed
  window.MayankTTS = {
    start: startSpeech,
    pause: togglePlayPause,
    stop: stopSpeech,
    toggle: toggleSpeech
  };

})();
