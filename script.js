const categories = [
    { name: "Frigo Casa", icon: "🍎" },
    { name: "Frigo Taverna", icon: "🍺" },
    { name: "Dispensa Taverna", icon: "🥫" },
    { name: "Freezer Garage", icon: "❄️" },
    { name: "Frigo Garage", icon: "🥤" }
];

let items = {};

function loadData() {
    const savedData = localStorage.getItem('foodInventoryData');
    if (savedData) {
        items = JSON.parse(savedData);
    }
}

function saveData() {
    localStorage.setItem('foodInventoryData', JSON.stringify(items));
}

function initializeApp() {
    loadData();
    renderCategories();
    populateCategorySelect();
    document.getElementById('newItemButton').addEventListener('click', showModal);
    document.getElementById('cancelButton').addEventListener('click', hideModal);
    document.getElementById('newItemForm').addEventListener('submit', addNewItem);
}

function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = categories.map(category => {
        const categoryItems = items[category.name] || [];
        const totalPrice = calculateTotalPrice(categoryItems);
        return `
            <div class="category-item">
                <div class="category-header" onclick="toggleCategory('${category.name}')">
                    <div class="category-icon">${category.icon}</div>
                    <span class="category-name">${category.name}</span>
                    <span class="item-count">${categoryItems.length}</span>
                </div>
                <div class="category-content" id="content-${category.name}" style="display: none;">
                    ${renderCategoryItems(categoryItems, category.name)}
                    <div class="category-total">Totale: €${totalPrice.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderCategoryItems(categoryItems, categoryName) {
    if (categoryItems.length === 0) {
        return '<p>Nessun alimento in questa categoria.</p>';
    }
    return categoryItems.map((item, index) => {
        const daysRemaining = calculateDaysRemaining(item.expiry);
        const expiryClass = getExpiryClass(daysRemaining);
        return `
            <div class="food-item">
                <p>${item.name}</p>
                <p>Prezzo: €${item.price.toFixed(2)}</p>
                <p class="${expiryClass}">Scadenza: ${item.expiry} (${daysRemaining} giorni rimanenti)</p>
                <button onclick="editItem('${categoryName}', ${index})">Modifica</button>
                <button onclick="deleteItem('${categoryName}', ${index})">Elimina</button>
            </div>
        `;
    }).join('');
}

function calculateDaysRemaining(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function getExpiryClass(daysRemaining) {
    if (daysRemaining > 7) return 'expiry-ok';
    if (daysRemaining > 3) return 'expiry-warning';
    return 'expiry-danger';
}

function calculateTotalPrice(categoryItems) {
    return categoryItems.reduce((total, item) => total + item.price, 0);
}

function toggleCategory(categoryName) {
    const content = document.getElementById(`content-${categoryName}`);
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
}

function populateCategorySelect() {
    const categorySelect = document.getElementById('itemCategory');
    categorySelect.innerHTML = '<option value="">Seleziona Categoria</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

function showModal() {
    document.getElementById('modal').style.display = 'block';
}

function hideModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('newItemForm').reset();
}

function addNewItem(event) {
    event.preventDefault();
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const expiry = document.getElementById('itemExpiry').value;
    const price = parseFloat(document.getElementById('itemPrice').value);

    if (name && category && expiry && !isNaN(price)) {
        if (!items[category]) {
            items[category] = [];
        }
        items[category].push({ name, expiry, price });
        renderCategories();
        hideModal();
        saveData();
    } else {
        alert('Per favore, compila tutti i campi correttamente.');
    }
}

function editItem(categoryName, index) {
    const item = items[categoryName][index];
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = categoryName;
    document.getElementById('itemExpiry').value = item.expiry;
    document.getElementById('itemPrice').value = item.price;
    
    showModal();

    document.getElementById('newItemForm').onsubmit = (e) => {
        e.preventDefault();
        updateItem(categoryName, index);
    };
}

function updateItem(categoryName, index) {
    const name = document.getElementById('itemName').value;
    const expiry = document.getElementById('itemExpiry').value;
    const price = parseFloat(document.getElementById('itemPrice').value);

    if (name && expiry && !isNaN(price)) {
        items[categoryName][index] = { name, expiry, price };
        renderCategories();
        hideModal();
        saveData();
    } else {
        alert('Per favore, compila tutti i campi correttamente.');
    }
}

function deleteItem(categoryName, index) {
    if (confirm('Sei sicuro di voler eliminare questo elemento?')) {
        items[categoryName].splice(index, 1);
        renderCategories();
        saveData();
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);