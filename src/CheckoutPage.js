import React, { useState } from 'react';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import qrCode from './images/qr-code.jpg';

export default function CheckoutPage({ cart, totalPrice, onBack, onPlaceOrder }) {
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [copied, setCopied] = useState(false);
  const gcashNumber = '09918428234';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(gcashNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          gap: '1rem'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#D4A027',
              padding: '0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ color: '#D4A027', fontSize: '1.5rem' }}>⬡</div>
            <span style={{ color: '#D4A027', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '2px' }}>
              GRACE BURGER
            </span>
          </div>
        </div>
      </header>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '2rem'
      }}>
        {/* Left Side - Order Review */}
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
              YOUR ORDER
            </h2>
            <p style={{ color: '#999', marginBottom: '2rem' }}>Review your items</p>

            <div style={{ 
              borderBottom: '1px solid #333',
              marginBottom: '2rem'
            }}></div>

            {/* Order Items */}
            <div style={{ marginBottom: '2rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '1.5rem',
                  borderBottom: '1px solid #222'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '1.1rem', 
                      marginBottom: '0.5rem',
                      color: '#fff'
                    }}>
                      {item.name}
                    </h3>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontSize: '0.9rem',
                      color: '#999'
                    }}>
                      <span>₱{item.price} each</span>
                      <span>×</span>
                      <span style={{ 
                        background: '#1a1a1a',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        color: '#D4A027',
                        fontWeight: 'bold'
                      }}>
                        {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div style={{ 
                    color: '#D4A027',
                    fontSize: '1.3rem',
                    fontWeight: 'bold'
                  }}>
                    ₱{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              background: '#1a1a1a',
              padding: '1.5rem',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '1.2rem' }}>Total:</span>
              <span style={{ 
                color: '#D4A027',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                ₱{totalPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Method */}
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
              PAYMENT METHOD
            </h2>
            <p style={{ color: '#999', marginBottom: '2rem' }}>Choose your payment option</p>

            <div style={{ 
              borderBottom: '1px solid #333',
              marginBottom: '2rem'
            }}></div>

            {/* Cash on Delivery */}
            <div 
              onClick={() => setSelectedPayment('cash')}
              style={{
                background: selectedPayment === 'cash' ? '#1a1a1a' : 'transparent',
                border: `2px solid ${selectedPayment === 'cash' ? '#D4A027' : '#333'}`,
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedPayment === 'cash' ? '#D4A027' : '#666'}`,
                  background: selectedPayment === 'cash' ? '#D4A027' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {selectedPayment === 'cash' && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#000'
                    }}></div>
                  )}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  color: '#D4A027'
                }}>
                  💵 💰
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.2rem',
                    color: selectedPayment === 'cash' ? '#D4A027' : '#fff',
                    marginBottom: '0.25rem'
                  }}>
                    CASH ON DELIVERY
                  </h3>
                  <p style={{ 
                    color: '#999',
                    fontSize: '0.85rem'
                  }}>
                    Pay when you receive your order
                  </p>
                </div>
              </div>

              {selectedPayment === 'cash' && (
                <div style={{
                  background: '#0a0a0a',
                  border: '1px solid #D4A027',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '0.75rem'
                }}>
                  <span style={{ color: '#D4A027', fontSize: '1.2rem' }}>ℹ️</span>
                  <p style={{ 
                    color: '#ccc',
                    fontSize: '0.85rem',
                    lineHeight: '1.5'
                  }}>
                    Your order is being received by Ate Grace. Please prepare the exact amount and pay upon delivery to process your order.
                  </p>
                </div>
              )}
            </div>

            {/* GCash */}
            <div 
              onClick={() => setSelectedPayment('gcash')}
              style={{
                background: selectedPayment === 'gcash' ? '#1a1a1a' : 'transparent',
                border: `2px solid ${selectedPayment === 'gcash' ? '#D4A027' : '#333'}`,
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedPayment === 'gcash' ? '#D4A027' : '#666'}`,
                  background: selectedPayment === 'gcash' ? '#D4A027' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {selectedPayment === 'gcash' && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#000'
                    }}></div>
                  )}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  color: '#D4A027'
                }}>
                  💰 📱
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.2rem',
                    color: selectedPayment === 'gcash' ? '#D4A027' : '#fff',
                    marginBottom: '0.25rem'
                  }}>
                    GCASH
                  </h3>
                  <p style={{ 
                    color: '#999',
                    fontSize: '0.85rem'
                  }}>
                    Instant payment via GCash
                  </p>
                </div>
              </div>
            </div>

            {/* GCash Payment Details - Shows when GCash is selected */}
            {selectedPayment === 'gcash' && (
              <div style={{
                background: '#111',
                border: '2px solid #D4A027',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                {/* QR Code Section */}
                <div style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ 
                    color: '#D4A027', 
                    fontSize: '1rem', 
                    marginBottom: '1.5rem',
                    letterSpacing: '2px'
                  }}>
                    SCAN QR CODE
                  </h3>
                  <div style={{
                    background: '#fff',
                    padding: '1rem',
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}>
                    <img 
                      src={qrCode} 
                      alt="GCash QR Code"
                      style={{
                        width: '200px',
                        height: '200px',
                        display: 'block'
                      }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '2rem 0',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                  <span style={{ padding: '0 1rem' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                </div>

                {/* Phone Number Section */}
                <div>
                  <div style={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ 
                      fontSize: '1.5rem', 
                      color: '#D4A027',
                      fontWeight: 'bold',
                      letterSpacing: '2px'
                    }}>
                      {gcashNumber}
                    </span>
                    <button
                      onClick={handleCopyNumber}
                      style={{
                        background: copied ? '#4CAF50' : '#D4A027',
                        border: 'none',
                        color: '#000',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                      }}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <label style={{
                    display: 'block',
                    color: '#D4A027',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    letterSpacing: '1px'
                  }}>
                    ENTER REFERENCE NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="Reference number from GCash"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={() => onPlaceOrder(selectedPayment)}
              style={{
                width: '100%',
                background: '#D4A027',
                border: 'none',
                color: '#000',
                padding: '1.25rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '2rem',
                letterSpacing: '2px',
                clipPath: 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)',
                transition: 'all 0.3s'
              }}
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}