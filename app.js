// VARIABLES
const cartBtn = document.querySelector(".shopping-cart");
const closeCartBtn = document.querySelector(".close_cart-btn");
const clearCartBtn = document.querySelector(".clear-cart-btn");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartContainer = document.querySelector(".cart-container");
const cartAmount = document.querySelector(".cart-amount");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products");
const searchBar = document.querySelector(".search-bar-input")


// CART
let cart = [];
// BUTTONS
let buttonsDOM = [];


// GETTING THE PRODUCT
class Products {
  async getProducts() {
    try {
      let result = await fetch("aircrafts.json");
      let data = await result.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}


// DISPLAY PRODUCTS
class UI {
  displayProducts(data) {
    let singleProduct = 0
    data.forEach((item) => {
      productsDOM.innerHTML += `
        <div class="product">
        <h2>${item.name}</h2>
        <h4>"${item.nickname}"</h4>
        <img src="${item.imgSrc}" 
        onmouseover="this.src='${item.blueprint}'"
        onmouseout="this.src='${item.imgSrc}'" />
        <div class="price_cart">
          <h3>$${item.price}M</h3>
          <button data-id="${item.id}" class="addto-cart-btn">Add to cart</button>
        </div>
      </div>
      </div>
      `;
      singleProduct = document.querySelectorAll(".product")
    });


// DISPLAY ONLY SEARCHED PRODUCTS 
    searchBar.addEventListener("keyup", (e) => { 
      e.preventDefault()
     let searchedValue = e.target.value
     
    for(let i = 0; i < singleProduct.length; i++) { 
        if(singleProduct[i].innerHTML.toLowerCase().includes(searchedValue.toLowerCase())) { 
            singleProduct[i].classList.remove('is-hidden')
        }else { 
          singleProduct[i].classList.add("is-hidden")
        }
     }
   })
  }

  
  getAddToCartBtns() {
    const addToCartButtons = [...document.querySelectorAll(".addto-cart-btn")];
    buttonsDOM = addToCartButtons;
    addToCartButtons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      button.addEventListener("click", (e) => {
       
        e.target.innerText = "In Cart";
        e.target.disabled = true;
        // GET PRODUCT FROM DATA/PRODUCTS
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // ADD PRODUCT TO THE CART
        cart = [...cart, cartItem];
        // SAVE CART IN LOCAL STORAGE
        Storage.saveCart(cart);
        // SET CART VALUES
        this.setCartValues(cart);
        // DISPLAY CART ITEM
        this.addCartItem(cartItem);
        // SHOW THE CART AFTER ADDING ITEM 
        // this.showCart();  
      });
    });
  }


  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = tempTotal;
    cartAmount.innerText = itemsTotal;
  }

  
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = ` <img class ="thumbnail-in-cart" src="${item.imgSrc}"/>
                        <span class="product-in-cart-name">${item.name}</span>
                            <div class="increase_decrease-amount">
                                <button class="increase-amount" data-id=${item.id}><ion-icon name="arrow-up-outline"></ion-icon></button>
                                <p class="item-amount">${item.amount}</p>
                                <button class="decrease-amount" data-id=${item.id}><ion-icon name="arrow-down-outline"></ion-icon></button>
                         </div>
                     <div class="product-in-cart-price">$${item.price}M</div>
                     <button class="remove-item-btn" data-id=${item.id}><ion-icon name="trash-outline"></ion-icon></button>
                    `;
    cartContent.appendChild(div);
  }

  
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartContainer.classList.add("showCart");
    document.querySelector('body').style.overflow = "hidden"
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartContainer.classList.remove("showCart");
    document.querySelector('body').style.overflow = "scroll"
  }
  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item-btn")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("increase-amount")) {
        let increaseAmount = event.target;
        let id = increaseAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        increaseAmount.nextElementSibling.textContent = tempItem.amount;
      } else if (event.target.classList.contains("decrease-amount")) {
        let decreaseAmount = event.target;
        let id = decreaseAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          decreaseAmount.previousElementSibling.textContent = tempItem.amount;
        } else {
          cartContent.removeChild(decreaseAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.textContent = `Add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// LOCAL SOTRAGE
class Storage {
  static saveProducts(data) {
    localStorage.setItem("products", JSON.stringify(data));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //    setup app
  ui.setupAPP();

  //    GET ALL PRODUCTS
  products
    .getProducts()
    .then((data) => {
      ui.displayProducts(data);
      Storage.saveProducts(data);
    })
    .then(() => {
      ui.getAddToCartBtns();
      ui.cartLogic();
    });
});
