const slides = document.querySelectorAll(".slide");
const section = document.querySelector(".scroll-section");

window.addEventListener("scroll", () => {

const rect = section.getBoundingClientRect();
const progress = Math.min(
Math.max(-rect.top / (rect.height - window.innerHeight), 0),
1
);

const index = Math.floor(progress * slides.length);

slides.forEach(s => s.classList.remove("active"));

if(slides[index]){
slides[index].classList.add("active");
}

});


/* Корзина и слайды с продуктами */
const products = [
{
id:1,
name:"Молочный шоколад",
price:629,
img:"https://raw.githubusercontent.com/BesovaVorobiovaKremerMD15/photo2/main/Rectangle%20240648777%20(1).png"
},
{
id:2,
name:"Малина сублимированная",
price:459,
img:"https://raw.githubusercontent.com/BesovaVorobiovaKremerMD15/photo2/main/Rectangle%20240648778%20(1).png"
},
{
id:3,
name:"Сыр креметте",
price:949,
img:"https://raw.githubusercontent.com/BesovaVorobiovaKremerMD15/photo2/main/Rectangle%20240648777.png"
},
{
id:4,
name:"Глазурь молочная",
price:1210,
img:"https://raw.githubusercontent.com/BesovaVorobiovaKremerMD15/photo2/main/Rectangle%20240648778.png"
}
];

let cart = [];

// Рендер товаров с кнопками + и - прямо под товаром
function renderProducts() {
    const container = document.getElementById("products");
    container.innerHTML = ""; // очистка перед рендером

    products.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";

        // проверяем, есть ли товар в корзине, чтобы показать qty
        const inCart = cart.find(i => i.id === p.id);
        const qty = inCart ? inCart.qty : 0;

        div.innerHTML = `
            <img src="${p.img}">
            <h4>${p.name}</h4>
            <div class="price">${p.price} ₽</div>
            <div class="qty-btns">
                <button onclick="changeProductQty(${p.id},-1)">-</button>
                <span id="productQty${p.id}">${qty}</span>
                <button onclick="changeProductQty(${p.id},1)">+</button>
            </div>
            <button onclick="addToCart(${p.id})">В корзину</button>
        `;

        container.appendChild(div);
    });
}

// Регулировка количества прямо на карточке товара
function changeProductQty(id, delta) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(i => i.id === id);

    if (existing) {
        existing.qty += delta;
        if (existing.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    } else if (delta > 0) {
        cart.push({ ...product, qty: 1 });
    }

    const qtySpan = document.getElementById(`productQty${id}`);
    const currentQty = cart.find(i => i.id === id)?.qty || 0;
    qtySpan.innerText = currentQty;

    renderCart();
}

// Добавление в корзину через кнопку
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(i => i.id === id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    // обновляем qty на карточке
    const qtySpan = document.getElementById(`productQty${id}`);
    qtySpan.innerText = cart.find(i => i.id === id).qty;

    renderCart();
}

// Изменение количества внутри модального окна
function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }

    // обновляем qty на карточке товара
    const qtySpan = document.getElementById(`productQty${id}`);
    const currentQty = cart.find(i => i.id === id)?.qty || 0;
    qtySpan.innerText = currentQty;

    renderCart();
}

// Удаление товара из корзины
function removeItem(id) {
    cart = cart.filter(i => i.id !== id);

    // обновляем qty на карточке товара
    const qtySpan = document.getElementById(`productQty${id}`);
    if (qtySpan) qtySpan.innerText = 0;

    renderCart();
}

// Включение/выключение кнопки отправки заказа
function updateCheckoutBtn() {
    const check = document.getElementById("privacyCheck").checked;
    document.getElementById("checkoutBtn").disabled = !check;
}

// Рендер корзины с общей суммой
function renderCart() {
    const container = document.getElementById("cartItems");
    container.innerHTML = "";

    let total = 0;

    cart.forEach(item => {
        const price = Number(item.price);
        total += price * item.qty;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <div>
                <div>${item.name}</div>
                <div>${price} ₽</div>
            </div>
            <div class="qty-btns">
                <button onclick="changeQty(${item.id},-1)">-</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${item.id},1)">+</button>
                <button onclick="removeItem(${item.id})">🗑️</button>
            </div>
        `;

        container.appendChild(div);
    });

    document.getElementById("modalTotal").innerText =
        "Общая сумма заказа: " + total + " ₽";
}

// Отправка заказа
async function checkout() {
  try {
    const total = cart.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
    if (cart.length === 0) {
    alert("Корзина пуста!");
    return;
    }
    const response = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        email: document.getElementById("email").value,
        note: document.getElementById("note").value,
        total
    })
    });

    const json = await response.json();

    if (json.success) {
      alert("Заказ отправлен! Проверьте почту.");
      closeModal();
      cart = [];
      renderCart();
      renderProducts();
    } else {
      console.error("Ошибка при оформлении заказа:", json);
      alert("Ошибка при оформлении заказа.");
    }
  } catch (err) {
    console.error("Ошибка при отправке заказа:", err);
    alert("Ошибка при отправке заказа.");
  }
}

// Модальное окно
function openModal() {
    document.getElementById("orderModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("orderModal").style.display = "none";
}

// Инициализация
renderProducts();