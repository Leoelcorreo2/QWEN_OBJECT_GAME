const Config = {
  STORAGE_KEY: 'objetinos_contrareloj_v2',
  MAX_DEPTH: 4,
  MAX_TRIPLES: 12,
  MAX_POWERUPS: 3,
  POWERUPS_PER_GRANT: 3,
  TUTORIAL_DELAY: 3000,
  TOAST_DURATION: 1700,
  ANIMATION_DURATION: 280,
  COMBO_WINDOW: 3500,
  BASE_TIME: 30,
  TIME_INCREMENT: 5,
  LEVELS_PER_TIME: 3,
  MAX_TIME: 90,
  
  SHOP_PRICES: {
    buyStar: 150,
    powerupRandom: 75,
    powerupBomb: 50,
    powerupShuffle: 100,
    powerupTime: 50
  },
  
  COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3, 3.5, 4],
  
  OBJECT_TYPES: {
    apple:  { emoji:'🍎' },
    milk:   { emoji:'🥛' },
    juice:  { emoji:'🧃' },
    bread:  { emoji:'🍞' },
    can:    { emoji:'🥫' },
    cheese: { emoji:'🧀' },
    banana: { emoji:'🍌' },
    cookie: { emoji:'🍪' },
    cup:    { emoji:'' },
    ball:   { emoji:'' },
    snack:  { emoji:'🍿' }
  },
  
  VISUAL_VARIANTS: [
    {id:'red',    color:'#d64b4b', filter:'none'},
    {id:'blue',   color:'#4f7fc4', filter:'hue-rotate(175deg)'},
    {id:'green',  color:'#5c9b62', filter:'hue-rotate(85deg) saturate(.85)'},
    {id:'gold',   color:'#d49a35', filter:'hue-rotate(330deg) saturate(1.1)'},
    {id:'pink',   color:'#d77ca0', filter:'hue-rotate(300deg) saturate(.9)'},
    {id:'purple', color:'#8964b8', filter:'hue-rotate(250deg) saturate(.9)'},
    {id:'orange', color:'#d47735', filter:'hue-rotate(345deg) saturate(1.05)'},
    {id:'cyan',   color:'#48a6a6', filter:'hue-rotate(150deg) saturate(.9)'}
  ],
  
  THEMES: {
    classic: {
      id:'classic', name:'Clásico', emoji:'🛒',
      bg:'#e7eef0', scene1:'#edf4f5', scene2:'#dfe9eb',
      cabinet:'#eadfce', cabinetBorder:'#cfbda0',
      comp1:'#f6f1e8', comp2:'#ded4c5', compBorder:'#b9a58a',
      header1:'#bd6a4d', header2:'#a8523e',
      unlock: 0
    },
    forest: {
      id:'forest', name:'Bosque', emoji:'🌲',
      bg:'#e8f0e4', scene1:'#eef5e8', scene2:'#d8e8cc',
      cabinet:'#d4e4c8', cabinetBorder:'#a8c090',
      comp1:'#eaf2dc', comp2:'#c8dcb0', compBorder:'#9ab878',
      header1:'#6a9a4a', header2:'#4a7a2a',
      unlock: 10
    },
    space: {
      id:'space', name:'Espacial', emoji:'🚀',
      bg:'#1a1a2e', scene1:'#22223e', scene2:'#16162a',
      cabinet:'#2a2a4a', cabinetBorder:'#4a4a7a',
      comp1:'#34345a', comp2:'#222244', compBorder:'#5a5a8a',
      header1:'#7a5ac0', header2:'#5a3aa0',
      unlock: 25
    },
    sweet: {
      id:'sweet', name:'Dulce', emoji:'🍭',
      bg:'#fce4ec', scene1:'#fde8ef', scene2:'#f8d0dd',
      cabinet:'#f8bbd0', cabinetBorder:'#f48fb1',
      comp1:'#fde0ea', comp2:'#f4a8c0', compBorder:'#ec80a8',
      header1:'#ec407a', header2:'#c2185b',
      unlock: 50
    }
  },
  
  DEPTH_OFFSETS: [
    [0, 0, 1],
    [-7, 0, .97],
    [7, 0, .94],
    [-5, 0, .92]
  ]
};

const Storage = {
  save(data) {
    try {
      localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) { return false; }
  },
  load() {
    try {
      const raw = localStorage.getItem(Config.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },
  clear() {
    try {
      localStorage.removeItem(Config.STORAGE_KEY);
      return true;
    } catch (e) { return false; }
  },
  hasProgress() {
    return this.load() !== null;
  }
};

const Audio = {
  context: null,
  init() {
    if (!this.context) {
      try { this.context = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (this.context?.state === 'suspended') this.context.resume();
  },
  playTone(freq, type = 'sine', duration = 0.1) {
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.context.currentTime);
    gain.gain.setValueAtTime(0.0001, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, this.context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + duration);
  },
  pop() { this.init(); this.playTone(520, 'sine', 0.12); },
  win() {
    this.init();
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.25), i * 90);
    });
  },
  lose() {
    this.init();
    [330, 262, 196].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.25), i * 150);
    });
  },
  tick() { this.init(); this.playTone(880, 'square', 0.05); },
  select() { this.init(); this.playTone(660, 'sine', 0.06); },
  move() { this.init(); this.playTone(440, 'triangle', 0.1); },
  powerup() {
    this.init();
    [660, 880, 1100].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.18), i * 70);
    });
  },
  shuffle() {
    this.init();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => this.playTone(300 + Math.random() * 400, 'sawtooth', 0.04), i * 40);
    }
  },
  timeBonus() {
    this.init();
    this.playTone(440, 'sine', 0.25);
    setTimeout(() => this.playTone(880, 'sine', 0.2), 200);
  },
  bomb() { this.init(); this.playTone(200, 'sawtooth', 0.35); },
  combo(level) { this.init(); this.playTone(400 + level * 80, 'triangle', 0.15); },
  shop() {
    this.init();
    [523.25, 659.25].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.15), i * 80);
    });
  }
};

const UI = {
  elements: {},
  init() {
    this.elements = {
      timer: document.getElementById('timer'),
      score: document.getElementById('score'),
      level: document.getElementById('level'),
      hint: document.getElementById('hint'),
      toast: document.getElementById('toast'),
      comboIndicator: document.getElementById('comboIndicator'),
      tutorialTip: document.getElementById('tutorialTip'),
      levelTimeoutTip: document.getElementById('levelTimeoutTip'),
      winModal: document.getElementById('winModal'),
      winTitle: document.getElementById('winTitle'),
      winSub: document.getElementById('winSub'),
      winStats: document.getElementById('winStats'),
      starsRow: document.getElementById('starsRow'),
      shopModal: document.getElementById('shopModal'),
      shopBalance: document.getElementById('shopBalance'),
      homeScreen: document.getElementById('homeScreen'),
      homeText: document.getElementById('homeText'),
      homeStats: document.getElementById('homeStats'),
      homeButtons: document.getElementById('homeButtons'),
      resetConfirmModal: document.getElementById('resetConfirmModal'),
      pauseModal: document.getElementById('pauseModal'),
      cabinets: document.getElementById('cabinets'),
      exitGameBtn: document.getElementById('exitGameBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      retryLevelBtn: document.getElementById('retryLevelBtn'),
      exitLevelBtn: document.getElementById('exitLevelBtn'),
      nextLevelBtn: document.getElementById('nextLevelBtn'),
      winHomeBtn: document.getElementById('winHomeBtn'),
      shopCloseBtn: document.getElementById('shopCloseBtn'),
      resetConfirmYes: document.getElementById('resetConfirmYes'),
      resetConfirmNo: document.getElementById('resetConfirmNo'),
      resumeBtn: document.getElementById('resumeBtn'),
      pauseHomeBtn: document.getElementById('pauseHomeBtn'),
      titleEmoji: document.getElementById('titleEmoji'),
      homeTitleEmoji: document.getElementById('homeTitleEmoji'),
      powerupsBar: document.getElementById('powerupsBar'),
      particles: document.getElementById('particles')
    };
  },
  showToast(msg, duration = Config.TOAST_DURATION) {
    const { toast } = this.elements;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  },
  updateTimer(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    this.elements.timer.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },
  updateScore(score) { this.elements.score.textContent = score; },
  updateLevel(level) { this.elements.level.textContent = level; },
  updateHint(level) {
    const hints = {
      1: '💡 Junta los 3 objetos iguales. Toca un objeto y después una posición libre.',
      2: ' Busca los 3 objetos iguales y colócalos en posiciones libres.',
      3: '🧩 Los objetos de atrás están sombreados. Solo mueve los de delante.',
      4: '🔎 Cuando una fila queda vacía, aparece la capa siguiente.',
      5: ' Planifica los movimientos. Consigue combos encadenando tríos rápidos 🔥',
      10: '⚠️ Los tríos pueden estar separados. Usa power-ups cuando los consigas 🎁',
      default: '🎯 Observa, planifica y reúne los tríos.'
    };
    const key = Object.keys(hints).find(k => level <= parseInt(k)) || 'default';
    this.elements.hint.textContent = hints[key] || hints.default;
  },
  showTutorial() { this.elements.tutorialTip.classList.add('show'); },
  hideTutorial() { this.elements.tutorialTip.classList.remove('show'); },
  showTimeoutModal() { this.elements.levelTimeoutTip.classList.add('show'); },
  hideTimeoutModal() { this.elements.levelTimeoutTip.classList.remove('show'); },
  showWinModal() { this.elements.winModal.classList.add('show'); },
  hideWinModal() { this.elements.winModal.classList.remove('show'); },
  showShopModal() { this.elements.shopModal.classList.add('show'); },
  hideShopModal() { this.elements.shopModal.classList.remove('show'); },
  showResetModal() { this.elements.resetConfirmModal.classList.add('show'); },
  hideResetModal() { this.elements.resetConfirmModal.classList.remove('show'); },
  showPauseModal() { this.elements.pauseModal.classList.add('show'); },
  hidePauseModal() { this.elements.pauseModal.classList.remove('show'); },
  showHomeScreen(hasProgress, savedLevel, totalStars) {
    const { homeScreen, homeText, homeStats, homeButtons } = this.elements;
    homeText.textContent = hasProgress
      ? `Tienes una partida guardada en el nivel ${savedLevel}.`
      : 'Es tu primera partida. ¡Vamos a empezar!';
    homeStats.innerHTML = hasProgress
      ? `⭐ Estrellas totales: <b>${totalStars}</b><br>📍 Nivel actual: <b>${savedLevel}</b>`
      : `Aún no tienes estrellas. ¡Consigue tus primeras 3! ⭐`;
    homeButtons.innerHTML = '';
    
    const startBtn = document.createElement('button');
    startBtn.textContent = hasProgress ? 'Nueva partida' : 'Comenzar partida';
    startBtn.onclick = () => { if (hasProgress) Game.showResetConfirm(); else Game.startNewGame(); };
    homeButtons.appendChild(startBtn);
    
    if (hasProgress) {
      const contBtn = document.createElement('button');
      contBtn.textContent = 'Continuar partida';
      contBtn.onclick = () => Game.continueGame(savedLevel);
      homeButtons.appendChild(contBtn);
    }
    
    const shopBtn = document.createElement('button');
    shopBtn.textContent = '🏪 Tienda';
    shopBtn.onclick = () => { UI.hideHomeScreen(); Shop.open(); };
    homeButtons.appendChild(shopBtn);
    
    Themes.renderGrid();
    homeScreen.classList.add('show');
  },
  hideHomeScreen() { this.elements.homeScreen.classList.remove('show'); },
  updateComboDisplay(count) {
    const el = this.elements.comboIndicator;
    if (count >= 2) {
      const mult = Config.COMBO_MULTIPLIERS[Math.min(count, Config.COMBO_MULTIPLIERS.length - 1)];
      el.textContent = `🔥 Combo x${mult.toFixed(1)} (${count})`;
      el.classList.add('show', 'big');
      setTimeout(() => el.classList.remove('big'), 450);
    } else {
      el.classList.remove('show', 'big');
    }
  },
  updatePowerupsDisplay(inventory, activeMode) {
    document.querySelectorAll('.powerupBtn').forEach(btn => {
      const type = btn.dataset.powerup;
      const count = inventory[type] || 0;
      const countEl = btn.querySelector('.powerupCount');
      if (countEl) countEl.textContent = count;
      btn.classList.toggle('empty', count <= 0 && activeMode !== type);
      btn.classList.toggle('active', activeMode === type);
    });
  },
  getCompartments() { return [...document.querySelectorAll('.compartment')]; },
  getCells(compartment) { return [...compartment.querySelectorAll('.cell')]; },
  flashCell(cell, color) {
    if (!cell) return;
    cell.style.setProperty('--flash-color', color || '#fff');
    cell.classList.remove('flash');
    void cell.offsetWidth;
    cell.classList.add('flash');
    setTimeout(() => cell.classList.remove('flash'), 500);
  }
};

const Themes = {
  current: 'classic',
  load() {
    try {
      const t = localStorage.getItem(Config.STORAGE_KEY + '_theme');
      return t && Config.THEMES[t] ? t : 'classic';
    } catch (e) { return 'classic'; }
  },
  save() {
    try { localStorage.setItem(Config.STORAGE_KEY + '_theme', this.current); } catch (e) {}
  },
  apply(themeId) {
    const theme = Config.THEMES[themeId];
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--scene-1', theme.scene1);
    root.style.setProperty('--scene-2', theme.scene2);
    root.style.setProperty('--cabinet', theme.cabinet);
    root.style.setProperty('--cabinet-border', theme.cabinetBorder);
    root.style.setProperty('--comp-1', theme.comp1);
    root.style.setProperty('--comp-2', theme.comp2);
    root.style.setProperty('--comp-border', theme.compBorder);
    root.style.setProperty('--header-1', theme.header1);
    root.style.setProperty('--header-2', theme.header2);
    document.body.classList.remove('theme-classic', 'theme-forest', 'theme-space', 'theme-sweet');
    document.body.classList.add('theme-' + themeId);
    this.current = themeId;
    this.save();
    if (UI.elements.titleEmoji) UI.elements.titleEmoji.textContent = theme.emoji;
    if (UI.elements.homeTitleEmoji) UI.elements.homeTitleEmoji.textContent = theme.emoji;
  },
  isUnlocked(themeId) {
    const theme = Config.THEMES[themeId];
    return theme && Game.getTotalStars() >= theme.unlock;
  },
  renderGrid() {
    const grid = document.getElementById('themeGrid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.values(Config.THEMES).forEach(theme => {
      const card = document.createElement('div');
      card.className = 'themeCard';
      const unlocked = this.isUnlocked(theme.id);
      const selected = this.current === theme.id;
      if (!unlocked) card.classList.add('locked');
      if (selected) card.classList.add('selected');
      card.innerHTML = `
        <span class="themeEmoji">${theme.emoji}</span>
        <span class="themeName">${theme.name}</span>
        ${!unlocked ? `<span class="themeLock">🔒</span><span class="themeReq">${theme.unlock} ⭐</span>` : ''}
      `;
      card.addEventListener('click', () => {
        if (!unlocked) {
          UI.showToast(`Necesitas ${theme.unlock} ⭐ para desbloquear ${theme.name}`);
          return;
        }
        this.apply(theme.id);
        this.renderGrid();
        Audio.select();
      });
      grid.appendChild(card);
    });
  }
};

class GameObject {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.element = null;
    this.slot = 0;
    this.compartment = null;
    this.depth = 0;
    this.trioKey = '';
    this.variant = null;
  }
}

class Layer {
  constructor() { this.slots = [null, null, null]; }
  get count() { return this.slots.filter(Boolean).length; }
  isEmpty() { return this.count === 0; }
  isFull() { return this.count === 3; }
  hasObjectAt(slot) { return !!this.slots[slot]; }
  addTo(slot, obj) {
    if (slot < 0 || slot > 2 || this.slots[slot]) return false;
    this.slots[slot] = obj;
    return true;
  }
  removeFrom(slot) {
    const obj = this.slots[slot];
    this.slots[slot] = null;
    return obj;
  }
  objects() { return this.slots.filter(Boolean); }
}

class Compartment {
  constructor(element) {
    this.element = element;
    this.layers = [];
  }
  ensureLayer(index) {
    while (this.layers.length <= index) this.layers.push(new Layer());
    return this.layers[index];
  }
  activeLayer() {
    while (this.layers.length && this.layers[0].isEmpty()) this.layers.shift();
    return this.layers[0] || null;
  }
  allObjects() { return this.layers.flatMap(layer => layer.objects()); }
}

const Combos = {
  count: 0,
  timer: null,
  register() {
    this.count++;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.count = 0; UI.updateComboDisplay(0); }, Config.COMBO_WINDOW);
    UI.updateComboDisplay(this.count);
    if (this.count >= 2) Audio.combo(this.count);
  },
  reset() {
    this.count = 0;
    clearTimeout(this.timer);
    UI.updateComboDisplay(0);
  },
  getMultiplier() {
    return Config.COMBO_MULTIPLIERS[Math.min(this.count, Config.COMBO_MULTIPLIERS.length - 1)];
  }
};

const Particles = {
  spawn(x, y, color, count = 24) {
    const container = UI.elements.particles;
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const dist = 55 + Math.random() * 95;
      p.style.cssText = `left:${x}px;top:${y}px;width:${9 + Math.random() * 11}px;height:${9 + Math.random() * 11}px;background:${color};color:${color};--px:${Math.cos(angle) * dist}px;--py:${Math.sin(angle) * dist - 25}px;--rot:${(Math.random() * 720 - 360)}deg;animation-duration:${0.7 + Math.random() * 0.4}s`;
      container.appendChild(p);
      setTimeout(() => p.remove(), 1100);
    }
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span');
      s.className = 'particle spark';
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 70;
      s.style.cssText = `left:${x}px;top:${y}px;width:${4 + Math.random() * 5}px;height:${4 + Math.random() * 5}px;background:#fff;color:${color};--px:${Math.cos(angle) * dist}px;--py:${Math.sin(angle) * dist - 15}px`;
      container.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  }
};

const PowerUps = {
  inventory: { bomb: 0, shuffle: 0, time: 0 },
  activeMode: null,
  load() {
    try {
      const raw = localStorage.getItem(Config.STORAGE_KEY + '_powerups');
      if (!raw) return { bomb: 0, shuffle: 0, time: 0 };
      const p = JSON.parse(raw);
      return {
        bomb: Number.isFinite(p.bomb) ? p.bomb : 0,
        shuffle: Number.isFinite(p.shuffle) ? p.shuffle : 0,
        time: Number.isFinite(p.time) ? p.time : 0
      };
    } catch (e) { return { bomb: 0, shuffle: 0, time: 0 }; }
  },
  save() {
    try { localStorage.setItem(Config.STORAGE_KEY + '_powerups', JSON.stringify(this.inventory)); } catch (e) {}
  },
  grantRandom() {
    const types = ['bomb', 'shuffle', 'time'];
    const type = (Game.state.timeLeft <= 10 && this.inventory.time < Config.MAX_POWERUPS) ? 'time' : types[Math.floor(Math.random() * types.length)];
    if (this.inventory[type] < Config.MAX_POWERUPS) {
      this.inventory[type]++;
      this.save();
      UI.updatePowerupsDisplay(this.inventory, this.activeMode);
      const meta = { bomb: { emoji: '💣', name: 'Bomba' }, shuffle: { emoji: '🔀', name: 'Mezclar' }, time: { emoji: '⏱️', name: '+15s' } }[type];
      UI.showToast(`🎁 +1 ${meta.emoji} ${meta.name}`);
      Audio.powerup();
    }
  },
  activate(type) {
    if (this.inventory[type] <= 0) return;
    if (type === 'bomb') {
      this.activeMode = this.activeMode === 'bomb' ? null : 'bomb';
      document.body.classList.toggle('bombMode', this.activeMode === 'bomb');
      UI.updatePowerupsDisplay(this.inventory, this.activeMode);
      UI.showToast(this.activeMode === 'bomb' ? '💣 Toca un objeto' : 'Modo bomba cancelado');
      Audio.select();
    } else if (type === 'shuffle') {
      this.inventory.shuffle--;
      this.save();
      Game.shuffleAllFrontObjects();
      UI.updatePowerupsDisplay(this.inventory, this.activeMode);
      UI.showToast('🔀 ¡Objetos mezclados!');
      Audio.shuffle();
    } else if (type === 'time') {
      this.inventory.time--;
      this.save();
      Game.state.timeLeft = Math.min(99, Game.state.timeLeft + 15);
      UI.updateTimer(Game.state.timeLeft);
      UI.updatePowerupsDisplay(this.inventory, this.activeMode);
      UI.showToast('⏱️ +15 segundos');
      Audio.timeBonus();
    }
  },
  useBomb(object) {
    if (this.activeMode !== 'bomb' || !object?.element || !object.element.classList.contains('front')) return false;
    const targetKey = object.trioKey;
    this.activeMode = null;
    this.inventory.bomb--;
    this.save();
    document.body.classList.remove('bombMode');
    Game.state.locked = true;
    let count = 0;
    const color = object.element.style.getPropertyValue('--c') || '#f5c64f';
    Game.compartments.forEach(comp => {
      comp.layers.forEach(layer => {
        layer.slots.forEach((obj, slot) => {
          if (obj && obj.trioKey === targetKey) {
            const cells = UI.getCells(comp.element);
            const cell = cells[slot];
            if (cell) {
              const rect = cell.getBoundingClientRect();
              Particles.spawn(rect.left + rect.width/2, rect.top + rect.height/2, color, 20);
              UI.flashCell(cell, color);
            }
            if (obj.element) obj.element.classList.add('removing');
            layer.slots[slot] = null;
            count++;
          }
        });
      });
    });
    Audio.bomb();
    setTimeout(() => {
      const mult = Combos.getMultiplier();
      Game.state.score += Math.round(count * 50 * mult);
      UI.updateScore(Game.state.score);
      Combos.register();
      Game.normalizeLayers();
      Game.renderAll();
      Game.state.locked = false;
      UI.updatePowerupsDisplay(this.inventory, this.activeMode);
      if (Game.countObjects() === 0) Game.handleLevelComplete();
      else Game.compartments.forEach(comp => Game.checkCompartment(comp));
    }, 300);
    return true;
  }
};

const Shop = {
  open() {
    const totalStars = Game.getTotalStars();
    UI.elements.shopBalance.innerHTML = `⭐ Estrellas disponibles: <b>${totalStars}</b><br>💰 Monedas disponibles: <b>${Game.state.score}</b>`;
    UI.showShopModal();
    this.updateButtons();
  },
  updateButtons() {
    document.querySelectorAll('.shopItemPrice').forEach(btn => {
      const buyAction = btn.dataset.buy;
      let canAfford = true;
      if (buyAction === 'star1') canAfford = Game.state.score >= Config.SHOP_PRICES.buyStar;
      else if (buyAction === 'powerupRandom') canAfford = Game.state.score >= Config.SHOP_PRICES.powerupRandom;
      else if (buyAction === 'powerupBomb') canAfford = Game.state.score >= Config.SHOP_PRICES.powerupBomb;
      else if (buyAction === 'powerupShuffle') canAfford = Game.state.score >= Config.SHOP_PRICES.powerupShuffle;
      else if (buyAction === 'powerupTime') canAfford = Game.state.score >= Config.SHOP_PRICES.powerupTime;
      btn.disabled = !canAfford;
    });
  },
  buyStars(count) {
    const cost = count * Config.SHOP_PRICES.buyStar;
    if (Game.state.score < cost) { UI.showToast('No tienes suficientes monedas'); return; }
    const map = Game.loadStars();
    let added = 0, level = 1;
    while (added < count) {
      if (!map[level]) map[level] = 0;
      if (map[level] < 3) { map[level]++; added++; }
      level++;
    }
    Game.saveStars(map);
    Game.state.score -= cost;
    UI.updateScore(Game.state.score);
    Game.saveProgress();
    Audio.shop();
    UI.showToast(`Compradas ${count}⭐ por ${cost}💰`);
    this.open();
  },
  buyPowerup(type) {
    const prices = { random: Config.SHOP_PRICES.powerupRandom, bomb: Config.SHOP_PRICES.powerupBomb, shuffle: Config.SHOP_PRICES.powerupShuffle, time: Config.SHOP_PRICES.powerupTime };
    const cost = prices[type];
    if (Game.state.score < cost) { UI.showToast('No tienes suficientes monedas'); return; }
    if (type === 'random') {
      const types = ['bomb', 'shuffle', 'time'];
      const chosen = types[Math.floor(Math.random() * types.length)];
      if (PowerUps.inventory[chosen] < Config.MAX_POWERUPS) {
        PowerUps.inventory[chosen]++;
        PowerUps.save();
        UI.updatePowerupsDisplay(PowerUps.inventory, PowerUps.activeMode);
        Game.state.score -= cost;
        UI.updateScore(Game.state.score);
        Game.saveProgress();
        Audio.shop();
        UI.showToast(`Comprado ${{ bomb: '💣', shuffle: '', time: '⏱️' }[chosen]}`);
        this.open();
      } else UI.showToast('Power-up al máximo');
    } else {
      if (PowerUps.inventory[type] < Config.MAX_POWERUPS) {
        PowerUps.inventory[type]++;
        PowerUps.save();
        UI.updatePowerupsDisplay(PowerUps.inventory, PowerUps.activeMode);
        Game.state.score -= cost;
        UI.updateScore(Game.state.score);
        Game.saveProgress();
        Audio.shop();
        UI.showToast(`Comprado ${{ bomb: '💣', shuffle: '🔀', time: '⏱️' }[type]}`);
        this.open();
      } else UI.showToast('Power-up al máximo');
    }
  }
};

const Game = {
  state: {
    score: 0, level: 1, timeLeft: 0, selected: null,
    dragging: false, dragStartX: 0, dragStartY: 0, dragPointerId: null,
    nextId: 1, locked: false, tutorialShown: false,
    levelConfig: null, timer: null, tutorialTimer: null, triplesCompleted: 0,
    paused: false
  },
  compartments: [],
  init() {
    UI.init();
    this.bindEvents();
    Themes.current = Themes.load();
    Themes.apply(Themes.current);
    PowerUps.inventory = PowerUps.load();
    UI.updatePowerupsDisplay(PowerUps.inventory, PowerUps.activeMode);
    UI.showHomeScreen(Storage.hasProgress(), this.getSavedLevel(), this.getTotalStars());
  },
  bindEvents() {
    UI.elements.exitGameBtn.addEventListener('click', () => this.exitToHome());
    UI.elements.pauseBtn.addEventListener('click', () => this.togglePause());
    UI.elements.resumeBtn.addEventListener('click', () => this.togglePause());
    UI.elements.pauseHomeBtn.addEventListener('click', () => { UI.hidePauseModal(); this.exitToHome(); });
    UI.elements.retryLevelBtn.addEventListener('click', (e) => { e.stopPropagation(); this.restartLevel(); });
    UI.elements.exitLevelBtn.addEventListener('click', (e) => { e.stopPropagation(); this.exitToHome(); });
    UI.elements.nextLevelBtn.addEventListener('click', () => { UI.hideWinModal(); this.state.locked = false; this.nextLevel(); });
    UI.elements.winHomeBtn.addEventListener('click', () => { UI.hideWinModal(); this.state.locked = false; this.exitToHome(); });
    UI.elements.shopCloseBtn.addEventListener('click', () => UI.hideShopModal());
    UI.elements.resetConfirmYes.addEventListener('click', () => { UI.hideResetModal(); this.performFullReset(); });
    UI.elements.resetConfirmNo.addEventListener('click', () => UI.hideResetModal());
    document.querySelectorAll('.powerupBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const type = btn.dataset.powerup;
        if (PowerUps.inventory[type] <= 0 && PowerUps.activeMode !== type) return;
        PowerUps.activate(type);
      });
    });
    document.querySelectorAll('.shopItemPrice').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const buy = btn.dataset.buy;
        if (buy === 'star1') Shop.buyStars(1);
        else if (buy === 'powerupRandom') Shop.buyPowerup('random');
        else if (buy === 'powerupBomb') Shop.buyPowerup('bomb');
        else if (buy === 'powerupShuffle') Shop.buyPowerup('shuffle');
        else if (buy === 'powerupTime') Shop.buyPowerup('time');
      });
    });
    document.addEventListener('click', (e) => this.handleClick(e));
    document.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    document.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    document.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    document.addEventListener('pointerdown', () => {
      if (this.state.level === 1 && !this.state.tutorialShown) { UI.hideTutorial(); this.state.tutorialShown = true; }
    }, true);
  },
  togglePause() {
    if (this.state.locked) return;
    this.state.paused = !this.state.paused;
    if (this.state.paused) {
      this.stopTimer();
      document.querySelector('header').classList.add('paused');
      document.getElementById('scene').classList.add('paused');
      UI.showPauseModal();
    } else {
      this.startTimer();
      document.querySelector('header').classList.remove('paused');
      document.getElementById('scene').classList.remove('paused');
      UI.hidePauseModal();
    }
  },
  startNewGame() { Storage.clear(); UI.hideHomeScreen(); this.resetState(); this.loadLevel(1); },
  continueGame(level) {
    UI.hideHomeScreen();
    this.resetState();
    PowerUps.inventory = PowerUps.load();
    UI.updatePowerupsDisplay(PowerUps.inventory, PowerUps.activeMode);
    this.loadLevel(level);
  },
  exitToHome() {
    this.saveProgress();
    PowerUps.save();
    this.stopTimer();
    UI.showHomeScreen(Storage.hasProgress(), this.getSavedLevel(), this.getTotalStars());
    UI.hideTimeoutModal(); UI.hideWinModal(); UI.hideTutorial(); UI.hidePauseModal();
    Combos.reset();
  },
  showResetConfirm() { UI.showResetModal(); },
  performFullReset() {
    Storage.clear();
    UI.hideHomeScreen();
    this.state.score = 0;
    UI.updateScore(0);
    PowerUps.inventory = { bomb: 0, shuffle: 0, time: 0 };
    PowerUps.activeMode = null;
    PowerUps.save();
    UI.updatePowerupsDisplay(PowerUps.inventory, PowerUps.activeMode);
    this.loadLevel(1);
    UI.showToast('🔄 Partida reiniciada');
  },
  restartLevel() {
    this.stopTimer();
    UI.hideTimeoutModal(); UI.hideTutorial();
    this.state.triplesCompleted = 0;
    this.state.levelTimedOut = false;
    PowerUps.activeMode = null;
    document.body.classList.remove('bombMode');
    UI.updatePowerupsDisplay(PowerUps.inventory, PowerUps.activeMode);
    Combos.reset();
    this.updateHint();
    this.loadLevel(this.state.level);
  },
  resetState() {
    this.state = {
      score: 0, level: 1, timeLeft: 0, selected: null,
      dragging: false, dragStartX: 0, dragStartY: 0, dragPointerId: null,
      nextId: 1, locked: false, tutorialShown: false,
      levelConfig: null, timer: null, tutorialTimer: null, triplesCompleted: 0,
      paused: false
    };
    this.compartments = [];
  },
  saveProgress() { Storage.save({ level: this.state.level, score: this.state.score }); },
  loadStars() {
    try { const raw = localStorage.getItem(Config.STORAGE_KEY + '_stars'); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
  },
  saveStars(map) { try { localStorage.setItem(Config.STORAGE_KEY + '_stars', JSON.stringify(map)); } catch (e) {} },
  getTotalStars() {
    const map = this.loadStars();
    let total = 0;
    for (const k in map) total += (map[k] || 0);
    return total;
  },
  getSavedLevel() { const data = Storage.load(); return data?.level || 1; },
  loadLevel(level) {
    this.state.level = level;
    UI.updateLevel(level);
    this.updateHint();
    this.saveProgress();
    this.clearBoard();
    this.compartments = UI.getCompartments().map(el => new Compartment(el));
    this.state.levelConfig = this.generateLevel(level);
    this.startTimer();
    UI.showToast(`Nivel ${level}`);
    if (level === 1) this.showTutorialDelayed();
  },
  nextLevel() { this.stopTimer(); setTimeout(() => this.loadLevel(this.state.level + 1), 1000); },
  clearBoard() {
    this.state.selected = null;
    this.compartments = [];
    UI.getCompartments().forEach(comp => { comp.querySelectorAll('.obj').forEach(obj => obj.remove()); });
  },
  generateLevel(level) {
    const triples = Math.max(1, Math.min(Config.MAX_TRIPLES, Math.ceil(level / 2)));
    const maxDepth = level < 4 ? 1 : Math.min(Config.MAX_DEPTH, 1 + Math.floor((level - 3) / 2));
    const config = { level, triples, maxDepth, tutorial: level === 1 };
    const trios = this.createTrioDefinitions(triples);
    if (level === 1) {
      const t = trios[0];
      this.addObject(this.compartments[0], 0, 0, t.type, t.variant);
      this.addObject(this.compartments[0], 1, 0, t.type, t.variant);
      this.addObject(this.compartments[1], 0, 0, t.type, t.variant);
      return config;
    }
    const positions = this.getAllPositions();
    const shuffled = this.shuffleArray([...positions]);
    let cursor = 0;
    for (const trio of trios) {
      for (let k = 0; k < 3; k++) {
        if (cursor >= shuffled.length) throw new Error("No hay suficientes posiciones");
        const pos = shuffled[cursor++];
        this.addObject(pos.comp, pos.slot, 0, trio.type, trio.variant);
      }
    }
    if (maxDepth > 1) this.addDepth(maxDepth, level);
    return config;
  },
  createTrioDefinitions(count) {
    const defs = [], usedKeys = new Set(), types = Object.keys(Config.OBJECT_TYPES);
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const variants = this.shuffleArray([...Config.VISUAL_VARIANTS]);
      let variant = variants.find(v => !usedKeys.has(`${type}::${v.id}`));
      if (!variant) {
        const n = i + 1;
        variant = { id: `generated-${type}-${n}`, color: `hsl(${(n*67)%360} 72% 52%)`, filter: `hue-rotate(${(n*67)%360}deg)` };
      }
      const key = `${type}::${variant.id}`;
      if (usedKeys.has(key)) { i--; continue; }
      usedKeys.add(key);
      defs.push({ type, variant, key });
    }
    return defs;
  },
  addObject(compartment, slot, depth, type, variant) {
    const layer = compartment.ensureLayer(depth);
    if (layer.hasObjectAt(slot)) return false;
    const obj = new GameObject(this.state.nextId++, type);
    obj.variant = variant;
    obj.trioKey = `${type}::${variant.id}`;
    obj.depth = depth;
    obj.slot = slot;
    obj.compartment = compartment;
    const info = Config.OBJECT_TYPES[type] || { emoji: '❓' };
    const el = document.createElement('button');
    el.className = 'obj front';
    el.dataset.pos = String(slot);
    el.dataset.depth = String(depth);
    el.dataset.type = type;
    el.dataset.variant = variant?.id || 'default';
    el.dataset.trioKey = obj.trioKey;
    el.style.setProperty('--c', variant?.color || '#d64b4b');
    el.style.setProperty('--bottom', '4px');
    el.style.setProperty('--scale', '1');
    el.style.setProperty('--z', String(40 - depth));
    el.style.setProperty('--variant-filter', variant?.filter || 'none');
    el.innerHTML = `${info.emoji}<small>${type}</small>`;
    obj.element = el;
    el.__gameObject = obj;
    const cell = UI.getCells(compartment.element)[slot];
    cell.appendChild(el);
    layer.addTo(slot, obj);
    return true;
  },
  addDepth(maxDepth, level) {
    const candidates = [];
    this.compartments.forEach(comp => {
      const front = comp.layers[0];
      if (!front) return;
      for (let slot = 0; slot < 3; slot++) {
        if (front.slots[slot]) candidates.push({ comp, slot, object: front.slots[slot] });
      }
    });
    this.shuffleArray(candidates);
    const moveCount = Math.min(Math.floor((level - 3) * 1.5), candidates.length);
    for (let i = 0; i < moveCount; i++) {
      const { comp, slot, object } = candidates[i];
      const target = comp.ensureLayer(1);
      if (!target.hasObjectAt(slot)) {
        comp.layers[0].removeFrom(slot);
        target.addTo(slot, object);
        object.depth = 1;
      }
    }
  },
  getAllPositions() {
    const positions = [];
    this.compartments.forEach((comp, ci) => {
      for (let slot = 0; slot < 3; slot++) positions.push({ comp, slot, ci, depth: 0 });
    });
    return positions;
  },
  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
  startTimer() {
    this.stopTimer();
    const baseTime = Config.BASE_TIME;
    const increment = Math.floor((this.state.level - 1) / Config.LEVELS_PER_TIME) * Config.TIME_INCREMENT;
    this.state.timeLeft = Math.min(Config.MAX_TIME, baseTime + increment);
    UI.updateTimer(this.state.timeLeft);
    this.state.timer = setInterval(() => {
      if (this.state.locked || this.state.paused) return;
      this.state.timeLeft--;
      UI.updateTimer(this.state.timeLeft);
      if (this.state.timeLeft <= 10) {
        UI.elements.timer.classList.add('urgent');
        document.querySelector('header').classList.add('urgent');
        if (this.state.timeLeft <= 5) Audio.tick();
      } else {
        UI.elements.timer.classList.remove('urgent');
        document.querySelector('header').classList.remove('urgent');
      }
      if (this.state.timeLeft <= 0) this.handleTimeout();
    }, 1000);
  },
  stopTimer() {
    if (this.state.timer) { clearInterval(this.state.timer); this.state.timer = null; }
    UI.elements.timer?.classList.remove('urgent');
    document.querySelector('header')?.classList.remove('urgent');
  },
  handleTimeout() {
    this.stopTimer();
    this.state.locked = true;
    this.saveProgress();
    UI.showTimeoutModal();
    UI.showToast(`⏱️ Tiempo agotado en el nivel ${this.state.level}`);
    Audio.lose();
  },
  showTutorialDelayed() {
    this.state.tutorialTimer = setTimeout(() => {
      if (this.state.level === 1 && !this.state.tutorialShown && this.countObjects() === 3) UI.showTutorial();
    }, Config.TUTORIAL_DELAY);
  },
  updateHint() { UI.updateHint(this.state.level); },
  handleClick(e) {
    if (this.state.locked || this.state.dragging || this.state.paused) return;
    const objEl = e.target.closest('.obj');
    const cell = e.target.closest('.cell');
    if (PowerUps.activeMode === 'bomb' && objEl) {
      const obj = objEl.__gameObject;
      if (obj?.element.classList.contains('front')) { PowerUps.useBomb(obj); return; }
    }
    if (objEl) {
      const obj = objEl.__gameObject;
      if (obj?.element.classList.contains('front')) { this.selectObject(obj); return; }
    }
    if (this.state.selected && cell) {
      const dest = this.getDestinationFromCell(cell);
      if (dest && this.moveObject(this.state.selected, dest.compartment, dest.slot)) this.clearSelection();
    }
  },
  handlePointerDown(e) {
    if (this.state.locked || PowerUps.activeMode === 'bomb' || this.state.paused) return;
    const objEl = e.target.closest('.obj.front');
    if (!objEl) return;
    const obj = objEl.__gameObject;
    if (!obj) return;
    this.state.selected = obj;
    this.state.dragging = true;
    this.state.dragPointerId = e.pointerId;
    this.state.dragStartX = e.clientX;
    this.state.dragStartY = e.clientY;
    obj.element.classList.add('selected', 'dragging');
    obj.element.style.pointerEvents = 'none';
    obj.element.style.setProperty('--drag-x', '0px');
    obj.element.style.setProperty('--drag-y', '0px');
    try { objEl.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  },
  handlePointerMove(e) {
    if (!this.state.dragging || !this.state.selected) return;
    if (this.state.dragPointerId !== null && e.pointerId !== this.state.dragPointerId) return;
    const dx = e.clientX - this.state.dragStartX;
    const dy = e.clientY - this.state.dragStartY;
    this.state.selected.element.style.setProperty('--drag-x', `${dx}px`);
    this.state.selected.element.style.setProperty('--drag-y', `${dy}px`);
    e.preventDefault();
  },
  handlePointerUp(e) {
    if (!this.state.dragging || !this.state.selected) return;
    if (this.state.dragPointerId !== null && e.pointerId !== this.state.dragPointerId) return;
    const obj = this.state.selected;
    const objEl = obj.element;
    this.state.dragging = false;
    this.state.dragPointerId = null;
    const underPointer = document.elementsFromPoint ? document.elementsFromPoint(e.clientX, e.clientY) : [document.elementFromPoint(e.clientX, e.clientY)].filter(Boolean);
    const cell = underPointer.find(el => el.classList?.contains('cell')) || null;
    let moved = false;
    if (cell) {
      const dest = this.getDestinationFromCell(cell);
      if (dest) moved = this.moveObject(obj, dest.compartment, dest.slot);
    }
    if (moved) {
      objEl.style.setProperty('--drag-x', '0px');
      objEl.style.setProperty('--drag-y', '0px');
      Audio.pop();
      this.clearSelection();
      return;
    }
    objEl.style.pointerEvents = 'auto';
    objEl.classList.remove('dragging', 'selected');
    objEl.classList.add('returning');
    objEl.style.setProperty('--drag-x', '0px');
    objEl.style.setProperty('--drag-y', '0px');
    setTimeout(() => {
      objEl.classList.remove('returning');
      if (this.state.selected === obj) this.state.selected = null;
    }, 230);
  },
  selectObject(obj) {
    if (!obj?.element || !obj.element.classList.contains('front')) return;
    if (this.state.selected === obj) { this.clearSelection(); return; }
    if (this.state.selected?.element) this.state.selected.element.classList.remove('selected');
    this.state.selected = obj;
    obj.element.classList.add('selected');
    Audio.select();
    UI.showToast('Ahora toca una posición libre');
  },
  clearSelection() {
    if (this.state.selected?.element) {
      this.state.selected.element.classList.remove('selected', 'dragging', 'returning');
      this.state.selected.element.style.setProperty('--drag-x', '0px');
      this.state.selected.element.style.setProperty('--drag-y', '0px');
    }
    this.state.selected = null;
    this.state.dragging = false;
    this.state.dragPointerId = null;
  },
  getDestinationFromCell(cell) {
    const compEl = cell.closest('.compartment');
    const compartment = this.compartments.find(c => c.element === compEl);
    if (!compartment) return null;
    const cells = UI.getCells(compEl);
    const index = cells.indexOf(cell);
    return { compartment, slot: index % 3 };
  },
  moveObject(object, destination, slot) {
    const origin = this.findObject(object);
    if (!origin) return false;
    const active = destination.activeLayer() || destination.ensureLayer(0);
    if (active.hasObjectAt(slot)) { UI.showToast('Ese espacio ya está ocupado'); return false; }
    origin.layer.removeFrom(origin.slot);
    const targetLayer = destination.activeLayer() || destination.ensureLayer(0);
    targetLayer.addTo(slot, object);
    object.compartment = destination;
    object.slot = slot;
    this.normalizeLayers();
    this.renderAll();
    this.checkCompartment(origin.compartment);
    if (destination !== origin.compartment) this.checkCompartment(destination);
    return true;
  },
  findObject(object) {
    for (const comp of this.compartments) {
      for (const layer of comp.layers) {
        for (let slot = 0; slot < 3; slot++) {
          if (layer.slots[slot] === object) return { compartment: comp, layer, slot };
        }
      }
    }
    return null;
  },
  checkCompartment(compartment) {
    const layer = compartment.activeLayer();
    if (!layer || layer.isEmpty()) { this.normalizeLayers(); this.renderAll(); return; }
    const objects = layer.objects();
    if (objects.length === 3 && objects[0].trioKey === objects[1].trioKey && objects[1].trioKey === objects[2].trioKey) {
      this.removeTriple(compartment, objects);
    }
  },
  removeTriple(compartment, objects) {
    if (this.state.locked) return;
    this.state.locked = true;
    const color = objects[0].element?.style.getPropertyValue('--c') || '#f5c64b';
    objects.forEach(obj => {
      const cells = UI.getCells(compartment.element);
      const cell = cells[obj.slot];
      if (cell) {
        const rect = cell.getBoundingClientRect();
        Particles.spawn(rect.left + rect.width/2, rect.top + rect.height/2, color, 22);
        UI.flashCell(cell, color);
      }
      if (obj.element) obj.element.classList.add('removing');
    });
    Combos.register();
    this.state.triplesCompleted++;
    if (this.state.triplesCompleted > 0 && this.state.triplesCompleted % Config.POWERUPS_PER_GRANT === 0) {
      setTimeout(() => PowerUps.grantRandom(), 350);
    }
    setTimeout(() => {
      const layer = compartment.activeLayer();
      if (layer) { for (let slot = 0; slot < 3; slot++) layer.slots[slot] = null; }
      const baseScore = 100;
      const mult = Combos.getMultiplier();
      this.state.score += Math.round(baseScore * mult);
      UI.updateScore(this.state.score);
      compartment.activeLayer();
      this.normalizeLayers();
      this.renderAll();
      this.state.locked = false;
      if (this.countObjects() === 0) this.handleLevelComplete();
      else this.compartments.forEach(comp => this.checkCompartment(comp));
    }, Config.ANIMATION_DURATION);
  },
  handleLevelComplete() {
    clearTimeout(this.state.tutorialTimer);
    this.stopTimer();
    UI.hideTutorial();
    const timeLeft = Math.max(0, this.state.timeLeft);
    const timeTotal = Config.BASE_TIME + Math.floor((this.state.level - 1) / Config.LEVELS_PER_TIME) * Config.TIME_INCREMENT;
    const bonusTime = timeLeft * 5;
    this.state.score += bonusTime;
    UI.updateScore(this.state.score);
    const stars = this.calculateStars(timeLeft, timeTotal);
    const maxCombo = Combos.count;
    this.saveBestStars(this.state.level, stars);
    this.saveProgress();
    UI.showToast(`🎉 Nivel ${this.state.level} completado`);
    Audio.win();
    setTimeout(() => { this.showWinModal(this.state.level, stars, timeLeft, timeTotal, 100 + bonusTime, maxCombo); }, 400);
  },
  showWinModal(level, stars, timeLeft, timeTotal, scoreGained, maxCombo) {
    UI.elements.winTitle.textContent = stars === 3 ? '🌟 ¡Perfecto!' : stars === 2 ? '🎉 ¡Muy bien!' : '✅ ¡Nivel completado!';
    UI.elements.winSub.textContent = `Nivel ${level} superado`;
    const pct = Math.round((timeLeft / timeTotal) * 100);
    UI.elements.winStats.innerHTML = `Tiempo restante: <b>${timeLeft}s</b> (${pct}%)<br>Monedas conseguidas: <b>+${scoreGained}</b> 💰<br>Combo máximo: <b>x${Combos.getMultiplier().toFixed(1)}</b>`;
    UI.elements.starsRow.querySelectorAll('.star').forEach(s => s.classList.remove('earned'));
    UI.showWinModal();
    document.querySelector('header').classList.add('win');
    setTimeout(() => document.querySelector('header').classList.remove('win'), 1300);
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => {
        const s = UI.elements.starsRow.querySelector(`.star[data-star="${i}"]`);
        if (s) s.classList.add('earned');
      }, 300 + i * 280);
    }
  },
  calculateStars(timeLeft, timeTotal) {
    if (timeTotal <= 0) return 1;
    const ratio = timeLeft / timeTotal;
    if (ratio >= 0.66) return 3;
    if (ratio >= 0.33) return 2;
    return 1;
  },
  saveBestStars(level, stars) {
    const map = this.loadStars();
    if (!map[level] || stars > map[level]) { map[level] = stars; this.saveStars(map); }
  },
  shuffleAllFrontObjects() {
    this.state.locked = true;
    const frontObjects = [], frontPositions = [];
    this.compartments.forEach(comp => {
      const layer = comp.activeLayer();
      if (!layer) return;
      for (let slot = 0; slot < 3; slot++) {
        if (layer.slots[slot]) { frontObjects.push(layer.slots[slot]); frontPositions.push({ comp, slot }); }
      }
    });
    this.shuffleArray(frontObjects);
    frontPositions.forEach(p => { const layer = p.comp.activeLayer(); if (layer) layer.slots[p.slot] = null; });
    frontPositions.forEach((p, i) => {
      const obj = frontObjects[i];
      const layer = p.comp.activeLayer() || p.comp.ensureLayer(0);
      layer.slots[p.slot] = obj;
      obj.compartment = p.comp;
      obj.slot = p.slot;
    });
    this.normalizeLayers();
    this.renderAll();
    this.state.locked = false;
    this.compartments.forEach(comp => this.checkCompartment(comp));
  },
  countObjects() { return this.compartments.reduce((n, c) => n + c.allObjects().length, 0); },
  normalizeLayers() {
    this.compartments.forEach(comp => {
      while (comp.layers.length && comp.layers[0].isEmpty()) comp.layers.shift();
      comp.layers.forEach((layer, depth) => {
        layer.slots.forEach((obj, slot) => {
          if (obj) { obj.depth = depth; obj.slot = slot; obj.compartment = comp; }
        });
      });
    });
  },
  renderAll() { this.compartments.forEach(comp => this.renderCompartment(comp)); },
  renderCompartment(compartment) {
    const cells = UI.getCells(compartment.element);
    
    // CORRECCIÓN: Primero aplicar estilos "back" a TODOS los objetos en el DOM
    cells.forEach(cell => {
      const allObjs = cell.querySelectorAll('.obj');
      allObjs.forEach(obj => {
        obj.style.pointerEvents = 'none';
        const variantFilter = obj.style.getPropertyValue('--variant-filter') || 'none';
        const variantColor = obj.style.getPropertyValue('--c') || '#d64b4b';
        obj.style.filter = `${variantFilter} brightness(.58) saturate(.58)`;
        obj.style.boxShadow = `0 0 0 2px ${variantColor} inset, 0 3px 6px #0002`;
        obj.style.opacity = '0.22';
        obj.classList.remove('front');
        obj.classList.add('back');
      });
    });
    
    // Luego aplicar estilos correctos a los objetos en las capas
    compartment.layers.forEach((layer, depth) => {
      layer.slots.forEach((obj, slot) => {
        if (!obj || !obj.element) return;
        const cell = cells[slot];
        if (!cell) return;
        if (obj.element.parentElement !== cell) cell.appendChild(obj.element);
        const active = depth === 0;
        const [dx, bottom, scale] = Config.DEPTH_OFFSETS[Math.min(depth, Config.DEPTH_OFFSETS.length - 1)];
        obj.element.dataset.depth = depth;
        obj.element.dataset.pos = Number(cell.dataset.pos || 0);
        obj.element.classList.toggle('front', active);
        obj.element.classList.toggle('back', !active);
        obj.element.style.pointerEvents = active ? 'auto' : 'none';
        obj.element.style.setProperty('--dx', `${dx}px`);
        obj.element.style.setProperty('--bottom', `${bottom}px`);
        obj.element.style.setProperty('--scale', scale);
        obj.element.style.setProperty('--z', 40 - depth);
        obj.element.style.opacity = active ? '1' : (depth === 1 ? '.38' : '.22');
        const variantFilter = obj.element.style.getPropertyValue('--variant-filter') || 'none';
        obj.element.style.filter = active ? variantFilter : `${variantFilter} brightness(.58) saturate(.58)`;
        const variantColor = obj.element.style.getPropertyValue('--c') || '#d64b4b';
        obj.element.style.boxShadow = active ? `0 0 0 3px ${variantColor} inset, 0 4px 8px #0003` : `0 0 0 2px ${variantColor} inset, 0 3px 6px #0002`;
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => { Game.init(); });