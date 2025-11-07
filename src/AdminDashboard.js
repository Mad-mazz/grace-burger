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
  XCircle,
  BarChart3
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
  initializeInventory,
  getReturnRequests,
  approveReturnRequest,
  rejectReturnRequest,
  getRevenueStats
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
  const [returnRequests, setReturnRequests] = useState([]);
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    returnedAmount: 0,
    netRevenue: 0,
    orderCount: 0,
    returnCount: 0
  });
  const [monthlySales, setMonthlySales] = useState([]);

  // Calculate monthly sales data
  useEffect(() => {
    if (orders.length > 0) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Get number of days in current month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      // Initialize sales data for each day
      const salesByDay = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        sales: 0,
        orders: 0
      }));
      
      // Calculate sales for each day
      orders.forEach(order => {
        const orderDate = order.timestamp?.toDate ? order.timestamp.toDate() : new Date(order.timestamp);
        const orderMonth = orderDate.getMonth();
        const orderYear = orderDate.getFullYear();
        const orderDay = orderDate.getDate();
        
        // Only include orders from current month and completed orders
        if (orderMonth === currentMonth && 
            orderYear === currentYear && 
            order.status?.toLowerCase() === 'completed') {
          const dayIndex = orderDay - 1;
          if (dayIndex >= 0 && dayIndex < daysInMonth) {
            salesByDay[dayIndex].sales += order.totalAmount || 0;
            salesByDay[dayIndex].orders += 1;
          }
        }
      });
      
      setMonthlySales(salesByDay);
    }
  }, [orders]);

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
      
      // Filter today's orders to only include orders with 'preparing' status (when Accept button is clicked)
      // This ensures revenue and order count only update when Accept is clicked, not Mark Ready
      const acceptedTodayOrders = todayOrders.filter(o => 
        o.status === 'preparing' || o.status === 'ready' || o.status === 'completed'
      );
      
      setStats({
        pendingOrders: ordersData.filter(o => o.status === 'received').length,
        todayRevenue: acceptedTodayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        ordersToday: acceptedTodayOrders.length,
        completedToday: todayOrders.filter(o => o.status === 'completed').length
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
    if (window.confirm('Are you sure you want to cancel this order?\n\nThe order will be marked as CANCELLED and kept in the database for records.')) {
      try {
        await cancelOrder(orderId); // This now marks order as cancelled
        alert('Order cancelled successfully!\n\nThe order status has been updated to CANCELLED.');
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order: ' + error.message);
      }
    }
  };


  // Load return requests
  useEffect(() => {
    loadReturnRequests();
    loadRevenueStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReturnRequests = async () => {
    try {
      console.log('Loading return requests...');
      const requests = await getReturnRequests();
      console.log('Return requests loaded:', requests.length, 'requests');
      console.log('Requests:', requests);
      setReturnRequests(requests);
    } catch (error) {
      console.error('Error loading return requests:', error);
      console.error('Error details:', error.message);
    }
  };

  const loadRevenueStats = async () => {
    try {
      const stats = await getRevenueStats();
      setRevenueStats(stats);
    } catch (error) {
      console.error('Error loading revenue stats:', error);
    }
  };

  const handleApproveReturn = async (orderId, orderAmount) => {
    const confirmed = window.confirm(
      `Approve this return request?\n\nAmount to refund: ₱${orderAmount}\n\nThis will deduct from total revenue.`
    );

    if (confirmed) {
      try {
        await approveReturnRequest(orderId);
        alert('Return approved successfully!');
        loadReturnRequests();
        loadRevenueStats();
      } catch (error) {
        console.error('Error approving return:', error);
        alert('Failed to approve return. Please try again.');
      }
    }
  };

  const handleRejectReturn = async (orderId) => {
    const reason = prompt('Please provide reason for rejection:');
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    try {
      await rejectReturnRequest(orderId, reason);
      alert('Return request rejected.');
      loadReturnRequests();
    } catch (error) {
      console.error('Error rejecting return:', error);
      alert('Failed to reject return. Please try again.');
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
            { id: 'returns', icon: <AlertCircle size={20} />, label: 'Return Requests', badge: returnRequests.length > 0 ? returnRequests.length : null },
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
                          order.status?.toLowerCase() === 'cancelled' ? '#ff3333' :
                          order.status === 'received' || order.status === 'PROCESSING' ? '#D4A027' : 
                          order.status === 'preparing' ? '#FF9800' : 
                          order.status === 'ready' ? '#4CAF50' : 
                          order.status === 'completed' ? '#4CAF50' :
                          '#666',
                        color: order.status?.toLowerCase() === 'cancelled' || order.status === 'ready' || order.status === 'completed' ? '#fff' : '#000',
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
                    {order.status?.toLowerCase() === 'cancelled' && (
                      <span style={{
                        color: '#ff3333',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        ❌ CANCELLED
                      </span>
                    )}
                    {order.status?.toLowerCase() !== 'cancelled' && (order.status?.toLowerCase() === 'received' || order.status?.toLowerCase() === 'processing') && (
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
                    
                    {order.status?.toLowerCase() !== 'cancelled' && order.status?.toLowerCase() === 'preparing' && (
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
        {currentPage === 'returns' && (
          <div style={{ flex: 1, padding: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Return Requests</h2>
                <p style={{ color: '#666', margin: 0 }}>Manage customer return requests</p>
              </div>
              <div style={{
                background: '#111',
                padding: '1rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid #222'
              }}>
                <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>
                  Pending Returns
                </p>
                <p style={{ color: '#D4A027', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  {returnRequests.length}
                </p>
              </div>
            </div>

            {/* Revenue Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#111',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #222'
              }}>
                <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
                  Total Revenue
                </p>
                <p style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                  ₱{revenueStats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div style={{
                background: '#111',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #ff6b6b'
              }}>
                <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
                  Returned Amount
                </p>
                <p style={{ color: '#ff6b6b', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                  -₱{revenueStats.returnedAmount.toLocaleString()}
                </p>
              </div>
              <div style={{
                background: '#111',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #D4A027'
              }}>
                <p style={{ color: '#D4A027', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
                  Net Revenue
                </p>
                <p style={{ color: '#D4A027', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                  ₱{revenueStats.netRevenue.toLocaleString()}
                </p>
              </div>
              <div style={{
                background: '#111',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #222'
              }}>
                <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
                  Return Rate
                </p>
                <p style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                  {revenueStats.orderCount > 0 
                    ? ((revenueStats.returnCount / revenueStats.orderCount) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Return Requests List */}
            {returnRequests.length === 0 ? (
              <div style={{
                background: '#111',
                padding: '3rem',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #222'
              }}>
                <AlertCircle size={48} style={{ color: '#666', margin: '0 auto 1rem' }} />
                <p style={{ color: '#666', fontSize: '1.1rem' }}>No pending return requests</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {returnRequests.map(request => (
                  <div
                    key={request.id}
                    style={{
                      background: '#111',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      border: '1px solid #ff6b6b'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <h3 style={{
                          color: '#D4A027',
                          fontSize: '1.2rem',
                          margin: '0 0 0.5rem 0'
                        }}>
                          {request.orderNumber}
                        </h3>
                        <p style={{ color: '#999', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
                          Customer: {request.returnCustomerName}
                        </p>
                        <p style={{ color: '#999', fontSize: '0.9rem', margin: 0 }}>
                          Requested: {new Date(request.returnRequestedAt?.toDate?.() || request.returnRequestedAt).toLocaleString()}
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(255, 107, 107, 0.1)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #ff6b6b'
                      }}>
                        <p style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 }}>
                          ₱{request.returnAmount || request.totalAmount}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{
                      background: '#0a0a0a',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        Order Items:
                      </p>
                      {request.items?.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0',
                            borderBottom: index < request.items.length - 1 ? '1px solid #222' : 'none'
                          }}
                        >
                          <span style={{ color: '#fff' }}>
                            {item.quantity}x {item.name}
                          </span>
                          <span style={{ color: '#D4A027' }}>₱{item.total}</span>
                        </div>
                      ))}
                    </div>

                    {/* Return Reason */}
                    <div style={{
                      background: '#0a0a0a',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        Return Reason:
                      </p>
                      <p style={{ color: '#fff', margin: 0 }}>
                        {request.returnReason}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={() => handleApproveReturn(request.id, request.returnAmount || request.totalAmount)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: '#4CAF50',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#45a049'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#4CAF50'}
                      >
                        <Check size={18} />
                        APPROVE RETURN
                      </button>
                      <button
                        onClick={() => handleRejectReturn(request.id)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: 'transparent',
                          border: '1px solid #f44336',
                          borderRadius: '8px',
                          color: '#f44336',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f44336';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#f44336';
                        }}
                      >
                        <X size={18} />
                        REJECT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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

            {/* Monthly Sales Bar Chart */}
            <div style={{ 
              background: '#1a1a1a', 
              borderRadius: '12px', 
              padding: '2rem', 
              border: '1px solid #333',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <BarChart3 size={28} color="#D4A027" />
                <h2 style={{ fontSize: '1.5rem', color: '#D4A027', margin: 0 }}>
                  SALES THIS MONTH
                </h2>
              </div>
              
              {monthlySales.length > 0 ? (
                <div>
                  {/* Chart Container */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    gap: '4px',
                    height: '300px',
                    padding: '1rem 0',
                    borderBottom: '2px solid #333',
                    position: 'relative'
                  }}>
                    {monthlySales.map((data, index) => {
                      const maxSales = Math.max(...monthlySales.map(d => d.sales), 1);
                      const barHeight = (data.sales / maxSales) * 100;
                      const isToday = data.day === new Date().getDate();
                      
                      return (
                        <div
                          key={index}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            height: '100%',
                            position: 'relative',
                            minWidth: '20px'
                          }}
                        >
                          {/* Tooltip on hover */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: '#000',
                              color: '#D4A027',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              border: '1px solid #D4A027',
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap',
                              opacity: 0,
                              pointerEvents: 'none',
                              transition: 'opacity 0.2s',
                              zIndex: 10,
                              marginBottom: '0.5rem'
                            }}
                            className="bar-tooltip"
                          >
                            Day {data.day}<br/>
                            ₱{data.sales}<br/>
                            {data.orders} orders
                          </div>
                          
                          {/* Bar */}
                          <div
                            style={{
                              width: '100%',
                              height: `${barHeight}%`,
                              background: isToday 
                                ? 'linear-gradient(180deg, #FFD700 0%, #D4A027 100%)'
                                : data.sales > 0 
                                  ? 'linear-gradient(180deg, #D4A027 0%, #B8891F 100%)'
                                  : '#333',
                              borderRadius: '4px 4px 0 0',
                              minHeight: data.sales > 0 ? '2px' : '0',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                              const tooltip = e.currentTarget.previousSibling;
                              if (tooltip) tooltip.style.opacity = '1';
                              e.currentTarget.style.transform = 'scaleY(1.05)';
                              e.currentTarget.style.filter = 'brightness(1.2)';
                            }}
                            onMouseLeave={(e) => {
                              const tooltip = e.currentTarget.previousSibling;
                              if (tooltip) tooltip.style.opacity = '0';
                              e.currentTarget.style.transform = 'scaleY(1)';
                              e.currentTarget.style.filter = 'brightness(1)';
                            }}
                          >
                            {/* Sales amount on top of bar for high values */}
                            {data.sales > 0 && barHeight > 15 && (
                              <div style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '0.65rem',
                                color: '#D4A027',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap'
                              }}>
                                ₱{data.sales}
                              </div>
                            )}
                          </div>
                          
                          {/* Day label */}
                          {(index === 0 || data.day % 5 === 0 || data.day === new Date().getDate()) && (
                            <div style={{
                              marginTop: '0.5rem',
                              fontSize: '0.7rem',
                              color: isToday ? '#D4A027' : '#666',
                              fontWeight: isToday ? 'bold' : 'normal'
                            }}>
                              {data.day}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Summary Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    marginTop: '1.5rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        TOTAL SALES
                      </p>
                      <p style={{ color: '#D4A027', fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>
                        ₱{monthlySales.reduce((sum, day) => sum + day.sales, 0).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        TOTAL ORDERS
                      </p>
                      <p style={{ color: '#D4A027', fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>
                        {monthlySales.reduce((sum, day) => sum + day.orders, 0)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        AVG PER DAY
                      </p>
                      <p style={{ color: '#D4A027', fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>
                        ₱{Math.round(
                          monthlySales.reduce((sum, day) => sum + day.sales, 0) / 
                          new Date().getDate()
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        BEST DAY
                      </p>
                      <p style={{ color: '#D4A027', fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>
                        Day {monthlySales.reduce((max, day) => 
                          day.sales > max.sales ? day : max, 
                          { day: 0, sales: 0 }
                        ).day}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                  <BarChart3 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p>No sales data for this month yet</p>
                </div>
              )}
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