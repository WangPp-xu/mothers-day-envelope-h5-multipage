const $ = (id) => document.getElementById(id);

const bgMusic = $('bgMusic');
const musicBtn = $('musicBtn');
const nameInput = $('nameInput');
const msgInput = $('msgInput');
const fromInput = $('fromInput');
const applyBtn = $('applyBtn');
const makeLinkBtn = $('makeLinkBtn');
const shareBox = $('shareBox');
const shareLink = $('shareLink');
const copyLinkBtn = $('copyLinkBtn');
const copyBlessingBtn = $('copyBlessingBtn');
const restartBtn = $('restartBtn');
const prevBtn = $('prevBtn');
const nextBtn = $('nextBtn');
const startBtn = $('startBtn');
const screenTrack = $('screenTrack');
const pageDots = $('pageDots');
const pageTitle = $('pageTitle');
const toast = $('toast');
const letterPaper = $('letterPaper');
const envelopeWrap = $('envelopeWrap');
const flap = $('flap');
const seal = $('seal');
const openTip = $('openTip');
const letterTo = $('letterTo');
const typeArea = $('typeArea');
const letterFrom = $('letterFrom');
const letterDate = $('letterDate');
const finalTo = $('finalTo');
const finalMessage = $('finalMessage');
const finalFrom = $('finalFrom');
const finalDate = $('finalDate');
const heartLayer = $('heartLayer');
const petalLayer = $('petalLayer');
const confettiLayer = $('confettiLayer');

const params = new URLSearchParams(window.location.search);
const packedParam = params.get('p');
const hasShareParams = params.has('p') || params.has('mode') || params.has('name') || params.has('msg') || params.has('from');
const isShareMode = params.get('mode') === 'share' || hasShareParams;

// 把中文祝福语压缩到一个 p 参数里。
// 这样比 ?name=...&msg=...&from=... 这种中文百分号编码链接短很多。
function encodeShareData(data) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeShareData(value) {
  if (!value) return null;
  try {
    let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    base64 += '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) {
    return null;
  }
}

const defaultName = '妈妈';
const defaultMsg = `母亲节快乐！
谢谢您一直以来的照顾、包容和爱。
愿您每天都开心、健康、平安。
我会一直爱您，也会越来越懂事。`;
const defaultFrom = '爱您的我';

let state = {
  name: defaultName,
  msg: defaultMsg,
  from: defaultFrom,
  date: '',
  activePage: 0,
  opened: false,
  typingTimer: null,
  typingStarted: false
};

const screens = Array.from(document.querySelectorAll('.screen'));
const totalPages = screens.length;

function decodeParam(key, fallback) {
  const value = params.get(key);
  if (!value) return fallback;
  try {
    return decodeURIComponent(value).replace(/\\n/g, '\n');
  } catch (e) {
    return value.replace(/\\n/g, '\n');
  }
}

function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1700);
}

function initState() {
  state.date = formatDate();

  if (isShareMode) {
    document.body.classList.add('share-mode');

    const packed = decodeShareData(packedParam);
    if (packed) {
      state.name = packed.n || defaultName;
      state.msg = packed.m || defaultMsg;
      state.from = packed.f || defaultFrom;
    } else {
      // 兼容旧版长链接：?name=妈妈&msg=祝福语&from=落款
      state.name = decodeParam('name', defaultName);
      state.msg = decodeParam('msg', defaultMsg);
      state.from = decodeParam('from', defaultFrom);
    }
  } else {
    state.name = localStorage.getItem('mom_card_name') || defaultName;
    state.msg = localStorage.getItem('mom_card_msg') || defaultMsg;
    state.from = localStorage.getItem('mom_card_from') || defaultFrom;
  }

  if (nameInput) nameInput.value = state.name;
  if (msgInput) msgInput.value = state.msg;
  if (fromInput) fromInput.value = state.from;

  applyContent();
}

function buildFullText() {
  return `${state.name}，${state.msg}`;
}

function buildShareText() {
  return `${letterTo.textContent}\n${state.msg}\n\n${state.from}\n${state.date}`;
}

function applyContent() {
  if (!isShareMode) {
    state.name = (nameInput.value || defaultName).trim();
    state.msg = (msgInput.value || defaultMsg).trim();
    state.from = (fromInput.value || defaultFrom).trim();
    localStorage.setItem('mom_card_name', state.name);
    localStorage.setItem('mom_card_msg', state.msg);
    localStorage.setItem('mom_card_from', state.from);
  }

  letterTo.textContent = `To 我最亲爱的${state.name}：`;
  typeArea.textContent = '';
  typeArea.classList.remove('done');
  letterFrom.textContent = state.from;
  letterDate.textContent = state.date;

  finalTo.textContent = `To ${state.name}`;
  finalMessage.textContent = buildFullText();
  finalFrom.textContent = state.from;
  finalDate.textContent = state.date;

  state.typingStarted = false;
  if (state.typingTimer) clearInterval(state.typingTimer);
}

function createDots() {
  pageDots.innerHTML = '';
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `跳转到第${i + 1}页`);
    dot.addEventListener('click', () => goToPage(i));
    pageDots.appendChild(dot);
  }
}

function goToPage(index) {
  state.activePage = Math.max(0, Math.min(totalPages - 1, index));
  screenTrack.style.transform = `translateX(-${state.activePage * 20}%)`;

  screens.forEach((screen, i) => screen.classList.toggle('active', i === state.activePage));
  Array.from(pageDots.children).forEach((dot, i) => dot.classList.toggle('active', i === state.activePage));

  const title = screens[state.activePage].dataset.title || '母亲节快乐';
  pageTitle.textContent = title;
  prevBtn.style.visibility = state.activePage === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = state.activePage === totalPages - 1 ? '回到开头' : '下一页';

  if (state.activePage === 3 && state.opened && !state.typingStarted) {
    startTypewriter();
  }

  if (state.activePage === 4) {
    launchConfetti(18);
  }
}

function nextPage() {
  if (state.activePage === totalPages - 1) {
    goToPage(0);
  } else {
    goToPage(state.activePage + 1);
  }
}

function prevPage() {
  goToPage(state.activePage - 1);
}

function openEnvelope() {
  if (state.opened) return;
  state.opened = true;
  envelopeWrap.classList.add('opened');
  letterPaper.classList.add('open');
  flap.classList.add('open');
  seal.classList.add('open');
  openTip.classList.add('open');
  launchConfetti(36);
  startTypewriter();
  tryPlayMusic();
}

function closeEnvelope() {
  state.opened = false;
  envelopeWrap.classList.remove('opened');
  letterPaper.classList.remove('open');
  flap.classList.remove('open');
  seal.classList.remove('open');
  openTip.classList.remove('open');
  typeArea.textContent = '';
  typeArea.classList.remove('done');
  state.typingStarted = false;
  if (state.typingTimer) clearInterval(state.typingTimer);
}

function toggleEnvelope() {
  if (state.opened) {
    closeEnvelope();
  } else {
    openEnvelope();
  }
}

function startTypewriter() {
  if (state.typingStarted) return;
  state.typingStarted = true;
  typeArea.textContent = '';
  typeArea.classList.remove('done');
  const text = state.msg;
  let index = 0;

  if (state.typingTimer) clearInterval(state.typingTimer);
  state.typingTimer = setInterval(() => {
    typeArea.textContent += text[index] || '';
    index += 1;
    if (index >= text.length) {
      clearInterval(state.typingTimer);
      typeArea.classList.add('done');
    }
  }, 55);
}

function tryPlayMusic() {
  if (!bgMusic) return;
  bgMusic.play().then(() => {
    musicBtn.classList.add('playing');
  }).catch(() => {});
}

function toggleMusic() {
  if (!bgMusic) return;
  if (bgMusic.paused) {
    bgMusic.play().then(() => {
      musicBtn.classList.add('playing');
      showToast('音乐已开启');
    }).catch(() => showToast('点击页面后再播放音乐'));
  } else {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
    showToast('音乐已暂停');
  }
}

function makeShareLink() {
  applyContent();
  const url = new URL(window.location.href);
  url.search = '';

  // 新版短链接：把 name/msg/from 打包成一个 p 参数
  const packed = encodeShareData({
    n: state.name,
    m: state.msg,
    f: state.from
  });
  url.searchParams.set('p', packed);

  shareLink.value = url.toString();
  shareBox.style.display = 'block';
  showToast('短版专属链接已生成');
  shareBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function copyText(text, successText) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
  }
  showToast(successText);
}

function copyShareLink() {
  if (!shareLink.value) makeShareLink();
  copyText(shareLink.value, '链接已复制');
}

function copyBlessing() {
  copyText(buildShareText(), '祝福语已复制');
}

function launchConfetti(count = 28) {
  const symbols = ['❤', '♡', '✿', '🌸', '✨', '💗'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.setProperty('--x', `${(Math.random() - 0.5) * 340}px`);
    piece.style.setProperty('--y', `${(Math.random() * 320 + 100) * -1}px`);
    piece.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    piece.style.fontSize = `${14 + Math.random() * 15}px`;
    confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 1700);
  }
}

function createFloatingHeart() {
  const heart = document.createElement('div');
  const icons = ['❤', '♡', '💗', '💕'];
  heart.className = 'heart';
  heart.textContent = icons[Math.floor(Math.random() * icons.length)];
  heart.style.left = `${Math.random() * 100}vw`;
  heart.style.fontSize = `${14 + Math.random() * 18}px`;
  heart.style.animationDuration = `${6 + Math.random() * 5}s`;
  heartLayer.appendChild(heart);
  setTimeout(() => heart.remove(), 12000);
}

function createPetal() {
  const petal = document.createElement('div');
  const icons = ['🌸', '✿', '❀'];
  petal.className = 'petal';
  petal.textContent = icons[Math.floor(Math.random() * icons.length)];
  petal.style.left = `${Math.random() * 100}vw`;
  petal.style.fontSize = `${12 + Math.random() * 14}px`;
  petal.style.animationDuration = `${7 + Math.random() * 6}s`;
  petal.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
  petal.style.setProperty('--spin', `${Math.random() * 520 - 260}deg`);
  petalLayer.appendChild(petal);
  setTimeout(() => petal.remove(), 14000);
}

function bindEvents() {
  if (applyBtn) applyBtn.addEventListener('click', () => {
    applyContent();
    showToast('贺卡已更新');
  });
  if (makeLinkBtn) makeLinkBtn.addEventListener('click', makeShareLink);
  if (copyLinkBtn) copyLinkBtn.addEventListener('click', copyShareLink);
  if (copyBlessingBtn) copyBlessingBtn.addEventListener('click', copyBlessing);
  if (restartBtn) restartBtn.addEventListener('click', () => {
    closeEnvelope();
    goToPage(0);
  });
  if (prevBtn) prevBtn.addEventListener('click', prevPage);
  if (nextBtn) nextBtn.addEventListener('click', nextPage);
  if (startBtn) startBtn.addEventListener('click', () => {
    tryPlayMusic();
    nextPage();
  });
  if (envelopeWrap) envelopeWrap.addEventListener('click', toggleEnvelope);
  if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

  document.body.addEventListener('click', function oncePlay() {
    tryPlayMusic();
    document.body.removeEventListener('click', oncePlay);
  }, { once: true });
}

function init() {
  initState();
  createDots();
  bindEvents();
  goToPage(0);
  shareBox.style.display = 'none';
  setInterval(createFloatingHeart, 850);
  setInterval(createPetal, 1100);
}

init();
