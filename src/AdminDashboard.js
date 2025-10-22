// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  LogOut,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Save,
  XCircle
} from 'lucide-react';
import {
  subscribeToOrders,
  subscribeToInventory,
  acceptOrder,
  completeOrder,
  cancelOrder,
  updateOrderStatus,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getTopSellingProducts,
  initializeInventory
} from './firebase-admin';

export default function AdminDashboard({ user, onSignOut }) {
  const [currentPage, setCurrentPage] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    todayRevenue: 0,
    ordersToday: 0,
    completedToday: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to real-time orders
  useEffect(() => {
    console.log('Setting up orders listener...');
    const unsubscribe = subscribeToOrders((ordersData) => {
      setOrders(ordersData);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayOrders = ordersData.filter(order => {
        const orderDate = order.timestamp ? new Date(order.timestamp).toDateString() : '';
        return orderDate === today;
      });
      
      setStats({
        pendingOrders: ordersData.filter(o => o.status === 'received').length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        ordersToday: todayOrders.length,
        completedToday: todayOrders.filter(o => o.status === 'ready' || o.status === 'completed').length
      });
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time inventory
  useEffect(() => {
    const unsubscribe = subscribeToInventory((inventoryData) => {
      setInventory(inventoryData);
    });

    return () => unsubscribe();
  }, []);

  // Load top products
  useEffect(() => {
    const loadTopProducts = async () => {
      try {
        const products = await getTopSellingProducts();
        setTopProducts(products);
      } catch (error) {
        console.error('Error loading top products:', error);
      }
    };
    loadTopProducts();
  }, [orders]);

  const handleAcceptOrder = async (order) => {
  try {
    await acceptOrder(order.id, order.items);
    alert('Order accepted and inventory updated successfully!');
  } catch (error) {
    console.error('Error accepting order:', error);
    // Show detailed error message to admin
    alert(`Failed to accept order:\n\n${error.message}\n\nPlease check inventory and restock if needed.`);
  }
};

  const handleCompleteOrder = async (orderId) => {
    try {
      await completeOrder(orderId);
      alert('Order marked as ready for pickup!');
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order: ' + error.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel and delete this order?')) {
      try {
        await cancelOrder(orderId); // This now deletes the order
        alert('Order cancelled and deleted successfully!');
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order: ' + error.message);
      }
    }
  };

  const handleSaveInventoryItem = async (item) => {
    try {
      if (item.id) {
        await updateInventoryItem(item.id, {
          name: item.name,
          category: item.category,
          stock: parseInt(item.stock),
          unit: item.unit,
          price: parseFloat(item.price),
          lowStockThreshold: parseInt(item.lowStockThreshold)
        });
        alert('Inventory item updated!');
      } else {
        await addInventoryItem({
          name: item.name,
          category: item.category,
          stock: parseInt(item.stock),
          unit: item.unit,
          price: parseFloat(item.price),
          lowStockThreshold: parseInt(item.lowStockThreshold)
        });
        alert('Inventory item added!');
      }
      setEditingItem(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save item: ' + error.message);
    }
  };

  const handleDeleteInventoryItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteInventoryItem(itemId);
        alert('Inventory item deleted!');
      } catch (error) {
        console.error('Error deleting inventory item:', error);
        alert('Failed to delete item: ' + error.message);
      }
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialize inventory button (for first-time setup)
  const handleInitializeInventory = async () => {
    if (window.confirm('This will initialize the inventory with default items. Continue?')) {
      try {
        await initializeInventory();
        alert('Inventory initialized successfully!');
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to initialize inventory');
      }
    }
  };

  const handlePickupComplete = async (orderId) => {
  if (window.confirm('Mark this order as picked up by customer?')) {
    try {
      await updateOrderStatus(orderId, 'completed');
      alert('Order marked as completed!');
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order: ' + error.message);
    }
  }
};

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        background: '#000',
        borderRight: '1px solid #222',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍔</div>
          <h1 style={{ color: '#D4A027', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px' }}>
            GRACE<br/>BURGER
          </h1>
          <p style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.5rem', letterSpacing: '2px' }}>ADMIN PANEL</p>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders', badge: stats.pendingOrders },
            { id: 'inventory', icon: <Package size={20} />, label: 'Inventory', badge: null },
            { id: 'analytics', icon: <TrendingUp size={20} />, label: 'Analytics', badge: null },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                background: currentPage === item.id ? '#D4A027' : 'transparent',
                border: currentPage === item.id ? 'none' : '1px solid #222',
                color: currentPage === item.id ? '#000' : '#999',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.95rem',
                fontWeight: currentPage === item.id ? 'bold' : 'normal',
                position: 'relative'
              }}
            >
              {item.icon}
              {item.label}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  right: '1rem',
                  background: '#f44336',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid #333',
            color: '#f44336',
            padding: '1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.95rem'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', flex: 1, padding: '2rem' }}>
        {/* Orders Page */}
        {currentPage === 'orders' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#D4A027' }}>
              ORDERS MANAGEMENT
            </h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                <AlertCircle size={32} color="#D4A027" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D4A027' }}>{stats.pendingOrders}</h3>
                <p style={{ color: '#999', fontSize: '0.9rem' }}>PENDING ORDERS</p>
              </div>
              <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                <span style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}>₱</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D4A027' }}>₱{stats.todayRevenue}</h3>
                <p style={{ color: '#999', fontSize: '0.9rem' }}>TODAY'S REVENUE</p>
              </div>
              <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                <ShoppingBag size={32} color="#D4A027" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D4A027' }}>{stats.ordersToday}</h3>
                <p style={{ color: '#999', fontSize: '0.9rem' }}>ORDERS TODAY</p>
              </div>
              <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                <Check size={32} color="#D4A027" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D4A027' }}>{stats.completedToday}</h3>
                <p style={{ color: '#999', fontSize: '0.9rem' }}>COMPLETED</p>
              </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '2rem' }}>
              <input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '1rem',
                  color: '#fff',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>

            {/* Orders List */}
            {filteredOrders.map((order) => (
              <div key={order.id} style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  {/* LEFT SIDE - Order Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <h3 style={{ color: '#D4A027', fontSize: '1.2rem' }}>{order.orderNumber}</h3>
                      <span style={{
                        background: 
                          order.status === 'received' || order.status === 'PROCESSING' ? '#D4A027' : 
                          order.status === 'preparing' ? '#FF9800' : 
                          order.status === 'ready' ? '#4CAF50' : 
                          '#666',
                        color: order.status === 'ready' ? '#fff' : '#000',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <p style={{ color: '#fff', marginBottom: '0.5rem' }}>{order.userName}</p>
                    <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      {order.items?.map(item => `${item.quantity}× ${item.name}`).join(', ')}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ color: '#D4A027', fontSize: '1.3rem', fontWeight: 'bold' }}>
                        ₱{order.totalAmount}
                      </span>
                      <span style={{
                        background: order.paymentMethod === 'GCash' ? '#007AFF' : '#666',
                        color: '#fff',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {order.paymentMethod === 'GCash' ? 'GCASH PAID' : 'CASH ON PICKUP'}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT SIDE - Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(order.status?.toLowerCase() === 'received' || order.status?.toLowerCase() === 'processing') && (
                      <button
                        onClick={() => handleAcceptOrder(order)}
                        style={{
                          background: '#4CAF50',
                          border: 'none',
                          color: '#fff',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontWeight: 'bold'
                        }}
                      >
                        <Check size={20} />
                        ACCEPT
                      </button>
                    )}
                    
                    {order.status?.toLowerCase() === 'preparing' && (
                      <button
                        onClick={() => handleCompleteOrder(order.id)}
                        style={{
                          background: '#D4A027',
                          border: 'none',
                          color: '#000',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        MARK READY
                      </button>
                    )}
                    
                    {order.status?.toLowerCase() === 'ready' && (
                      <button
                        onClick={() => handlePickupComplete(order.id)}
                        style={{
                          background: '#4CAF50',
                          border: 'none',
                          color: '#fff',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontWeight: 'bold'
                        }}
                      >
                        <Check size={20} />
                        COMPLETE
                      </button>
                    )}
                    
                    {(order.status?.toLowerCase() !== 'cancelled' && order.status?.toLowerCase() !== 'completed') && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        style={{
                          background: '#f44336',
                          border: 'none',
                          color: '#fff',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inventory Page */}
        {currentPage === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D4A027' }}>INVENTORY</h1>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleInitializeInventory}
                  style={{
                    background: '#666',
                    border: 'none',
                    color: '#fff',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                >
                  Initialize Inventory
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    background: '#D4A027',
                    border: 'none',
                    color: '#000',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus size={20} />
                  ADD PRODUCT
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '1rem',
                  color: '#fff',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filteredInventory.map((item) => (
                <div key={item.id} style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  position: 'relative'
                }}>
                  {editingItem?.id === item.id ? (
                    <div>
                      <input
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        style={{
                          background: '#111',
                          border: '1px solid #333',
                          color: '#fff',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          width: '100%',
                          marginBottom: '0.5rem'
                        }}
                      />
                      <input
                        type="number"
                        value={editingItem.stock}
                        onChange={(e) => setEditingItem({...editingItem, stock: e.target.value})}
                        style={{
                          background: '#111',
                          border: '1px solid #333',
                          color: '#fff',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          width: '100%',
                          marginBottom: '0.5rem'
                        }}
                        placeholder="Stock"
                      />
                      <input
                        type="number"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                        style={{
                          background: '#111',
                          border: '1px solid #333',
                          color: '#fff',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          width: '100%',
                          marginBottom: '1rem'
                        }}
                        placeholder="Price"
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleSaveInventoryItem(editingItem)}
                          style={{
                            flex: 1,
                            background: '#4CAF50',
                            border: 'none',
                            color: '#fff',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          style={{
                            flex: 1,
                            background: '#666',
                            border: 'none',
                            color: '#fff',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <XCircle size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                          <span style={{ color: '#999', fontSize: '0.85rem', textTransform: 'uppercase' }}>{item.category}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setEditingItem(item)}
                            style={{ background: '#333', border: 'none', color: '#D4A027', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteInventoryItem(item.id)}
                            style={{ background: '#333', border: 'none', color: '#f44336', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                          <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.25rem' }}>PRICE</p>
                          <p style={{ color: '#D4A027', fontSize: '1.3rem', fontWeight: 'bold' }}>₱{item.price}</p>
                        </div>
                        <div>
                          <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.25rem' }}>STOCK</p>
                          <p style={{ color: item.stock === 0 ? '#f44336' : item.stock <= item.lowStockThreshold ? '#FF9800' : '#4CAF50', fontSize: '1.3rem', fontWeight: 'bold' }}>
                            {item.stock} {item.unit}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        background: item.stock === 0 ? '#f44336' : item.stock <= item.lowStockThreshold ? '#FF9800' : '#4CAF50',
                        color: '#fff',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {item.stock === 0 ? 'OUT OF STOCK' : item.stock <= item.lowStockThreshold ? 'LOW STOCK' : 'IN STOCK'}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  background: '#1a1a1a',
                  border: '2px solid #D4A027',
                  borderRadius: '12px',
                  padding: '2rem',
                  width: '500px',
                  maxWidth: '90%'
                }}>
                  <h2 style={{ color: '#D4A027', marginBottom: '1.5rem' }}>Add New Product</h2>
                  <input
                    placeholder="Product Name"
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    style={{
                      background: '#111',
                      border: '1px solid #333',
                      color: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      width: '100%',
                      marginBottom: '1rem',
                      outline: 'none'
                    }}
                  />
                  <select
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    style={{
                      background: '#111',
                      border: '1px solid #333',
                      color: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      width: '100%',
                      marginBottom: '1rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Category</option>
                    <option value="INGREDIENTS">INGREDIENTS</option>
                    <option value="BEVERAGES">BEVERAGES</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    onChange={(e) => setEditingItem({...editingItem, stock: e.target.value})}
                    style={{
                      background: '#111',
                      border: '1px solid #333',
                      color: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      width: '100%',
                      marginBottom: '1rem',
                      outline: 'none'
                    }}
                  />
                  <input
                    placeholder="Unit (e.g., pcs, slices)"
                    onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                    style={{
                      background: '#111',
                      border: '1px solid #333',
                      color: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      width: '100%',
                      marginBottom: '1rem',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                    style={{
                      background: '#111',
                      border: '1px solid #333',
                      color: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      width: '100%',
                      marginBottom: '1rem',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Low Stock Threshold"
                    onChange={(e) => setEditingItem({...editingItem, lowStockThreshold: e.target.value})}
                    style={{
                      background: '#111',
                      border: '1px solid #333',
                      color: '#fff',
                      padding: '1rem',
                      borderRadius: '8px',
                      width: '100%',
                      marginBottom: '1.5rem',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleSaveInventoryItem(editingItem || {})}
                      style={{
                        flex: 1,
                        background: '#D4A027',
                        border: 'none',
                        color: '#000',
                        padding: '1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ADD PRODUCT
                    </button>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingItem(null);
                      }}
                      style={{
                        flex: 1,
                        background: '#666',
                        border: 'none',
                        color: '#fff',
                        padding: '1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Page */}
        {currentPage === 'analytics' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#D4A027' }}>
              SALES ANALYTICS
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                <TrendingUp size={32} color="#D4A027" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem' }}>TODAY'S REVENUE</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D4A027' }}>₱{stats.todayRevenue}</h3>
              </div>
              <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                <ShoppingBag size={32} color="#D4A027" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem' }}>ORDERS TODAY</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D4A027' }}>{stats.ordersToday}</h3>
              </div>
              <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                <Check size={32} color="#D4A027" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem' }}>COMPLETED</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D4A027' }}>{stats.completedToday}</h3>
              </div>
            </div>

            <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '2rem', border: '1px solid #333' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#D4A027', marginBottom: '2rem' }}>TOP SELLING PRODUCTS</h2>
              {topProducts.map((product, index) => (
                <div key={index} style={{
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                      background: '#D4A027',
                      color: '#000',
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{product.name}</h3>
                      <p style={{ color: '#999', fontSize: '0.85rem' }}>{product.quantity} sold</p>
                    </div>
                  </div>
                  <p style={{ color: '#D4A027', fontSize: '1.5rem', fontWeight: 'bold' }}>₱{product.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}