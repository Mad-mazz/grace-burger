import React, { useState, useEffect, useRef } from 'react';
import { Check, Download, Printer, Headphones, ArrowLeft, XCircle } from 'lucide-react';
import { subscribeToOrderStatus } from './firebase-admin';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReceiptPage({ orderData, onBack, onBackToMenu }) {
  const handleBack = onBackToMenu || onBack;
  const [currentOrder, setCurrentOrder] = useState(orderData);
  const [currentStatus, setCurrentStatus] = useState('received');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef(null);
  
  useEffect(() => {
    console.log('Receipt page mounted/updated with props:', {
      hasOrderData: !!orderData,
      hasOnBack: !!onBack,
      hasOnBackToMenu: !!onBackToMenu,
      hasHandleBack: !!handleBack
    });
  }, [orderData, onBack, onBackToMenu, handleBack]);

  useEffect(() => {
    if (orderData?.id) {
      console.log('Subscribing to order:', orderData.id);
      const unsubscribe = subscribeToOrderStatus(orderData.id, (updatedOrder) => {
        if (updatedOrder) {
          console.log('Order updated:', updatedOrder);
          setCurrentOrder(updatedOrder);
          setCurrentStatus(updatedOrder.status?.toLowerCase() || 'received');
        }
      });
      return () => unsubscribe();
    }
  }, [orderData?.id]);

  const order = currentOrder || {
    orderNumber: '#GB-2025-8810',
    date: 'October 21, 2025',
    time: '2:12 PM',
    paymentMethod: 'Cash on Delivery',
    reference: '',
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

  // Calculate total if not provided
  const displayTotal = order.total || currentOrder?.total || order.subtotal || currentOrder?.subtotal || 0;

  const isCancelled = currentStatus === 'cancelled';

  const statuses = isCancelled ? [
    {
      id: 'cancelled',
      icon: '❌',
      title: 'ORDER CANCELLED',
      description: 'Your order has been cancelled by the admin. No charges applied.',
      active: true
    }
  ] : [
    {
      id: 'received',
      icon: '📦',
      title: 'ORDER RECEIVED',
      description: 'Your order has been confirmed and is being prepared',
      active: ['received', 'processing', 'preparing', 'ready', 'completed'].includes(currentStatus)
    },
    {
      id: 'preparing',
      icon: '🍳',
      title: 'PREPARING YOUR ORDER',
      description: 'Ate Grace is cooking your delicious meal',
      active: ['preparing', 'ready', 'completed'].includes(currentStatus)
    },
    {
      id: 'ready',
      icon: '🍔',
      title: 'READY TO PICKUP',
      description: 'Your order is ready! Please pick it up at Grace Burger',
      active: ['ready', 'completed'].includes(currentStatus)
    },
    {
      id: 'completed',
      icon: '✓',
      title: 'COMPLETED',
      description: 'Thank you for your order! We hope you enjoyed your meal!',
      active: currentStatus === 'completed'
    }
  ];

  const handleDownloadAsImage = async () => {
    if (!receiptRef.current || isDownloading) return;
    setIsDownloading(true);
    setShowDownloadMenu(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        logging: false,
        useCORS: true,
        windowWidth: receiptRef.current.scrollWidth,
        windowHeight: receiptRef.current.scrollHeight
      });
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${order.orderNumber || 'order'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      });
    } catch (error) {
      console.error('Error downloading as image:', error);
      alert('Failed to download receipt as image. Please try again.');
      setIsDownloading(false);
    }
  };

  const handleDownloadAsPDF = async () => {
    if (!receiptRef.current || isDownloading) return;
    setIsDownloading(true);
    setShowDownloadMenu(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        logging: false,
        useCORS: true,
        windowWidth: receiptRef.current.scrollWidth,
        windowHeight: receiptRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`receipt-${order.orderNumber || 'order'}.pdf`);
      setIsDownloading(false);
    } catch (error) {
      console.error('Error downloading as PDF:', error);
      alert('Failed to download receipt as PDF. Please try again.');
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSupport = () => {
    alert('Contacting support...');
  };

  const getProgressPercentage = () => {
    if (currentStatus === 'cancelled') return '0%';
    switch (currentStatus) {
      case 'received':
      case 'processing':
        return '25%';
      case 'preparing':
        return '50%';
      case 'ready':
        return '75%';
      case 'completed':
        return '100%';
      default:
        return '25%';
    }
  };

  return (
    <div style={{ 
      background: '#0a0a0a', 
      minHeight: '100vh', 
      color: '#fff'
    }}>
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
            <button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>HOME</button>
            <button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>MENU</button>
            <button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>ABOUT</button>
            <button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>CONTACT</button>
          </nav>
        </div>
      </header>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '2rem 2rem 0'
      }}>
        <button
          onClick={() => {
            if (handleBack && typeof handleBack === 'function') {
              try {
                handleBack();
              } catch (error) {
                console.error('Error executing handleBack:', error);
              }
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: '1px solid #333',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#D4A027';
            e.currentTarget.style.borderColor = '#D4A027';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.color = '#fff';
          }}
        >
          <ArrowLeft size={20} />
          Back to Menu
        </button>
      </div>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '2rem auto', 
        padding: '0 2rem 2rem'
      }}>
        <div ref={receiptRef} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          background: '#0a0a0a'
        }}>
          {/* Left Side */}
          <div>
            <div style={{
              background: '#111',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid #222'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: currentStatus === 'cancelled'
                  ? 'linear-gradient(135deg, #F44336, #E53935)'
                  : currentStatus === 'completed' 
                  ? 'linear-gradient(135deg, #4CAF50, #66BB6A)' 
                  : 'linear-gradient(135deg, #D4A027, #FFD700)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem'
              }}>
                {currentStatus === 'cancelled' ? (
                  <XCircle size={48} color="#000" strokeWidth={3} />
                ) : (
                  <Check size={48} color="#000" strokeWidth={3} />
                )}
              </div>

              <h1 style={{
                color: currentStatus === 'cancelled' 
                  ? '#F44336' 
                  : currentStatus === 'completed' ? '#4CAF50' : '#D4A027',
                fontSize: '2.5rem',
                textAlign: 'center',
                marginBottom: '0.5rem',
                letterSpacing: '2px'
              }}>
                {currentStatus === 'cancelled' 
                  ? 'ORDER CANCELLED' 
                  : currentStatus === 'completed' ? 'ORDER COMPLETED!' : 'ORDER CONFIRMED!'}
              </h1>
              <p style={{
                textAlign: 'center',
                color: '#999',
                fontSize: '1.1rem',
                marginBottom: '2rem'
              }}>
                {currentStatus === 'cancelled' 
                  ? 'Your order has been cancelled. No charges applied.' 
                  : currentStatus === 'completed' 
                  ? 'Thank you for your order! We hope you enjoyed your meal!' 
                  : 'Thank you for your order!'}
              </p>

              <div style={{
                background: '#0a0a0a',
                border: '2px dashed #D4A027',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Order Number
                </div>
                <div style={{
                  color: '#D4A027',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  letterSpacing: '2px'
                }}>
                  {order.orderNumber || currentOrder?.orderNumber}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem',
                paddingBottom: '2rem',
                borderBottom: '1px solid #222'
              }}>
                <div>
                  <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Date & Time
                  </div>
                  <div style={{ color: '#fff', fontSize: '1rem' }}>{order.date}</div>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{order.time}</div>
                </div>
                <div>
                  <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Payment Method
                  </div>
                  <div style={{ color: '#fff', fontSize: '1rem' }}>{order.paymentMethod}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Contact Number
                  </div>
                  <div style={{ color: '#fff', fontSize: '1rem' }}>
                    {order.contactNumber || currentOrder?.contactNumber}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  color: '#D4A027',
                  fontSize: '1.2rem',
                  marginBottom: '1rem',
                  letterSpacing: '1px'
                }}>
                  ORDER ITEMS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(order.items || currentOrder?.items || []).map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: '#0a0a0a',
                      borderRadius: '8px',
                      border: '1px solid #1a1a1a'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.25rem' }}>
                          {item.name}
                        </div>
                        <div style={{ color: '#999', fontSize: '0.85rem' }}>
                          ₱{item.price} × {item.quantity}
                        </div>
                      </div>
                      <div style={{
                        color: '#D4A027',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}>
                        ₱{item.total}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: '#0a0a0a',
                borderRadius: '8px',
                padding: '1.5rem',
                border: '2px solid #D4A027',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ color: '#999' }}>Subtotal</span>
                  <span style={{ color: '#fff', fontSize: '1.1rem' }}>₱{order.subtotal || currentOrder?.subtotal || displayTotal}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #222'
                }}>
                  <span style={{ color: '#D4A027', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    TOTAL
                  </span>
                  <span style={{
                    color: '#D4A027',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    ₱{displayTotal}
                  </span>
                </div>
              </div>

              <div style={{
                background: '#0a1a0a',
                border: '1px solid #2a5a2a',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>📍</span>
                  <h3 style={{ color: '#4CAF50', fontSize: '1rem', letterSpacing: '1px' }}>
                    PICKUP LOCATION
                  </h3>
                </div>
                <div style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  {order.pickupLocation?.name || 'Grace Burger'}
                </div>
                <div style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {order.pickupLocation?.street}<br />
                  {order.pickupLocation?.barangay}<br />
                  {order.pickupLocation?.city}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    disabled={isDownloading}
                    style={{
                      width: '100%',
                      background: isDownloading ? '#555' : 'linear-gradient(135deg, #D4A027, #FFD700)',
                      border: 'none',
                      color: '#000',
                      padding: '1.25rem',
                      borderRadius: '8px',
                      cursor: isDownloading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                      opacity: isDownloading ? 0.6 : 1
                    }}
                  >
                    <Download size={18} />
                    {isDownloading ? 'DOWNLOADING...' : 'DOWNLOAD RECEIPT'}
                  </button>
                  
                  {showDownloadMenu && !isDownloading && (
                    <div style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 0.5rem)',
                      left: 0,
                      right: 0,
                      background: '#1a1a1a',
                      border: '1px solid #D4A027',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                      <button
                        onClick={handleDownloadAsImage}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          padding: '1rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          borderBottom: '1px solid #333'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        📸 Download as Image (PNG)
                      </button>
                      <button
                        onClick={handleDownloadAsPDF}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          padding: '1rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.9rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        📄 Download as PDF
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handlePrint}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid #D4A027',
                    color: '#D4A027',
                    padding: '1.25rem',
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

          {/* Right Side */}
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
                {currentStatus === 'completed' ? 'Order completed - Thank you!' :
                 currentStatus === 'ready' ? 'Ready for pickup now!' :
                 `Estimated pickup time: ${order.estimatedTime}`}
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
                  background: currentStatus === 'completed' ? 
                    'linear-gradient(90deg, #4CAF50, #66BB6A)' : 
                    'linear-gradient(90deg, #D4A027, #FFD700)',
                  width: getProgressPercentage(),
                  transition: 'width 0.5s ease'
                }}></div>
              </div>

              <div style={{ position: 'relative' }}>
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
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: status.active ? 
                        (currentStatus === 'completed' && status.id === 'completed' ? '#4CAF50' : '#D4A027') : 
                        '#1a1a1a',
                      border: `2px solid ${status.active ? 
                        (currentStatus === 'completed' && status.id === 'completed' ? '#4CAF50' : '#D4A027') : 
                        '#333'}`,
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

                    <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                      <h3 style={{
                        color: status.active ? 
                          (currentStatus === 'completed' && status.id === 'completed' ? '#4CAF50' : '#D4A027') : 
                          '#666',
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
                          color: currentStatus === 'completed' && status.id === 'completed' ? '#4CAF50' : '#D4A027',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}>
                          {currentStatus === status.id ? 'CURRENT STATUS' : 'COMPLETED'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {currentStatus !== 'completed' && (
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
                    {currentStatus === 'ready' ? 
                      'Your order is ready! Please come pick it up.' :
                      "We'll notify you via SMS when your order is ready for pickup."}
                  </p>
                </div>
              )}

              <div style={{
                background: currentStatus === 'completed' ? '#1a3a1a' : '#0a1a0a',
                border: `1px solid ${currentStatus === 'completed' ? '#4CAF50' : '#2a5a2a'}`,
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
                  <span style={{ fontSize: '1.2rem' }}>
                    {currentStatus === 'completed' ? '✓' : '📍'}
                  </span>
                  <h3 style={{
                    color: currentStatus === 'completed' ? '#4CAF50' : '#4CAF50',
                    fontSize: '1rem',
                    letterSpacing: '1px'
                  }}>
                    {currentStatus === 'completed' ? 'Order Completed:' : 'Pickup Instructions:'}
                  </h3>
                </div>
                <p style={{
                  color: '#ccc',
                  fontSize: '0.9rem',
                  lineHeight: '1.6'
                }}>
                  {currentStatus === 'completed' ? 
                    `Thank you for your order ${order.orderNumber || currentOrder?.orderNumber}! We hope you enjoyed your meal from Grace Burger!` :
                    `Please show this order number ${order.orderNumber || currentOrder?.orderNumber} when picking up your order. Our store is located at 123 Main Street, Abangan Norte, Marilao, Bulacan. Look for the golden Grace Burger sign!`}
                </p>
              </div>

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

      {showDownloadMenu && (
        <div 
          onClick={() => setShowDownloadMenu(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9
          }}
        />
      )}
    </div>
  );
}