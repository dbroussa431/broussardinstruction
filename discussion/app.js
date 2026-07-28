const state = {
  allCards: [],
  sessionCards: [],
  currentIndex: 0,
  selectedIndex: null,
  completedCategories: []
};

const els = {
  startBtn: document.querySelector('#startBtn'),
  restartBtn: document.querySelector('#restartBtn'),
  newSetBtn: document.querySelector('#newSetBtn'),
  lab: document.querySelector('#lab'),
  complete: document.querySelector('#complete'),
  progressTitle: document.querySelector('#progressTitle'),
  category: document.querySelector('#category'),
  cardCount: document.querySelector('#cardCount'),
  cardTitle: document.querySelector('#cardTitle'),
  scenario: document.querySelector('#scenario'),
  choices: document.querySelector('#choices'),
  revealBtn: document.querySelector('#revealBtn'),
  thoughts: document.querySelector('#thoughts'),
  responseHeading: document.querySelector('#responseHeading'),
  explanation: document.querySelector('#explanation'),
  takeaway: document.querySelector('#takeaway'),
  nextBtn: document.querySelector('#nextBtn'),
  completedCategories: document.querySelector('#completedCategories'),
  progressDots: document.querySelector('#progressDots'),
  loadError: document.querySelector('#loadError')
};

const RECENT_CATEGORIES_KEY = 'bsaRecentCategories';

function getRecentCategories() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_CATEGORIES_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveRecentCategories(categories) {
  try {
    localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(categories.slice(-5)));
  } catch (error) {
    /* localStorage unavailable; skip persistence */
  }
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function drawSessionCards() {
  const byCategory = new Map();

  state.allCards.forEach(card => {
    if (!byCategory.has(card.category)) byCategory.set(card.category, []);
    byCategory.get(card.category).push(card);
  });

  const allCategories = [...byCategory.keys()];
  const recent = getRecentCategories();
  // Prefer categories not shown in the last few sessions so rotation feels fresh.
  const fresh = allCategories.filter(category => !recent.includes(category));
  const pool = fresh.length >= 3 ? fresh : allCategories;
  const categories = shuffle(pool).slice(0, 3);

  state.sessionCards = categories.map(category => {
    const cards = byCategory.get(category);
    const card = cards[Math.floor(Math.random() * cards.length)];
    // Shuffle choice order per render so the correct answer isn't always in the same slot.
    const order = shuffle(card.choices.map((_, index) => index));
    return {
      ...card,
      choices: order.map(index => card.choices[index]),
      preferred: order.indexOf(card.preferred)
    };
  });

  saveRecentCategories([...recent, ...categories]);
  state.currentIndex = 0;
  state.completedCategories = [];
}

function renderCard() {
  const card = state.sessionCards[state.currentIndex];
  state.selectedIndex = null;

  els.progressTitle.textContent = `Discussion Card ${state.currentIndex + 1} of ${state.sessionCards.length}`;
  els.category.textContent = card.category;
  els.cardCount.textContent = `${state.currentIndex + 1} / ${state.sessionCards.length}`;
  els.cardTitle.textContent = card.title;
  els.scenario.textContent = card.scenario;
  els.choices.innerHTML = '<legend>What would you consider?</legend>';

  card.choices.forEach((choice, index) => {
    const label = document.createElement('label');
    label.className = 'choice';
    label.innerHTML = `<input type="radio" name="discussion-choice" value="${index}"><span>${choice}</span>`;

    label.querySelector('input').addEventListener('change', () => {
      state.selectedIndex = index;
      els.revealBtn.disabled = false;
    });

    els.choices.appendChild(label);
  });

  els.revealBtn.disabled = true;
  els.thoughts.classList.add('hidden');
  els.revealBtn.classList.remove('hidden');
  els.nextBtn.textContent = state.currentIndex === state.sessionCards.length - 1
    ? 'Finish Today\'s Discussion'
    : 'Next Discussion Card';

  els.progressDots.innerHTML = state.sessionCards
    .map((_, index) => {
      const cls = index < state.currentIndex ? 'is-done' : index === state.currentIndex ? 'is-current' : '';
      return `<span class="${cls}"></span>`;
    })
    .join('');
}

function revealThoughts() {
  const card = state.sessionCards[state.currentIndex];
  const chosePreferred = state.selectedIndex === card.preferred;

  els.responseHeading.textContent = chosePreferred
    ? 'That is close to what we hoped you would notice...'
    : 'Here is another reasonable way to think through it...';

  els.explanation.textContent = card.explanation;
  els.takeaway.textContent = card.takeaway;
  els.revealBtn.classList.add('hidden');
  els.thoughts.classList.remove('hidden');
  const thoughtsTop = els.thoughts.getBoundingClientRect().top + window.pageYOffset - 24;
  window.scrollTo({ top: thoughtsTop, behavior: 'smooth' });
}

function nextCard() {
  const card = state.sessionCards[state.currentIndex];
  state.completedCategories.push(card.category);

  if (state.currentIndex < state.sessionCards.length - 1) {
    state.currentIndex += 1;
    renderCard();
    const labTop = els.lab.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: labTop, behavior: 'smooth' });
  } else {
    showComplete();
  }
}

function showComplete() {
  els.lab.classList.add('hidden');
  els.complete.classList.remove('hidden');
  els.completedCategories.innerHTML = state.completedCategories
    .map(category => `<span>✓ ${category}</span>`)
    .join('');
  const completeTop = els.complete.getBoundingClientRect().top + window.pageYOffset;
  window.scrollTo({ top: completeTop, behavior: 'smooth' });
}

function startSession() {
  drawSessionCards();
  els.complete.classList.add('hidden');
  els.lab.classList.remove('hidden');
  renderCard();
  const startLabTop = els.lab.getBoundingClientRect().top + window.pageYOffset;
  window.scrollTo({ top: startLabTop, behavior: 'smooth' });
}

async function init() {
  try {
    const response = await fetch('cards/cards.json');
    if (!response.ok) throw new Error('Unable to load Discussion Cards.');
    state.allCards = await response.json();
  } catch (error) {
    console.error(error);
    els.startBtn.disabled = true;
    els.startBtn.textContent = 'Discussion Cards unavailable';
    els.loadError.classList.remove('hidden');
  }
}

els.startBtn.addEventListener('click', startSession);
els.restartBtn.addEventListener('click', startSession);
els.newSetBtn.addEventListener('click', startSession);
els.revealBtn.addEventListener('click', revealThoughts);
els.nextBtn.addEventListener('click', nextCard);

init();
