/* BTS ARMY HUB — interactive features */
"use strict";

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const members = {
  rm: { name: "RM", realName: "Kim Namjoon", birthday: "September 12, 1994", image: "images/rm.jpg", bio: "RM is the leader of BTS, known for thoughtful lyrics, leadership and a love of art, books and music." },
  jin: { name: "JIN", realName: "Kim Seokjin", birthday: "December 4, 1992", image: "images/jin.jpg", bio: "Jin is known for his warm personality, powerful vocals, humour and memorable performances." },
  suga: { name: "SUGA", realName: "Min Yoongi", birthday: "March 9, 1993", image: "images/suga.jpg", bio: "SUGA is a rapper, songwriter and producer whose music is known for honesty and emotional depth." },
  jhope: { name: "j-hope", realName: "Jung Hoseok", birthday: "February 18, 1994", image: "images/jhope.jpg", bio: "j-hope is known for energetic dance performances, creative style, rap and bright stage presence." },
  jimin: { name: "JIMIN", realName: "Park Jimin", birthday: "October 13, 1995", image: "images/jimin.jpg", bio: "Jimin is admired for expressive dancing, distinctive vocals and graceful performances." },
  v: { name: "V", realName: "Kim Taehyung", birthday: "December 30, 1995", image: "images/v.jpg", bio: "V is known for his distinctive deep voice, artistic personality and expressive performances." },
  jungkook: { name: "JUNGKOOK", realName: "Jeon Jungkook", birthday: "September 1, 1997", image: "images/jungkook.jpg", bio: "Jungkook is known for versatile vocals, dancing, musical abilities and energetic performances." }
};

const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    menuToggle.textContent = isOpen ? "×" : "☰";
  });
  $$(".nav-links a").forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.textContent = "☰";
  }));
}

let lastFocusedElement = null;
const memberModal = $("#memberModal");
const modalClose = $("#modalClose");
function openMemberProfile(id) {
  const member = members[id];
  if (!member || !memberModal) return;
  lastFocusedElement = document.activeElement;
  $("#modalImage").src = member.image;
  $("#modalImage").alt = member.name;
  $("#modalName").textContent = member.name;
  $("#modalRealName").textContent = member.realName;
  $("#modalBirthday").textContent = member.birthday;
  $("#modalBio").textContent = member.bio;
  memberModal.classList.add("active");
  memberModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalClose?.focus();
}
function closeMemberProfile() {
  if (!memberModal) return;
  memberModal.classList.remove("active");
  memberModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  lastFocusedElement?.focus();
}
$$(".member-card").forEach(card => {
  card.addEventListener("click", event => {
    if (event.target.closest(".favorite-btn")) return;
    openMemberProfile(card.dataset.member);
  });
  card.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") && event.target === card) {
      event.preventDefault();
      openMemberProfile(card.dataset.member);
    }
  });
});
modalClose?.addEventListener("click", closeMemberProfile);
memberModal?.addEventListener("click", event => {
  if (event.target === memberModal) closeMemberProfile();
});

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2400);
}

let favorites = [];
try { favorites = JSON.parse(localStorage.getItem("btsArmyFavorites") || "[]"); } catch { favorites = []; }
function updateFavoriteButtons() {
  $$("[data-favorite]").forEach(button => {
    const id = button.dataset.favorite;
    const active = favorites.includes(id);
    button.classList.toggle("is-favorite", active);
    button.textContent = active ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", `${active ? "Remove" : "Add"} ${members[id].name} ${active ? "from" : "to"} favourites`);
  });
  const hint = $("#favoriteHint");
  if (hint) hint.textContent = favorites.length
    ? `Your saved favourite${favorites.length === 1 ? "" : "s"}: ${favorites.map(id => members[id].name).join(", ")}`
    : "Tap the heart on a card to save your favourite member on this device.";
}
$$("[data-favorite]").forEach(button => button.addEventListener("click", event => {
  event.stopPropagation();
  const id = button.dataset.favorite;
  favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
  try { localStorage.setItem("btsArmyFavorites", JSON.stringify(favorites)); } catch {}
  updateFavoriteButtons();
  showToast(favorites.includes(id) ? `${members[id].name} added to favourites 💜` : `${members[id].name} removed from favourites`);
}));
updateFavoriteButtons();

const musicSearch = $("#musicSearch");
const musicCards = $$(".music-card");
musicSearch?.addEventListener("input", () => {
  const query = musicSearch.value.trim().toLowerCase();
  let visible = 0;
  musicCards.forEach(card => {
    const match = `${card.dataset.title} ${card.dataset.description} ${card.textContent}`.toLowerCase().includes(query);
    card.hidden = !match;
    if (match) visible++;
  });
  $("#musicEmpty").hidden = visible !== 0;
  $("#musicResultCount").textContent = `${visible} ${visible === 1 ? "album" : "albums"}`;
});
$$(".album-details-btn").forEach(button => button.addEventListener("click", () => {
  const card = button.closest(".music-card");
  showToast(`${card.dataset.title}: ${card.dataset.description}`);
}));

const galleryItems = $$(".gallery-item");
const lightbox = $("#lightbox");
const lightboxImage = $("#lightboxImage");
let galleryIndex = 0;
function showGalleryImage(index) {
  if (!galleryItems.length || !lightbox) return;
  galleryIndex = (index + galleryItems.length) % galleryItems.length;
  const image = $("img", galleryItems[galleryIndex]);
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  $("#lightboxCaption").textContent = image.alt;
  $("#lightboxCount").textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
}
function openLightbox(index) {
  showGalleryImage(index);
  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  $("#lightboxClose")?.focus();
}
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}
galleryItems.forEach((item, index) => item.addEventListener("click", () => openLightbox(index)));
$("#lightboxClose")?.addEventListener("click", closeLightbox);
$("#lightboxPrev")?.addEventListener("click", () => showGalleryImage(galleryIndex - 1));
$("#lightboxNext")?.addEventListener("click", () => showGalleryImage(galleryIndex + 1));
lightbox?.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (memberModal?.classList.contains("active")) closeMemberProfile();
    if (lightbox?.classList.contains("active")) closeLightbox();
  }
  if (lightbox?.classList.contains("active")) {
    if (event.key === "ArrowRight") showGalleryImage(galleryIndex + 1);
    if (event.key === "ArrowLeft") showGalleryImage(galleryIndex - 1);
  }
});

// Scroll progress and back-to-top
const progress = $("#readingProgress");
const backToTop = $("#backToTop");
function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${percent}%`;
  backToTop?.classList.toggle("visible", window.scrollY > 450);
}
window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();
backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Small count-up effect when the statistics section enters view.
const counters = $$("[data-count]");
if ("IntersectionObserver" in window && counters.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 20));
      const timer = window.setInterval(() => {
        current = Math.min(target, current + step);
        element.textContent = String(current);
        if (current >= target) window.clearInterval(timer);
      }, 45);
      observer.unobserve(element);
    });
  }, { threshold: 0.5 });
  counters.forEach(counter => observer.observe(counter));
} else {
  counters.forEach(counter => counter.textContent = counter.dataset.count);
}

$("#currentYear").textContent = new Date().getFullYear();

// ARMY Hub interactive extras (all personal data stays in this browser).
const quotes = [
  'You never walk alone. Keep moving at your own pace.',
  'Your story matters. Your voice matters. You matter.',
  'Small steps still move you forward. Keep going.',
  'Let music remind you that you are not alone.',
  'Make today a little more beautiful for yourself.'
];
const quoteEl = $('#dailyQuote');
function dailyQuote() {
  if (!quoteEl) return;
  const day = Math.floor(Date.now() / 86400000);
  quoteEl.textContent = '“' + quotes[day % quotes.length] + '”';
}
dailyQuote();
$('#newQuote')?.addEventListener('click', () => {
  if (!quoteEl) return;
  let next = quotes[Math.floor(Math.random() * quotes.length)];
  if (quoteEl.textContent.includes(next)) next = quotes[(quotes.indexOf(next) + 1) % quotes.length];
  quoteEl.textContent = '“' + next + '”';
});

const quiz = [
  { q: 'Which year did BTS officially debut?', a: ['2013','2015','2017'], correct: '2013', explain: 'BTS debuted on 13 June 2013.' },
  { q: 'What is the name of BTS’s official fandom?', a: ['MOA','ARMY','BLINK'], correct: 'ARMY', explain: 'The official fandom name is ARMY.' },
  { q: 'Which album includes “Black Swan”?', a: ['BE','Map of the Soul: 7','Love Yourself: Tear'], correct: 'Map of the Soul: 7', explain: 'Black Swan appears on Map of the Soul: 7.' },
  { q: 'Who is BTS’s leader?', a: ['Jin','RM','Jimin'], correct: 'RM', explain: 'RM is the leader of BTS.' }
];
let quizIndex = 0, quizScore = 0, quizAnswered = false;
function renderQuiz() {
  const q = quiz[quizIndex];
  if (!$('#quizQuestion')) return;
  $('#quizQuestion').textContent = q.q;
  $('#quizOptions').innerHTML = q.a.map(answer => `<button type="button" data-answer="${answer.replaceAll('&','&amp;').replaceAll('"','&quot;')}">${answer}</button>`).join('');
  $('#quizFeedback').textContent = '';
  $('#quizScore').textContent = `Score: ${quizScore} / ${quiz.length}`;
  quizAnswered = false;
  $$('#quizOptions button').forEach(btn => btn.addEventListener('click', () => {
    if (quizAnswered) return;
    quizAnswered = true;
    const correct = btn.dataset.answer === q.correct;
    if (correct) quizScore++;
    $('#quizFeedback').textContent = `${correct ? 'Correct! 💜' : `Not quite. Correct answer: ${q.correct}.`} ${q.explain}`;
    $('#quizScore').textContent = `Score: ${quizScore} / ${quiz.length}`;
    $$('#quizOptions button').forEach(option => { option.disabled = true; if (option.dataset.answer === q.correct) option.classList.add('correct-answer'); });
  }));
}
renderQuiz();
$('#nextQuestion')?.addEventListener('click', () => {
  if (!quizAnswered) { $('#quizFeedback').textContent = 'Choose an answer first.'; return; }
  if (quizIndex === quiz.length - 1) { showToast(`Quiz complete! Your score: ${quizScore}/${quiz.length} 💜`); quizIndex = 0; quizScore = 0; }
  else quizIndex++;
  renderQuiz();
});

const biasSelect = $('#biasSelect');
try { if (biasSelect) biasSelect.value = localStorage.getItem('btsBias') || ''; } catch {}
function updateBias() { if (!biasSelect || !$('#biasMessage')) return; $('#biasMessage').textContent = biasSelect.value ? `Your bias is ${biasSelect.value}! Borahae 💜` : 'Choose your bias 💜'; }
updateBias();
biasSelect?.addEventListener('change', () => { try { localStorage.setItem('btsBias', biasSelect.value); } catch {} updateBias(); });

$('#voteButton')?.addEventListener('click', () => {
  const choice = $('input[name="era"]:checked');
  if (!choice) { $('#pollResult').textContent = 'Please choose an era before voting.'; return; }
  let votes = {};
  try { votes = JSON.parse(localStorage.getItem('btsEraVotes') || '{}'); } catch {}
  votes[choice.value] = (votes[choice.value] || 0) + 1;
  try { localStorage.setItem('btsEraVotes', JSON.stringify(votes)); } catch {}
  $('#pollResult').textContent = `Your vote for ${choice.value} has been saved on this device. Local votes: ${Object.values(votes).reduce((a,b)=>a+b,0)}. This is not a global poll.`;
});

function renderMemories() {
  const list = $('#memoryList'); if (!list) return;
  let memories = []; try { memories = JSON.parse(localStorage.getItem('btsArmyMemories') || '[]'); } catch {}
  list.replaceChildren();
  memories.slice(-5).reverse().forEach(memory => { const item = document.createElement('p'); item.className = 'memory-entry'; item.textContent = memory; list.append(item); });
}
renderMemories();
$('#saveMemory')?.addEventListener('click', () => {
  const field = $('#memoryInput'), value = field?.value.trim();
  if (!value) { showToast('Write a memory first.'); return; }
  let memories = []; try { memories = JSON.parse(localStorage.getItem('btsArmyMemories') || '[]'); } catch {}
  memories.push(value); try { localStorage.setItem('btsArmyMemories', JSON.stringify(memories.slice(-30))); } catch {}
  field.value = ''; renderMemories(); showToast('Your memory was saved on this device 💜');
});

const themeToggle = $('#themeToggle');
try { if (localStorage.getItem('btsTheme') === 'light') document.body.classList.add('light-theme'); } catch {}
function updateThemeButton() { if (themeToggle) themeToggle.textContent = document.body.classList.contains('light-theme') ? 'Switch to purple theme' : 'Switch to light theme'; }
updateThemeButton();
themeToggle?.addEventListener('click', () => { document.body.classList.toggle('light-theme'); try { localStorage.setItem('btsTheme', document.body.classList.contains('light-theme') ? 'light' : 'purple'); } catch {} updateThemeButton(); });

const countdownDate = $('#countdownDate');
countdownDate?.addEventListener('change', () => {
  const target = new Date(countdownDate.value).getTime();
  if (!Number.isFinite(target) || target <= Date.now()) { $('#countdownOutput').textContent = 'Choose a future date and time.'; return; }
  if (window.armyCountdownTimer) clearInterval(window.armyCountdownTimer);
  const update = () => { const diff = target - Date.now(); if (diff <= 0) { $('#countdownOutput').textContent = 'It is time! 💜'; clearInterval(window.armyCountdownTimer); return; } const days=Math.floor(diff/86400000), hours=Math.floor(diff%86400000/3600000), mins=Math.floor(diff%3600000/60000), secs=Math.floor(diff%60000/1000); $('#countdownOutput').textContent = `${days} days · ${hours} hours · ${mins} min · ${secs} sec`; };
  update(); window.armyCountdownTimer = setInterval(update,1000);
});

$('#siteSearch')?.addEventListener('input', event => {
  const term = event.target.value.trim().toLowerCase();
  const targets = [...$$('.member-card'), ...$$('.music-card'), ...$$('#about, #gallery, #community')];
  const matches = targets.filter(el => el.textContent.toLowerCase().includes(term) || (el.querySelector('img')?.alt || '').toLowerCase().includes(term));
  $('#siteSearchResult').textContent = !term ? 'Search to find matching content.' : `${matches.length} matching item(s) found.`;
  if (term && matches.length) { const first = matches[0]; first.scrollIntoView({behavior:'smooth',block:'center'}); }
});

// RUN BTS archive search and era filter.
const runSearch = $('#runSearch');
const runEra = $('#runEra');
const episodeCards = $$('.episode-card');
function filterEpisodes() {
  const term = (runSearch?.value || '').trim().toLowerCase();
  const era = runEra?.value || 'all';
  let shown = 0;
  episodeCards.forEach(card => {
    const matchesText = `${card.dataset.search || ''} ${card.textContent}`.toLowerCase().includes(term);
    const matchesEra = era === 'all' || card.dataset.era === era;
    card.hidden = !(matchesText && matchesEra);
    if (!card.hidden) shown++;
  });
  const count = $('#runCount');
  if (count) count.textContent = `${shown} ${shown === 1 ? 'episode' : 'highlights'}`;
}
runSearch?.addEventListener('input', filterEpisodes);
runEra?.addEventListener('change', filterEpisodes);

// Replace missing user-supplied member/album images with a graceful local placeholder.
$$('img').forEach(img => {
  img.addEventListener('error', () => {
    if (img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = 'true';
    img.classList.add('image-missing');
    img.alt = `${img.alt || 'BTS image'} — add your image file to the images folder`;
    img.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#392653"/><stop offset="1" stop-color="#171020"/></linearGradient></defs><rect width="600" height="420" fill="url(#g)"/><circle cx="300" cy="160" r="68" fill="none" stroke="#c9a7ff" stroke-opacity=".55" stroke-width="2"/><path d="M260 160h80M300 120v80" stroke="#c9a7ff" stroke-opacity=".55" stroke-width="2"/><text x="300" y="280" text-anchor="middle" fill="#eadcff" font-family="Arial" font-size="25" letter-spacing="5">BORAHAE</text><text x="300" y="315" text-anchor="middle" fill="#c9a7ff" font-family="Arial" font-size="13">ADD YOUR IMAGE HERE</text></svg>`);
  }, { once: true });
  if (img.complete && img.naturalWidth === 0 && img.src) img.dispatchEvent(new Event('error'));
});
