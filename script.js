const typeNames = { breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', dessert: 'Десерт' };

// Стартовые рецепты (показываются, пока в localStorage ничего нет)
const startRecipes = [
  { id: 1, name: 'Шакшука', imageUrl: 'photos/eggs.jpg', time: 25, difficulty: 'Легко', type: 'breakfast', favorite: false,
    ingredients: ['Помидоры, 400 г', 'Болгарский перец, 1 шт', 'Лук, 1 шт', 'Яйца, 4 шт', 'Паприка, 1 ч. л.'],
    steps: ['Обжарьте нарезанные лук и перец.', 'Добавьте помидоры и паприку, тушите 10 минут.', 'Сделайте лунки и вбейте яйца.', 'Накройте крышкой, готовьте 5 минут.'] },
  { id: 2, name: 'Сырники', imageUrl: 'photos/syrniki.jpg', time: 30, difficulty: 'Средне', type: 'breakfast', favorite: false,
    ingredients: ['Творог, 400 г', 'Яйцо, 1 шт', 'Мука, 4 ст. л.', 'Сахар, 2 ст. л.'],
    steps: ['Разомните творог с яйцом и сахаром.', 'Добавьте муку, сформируйте шайбы.', 'Жарьте до золотой корочки.'] },
  { id: 3, name: 'Тыквенный суп', imageUrl: 'photos/pumpkin-soup.jpg', time: 40, difficulty: 'Легко', type: 'lunch', favorite: false,
    ingredients: ['Тыква, 600 г', 'Морковь, 1 шт', 'Лук, 1 шт', 'Имбирь, 20 г', 'Кокосовое молоко, 200 мл'],
    steps: ['Обжарьте лук с имбирём.', 'Добавьте тыкву, морковь и воду, варите 25 минут.', 'Влейте кокосовое молоко и пробейте блендером.'] },
  { id: 4, name: 'Паста с лимоном и рикоттой', imageUrl: 'photos/pasta.jpg', time: 15, difficulty: 'Легко', type: 'dinner', favorite: false,
    ingredients: ['Паста, 200 г', 'Рикотта, 150 г', 'Лимон, 1 шт', 'Шпинат, 80 г'],
    steps: ['Отварите пасту.', 'Смешайте рикотту с цедрой и соком лимона.', 'Добавьте шпинат и соедините с пастой.'] },
  { id: 5, name: 'Тушёная говядина', imageUrl: 'photos/meat.jpg', time: 120, difficulty: 'Сложно', type: 'dinner', favorite: false,
    ingredients: ['Говядина, 700 г', 'Морковь, 2 шт', 'Лук, 2 шт', 'Томатная паста, 2 ст. л.'],
    steps: ['Обжарьте мясо кусками.', 'Добавьте овощи и томатную пасту.', 'Тушите под крышкой 1,5 часа.'] },
  { id: 6, name: 'Панна котта с малиной', imageUrl: 'photos/dessert.jpg', time: 20, difficulty: 'Средне', type: 'dessert', favorite: false,
    ingredients: ['Сливки, 400 мл', 'Сахар, 50 г', 'Желатин, 8 г', 'Малина, 150 г'],
    steps: ['Замочите желатин.', 'Подогрейте сливки с сахаром и растворите желатин.', 'Разлейте по формам, охлаждайте 4 часа.', 'Подавайте с малиной.'] }
];

// Чтение и запись с защитой от ошибок
function load(storage, key, fallback) {
  try {
    const value = JSON.parse(storage.getItem(key));
    return value === null ? fallback : value;
  } catch (e) {
    return fallback;
  }
}
function save(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); }
  catch (e) { showToast('Не удалось сохранить: нет места в хранилище'); }
}

let recipes = load(localStorage, 'recipes', null);
if (!recipes) {                       // первый запуск
  recipes = startRecipes;
  save(localStorage, 'recipes', recipes);
}

// Фото стартовых рецептов всегда из кода (startRecipes),
// даже если рецепты уже сохранены в localStorage
recipes.forEach((r) => {
  const start = startRecipes.find((s) => s.id === r.id);
  if (start && start.imageUrl) r.imageUrl = start.imageUrl;
});
save(localStorage, 'recipes', recipes);
// Настройки фильтров по умолчанию (maxTime 300 минут = 5 часов = без ограничения)
function defaultFilters() {
  return { search: '', types: [], difficulty: '', timeRange: '', maxTime: 300 };
}
let filters = load(localStorage, 'recipeFilters', defaultFilters());

/* элементы страницы */
const grid = document.getElementById('grid');
const favGrid = document.getElementById('fav-grid');
const modal = document.getElementById('modal');
const toast = document.getElementById('toast');
const form = document.getElementById('recipe-form');
const ingredientsList = document.getElementById('ingredients');
const stepsList = document.getElementById('steps');

// Защита от вставки HTML из полей формы
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

/* навигация*/
function showSection(id) {
  document.querySelectorAll('.section').forEach((s) => s.classList.toggle('hidden', s.id !== id));
  document.querySelectorAll('.nav button').forEach((b) => b.classList.toggle('active', b.dataset.section === id));
}
document.querySelector('.nav').addEventListener('click', (e) => {
  const button = e.target.closest('button');
  if (button) showSection(button.dataset.section);
});

/* карточки*/
function cardHTML(r) {
  const image = r.imageUrl ? `<img src="${esc(r.imageUrl)}" alt="${esc(r.name)}">` : '';
  return `
    <article class="card" data-id="${r.id}">
      <div class="photo ${r.type}">
        ${image}
        <button class="fav ${r.favorite ? 'active' : ''}" data-fav aria-label="Избранное">♥</button>
        <span class="time">${r.time} мин</span>
      </div>
      <h3 class="card-title">${esc(r.name)}</h3>
      <div class="card-info"><span>${typeNames[r.type]}</span><span>${r.difficulty}</span></div>
    </article>`;
}

// список рецептов с учётом фильтров и поиска
function renderRecipes() {
  const list = recipes.filter(matchesFilters);
  grid.innerHTML = list.map(cardHTML).join('');
  document.getElementById('count').textContent = `Найдено: ${list.length} из ${recipes.length}`;
  document.getElementById('empty').hidden = list.length > 0;
}

// раздел «Избранное»
function renderFavorites() {
  const list = recipes.filter((r) => r.favorite);
  favGrid.innerHTML = list.map(cardHTML).join('');
  document.getElementById('fav-empty').hidden = list.length > 0;
  document.getElementById('fav-count').textContent = list.length;
}

function renderAll() { renderRecipes(); renderFavorites(); }

// клик по карточке: сердечко переключает избранное, остальное открывает окно
function onCardClick(e) {
  const card = e.target.closest('.card');
  if (!card) return;
  const id = Number(card.dataset.id);
  if (e.target.closest('[data-fav]')) toggleFavorite(id);
  else openRecipe(id);
}
grid.addEventListener('click', onCardClick);
favGrid.addEventListener('click', onCardClick);

function toggleFavorite(id) {
  const recipe = recipes.find((r) => r.id === id);
  recipe.favorite = !recipe.favorite;
  save(localStorage, 'recipes', recipes);
  renderAll();
}

/* окно рецепта */
function openRecipe(id) {
  const r = recipes.find((item) => item.id === id);
  const image = r.imageUrl ? `<img src="${esc(r.imageUrl)}" alt="${esc(r.name)}">` : '';
  modal.innerHTML = `
    <button class="close" aria-label="Закрыть">×</button>
    <div class="modal-top">
      <div class="photo ${r.type}">${image}</div>
      <div>
        <div class="card-info" style="justify-content:flex-start">
          <span>${typeNames[r.type]}</span><span>${r.time} мин</span><span>${r.difficulty}</span>
        </div>
        <h1>${esc(r.name)}</h1>
      </div>
    </div>
    <div class="modal-body">
      <div><h3>Ингредиенты</h3><ul>${r.ingredients.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
      <div><h3>Приготовление</h3><ol>${r.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
    </div>`;
  modal.showModal();
}
modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target.closest('.close')) modal.close();   // крестик или фон
});

/* фильтры*/
const maxMinutes = 300;   // правый край слайдера (5 часов) = без ограничения

// 90 - «1 ч 30 мин»
function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} мин`;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

// подходит ли рецепт под все выбранные фильтры
function matchesFilters(r) {
  const q = filters.search.trim().toLowerCase();
  // поиск по названию или любому ингредиенту
  if (q && !(r.name.toLowerCase().includes(q) || r.ingredients.some((i) => i.toLowerCase().includes(q)))) return false;
  if (filters.types.length && !filters.types.includes(r.type)) return false;
  if (filters.difficulty && r.difficulty !== filters.difficulty) return false;
  if (filters.timeRange === 'lt30' && r.time >= 30) return false;
  if (filters.timeRange === 'gt60' && r.time <= 60) return false;
  if (filters.maxTime < maxMinutes && r.time > filters.maxTime) return false;
  return true;
}

const searchInput = document.getElementById('search');
const pills = document.querySelectorAll('.pill');
const slider = document.getElementById('time-slider');
const sliderOutput = document.getElementById('time-output');

// применить фильтры: запоминаем настройки и перерисовываем список
function applyFilters() {
  save(localStorage, 'recipeFilters', filters);
  sliderOutput.textContent = filters.maxTime >= maxMinutes ? 'любое' : 'до ' + formatTime(filters.maxTime);
  renderRecipes();
}

// показать сохранённые настройки: подсветить кнопки, заполнить поиск и слайдер
function showFilterValues() {
  pills.forEach((pill) => {
    const { group, value } = pill.dataset;
    const on = group === 'types' ? filters.types.includes(value) : filters[group] === value;
    pill.classList.toggle('active', on);
    pill.setAttribute('aria-pressed', on);
  });
  searchInput.value = filters.search;
  slider.value = filters.maxTime;
}

// клик по кнопке-«таблетке»
document.querySelector('.pills').addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  const { group, value } = pill.dataset;

  if (group === 'types') {
    // типов можно выбрать несколько: добавляем или убираем значение
    filters.types = filters.types.includes(value)
      ? filters.types.filter((t) => t !== value)
      : [...filters.types, value];
  } else {
    // сложность и время: выбирается одно значение, повторный клик снимает выбор
    filters[group] = filters[group] === value ? '' : value;
  }
  showFilterValues();
  applyFilters();
});

// живой поиск: срабатывает на каждую набранную букву
searchInput.addEventListener('input', () => { filters.search = searchInput.value; applyFilters(); });
slider.addEventListener('input', () => { filters.maxTime = Number(slider.value); applyFilters(); });
document.getElementById('reset').addEventListener('click', () => {
  filters = defaultFilters();
  showFilterValues();
  applyFilters();
});

/* динамические списки */
// добавить строку (поле + кнопка удаления) в список ингредиентов или шагов
function addRow(list, value = '') {
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = `<input type="text" value="${esc(value)}" placeholder="${list.dataset.placeholder}">
                   <button type="button" class="remove" aria-label="Удалить">×</button>`;
  list.appendChild(row);
}

// значения всех непустых строк списка
function getList(list) {
  return Array.from(list.querySelectorAll('input')).map((i) => i.value.trim()).filter(Boolean);
}

// кнопки «+ Добавить ...»
form.addEventListener('click', (e) => {
  const addButton = e.target.closest('[data-add]');
  if (addButton) addRow(document.getElementById(addButton.dataset.add));

  const removeButton = e.target.closest('.remove');
  if (removeButton) {
    const list = removeButton.closest('.list');
    removeButton.closest('.row').remove();
    if (!list.children.length) addRow(list);   // всегда оставляем хотя бы одну строку
    checkList(list.id);
    saveDraft();
  }
});

/* валидация в реальном времени */
// возвращают текст ошибки или '' (если всё верно)
const rules = {
  name: (v) => (/^.{2,100}$/.test(v.trim()) ? '' : 'Название: от 2 до 100 символов'),
  time: (v) => (Number.isInteger(Number(v)) && Number(v) > 0 ? '' : 'Введите целое число минут больше 0'),
  difficulty: (v) => (v ? '' : 'Выберите сложность'),
  type: (v) => (v ? '' : 'Выберите тип блюда')
};

function checkField(fieldName) {
  const input = form.elements[fieldName];
  const message = rules[fieldName](input.value);
  input.classList.toggle('invalid', Boolean(message));
  document.getElementById('err-' + fieldName).textContent = message;
  return !message;
}
function checkList(id) {
  const ok = getList(document.getElementById(id)).length > 0;
  document.getElementById('err-' + id).textContent = ok ? '' : 'Добавьте хотя бы один пункт';
  return ok;
}

// проверяем поле и сохраняем черновик
form.addEventListener('input', (e) => {
  if (rules[e.target.name]) checkField(e.target.name);
  const list = e.target.closest('.list');
  if (list) checkList(list.id);
  saveDraft();
});

/*черновик формы*/
function saveDraft() {
  const rowValues = (list) => Array.from(list.querySelectorAll('input')).map((i) => i.value);
  save(sessionStorage, 'draft', {
    name: form.elements.name.value,
    imageUrl: form.elements.imageUrl.value,
    time: form.elements.time.value,
    difficulty: form.elements.difficulty.value,
    type: form.elements.type.value,
    ingredients: rowValues(ingredientsList),
    steps: rowValues(stepsList)
  });
}

function restoreDraft() {
  const d = load(sessionStorage, 'draft', null);
  if (d) {
    form.elements.name.value = d.name;
    form.elements.imageUrl.value = d.imageUrl;
    form.elements.time.value = d.time;
    form.elements.difficulty.value = d.difficulty;
    form.elements.type.value = d.type;
  }
  const ingredients = d && d.ingredients.length ? d.ingredients : [''];
  const steps = d && d.steps.length ? d.steps : [''];
  ingredients.forEach((v) => addRow(ingredientsList, v));
  steps.forEach((v) => addRow(stepsList, v));
}

/* отправка формы */
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // проверяем всё сразу (без раннего выхода, чтобы показать все ошибки)
  const results = [
    checkField('name'), checkField('time'), checkField('difficulty'), checkField('type'),
    checkList('ingredients'), checkList('steps')
  ];
  if (results.includes(false)) {
    showToast('Исправьте ошибки в форме');
    return;
  }

  recipes.unshift({
    id: Date.now(),                                   // уникальный номер
    name: form.elements.name.value.trim(),
    imageUrl: form.elements.imageUrl.value.trim(),
    time: Number(form.elements.time.value),
    difficulty: form.elements.difficulty.value,
    type: form.elements.type.value,
    ingredients: getList(ingredientsList),
    steps: getList(stepsList),
    favorite: false
  });
  save(localStorage, 'recipes', recipes);

  // очищаем форму и черновик
  form.reset();
  ingredientsList.innerHTML = '';
  stepsList.innerHTML = '';
  addRow(ingredientsList);
  addRow(stepsList);
  sessionStorage.removeItem('draft');

  renderAll();
  showSection('recipes');
  showToast('Рецепт добавлен');
});

showFilterValues();
applyFilters();      // рисует список и подпись слайдера
renderFavorites();
restoreDraft();
