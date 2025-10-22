// firebase-admin.js - Add these functions to your existing firebase.js

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== INVENTORY MANAGEMENT ====================

// Initialize Inventory (Run this once to set up inventory)
export const initializeInventory = async () => {
  const inventoryItems = [
    { name: 'Patty', category: 'INGREDIENTS', stock: 150, unit: 'pcs', price: 15, lowStockThreshold: 20 },
    { name: 'Cheese', category: 'INGREDIENTS', stock: 80, unit: 'slices', price: 10, lowStockThreshold: 15 },
    { name: 'Ham', category: 'INGREDIENTS', stock: 60, unit: 'slices', price: 12, lowStockThreshold: 15 },
    { name: 'Egg', category: 'INGREDIENTS', stock: 45, unit: 'pcs', price: 8, lowStockThreshold: 10 },
    { name: 'Bacon', category: 'INGREDIENTS', stock: 35, unit: 'strips', price: 15, lowStockThreshold: 10 },
    { name: 'Bun', category: 'INGREDIENTS', stock: 120, unit: 'pcs', price: 5, lowStockThreshold: 20 },
    { name: 'Hotdog', category: 'INGREDIENTS', stock: 70, unit: 'pcs', price: 12, lowStockThreshold: 15 },
    { name: 'Footlong', category: 'INGREDIENTS', stock: 40, unit: 'pcs', price: 20, lowStockThreshold: 10 },
    { name: 'Siomai', category: 'INGREDIENTS', stock: 100, unit: 'pcs', price: 6, lowStockThreshold: 20 },
    { name: 'Softdrinks', category: 'BEVERAGES', stock: 95, unit: 'bottles', price: 15, lowStockThreshold: 20 },
    { name: 'Rice', category: 'INGREDIENTS', stock: 200, unit: 'cups', price: 10, lowStockThreshold: 30 }
  ];

  try {
    const inventoryCollection = collection(db, 'inventory');
    for (const item of inventoryItems) {
      await addDoc(inventoryCollection, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('Inventory initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing inventory:', error);
    throw error;
  }
};

// Get All Inventory Items
export const getInventory = async () => {
  try {
    const inventoryCollection = collection(db, 'inventory');
    const inventorySnapshot = await getDocs(inventoryCollection);
    const inventoryList = inventorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return inventoryList;
  } catch (error) {
    console.error('Error getting inventory:', error);
    throw error;
  }
};

// Listen to Inventory Changes (Real-time)
export const subscribeToInventory = (callback) => {
  const inventoryCollection = collection(db, 'inventory');
  const q = query(inventoryCollection, orderBy('name'));
  
  return onSnapshot(q, (snapshot) => {
    const inventoryList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(inventoryList);
  });
};

// Add Inventory Item
export const addInventoryItem = async (itemData) => {
  try {
    const inventoryCollection = collection(db, 'inventory');
    const docRef = await addDoc(inventoryCollection, {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

// Update Inventory Item
export const updateInventoryItem = async (itemId, updates) => {
  try {
    const itemRef = doc(db, 'inventory', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

// Delete Inventory Item
export const deleteInventoryItem = async (itemId) => {
  try {
    const itemRef = doc(db, 'inventory', itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

// Deduct Inventory (when order is accepted)
export const deductInventory = async (orderItems) => {
  try {
    // Calculate ingredients needed from order
    const ingredientsNeeded = {};
    
    for (const item of orderItems) {
      // Parse item name to identify ingredients
      const itemName = item.name.toLowerCase();
      
      // Count basic ingredients
      if (itemName.includes('burger') || itemName.includes('ham burger')) {
        ingredientsNeeded['Patty'] = (ingredientsNeeded['Patty'] || 0) + item.quantity;
        ingredientsNeeded['Bun'] = (ingredientsNeeded['Bun'] || 0) + item.quantity;
      }
      if (itemName.includes('cheese')) {
        ingredientsNeeded['Cheese'] = (ingredientsNeeded['Cheese'] || 0) + item.quantity;
      }
      if (itemName.includes('ham')) {
        ingredientsNeeded['Ham'] = (ingredientsNeeded['Ham'] || 0) + item.quantity;
      }
      if (itemName.includes('egg')) {
        ingredientsNeeded['Egg'] = (ingredientsNeeded['Egg'] || 0) + item.quantity;
      }
      if (itemName.includes('bacon')) {
        ingredientsNeeded['Bacon'] = (ingredientsNeeded['Bacon'] || 0) + item.quantity;
      }
      if (itemName.includes('1/2 long')) {
        ingredientsNeeded['Hotdog'] = (ingredientsNeeded['Hotdog'] || 0) + item.quantity;
        ingredientsNeeded['Bun'] = (ingredientsNeeded['Bun'] || 0) + item.quantity;
      }
      if (itemName.includes('footlong')) {
        ingredientsNeeded['Footlong'] = (ingredientsNeeded['Footlong'] || 0) + item.quantity;
        ingredientsNeeded['Bun'] = (ingredientsNeeded['Bun'] || 0) + item.quantity;
      }
      if (itemName.includes('siomai')) {
        ingredientsNeeded['Siomai'] = (ingredientsNeeded['Siomai'] || 0) + (item.quantity * 4);
      }
      if (itemName.includes('rice')) {
        ingredientsNeeded['Rice'] = (ingredientsNeeded['Rice'] || 0) + item.quantity;
      }
      if (itemName.includes('mountain dew') || itemName.includes('pepsi') || itemName.includes('rootbeer')) {
        ingredientsNeeded['Softdrinks'] = (ingredientsNeeded['Softdrinks'] || 0) + item.quantity;
      }
    }

    // Get current inventory
    const inventoryCollection = collection(db, 'inventory');
    const inventorySnapshot = await getDocs(inventoryCollection);
    
    // Check if ingredients exist and have enough stock
    const missingIngredients = [];
    const insufficientIngredients = [];
    
    for (const [ingredient, quantityNeeded] of Object.entries(ingredientsNeeded)) {
      const itemDoc = inventorySnapshot.docs.find(doc => 
        doc.data().name === ingredient
      );
      
      if (!itemDoc) {
        missingIngredients.push(ingredient);
      } else {
        const currentStock = itemDoc.data().stock;
        if (currentStock < quantityNeeded) {
          insufficientIngredients.push({
            name: ingredient,
            needed: quantityNeeded,
            available: currentStock,
            short: quantityNeeded - currentStock
          });
        }
      }
    }
    
    // If there are missing or insufficient ingredients, throw error
    if (missingIngredients.length > 0 || insufficientIngredients.length > 0) {
      let errorMessage = '';
      
      if (missingIngredients.length > 0) {
        errorMessage += `Missing ingredients in inventory: ${missingIngredients.join(', ')}. `;
      }
      
      if (insufficientIngredients.length > 0) {
        const insufficientDetails = insufficientIngredients.map(item => 
          `${item.name} (need ${item.needed}, have ${item.available}, short by ${item.short})`
        ).join(', ');
        errorMessage += `Insufficient stock: ${insufficientDetails}`;
      }
      
      throw new Error(errorMessage);
    }

    // Deduct from inventory
    for (const [ingredient, quantity] of Object.entries(ingredientsNeeded)) {
      const itemDoc = inventorySnapshot.docs.find(doc => 
        doc.data().name === ingredient
      );
      
      if (itemDoc) {
        const itemRef = doc(db, 'inventory', itemDoc.id);
        await updateDoc(itemRef, {
          stock: increment(-quantity),
          updatedAt: serverTimestamp()
        });
      }
    }

    return {
      success: true,
      deducted: ingredientsNeeded
    };
  } catch (error) {
    console.error('Error deducting inventory:', error);
    throw error;
  }
};

// ==================== ORDER MANAGEMENT ====================

// Get All Orders
export const getAllOrders = async () => {
  try {
    const ordersCollection = collection(db, 'orders');
    const ordersSnapshot = await getDocs(query(ordersCollection, orderBy('timestamp', 'desc')));
    const ordersList = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return ordersList;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

// Listen to Orders (Real-time)
export const subscribeToOrders = (callback) => {
  const ordersCollection = collection(db, 'orders');
  const q = query(ordersCollection, orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const ordersList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(ordersList);
  });
};

// Update Order Status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Accept Order (Update status + Deduct Inventory)
export const acceptOrder = async (orderId, orderItems) => {
  try {
    // First, try to deduct inventory (this will throw error if ingredients missing/insufficient)
    await deductInventory(orderItems);
    
    // If deduction successful, update order status
    await updateOrderStatus(orderId, 'preparing');
    
    return true;
  } catch (error) {
    console.error('Error accepting order:', error);
    throw error;
  }
};

export const subscribeToOrderStatus = (orderId, callback) => {
  const orderRef = doc(db, 'orders', orderId);
  
  return onSnapshot(orderRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      callback({
        id: docSnapshot.id,
        ...docSnapshot.data()
      });
    } else {
      callback(null);
    }
  });
};

// Complete Order
export const completeOrder = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: 'ready',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error completing order:', error);
    throw error;
  }
};

// Cancel Order and Delete from Database
export const cancelOrder = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Delete Order from Database
export const deleteOrder = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// ==================== PRODUCT MANAGEMENT ====================

// Mark Product as Sold Out
export const markProductSoldOut = async (productId, isSoldOut) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      soldOut: isSoldOut,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating product sold out status:', error);
    throw error;
  }
};

// Get Low Stock Items
export const getLowStockItems = async () => {
  try {
    const inventoryCollection = collection(db, 'inventory');
    const inventorySnapshot = await getDocs(inventoryCollection);
    
    const lowStockItems = inventorySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.stock <= item.lowStockThreshold);
    
    return lowStockItems;
  } catch (error) {
    console.error('Error getting low stock items:', error);
    throw error;
  }
};

// ==================== ANALYTICS ====================

// Get Today's Revenue
export const getTodayRevenue = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const ordersCollection = collection(db, 'orders');
    const q = query(
      ordersCollection,
      where('timestamp', '>=', today.toISOString()),
      where('status', '!=', 'cancelled')
    );
    
    const ordersSnapshot = await getDocs(q);
    const revenue = ordersSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().totalAmount || 0);
    }, 0);
    
    return revenue;
  } catch (error) {
    console.error('Error getting today revenue:', error);
    throw error;
  }
};

// Get Top Selling Products
export const getTopSellingProducts = async () => {
  try {
    const ordersCollection = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersCollection);
    
    const productCounts = {};
    
    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data();
      if (order.status !== 'cancelled' && order.items) {
        order.items.forEach(item => {
          if (!productCounts[item.name]) {
            productCounts[item.name] = {
              name: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          productCounts[item.name].quantity += item.quantity;
          productCounts[item.name].revenue += item.total;
        });
      }
    });
    
    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    return topProducts;
  } catch (error) {
    console.error('Error getting top selling products:', error);
    throw error;
  }
};