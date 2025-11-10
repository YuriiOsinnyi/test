const API_BASE = 'https://furniture-store-v2.b.goit.study/api';

let categories = [];
let selectedCategory = null;
let allFurniture = [];
let displayedFurniture = [];

// Завантаження категорій
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/furnitures?page=1&limit=8`);
    const data = await response.json();
    categories = data.furnitures || [];
    renderCategories();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Відображення категорій
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = categories
    .map(
      cat => `
        <div class="category-card" onclick="selectCategory('${cat._id}', '${cat.name}')">
          <img src="${cat.img_url}" alt="${cat.name}">
          <div class="category-overlay">
            <div class="category-name">${cat.name}</div>
          </div>
        </div>
      `
    )
    .join('');
}

// Вибір категорії
function selectCategory(id, name) {
  selectedCategory = { id, name };
  document.getElementById('categoriesButton').click();
  document.getElementById('selectedCategory').classList.add('show');
  document.getElementById('selectedCategoryName').textContent = name;
  loadFurniture(id);
}

// Скидання категорії
document.getElementById('clearCategory').addEventListener('click', () => {
  selectedCategory = null;
  document.getElementById('selectedCategory').classList.remove('show');
  document.getElementById('furnitureGrid').innerHTML = '';
  document.getElementById('loadMoreSection').style.display = 'none';
  document.getElementById('emptyState').style.display = 'block';
});

// Завантаження меблів
async function loadFurniture(categoryId) {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('furnitureGrid').innerHTML = '';

  try {
    const url = categoryId
      ? `${API_BASE}/furnitures?category=${categoryId}&page=1&limit=8`
      : `${API_BASE}/furnitures?page=1&limit=8`;

    const response = await fetch(url);
    const data = await response.json();
    allFurniture = data.furnitures || [];
    displayedFurniture = allFurniture.slice(0, 8);
    renderFurniture();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    document.getElementById('loadingState').style.display = 'none';
  }
}

// Відображення меблів
function renderFurniture() {
  const grid = document.getElementById('furnitureGrid');
  grid.innerHTML = displayedFurniture
    .map(
      item => `
        <div class="furniture-card" onclick='openModal(${JSON.stringify(
          item
        ).replace(/'/g, '&#39;')})'>
          <img class="furniture-image" src="${item.images[0]}" alt="${
        item.name
      }">
          <div class="furniture-content">
            <div class="furniture-name">${item.name}</div>
            <div class="furniture-price">${item.price} ₴</div>
            <button class="details-button">Детальніше</button>
          </div>
        </div>
      `
    )
    .join('');

  // Кнопка "Показати ще"
  const section = document.getElementById('loadMoreSection');
  if (displayedFurniture.length < allFurniture.length) {
    section.style.display = 'block';
    section.innerHTML =
      '<button class="load-more-button" onclick="loadMore()">Показати ще</button>';
  } else if (displayedFurniture.length > 0) {
    section.style.display = 'block';
    section.innerHTML = '<p class="no-more-text">Більше меблів немає</p>';
  } else {
    section.style.display = 'none';
  }
}

// Завантажити ще
function loadMore() {
  const current = displayedFurniture.length;
  displayedFurniture = allFurniture.slice(0, current + 8);
  renderFurniture();
}

// Модальне вікно
async function openModal(item) {
  document.getElementById('modal').classList.add('show');

  // Показуємо базову інформацію
  document.getElementById('modalImage').src = item.images[0];
  document.getElementById('modalTitle').textContent = item.name;
  document.getElementById('modalPrice').textContent = `${item.price} ₴`;
  document.getElementById('modalDescription').textContent = 'Завантаження...';
  document.getElementById('modalInfo').innerHTML = '';

  // Завантажуємо детальну інформацію
  try {
    const response = await fetch(`${API_BASE}/furnitures/${item._id}`);
    const data = await response.json();

    document.getElementById('modalDescription').textContent =
      data.description || 'Опис відсутній';

    // Додаткова інформація
    const infoHTML = `
          ${
            data.type
              ? `
            <div class="modal-info-item">
              <span class="modal-info-label">Тип</span>
              <span class="modal-info-value">${data.type}</span>
            </div>
          `
              : ''
          }
          ${
            data.sizes
              ? `
            <div class="modal-info-item">
              <span class="modal-info-label">Розміри (ДxШxВ)</span>
              <span class="modal-info-value">${data.sizes} см</span>
            </div>
          `
              : ''
          }
          ${
            data.rate
              ? `
            <div class="modal-info-item">
              <span class="modal-info-label">Рейтинг</span>
              <span class="modal-info-value">⭐ ${data.rate}</span>
            </div>
          `
              : ''
          }
          ${
            data.color && data.color.length > 0
              ? `
            <div class="modal-info-item">
              <span class="modal-info-label">Доступні кольори</span>
              <div class="color-circles">
                ${data.color
                  .map(
                    c =>
                      `<div class="color-circle" style="background-color: ${c}"></div>`
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
        `;

    document.getElementById('modalInfo').innerHTML = infoHTML;
  } catch (error) {
    console.error('Error loading details:', error);
    document.getElementById('modalDescription').textContent =
      'Помилка завантаження деталей';
  }
}

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('modal').classList.remove('show');
});

document.getElementById('modal').addEventListener('click', e => {
  if (e.target.id === 'modal') {
    document.getElementById('modal').classList.remove('show');
  }
});

// Показати/сховати категорії
document.getElementById('categoriesButton').addEventListener('click', () => {
  const grid = document.getElementById('categoriesGrid');
  const chevron = document.getElementById('chevron');
  grid.classList.toggle('show');
  chevron.classList.toggle('rotated');
});

// Ініціалізація
loadCategories();
document.getElementById('emptyState').style.display = 'block';
