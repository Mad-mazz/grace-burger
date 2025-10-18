import React, { useState } from 'react';
import { Check, Download, Printer, Headphones } from 'lucide-react';

export default function ReceiptPage({ orderData }) {
  const [currentStatus] = useState('received');
  
  // Demo data - replace with actual props
  const order = orderData || {
    orderNumber: '#GB-2024-0123',
    date: 'October 18, 2025',
    time: '7:29 PM',
    paymentMethod: 'GCash',
    reference: 'Ref: 1234567890',
    contactNumber: '+63 912 345 6789',
    items: [
      { name: 'Cheese Burger', quantity: 2, price: 35, total: 70 },
      { name: 'Footlong', quantity: 1, price: 47, total: 47 },
      { name: 'Mountain Dew', quantity: 2, price: 25, total: 50 }
    ],
    subtotal: 167,
    total: 167,
    pickupLocation: {
      name: 'Grace Burger CDO',
      street: '123 Main Street',
      barangay: 'Barangay Carmen',
      city: 'Cagayan de Oro City'
    },
    estimatedTime: '20-30 mins'
  };

  const statuses = [
    {
      id: 'received',
      icon: '📦',
      title: 'ORDER RECEIVED',
      description: 'Your order has been confirmed and is being prepared',
      time: '10:23 AM',
      active: true
    },
    {
      id: 'preparing',
      icon: '🍳',
      title: 'PREPARING YOUR ORDER',
      description: 'Ate Grace is cooking your delicious meal',
      time: '10:25 AM',
      active: currentStatus === 'preparing' || currentStatus === 'ready' || currentStatus === 'completed'
    },
    {
      id: 'ready',
      icon: '🍔',
      title: 'READY TO PICKUP',
      description: 'Your order is ready! Please pick it up at Grace Burger',
      time: '7:28 PM',
      active: currentStatus === 'ready' || currentStatus === 'completed'
    },
    {
      id: 'completed',
      icon: '✓',
      title: 'COMPLETED',
      description: 'Thank you for your order! We hope you enjoyed your meal!',
      time: '7:23 PM',
      active: currentStatus === 'completed'
    }
  ];

  const handleDownload = () => {
    alert('Downloading receipt...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSupport = () => {
    alert('Contacting support...');
  };

  return (
    <div style={{ 
      background: '#0a0a0a', 
      minHeight: '100vh', 
      color: '#fff'
    }}>
      {/* Header */}
      <header style={{ 
        background: '#000', 
        padding: '1rem 2rem',
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
            <div style={{ color: '#D4A027', fontSize: '1.5rem' }}>🍔</div>
            <span style={{ color: '#D4A027', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '2px' }}>
              GRACE BURGER
            </span>
          </div>
          <nav style={{ display: 'flex', gap: '2rem' }}>
        <button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>HOME</button>
        <button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>MENU</button>
        <button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>ABOUT</button>
        <button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>CONTACT</button>
        </nav>
        </div>
      </header>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '3rem 2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem'
      }}>
        {/* Left Side - Order Confirmation */}
        <div>
          {/* Confirmation Card */}
          <div style={{
            background: '#111',
            borderRadius: '12px',
            padding: '3rem',
            border: '1px solid #222',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#D4A027',
              borderRadius: '12px',
              margin: '0 auto 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(45deg)'
            }}>
              <Check size={40} style={{ transform: 'rotate(-45deg)', color: '#000' }} />
            </div>

            <h1 style={{
              color: '#D4A027',
              fontSize: '2.5rem',
              marginBottom: '1rem',
              letterSpacing: '3px',
              fontWeight: 'bold'
            }}>
              ORDER CONFIRMED!
            </h1>

            <p style={{ color: '#999', marginBottom: '1rem' }}>
              Thank you for your order
            </p>

            <h2 style={{
              color: '#fff',
              fontSize: '1.5rem',
              marginBottom: '0.5rem',
              letterSpacing: '2px'
            }}>
              {order.orderNumber}
            </h2>

            <p style={{ color: '#666', fontSize: '0.85rem' }}>
              Confirmation sent to your email
            </p>

            <div style={{
              width: '60px',
              height: '2px',
              background: '#D4A027',
              margin: '2rem auto'
            }}></div>
          </div>

          {/* Order Details Card */}
          <div style={{
            background: '#111',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #222'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div>
                <h3 style={{ 
                  color: '#D4A027', 
                  fontSize: '0.8rem',
                  marginBottom: '0.75rem',
                  letterSpacing: '1px'
                }}>
                  ORDER DATE & TIME
                </h3>
                <p style={{ color: '#fff', marginBottom: '0.25rem' }}>{order.date}</p>
                <p style={{ color: '#fff' }}>{order.time}</p>
              </div>

              <div>
                <h3 style={{ 
                  color: '#D4A027', 
                  fontSize: '0.8rem',
                  marginBottom: '0.75rem',
                  letterSpacing: '1px'
                }}>
                  PAYMENT METHOD
                </h3>
                <p style={{ color: '#fff', marginBottom: '0.25rem' }}>{order.paymentMethod}</p>
                <p style={{ color: '#fff', fontSize: '0.9rem' }}>{order.reference}</p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem'
            }}>
              <div>
                <h3 style={{ 
                  color: '#D4A027', 
                  fontSize: '0.8rem',
                  marginBottom: '0.75rem',
                  letterSpacing: '1px'
                }}>
                  PICKUP LOCATION
                </h3>
                <div style={{
                  borderLeft: '3px solid #D4A027',
                  paddingLeft: '1rem'
                }}>
                  <p style={{ color: '#fff', fontStyle: 'italic', marginBottom: '0.25rem' }}>
                    {order.pickupLocation.name}
                  </p>
                  <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {order.pickupLocation.street}
                  </p>
                  <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {order.pickupLocation.barangay}
                  </p>
                  <p style={{ color: '#fff', fontSize: '0.9rem' }}>
                    {order.pickupLocation.city}
                  </p>
                </div>
              </div>

              <div>
                <h3 style={{ 
                  color: '#D4A027', 
                  fontSize: '0.8rem',
                  marginBottom: '0.75rem',
                  letterSpacing: '1px'
                }}>
                  CONTACT NUMBER
                </h3>
                <p style={{ color: '#fff' }}>{order.contactNumber}</p>
              </div>
            </div>

            {/* Items Ordered */}
            <div style={{
              borderTop: '1px solid #333',
              marginTop: '2rem',
              paddingTop: '2rem'
            }}>
              <h3 style={{
                color: '#D4A027',
                fontSize: '1.2rem',
                marginBottom: '1.5rem',
                letterSpacing: '2px'
              }}>
                ITEMS ORDERED
              </h3>

              {order.items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: index < order.items.length - 1 ? '1px solid #222' : 'none'
                }}>
                  <div>
                    <p style={{ color: '#fff', marginBottom: '0.25rem' }}>{item.name}</p>
                    <p style={{ color: '#999', fontSize: '0.85rem' }}>
                      {item.quantity} × ₱{item.price}
                    </p>
                  </div>
                  <p style={{ color: '#D4A027', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    ₱{item.total}
                  </p>
                </div>
              ))}

              <div style={{
                borderTop: '1px solid #444',
                marginTop: '1.5rem',
                paddingTop: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <span style={{ color: '#999' }}>Subtotal</span>
                  <span style={{ color: '#fff' }}>₱{order.subtotal}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#0a0a0a',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>TOTAL</span>
                  <span style={{ 
                    color: '#D4A027',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}>
                    ₱{order.total}
                  </span>
                </div>

                <div style={{
                  background: '#1a3a1a',
                  border: '1px solid #2a5a2a',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Check size={16} style={{ color: '#4CAF50' }} />
                  <span style={{ color: '#4CAF50', fontSize: '0.9rem' }}>PAYMENT RECEIVED</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={handleDownload}
                style={{
                  background: 'transparent',
                  border: '1px solid #D4A027',
                  color: '#D4A027',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }}
              >
                <Download size={18} />
                DOWNLOAD RECEIPT
              </button>

              <button
                onClick={handlePrint}
                style={{
                  background: 'transparent',
                  border: '1px solid #D4A027',
                  color: '#D4A027',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }}
              >
                <Printer size={18} />
                PRINT RECEIPT
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Order Status */}
        <div>
          <div style={{
            background: '#111',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #222'
          }}>
            <h2 style={{
              color: '#D4A027',
              fontSize: '2rem',
              marginBottom: '0.5rem',
              letterSpacing: '2px'
            }}>
              ORDER STATUS
            </h2>
            <p style={{ color: '#999', marginBottom: '2rem' }}>
              Estimated pickup time: {order.estimatedTime}
            </p>

            <div style={{
              width: '100%',
              height: '6px',
              background: '#1a1a1a',
              borderRadius: '3px',
              marginBottom: '3rem',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #D4A027, #FFD700)',
                width: currentStatus === 'received' ? '25%' : 
                       currentStatus === 'preparing' ? '50%' :
                       currentStatus === 'ready' ? '75%' : '100%',
                transition: 'width 0.5s ease'
              }}></div>
            </div>

            {/* Status Timeline */}
            <div style={{ position: 'relative' }}>
              {/* Vertical Line */}
              <div style={{
                position: 'absolute',
                left: '23px',
                top: '40px',
                bottom: '40px',
                width: '2px',
                background: '#333'
              }}></div>

              {statuses.map((status, index) => (
                <div key={status.id} style={{
                  display: 'flex',
                  gap: '1.5rem',
                  marginBottom: index < statuses.length - 1 ? '3rem' : '0',
                  position: 'relative'
                }}>
                  {/* Icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: status.active ? '#D4A027' : '#1a1a1a',
                    border: `2px solid ${status.active ? '#D4A027' : '#333'}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                    opacity: status.active ? 1 : 0.5
                  }}>
                    {status.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                    <h3 style={{
                      color: status.active ? '#D4A027' : '#666',
                      fontSize: '1rem',
                      marginBottom: '0.5rem',
                      letterSpacing: '1px'
                    }}>
                      {status.title}
                    </h3>
                    <p style={{
                      color: status.active ? '#ccc' : '#555',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      marginBottom: '0.5rem'
                    }}>
                      {status.description}
                    </p>
                    {status.active && (
                      <p style={{
                        color: '#D4A027',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {status.time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notification Info */}
            <div style={{
              background: '#1a1a0a',
              border: '1px solid #D4A027',
              borderRadius: '8px',
              padding: '1rem',
              marginTop: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
              <p style={{ color: '#ccc', fontSize: '0.85rem' }}>
                We'll notify you via SMS when your order is ready for pickup.
              </p>
            </div>

            {/* Pickup Instructions */}
            <div style={{
              background: '#0a1a0a',
              border: '1px solid #2a5a2a',
              borderRadius: '8px',
              padding: '1.5rem',
              marginTop: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>📍</span>
                <h3 style={{
                  color: '#4CAF50',
                  fontSize: '1rem',
                  letterSpacing: '1px'
                }}>
                  Pickup Instructions:
                </h3>
              </div>
              <p style={{
                color: '#ccc',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                Please show this order number <strong style={{ color: '#D4A027' }}>{order.orderNumber}</strong> when picking up your order. Our store is located at 123 Main Street, Barangay Carmen. Look for the golden Grace Burger sign!
              </p>
            </div>

            {/* Contact Support Button */}
            <button
              onClick={handleSupport}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid #D4A027',
                color: '#D4A027',
                padding: '1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              <Headphones size={20} />
              CONTACT SUPPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}