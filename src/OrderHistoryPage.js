import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Receipt, RotateCcw, Eye } from 'lucide-react';
import './OrderHistoryPage.css';
import { getAllOrders } from './firebase-admin';
import ReceiptPage from './Receipt';

export default function OrderHistoryPage({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'info' });
  const [inputPopup, setInputPopup] = useState({ show: false, message: '', value: '', onConfirm: null });
  const [confirmPopup, setConfirmPopup] = useState({ show: false, message: '', onConfirm: null });

  const showPopup = (message, type = 'info') => {
    setPopup({ show: true, message, type });
  };

  const closePopup = () => {
    setPopup({ show: false, message: '', type: 'info' });
  };

  const showInputPopup = (message, onConfirm) => {
    setInputPopup({ show: true, message, value: '', onConfirm });
  };

  const closeInputPopup = () => {
    setInputPopup({ show: false, message: '', value: '', onConfirm: null });
  };

  const showConfirmPopup = (message, onConfirm) => {
    setConfirmPopup({ show: true, message, onConfirm });
  };

  const closeConfirmPopup = () => {
    setConfirmPopup({ show: false, message: '', onConfirm: null });
  };

  useEffect(() => {
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    filterAndSortOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, selectedFilter, searchQuery, sortOrder]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await getAllOrders();
      
      // Filter orders by current user
      const userOrders = allOrders.filter(order => order.userId === user.uid);
      
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(order => {
        if (selectedFilter === 'ongoing') {
          return order.status === 'pending' || order.status === 'preparing';
        } else if (selectedFilter === 'completed') {
          return order.status === 'ready' || order.status === 'completed';
        } else if (selectedFilter === 'cancelled') {
          return order.status === 'cancelled';
        }
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items?.some(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort orders
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp || a.createdAt);
      const dateB = new Date(b.timestamp || b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredOrders(filtered);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'PENDING', color: '#FFA500', bgColor: 'rgba(255, 165, 0, 0.1)' };
      case 'preparing':
        return { label: 'PREPARING', color: '#D4A027', bgColor: 'rgba(212, 160, 39, 0.1)' };
      case 'ready':
      case 'completed':
        return { label: 'COMPLETED', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.1)' };
      case 'cancelled':
        return { label: 'CANCELLED', color: '#f44336', bgColor: 'rgba(244, 67, 54, 0.1)' };
      default:
        return { label: 'UNKNOWN', color: '#666', bgColor: 'rgba(102, 102, 102, 0.1)' };
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getOrderCount = (filter) => {
    if (filter === 'all') return orders.length;
    if (filter === 'ongoing') {
      return orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    }
    if (filter === 'completed') {
      return orders.filter(o => o.status === 'ready' || o.status === 'completed').length;
    }
    if (filter === 'cancelled') {
      return orders.filter(o => o.status === 'cancelled').length;
    }
    return 0;
  };

  const handleViewReceipt = (order) => {
    setSelectedOrder(order);
    setShowReceipt(true);
  };

  const handleReorder = (order) => {
    // You can implement reorder functionality here
    showPopup('Reorder feature - Add items back to cart', 'info');
  };

  const handleReturnRequest = async (order) => {
    showInputPopup('Please provide a reason for return:', async (reason) => {
      if (!reason || reason.trim() === '') {
        showPopup('Return reason is required', 'error');
        return;
      }

      showConfirmPopup(
        `Request return for order ${order.orderNumber}?\n\nReason: ${reason}\n\nThis will be sent to admin for approval.`,
        async () => {
          try {
            // Import the function at the top if not already imported
            const { requestOrderReturn } = await import('./firebase-admin');
            
            await requestOrderReturn(order.id, {
              reason: reason,
              requestedBy: user.uid,
              requestedAt: new Date().toISOString(),
              customerName: user.displayName || user.email,
              orderAmount: order.totalAmount
            });

            showPopup('Return request submitted successfully! Please wait for admin approval.', 'success');
            loadOrders(); // Reload orders to show updated status
          } catch (error) {
            console.error('Error requesting return:', error);
            showPopup('Failed to submit return request. Please try again.', 'error');
          }
        }
      );
    });
  };

  if (showReceipt && selectedOrder) {
    return (
      <ReceiptPage
        orderData={{
          ...selectedOrder,
          customerName: user.displayName || user.email,
          orderNumber: selectedOrder.orderNumber
        }}
        onBack={() => {
          setShowReceipt(false);
          setSelectedOrder(null);
        }}
        user={user}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      paddingBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        padding: '2rem',
        borderBottom: '1px solid #222'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#D4A027',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              padding: '0.5rem 0'
            }}
          >
            <ArrowLeft size={20} />
            Back to Menu
          </button>

          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <p style={{
              color: '#D4A027',
              fontSize: '0.85rem',
              letterSpacing: '2px',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              — YOUR ORDERS —
            </p>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '800',
              margin: '0',
              letterSpacing: '2px'
            }}>
              ORDER HISTORY
            </h1>
            <p style={{
              color: '#888',
              marginTop: '0.5rem',
              fontSize: '0.95rem'
            }}>
              Track all your past and ongoing orders
            </p>
            <p style={{
              color: '#D4A027',
              marginTop: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              Welcome back, {user.displayName || user.email.split('@')[0]}!
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #222',
            paddingBottom: '1rem'
          }}>
            {[
              { key: 'all', label: 'ALL ORDERS' },
              { key: 'ongoing', label: 'ONGOING' },
              { key: 'completed', label: 'COMPLETED' },
              { key: 'cancelled', label: 'CANCELLED' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                style={{
                  background: selectedFilter === filter.key ? '#D4A027' : 'transparent',
                  color: selectedFilter === filter.key ? '#000' : '#fff',
                  border: selectedFilter === filter.key ? 'none' : '1px solid #333',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                {filter.label}
                <span style={{
                  marginLeft: '0.5rem',
                  background: selectedFilter === filter.key ? 'rgba(0,0,0,0.2)' : 'rgba(212,160,39,0.2)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem'
                }}>
                  {getOrderCount(filter.key)}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666'
                }}
              />
              <input
                type="text"
                placeholder="Search by order number or item name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 2rem'
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666'
          }}>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666'
          }}>
            <Receipt size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              {searchQuery ? 'No orders found matching your search' : 'No orders yet'}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              {searchQuery ? 'Try a different search term' : 'Start ordering to see your history here'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1.5rem'
          }}>
            {filteredOrders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div
                  key={order.id}
                  style={{
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#D4A027';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#222';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #222'
                  }}>
                    <div>
                      <h3 style={{
                        color: '#D4A027',
                        fontSize: '1.2rem',
                        margin: '0 0 0.5rem 0',
                        fontWeight: '700'
                      }}>
                        {order.orderNumber}
                      </h3>
                      <p style={{
                        color: '#888',
                        fontSize: '0.85rem',
                        margin: 0
                      }}>
                        {formatDate(order.timestamp || order.createdAt)}
                      </p>
                    </div>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      background: statusInfo.bgColor,
                      border: `1px solid ${statusInfo.color}`,
                      color: statusInfo.color,
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      letterSpacing: '1px'
                    }}>
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ marginBottom: '1rem' }}>
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          color: '#ccc',
                          fontSize: '0.9rem'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span>{item.emoji || '🍔'}</span>
                          <span>{item.name}</span>
                        </div>
                        <span style={{ color: '#888' }}>
                          {item.quantity} × ₱{item.price}
                        </span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p style={{
                        color: '#666',
                        fontSize: '0.85rem',
                        marginTop: '0.5rem'
                      }}>
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid #222'
                  }}>
                    <div>
                      <p style={{
                        color: '#888',
                        fontSize: '0.85rem',
                        margin: '0 0 0.25rem 0'
                      }}>
                        Subtotal
                      </p>
                      <p style={{
                        color: '#fff',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        margin: 0
                      }}>
                        ₱{order.subtotal || order.totalAmount}
                      </p>
                      <div style={{
                        marginTop: '0.5rem',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: order.paymentMethod === 'GCASH' ? '#0066FF' : '#4CAF50',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#fff'
                        }}>
                          {order.paymentMethod === 'GCASH' ? 'GCASH PAID' : 'CASH'}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          color: '#888',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          📍 {order.pickupLocation?.name || order.pickupLocation || 'Pickup at Store'}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem'
                    }}>
                      <button
                        onClick={() => handleViewReceipt(order)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'transparent',
                          border: '1px solid #D4A027',
                          color: '#D4A027',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#D4A027';
                          e.currentTarget.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#D4A027';
                        }}
                      >
                        <Eye size={16} />
                        VIEW RECEIPT
                      </button>
                      {(order.status === 'ready' || order.status === 'completed') && !order.returnRequested && !order.returned && !order.returnRejected && (
                        <>
                          <button
                            onClick={() => handleReorder(order)}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: '#D4A027',
                              border: 'none',
                              color: '#000',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#B8891F';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#D4A027';
                            }}
                          >
                            <RotateCcw size={16} />
                            REORDER
                          </button>
                          <button
                            onClick={() => handleReturnRequest(order)}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: 'transparent',
                              border: '1px solid #ff6b6b',
                              color: '#ff6b6b',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ff6b6b';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#ff6b6b';
                            }}
                          >
                            <RotateCcw size={16} />
                            RETURN
                          </button>
                        </>
                      )}
                      {order.returnRequested && !order.returned && (
                        <span style={{
                          padding: '0.75rem 1.5rem',
                          background: 'rgba(255, 165, 0, 0.1)',
                          border: '1px solid #FFA500',
                          color: '#FFA500',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}>
                          RETURN PENDING
                        </span>
                      )}
                      {order.returned && (
                        <span style={{
                          padding: '0.75rem 1.5rem',
                          background: 'rgba(76, 175, 80, 0.1)',
                          border: '1px solid #4CAF50',
                          color: '#4CAF50',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}>
                          RETURNED
                        </span>
                      )}
                      {order.returnRejected && (
                        <span style={{
                          padding: '0.75rem 1.5rem',
                          background: 'rgba(244, 67, 54, 0.1)',
                          border: '1px solid #f44336',
                          color: '#f44336',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}>
                          RETURN REJECTED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total Section */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #222'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#888',
                      fontWeight: '600'
                    }}>
                      TOTAL
                    </span>
                    <span style={{
                      fontSize: '1.5rem',
                      color: '#D4A027',
                      fontWeight: '700'
                    }}>
                      ₱{order.totalAmount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input Popup Modal */}
      {inputPopup.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '2px solid #D4A027',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.25rem',
              color: '#fff',
              fontWeight: '600'
            }}>
              {inputPopup.message}
            </h3>
            <textarea
              value={inputPopup.value}
              onChange={(e) => setInputPopup({ ...inputPopup, value: e.target.value })}
              placeholder="Enter your reason here..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '1.5rem'
              }}
              autoFocus
            />
            <div style={{
              display: 'flex',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => {
                  closeInputPopup();
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid #666',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (inputPopup.onConfirm) {
                    inputPopup.onConfirm(inputPopup.value);
                  }
                  closeInputPopup();
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#D4A027',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#B8891F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#D4A027';
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Popup Modal */}
      {confirmPopup.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '2px solid #D4A027',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(212, 160, 39, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                ⚠️
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                color: '#D4A027',
                fontWeight: '600'
              }}>
                Confirm Action
              </h3>
            </div>
            <p style={{
              color: '#fff',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem',
              whiteSpace: 'pre-line'
            }}>
              {confirmPopup.message}
            </p>
            <div style={{
              display: 'flex',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => {
                  closeConfirmPopup();
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid #666',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmPopup.onConfirm) {
                    confirmPopup.onConfirm();
                  }
                  closeConfirmPopup();
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#D4A027',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#B8891F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#D4A027';
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Popup Modal */}
      {popup.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: `2px solid ${popup.type === 'error' ? '#ff6b6b' : popup.type === 'success' ? '#4CAF50' : '#D4A027'}`,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: popup.type === 'error' ? 'rgba(255, 107, 107, 0.2)' : popup.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(212, 160, 39, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {popup.type === 'error' ? '❌' : popup.type === 'success' ? '✅' : 'ℹ️'}
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                color: popup.type === 'error' ? '#ff6b6b' : popup.type === 'success' ? '#4CAF50' : '#D4A027',
                fontWeight: '600'
              }}>
                {popup.type === 'error' ? 'Error' : popup.type === 'success' ? 'Success' : 'Information'}
              </h3>
            </div>
            <p style={{
              color: '#fff',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              {popup.message}
            </p>
            <button
              onClick={closePopup}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: popup.type === 'error' ? '#ff6b6b' : popup.type === 'success' ? '#4CAF50' : '#D4A027',
                border: 'none',
                borderRadius: '8px',
                color: popup.type === 'error' || popup.type === 'success' ? '#fff' : '#000',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}