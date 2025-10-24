import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, LogOut, Plus, Minus, X, ClipboardList } from 'lucide-react';
import './MenuPage.css';
import CheckoutPage from './CheckoutPage';
import ReceiptPage from './Receipt';
import OrderHistoryPage from './OrderHistoryPage';
import { saveOrder } from './firebase';
import { getTopSellingProducts } from './firebase-admin';
import { subscribeToInventory } from './firebase-admin';

import menuBg from './images/menu-image.jpg';
import cdoBurger from './images/products/cdo-burger.jpg';
import burgerWithHam from './images/products/burger-with-ham.jpg';
import burgerEgg from './images/products/burger-egg.jpg';
import burgerBacon from './images/products/burger-bacon.jpg';
import cheeseBurger from './images/products/cheese-burger.jpg';
import cheeseBurgerHam from './images/products/cheese-burger-ham.jpg';
import cheeseBurgerEgg from './images/products/cheese-burger-egg.jpg';
import cheeseBurgerBacon from './images/products/cheese-burger-bacon.jpg';
import hamBurger from './images/products/ham-burger.jpg';
import hamBurgerCheese from './images/products/ham-burger-cheese.jpg';
import hamBurgerEgg from './images/products/ham-burger-egg.jpg';
import hamBurgerCheeseEgg from './images/products/ham-burger-cheese-egg.jpg';
import burgerBaconHam from './images/products/burger-bacon-ham.jpg';
import complete from './images/products/complete.jpg';
import completeBacon from './images/products/complete-bacon.jpg';
import eggCheese from './images/products/egg-cheese.jpg';
import eggSandwich from './images/products/egg-sandwich.jpg';
import baconSandwich from './images/products/bacon-sandwich.jpg';
import baconHamSandwich from './images/products/bacon-ham-sandwich.jpg';
import baconEggSandwich from './images/products/bacon-egg-sandwich.jpg';
import baconCheeseSandwich from './images/products/bacon-cheese-sandwich.jpg';
import baconCheeseHamSandwich from './images/products/bacon-cheese-ham-sandwich.jpg';
import baconCheeseEggSandwich from './images/products/bacon-cheese-egg-sandwich.jpg';
import halfLong from './images/products/12-long.jpg';
import halfLongCheese from './images/products/12-long-cheese.jpg';
import halfLongBacon from './images/products/12-long-bacon.jpg';
import halfLongHam from './images/products/12-long-ham.jpg';
import halfLongEgg from './images/products/12-long-egg.jpg';
import halfLongBaconCheese from './images/products/12-long-bacon-cheese.jpg';
import footlong from './images/products/footlong.jpg';
import footlongHam from './images/products/footlong-ham.jpg';
import footlongEggCheese from './images/products/footlong-egg-cheese.jpg';
import footlongCheese from './images/products/footlong-cheese.jpg';
import footlongBacon from './images/products/footlong-bacon.jpg';
import footlongCheeseBacon from './images/products/footlong-cheese-bacon.jpg';
import footlongHamBacon from './images/products/footlong-ham-bacon.jpg';
import siomaiRice from './images/products/siomai-rice.jpg';
import hamRice from './images/products/ham-rice.jpg';
import eggRice from './images/products/egg-rice.jpg';
import hotdogRice from './images/products/hotdog-rice.jpg';
import siomai from './images/products/4pcs-siomai.jpg';
import patty from './images/products/patty.jpg';
import ham from './images/products/ham.jpg';
import mountainDew from './images/products/mountain-dew.jpg';
import pepsi from './images/products/pepsi.jpg';
import rootbeer from './images/products/rootbeer.jpg';

export default function MenuPage({ user, onSignOut }) {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [inventory, setInventory] = useState([]);


  // Load top selling products and subscribe to inventory
  useEffect(() => {
    loadTopProducts();
    
    // Subscribe to inventory changes
    console.log('Setting up inventory subscription...');
    const unsubscribe = subscribeToInventory((inventoryData) => {
      console.log('Inventory updated:', inventoryData);
      console.log('Inventory count:', inventoryData.length);
      setInventory(inventoryData);
    });

    return () => {
      console.log('Cleaning up inventory subscription');
      unsubscribe();
    };
  }, []);

  const loadTopProducts = async () => {
    try {
      const products = await getTopSellingProducts();
      console.log('Top products:', products);
      setTopProducts(products);
    } catch (error) {
      console.error('Error loading top products:', error);
    }
  };

  // Check if item is sold out based on inventory
  const isItemSoldOut = (item) => {
    // If no ingredients defined, item is always available
    if (!item.ingredients || item.ingredients.length === 0) {
      return false;
    }

    // CRITICAL: If inventory collection is empty or not loaded,
    // mark items with ingredients as SOLD OUT (no stock available)
    if (!inventory || inventory.length === 0) {
      console.log(`⚠️ No inventory data - ${item.name} is SOLD OUT`);
      return true; // Changed from false to true
    }

    console.log(`Checking ${item.name}:`, {
      ingredients: item.ingredients,
      inventory: inventory.map(i => ({ name: i.name, stock: i.stock }))
    });

    // Check each ingredient
    for (const ingredientName of item.ingredients) {
      // Try to find ingredient in inventory (case-insensitive)
      const inventoryItem = inventory.find(
        inv => inv.name.toLowerCase().trim() === ingredientName.toLowerCase().trim()
      );

      console.log(`  - Checking ${ingredientName}:`, inventoryItem);

      // If ingredient not found in inventory or stock is 0 or less, item is sold out
      if (!inventoryItem || inventoryItem.stock <= 0) {
        console.log(`  ❌ ${item.name} is SOLD OUT (${ingredientName} not available)`);
        return true;
      }
    }

    console.log(`  ✅ ${item.name} is available`);
    return false;
  };

  const menuItems = {
    'Burgers': [
      { id: 1, name: 'CDO Burger', price: 27, category: 'Burgers', image: cdoBurger, emoji: '🍔', description: 'Classic burger with our signature patty', ingredients: ['Patty', 'Bun'] },
      { id: 2, name: 'Burger with Ham', price: 36, category: 'Burgers', image: burgerWithHam, emoji: '🍔', description: 'Juicy burger topped with savory ham', ingredients: ['Patty', 'Ham', 'Bun'] },
      { id: 3, name: 'Burger with Egg', price: 37, category: 'Burgers', image: burgerEgg, emoji: '🍔', description: 'Burger with a perfectly fried egg', ingredients: ['Patty', 'Egg', 'Bun'] },
      { id: 4, name: 'Burger with Bacon', price: 42, category: 'Burgers', image: burgerBacon, emoji: '🍔', description: 'Crispy bacon makes this burger special', ingredients: ['Patty', 'Bacon', 'Bun'] },
      { id: 5, name: 'Cheese Burger', price: 35, category: 'Burgers', image: cheeseBurger, emoji: '🍔', description: 'Melted cheese perfection', ingredients: ['Patty', 'Cheese', 'Bun'] },
      { id: 6, name: 'Cheese Burger with Ham', price: 41, category: 'Burgers', image: cheeseBurgerHam, emoji: '🍔', description: 'Cheese and ham combo', ingredients: ['Patty', 'Cheese', 'Ham', 'Bun'] },
      { id: 7, name: 'Cheese Burger with Egg', price: 43, category: 'Burgers', image: cheeseBurgerEgg, emoji: '🍔', description: 'Cheese and egg delight', ingredients: ['Patty', 'Cheese', 'Egg', 'Bun'] },
      { id: 8, name: 'Cheese Burger with Bacon', price: 47, category: 'Burgers', image: cheeseBurgerBacon, emoji: '🍔', description: 'Triple threat: cheese, bacon, and patty', ingredients: ['Patty', 'Cheese', 'Bacon', 'Bun'] },
      { id: 9, name: 'Ham Burger', price: 29, category: 'Burgers', image: hamBurger, emoji: '🍔', description: 'Simple and delicious ham burger', ingredients: ['Ham', 'Bun', 'Patty'] },
      { id: 10, name: 'Ham Burger with Cheese', price: 36, category: 'Burgers', image: hamBurgerCheese, emoji: '🍔', description: 'Ham and cheese classic', ingredients: ['Ham', 'Cheese', 'Bun', 'Patty'] },
      { id: 11, name: 'Ham Burger with Egg', price: 34, category: 'Burgers', image: hamBurgerEgg, emoji: '🍔', description: 'Ham and egg breakfast style', ingredients: ['Ham', 'Egg', 'Bun', 'Patty'] },
      { id: 12, name: 'Hamburger With Cheese and Egg', price: 48, category: 'Burgers', image: hamBurgerCheeseEgg, emoji: '🍔', description: 'Loaded with ham, cheese, and egg', ingredients: ['Ham', 'Cheese', 'Egg', 'Bun', 'Patty'] },
      { id: 13, name: 'Burger Bacon Ham', price: 52, category: 'Burgers', image: burgerBaconHam, emoji: '🍔', description: 'Bacon and ham power combo', ingredients: ['Patty', 'Bacon', 'Ham', 'Bun'] },
      { id: 24, name: 'Complete', price: 64, category: 'Burgers', image: complete, emoji: '🍔', tag: 'SIGNATURE', description: 'Our signature burger with everything!', ingredients: ['Patty', 'Cheese', 'Ham', 'Egg', 'Bun'] },
      { id: 25, name: 'Complete change Bacon', price: 62, category: 'Burgers', image: completeBacon, emoji: '🍔', description: 'Complete burger, bacon style', ingredients: ['Patty', 'Cheese', 'Bacon', 'Egg', 'Bun'] },
      { id: 26, name: 'Complete with Bacon', price: 67, category: 'Burgers', image: completeBacon, emoji: '🍔', description: 'The ultimate burger experience', ingredients: ['Patty', 'Cheese', 'Ham', 'Bacon', 'Egg', 'Bun'] },
    ],
    'Sandwiches': [
      { id: 14, name: 'Egg Cheese', price: 38, category: 'Sandwiches', image: eggCheese, emoji: '🥪', description: 'Egg and cheese sandwich', ingredients: ['Egg', 'Cheese', 'Bun'] },
      { id: 15, name: 'Egg Sandwich', price: 30, category: 'Sandwiches', image: eggSandwich, emoji: '🥪', description: 'Simple egg sandwich', ingredients: ['Egg', 'Bun'] },
      { id: 16, name: 'Bacon Sandwich', price: 40, category: 'Sandwiches', image: baconSandwich, emoji: '🥪', description: 'Crispy bacon sandwich', ingredients: ['Bacon', 'Bun'] },
      { id: 19, name: 'Bacon with Ham', price: 48, category: 'Sandwiches', image: baconHamSandwich, emoji: '🥪', description: 'Bacon and ham combo', ingredients: ['Bacon', 'Ham', 'Bun'] },
      { id: 20, name: 'Bacon with Egg', price: 49, category: 'Sandwiches', image: baconEggSandwich, emoji: '🥪', description: 'Bacon and egg classic', ingredients: ['Bacon', 'Egg', 'Bun'] },
      { id: 21, name: 'Bacon with Cheese', price: 51, category: 'Sandwiches', image: baconCheeseSandwich, emoji: '🥪', description: 'Bacon and cheese delight', ingredients: ['Bacon', 'Cheese', 'Bun'] },
      { id: 22, name: 'Bacon Cheese with Ham', price: 52, category: 'Sandwiches', image: baconCheeseHamSandwich, emoji: '🥪', description: 'Loaded bacon sandwich', ingredients: ['Bacon', 'Cheese', 'Ham', 'Bun'] },
      { id: 23, name: 'Bacon Cheese With Egg', price: 54, category: 'Sandwiches', image: baconCheeseEggSandwich, emoji: '🥪', description: 'Bacon, cheese, and egg combo', ingredients: ['Bacon', 'Cheese', 'Egg', 'Bun'] },
    ],
    'Hot Dogs': [
      { id: 27, name: '1/2 Long', price: 30, category: 'Hot Dogs', image: halfLong, emoji: '🌭', description: 'Half-size hot dog', ingredients: ['Hotdog', 'Bun'] },
      { id: 28, name: '1/2 Long Cheese', price: 37, category: 'Hot Dogs', image: halfLongCheese, emoji: '🌭', description: 'Half-size with cheese', ingredients: ['Hotdog', 'Cheese', 'Bun'] },
      { id: 29, name: '1/2 Long Bacon', price: 43, category: 'Hot Dogs', image: halfLongBacon, emoji: '🌭', description: 'Half-size with bacon', ingredients: ['Hotdog', 'Bacon', 'Bun'] },
      { id: 30, name: '1/2 Long Ham', price: 42, category: 'Hot Dogs', image: halfLongHam, emoji: '🌭', description: 'Half-size with ham', ingredients: ['Hotdog', 'Ham', 'Bun'] },
      { id: 31, name: '1/2 Long Egg', price: 44, category: 'Hot Dogs', image: halfLongEgg, emoji: '🌭', description: 'Half-size with egg', ingredients: ['Hotdog', 'Egg', 'Bun'] },
      { id: 32, name: '1/2 Long Bacon Cheese', price: 53, category: 'Hot Dogs', image: halfLongBaconCheese, emoji: '🌭', description: 'Half-size loaded', ingredients: ['Hotdog', 'Bacon', 'Cheese', 'Bun'] },
      { id: 33, name: 'Footlong', price: 47, category: 'Hot Dogs', image: footlong, emoji: '🌭', description: 'Full-size hot dog', ingredients: ['Footlong', 'Bun'] },
      { id: 34, name: 'Footlong Ham', price: 53, category: 'Hot Dogs', image: footlongHam, emoji: '🌭', description: 'Footlong with ham', ingredients: ['Footlong', 'Ham', 'Bun'] },
      { id: 35, name: 'Footlong Egg Cheese', price: 58, category: 'Hot Dogs', image: footlongEggCheese, emoji: '🌭', description: 'Footlong with egg and cheese', ingredients: ['Footlong', 'Egg', 'Cheese', 'Bun'] },
      { id: 36, name: 'Footlong Cheese', price: 56, category: 'Hot Dogs', image: footlongCheese, emoji: '🌭', description: 'Footlong with cheese', ingredients: ['Footlong', 'Cheese', 'Bun'] },
      { id: 37, name: 'Footlong Bacon', price: 64, category: 'Hot Dogs', image: footlongBacon, emoji: '🌭', description: 'Footlong with bacon', ingredients: ['Footlong', 'Bacon', 'Bun'] },
      { id: 38, name: 'Footlong Cheese with Bacon', price: 77, category: 'Hot Dogs', image: footlongCheeseBacon, emoji: '🌭', description: 'Ultimate footlong', ingredients: ['Footlong', 'Cheese', 'Bacon', 'Bun'] },
      { id: 39, name: 'Footlong Ham with Bacon', price: 77, category: 'Hot Dogs', image: footlongHamBacon, emoji: '🌭', description: 'Footlong ham and bacon', ingredients: ['Footlong', 'Ham', 'Bacon', 'Bun'] },
    ],
    'Rice Meals': [
      { id: 40, name: 'Siomai Rice', price: 40, category: 'Rice Meals', image: siomaiRice, emoji: '🍚', description: 'Siomai with steamed rice', ingredients: ['Siomai', 'Rice'] },
      { id: 41, name: 'Ham Rice', price: 25, category: 'Rice Meals', image: hamRice, emoji: '🍚', description: 'Ham with steamed rice', ingredients: ['Ham', 'Rice'] },
      { id: 42, name: 'Egg Rice', price: 30, category: 'Rice Meals', image: eggRice, emoji: '🍚', description: 'Egg with steamed rice', ingredients: ['Egg', 'Rice'] },
      { id: 43, name: 'Hotdog Rice', price: 35, category: 'Rice Meals', image: hotdogRice, emoji: '🍚', description: 'Hotdog with steamed rice', ingredients: ['Hotdog', 'Rice'] },
    ],
    'Sides': [
      { id: 17, name: '4-pcs Grace Pork Siomai', price: 25, category: 'Sides', image: siomai, emoji: '🥟', description: 'Four pieces of pork siomai', ingredients: ['Siomai'] },
      { id: 18, name: 'Patty', price: 15, category: 'Sides', image: patty, emoji: '🥩', description: 'Single burger patty', ingredients: ['Patty'] },
      { id: 44, name: 'Ham', price: 12, category: 'Sides', image: ham, emoji: '🥓', description: 'Sliced ham', ingredients: ['Ham'] },
    ],
    'Beverages': [
      { id: 45, name: 'Mountain Dew', price: 25, category: 'Beverages', image: mountainDew, emoji: '🥤', description: 'Refreshing citrus soda', ingredients: ['Softdrinks'] },
      { id: 46, name: 'Pepsi', price: 15, category: 'Beverages', image: pepsi, emoji: '🥤', description: 'Classic cola', ingredients: ['Softdrinks'] },
      { id: 47, name: 'Rootbeer', price: 15, category: 'Beverages', image: rootbeer, emoji: '🥤', description: 'Smooth rootbeer', ingredients: ['Softdrinks'] },
    ],
  };

  const openItemModal = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const categories = ['All', ...Object.keys(menuItems)];
  const allItems = Object.values(menuItems).flat();

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = async (paymentMethod, gcashReference = null) => {
    console.log('Order placed with payment method:', paymentMethod);
    console.log('Cart:', cart);
    
    try {
      const now = new Date();
      const orderNumber = `#GB-${now.getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Format date and time
      const orderDate = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const orderTime = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      // Prepare order data for Firebase
      const firebaseOrderData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        orderNumber: orderNumber,
        date: orderDate,
        time: orderTime,
        timestamp: now.toISOString(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          image: item.image,
          ingredients: item.ingredients
        })),
        subtotal: getTotalPrice(),
        totalAmount: getTotalPrice(),
        paymentMethod: paymentMethod === 'cash' ? 'Cash on Delivery' : 'GCash',
        paymentReference: paymentMethod === 'gcash' ? gcashReference : null,
        status: 'received',
        paymentConfirmed: paymentMethod === 'cash' ? false : true,
        pickupLocation: {
          name: 'Grace Burger CDO',
          street: '123 Main Street',
          barangay: 'Barangay Carmen',
          city: 'Cagayan de Oro City'
        },
        estimatedTime: '20-30 mins',
        contactNumber: '+63 912 345 6789'
      };

      // Save to Firebase
      const orderId = await saveOrder(firebaseOrderData);
      console.log('Order saved with ID:', orderId);

      // Prepare order data for Receipt page
      const receiptData = {
        id: orderId,
        orderNumber: orderNumber,
        date: orderDate,
        time: orderTime,
        timestamp: now,
        paymentMethod: paymentMethod === 'cash' ? 'Cash on Delivery' : 'GCash',
        reference: paymentMethod === 'gcash' ? `Ref: ${gcashReference}` : null,
        contactNumber: '+63 912 345 6789',
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        subtotal: getTotalPrice(),
        total: getTotalPrice(),
        pickupLocation: {
          name: 'Grace Burger CDO',
          street: '123 Main Street',
          barangay: 'Barangay Carmen',
          city: 'Cagayan de Oro City'
        },
        estimatedTime: '20-30 mins'
      };

      // Show receipt page
      setOrderData(receiptData);
      setCart([]);
      setShowCheckout(false);
      setShowReceipt(true);
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleBackToMenu = () => {
    setShowReceipt(false);
    setOrderData(null);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setShowCheckout(true);
    setShowCart(false);
  };

  // Show Receipt Page
  if (showReceipt && orderData) {
    return (
      <ReceiptPage
        orderData={orderData}
        onBackToMenu={handleBackToMenu}
      />
    );
  }


  // Show Order History Page
  if (showOrderHistory) {
    return (
      <OrderHistoryPage
        user={user}
        onBack={() => setShowOrderHistory(false)}
      />
    );
  }
  // Show Checkout Page
  if (showCheckout) {
    return (
      <CheckoutPage
        cart={cart}
        totalPrice={getTotalPrice()}
        onBack={() => setShowCheckout(false)}
        onPlaceOrder={handlePlaceOrder}
      />
    );
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <header style={{ 
        background: '#000', 
        padding: '1rem 2rem', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        borderBottom: '1px solid #222'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ color: '#D4A027', fontSize: '1.5rem' }}>⬡</div>
            <span style={{ color: '#D4A027', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '2px' }}>
              GRACE BURGER
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setShowOrderHistory(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#D4A027';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
            >
              <ClipboardList size={20} />
            </button>
            <button 
              onClick={() => setShowCart(true)}
              style={{
                background: 'transparent',
                border: '1px solid #333',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <ShoppingCart size={20} />
              {getTotalItems() > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#D4A027',
                  color: '#000',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  {getTotalItems()}
                </span>
              )}
            </button>
            <button 
              onClick={onSignOut}
              style={{
                background: 'transparent',
                border: '1px solid #333',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ 
        padding: '4rem 2rem', 
        textAlign: 'center',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${menuBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <span style={{ color: '#D4A027', fontSize: '0.8rem', letterSpacing: '3px', fontWeight: 600 }}>
          HANDCRAFTED EXCELLENCE
        </span>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, margin: '1rem 0' }}>OUR BURGERS</h1>
        <p style={{ color: '#999', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
          Handcrafted burgers made with the finest ingredients. Each creation is a masterpiece of flavor, texture, and presentation.
        </p>
      </section>


      {/* Top 5 Most Ordered */}
      {topProducts.length > 0 && (
        <section style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '3rem 2rem 2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ 
              color: '#D4A027', 
              fontSize: '0.8rem', 
              letterSpacing: '3px', 
              fontWeight: 600 
            }}>
              CUSTOMER FAVORITES
            </span>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              margin: '0.5rem 0',
              background: 'linear-gradient(135deg, #D4A027 0%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🔥 TOP 5 MOST ORDERED
            </h2>
            <p style={{ color: '#888', fontSize: '0.95rem' }}>
              Our most popular items loved by customers
            </p>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1rem'
          }}>
            {topProducts.slice(0, 5).map((product, index) => {
              // Find the full item details from menuItems
              const allItems = Object.values(menuItems).flat();
              const fullItem = allItems.find(item => item.name === product.name);
              
              if (!fullItem) return null;

              return (
                <div
                  key={product.name}
                  onClick={() => !isItemSoldOut(fullItem) && openItemModal(fullItem)}
                  style={{
                    opacity: isItemSoldOut(fullItem) ? 0.6 : 1,
                    filter: isItemSoldOut(fullItem) ? 'grayscale(50%)' : 'none',
                    cursor: isItemSoldOut(fullItem) ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
                    border: '2px solid #D4A027',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(212, 160, 39, 0.3)';
                    e.currentTarget.style.borderColor = '#FFD700';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#D4A027';
                  }}
                >
                  {/* SOLD OUT Overlay for Top 5 */}
                  {isItemSoldOut(fullItem) && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.9)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 20
                    }}>
                      <div style={{
                        transform: 'rotate(-15deg)',
                        background: '#ff3333',
                        color: '#fff',
                        padding: '0.75rem 2.5rem',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        border: '3px solid #fff',
                        boxShadow: '0 8px 24px rgba(255, 51, 51, 0.5)'
                      }}>
                        SOLD OUT
                      </div>
                    </div>
                  )}

                  {/* Rank Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '50px',
                    height: '50px',
                    background: index === 0 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 
                                index === 1 ? 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' :
                                index === 2 ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' :
                                'linear-gradient(135deg, #D4A027 0%, #B8891F 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    color: '#000',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '3px solid #0a0a0a',
                    zIndex: 2
                  }}>
                    #{index + 1}
                  </div>

                  {/* Image */}
                  {fullItem.image && (
                    <div style={{
                      width: '100%',
                      height: '160px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '1rem',
                      position: 'relative'
                    }}>
                      <img 
                        src={fullItem.image} 
                        alt={fullItem.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: '#D4A027',
                        border: '1px solid #D4A027'
                      }}>
                        ⭐ {product.quantity} SOLD
                      </div>
                    </div>
                  )}

                  {/* Item Name */}
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    margin: '0 0 0.5rem 0',
                    color: '#fff',
                    lineHeight: '1.3'
                  }}>
                    {fullItem.emoji} {fullItem.name}
                  </h3>

                  {/* Category */}
                  <p style={{
                    color: '#888',
                    fontSize: '0.8rem',
                    margin: '0 0 0.75rem 0'
                  }}>
                    {fullItem.category}
                  </p>

                  {/* Price and Add Button */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #333'
                  }}>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#D4A027'
                    }}>
                      ₱{fullItem.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isItemSoldOut(fullItem)) {
                          addToCart(fullItem);
                        }
                      }}
                      disabled={isItemSoldOut(fullItem)}
                      style={{
                        background: isItemSoldOut(fullItem) ? '#666' : '#D4A027',
                        border: 'none',
                        color: isItemSoldOut(fullItem) ? '#999' : '#000',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: isItemSoldOut(fullItem) ? 'not-allowed' : 'pointer',
                        opacity: isItemSoldOut(fullItem) ? 0.5 : 1,
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FFD700';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#D4A027';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Plus size={16} />
                      ADD
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#111',
          border: '1px solid #333',
          borderRadius: '50px',
          padding: '0.75rem 1.5rem',
          marginBottom: '2rem',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              marginLeft: '1rem',
              width: '100%',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                background: selectedCategory === category ? '#D4A027' : 'transparent',
                border: '1px solid ' + (selectedCategory === category ? '#D4A027' : '#333'),
                color: selectedCategory === category ? '#000' : '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '2rem' 
        }}>
          {filteredItems.map(item => {
            const soldOut = isItemSoldOut(item);
            return (
          <div 
            key={item.id} 
            className="menu-card" 
            onClick={() => !soldOut && openItemModal(item)} 
            style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '1.5rem',
            position: 'relative',
            cursor: soldOut ? 'not-allowed' : 'pointer',
            opacity: soldOut ? 0.6 : 1,
            filter: soldOut ? 'grayscale(50%)' : 'none'
          }}>
            {/* SOLD OUT Overlay */}
            {isItemSoldOut(item) && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'none'
              }}>
                <div style={{
                  transform: 'rotate(-15deg)',
                  background: '#ff3333',
                  color: '#fff',
                  padding: '1rem 3rem',
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  letterSpacing: '3px',
                  border: '4px solid #fff',
                  boxShadow: '0 8px 24px rgba(255, 51, 51, 0.5)',
                  textAlign: 'center',
                  lineHeight: '1'
                }}>
                  SOLD OUT
                </div>
              </div>
            )}

            {item.tag && (
              <span style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: '#D4A027',
                color: '#000',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                letterSpacing: '1px',
                zIndex: 1
              }}>
                {item.tag}
              </span>
            )}
            
            {/* REPLACE THE EMOJI DIV WITH THIS IMAGE DIV */}
            <div style={{ 
              width: '100%',
              height: '200px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '1rem',
              background: '#000'
            }}>
              <img 
                src={item.image} 
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:4rem;">' + item.emoji + '</div>';
                }}
              />
            </div>
            
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{item.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#D4A027', fontSize: '1.3rem', fontWeight: 'bold' }}>
                  ₱{item.price}
                </span>
                <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(item);
                }}
                className="add-to-cart-btn"
                style={{
                  background: '#D4A027',
                  border: 'none',
                  color: '#000',
                  padding: '0.5rem 1rem',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Plus size={16} /> Add
              </button>
              </div>
          </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#000',
        borderTop: '1px solid #222',
        padding: '3rem 2rem',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{
              color: '#D4A027',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              letterSpacing: '2px'
            }}>
              GRACE BURGER
            </h3>
            <p style={{
              color: '#999',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Crafting exceptional burgers and hot dogs with passion and precision. Every meal is made with premium ingredients and served with pride since 2024.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['f', '📷', '🐦', '▶️'].map((icon, i) => (
                <button
                  key={i}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4A027',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Links */}
          <div>
            <h4 style={{
              color: '#D4A027',
              fontSize: '1rem',
              marginBottom: '1rem',
              letterSpacing: '2px'
            }}>
              MENU
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Burgers', 'Hot Dogs', 'Rice Meals', 'Beverages'].map(item => (
                <li key={item} style={{ marginBottom: '0.75rem' }}>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    padding: 0
                  }}>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 style={{
              color: '#D4A027',
              fontSize: '1rem',
              marginBottom: '1rem',
              letterSpacing: '2px'
            }}>
              COMPANY
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['About Us', 'Locations', 'Careers', 'Franchise'].map(item => (
                <li key={item} style={{ marginBottom: '0.75rem' }}>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    padding: 0
                  }}>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              color: '#D4A027',
              fontSize: '1rem',
              marginBottom: '1rem',
              letterSpacing: '2px'
            }}>
              CONTACT
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#999',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: '#D4A027' }}>📍</span>
                Cagayan de Oro City
              </li>
              <li style={{
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#999',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: '#D4A027' }}>📞</span>
                +63 XXX-XXX-XXXX
              </li>
              <li style={{
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#999',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: '#D4A027' }}>✉️</span>
                hello@graceburger.ph
              </li>
              <li style={{
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#999',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: '#D4A027' }}>🕐</span>
                10:00 AM - 10:00 PM Daily
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid #222',
          marginTop: '3rem',
          paddingTop: '2rem',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          © 2024 Grace Burger. All Rights Reserved. Handcrafted with love in CDO.
        </div>
      </footer>

      {/* Item Details Modal */}
      {showItemModal && selectedItem && (
        <div 
          onClick={() => setShowItemModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0a0a0a',
              border: '2px solid #D4A027',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowItemModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#D4A027',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} />
            </button>

            {/* Item Image */}
            <div style={{
              width: '100%',
              height: '300px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '1.5rem',
              background: '#000'
            }}>
              <img 
                src={selectedItem.image} 
                alt={selectedItem.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Item Tag */}
            {selectedItem.tag && (
              <div style={{
                display: 'inline-block',
                background: '#D4A027',
                color: '#000',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                letterSpacing: '1px',
                marginBottom: '1rem'
              }}>
                {selectedItem.tag}
              </div>
            )}

            {/* Item Name */}
            <h2 style={{
              color: '#fff',
              fontSize: '2rem',
              marginBottom: '0.5rem'
            }}>
              {selectedItem.name}
            </h2>

            {/* Item Price */}
            <div style={{
              color: '#D4A027',
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem'
            }}>
              ₱{selectedItem.price}
            </div>

            {/* Description */}
            <p style={{
              color: '#999',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              {selectedItem.description}
            </p>

            {/* Ingredients Section */}
            <div style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: '#D4A027',
                fontSize: '1.2rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🥘 Ingredients
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                {selectedItem.ingredients.map((ingredient, index) => (
                  <span 
                    key={index}
                    style={{
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                addToCart(selectedItem);
                setShowItemModal(false);
              }}
              style={{
                width: '100%',
                background: '#D4A027',
                border: 'none',
                color: '#000',
                padding: '1rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s'
              }}
            >
              <Plus size={20} />
              Add to Cart - ₱{selectedItem.price}
            </button>
          </div>
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div 
          onClick={() => setShowCart(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '400px',
              background: '#0a0a0a',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid #222'
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#D4A027', fontSize: '1.5rem' }}>Your Order</h2>
              <button 
                onClick={() => setShowCart(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {cart.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', gap: '1rem' }}>
                  <ShoppingCart size={48} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ background: '#111', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #222' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                      <div>
                        <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                        <span style={{ color: '#D4A027', fontWeight: 'bold' }}>₱{item.price}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{ background: '#222', border: '1px solid #333', color: '#fff', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{ background: '#222', border: '1px solid #333', color: '#fff', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: '#ff4444', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid #222' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  <span>Total:</span>
                  <span style={{ color: '#D4A027', fontWeight: 'bold', fontSize: '1.5rem' }}>₱{getTotalPrice()}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  style={{ width: '100%', background: '#D4A027', border: 'none', color: '#000', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}