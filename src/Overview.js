import React from 'react';
import './Overview.css';

const Overview = ({ onLoginClick }) => {
  const burgers = [
    {
      id: 1,
      name: 'THE COMPLETE',
      description: 'Our ultimate creation featuring premium beef, crispy bacon, aged cheddar, savory ham, and a farm-fresh egg',
      price: '₱64'
    },
    {
      id: 2,
      name: 'CHEESE BURGER',
      description: 'Classic beef patty with melted cheddar cheese, fresh lettuce, and our signature sauce',
      price: '₱35'
    },
    {
      id: 3,
      name: 'BACON BURGER',
      description: 'Juicy beef patty topped with crispy bacon strips and our special smoky sauce',
      price: '₱42'
    }
  ];

  const features = [
    'Easy mobile ordering',
    'Real-time order tracking',
    'Save your favorites',
    'Faster checkout'
  ];

  // Handle APK download
  const handleDownloadApp = () => {
    try {
      // Create a link element
      const link = document.createElement('a');
      link.href = '/android-app/gburger-app.apk';
      link.download = 'gburger-app.apk';
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Optional: Show a console message
      console.log('Downloading Grace Burger APK...');
    } catch (error) {
      console.error('Error downloading APK:', error);
      alert('Unable to download the app. Please try again later.');
    }
  };

  return (
    <div className="overview-container">
      {/* Header */}
      <header className="overview-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🍔</span>
            <span className="logo-text">GRACE BURGER</span>
          </div>
          
          <nav className="nav">
            <a href="#home" className="nav-link">HOME</a>
            <a href="#menu" className="nav-link">MENU</a>
            <a href="#about" className="nav-link">ABOUT</a>
            <a href="#contact" className="nav-link">CONTACT</a>
          </nav>
          
          <div className="header-buttons">
            <button className="btn-login" onClick={onLoginClick}>
              <span className="icon">👤</span>
              LOGIN
            </button>
            <button className="btn-app" onClick={handleDownloadApp}>
              <span className="icon">📱</span>
              GET THE APP
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-subtitle">— PREMIUM BURGERS & HOT DOGS —</p>
          <h1 className="hero-title">GRACE BURGER</h1>
          <p className="hero-description">
            Experience the perfect blend of premium ingredients, masterful craftsmanship,
            <br />
            and unforgettable flavors in every bite
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section" id="about">
        <div className="story-container">
          <div className="story-content">
            <p className="story-subtitle">— OUR STORY —</p>
            <h2 className="story-title">
              THE GRACE BURGER
              <br />
              DIFFERENCE
            </h2>
            <p className="story-text">
              Founded by Ate Grace in the heart of Abangan Norte, Grace Burger began with a
              simple mission: to create the perfect burger that brings people together. What
              started as a small food cart has grown into a beloved local favorite, serving
              thousands of happy customers with our signature recipes.
            </p>
            <p className="story-text">
              Every burger tells a story of dedication, quality, and love for great food. From our
              hand-pressed patties to our secret sauces, we've perfected every detail to deliver an
              unforgettable experience with each bite.
            </p>
          </div>
          
          <div className="story-image-container">
            <div className="story-image">
              <div className="image-placeholder">
                <span style={{ fontSize: '100px' }}>🍔</span>
              </div>
              <div className="since-badge">SINCE 2011</div>
            </div>
          </div>
        </div>
      </section>

      {/* Burgers Section */}
      <section className="burgers-section" id="menu">
        <div className="burgers-container">
          <p className="burgers-subtitle">— SIGNATURE CREATIONS —</p>
          <h2 className="burgers-title">OUR BEST BURGERS</h2>
          <p className="burgers-description">These are the burgers that made us famous in CDO</p>
          
          <div className="burgers-grid">
            {burgers.map((burger) => (
              <div key={burger.id} className="burger-card">
                <div className="burger-image">
                  <div className="burger-image-placeholder">
                    <span style={{ fontSize: '120px' }}>🍔</span>
                  </div>
                </div>
                <div className="burger-info">
                  <h3 className="burger-name">{burger.name}</h3>
                  <p className="burger-description">{burger.description}</p>
                  <p className="burger-price">{burger.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Section */}
      <section className="app-section">
        <div className="app-container">
          <div className="app-content">
            <p className="app-subtitle">— NOW AVAILABLE —</p>
            <h2 className="app-title">GET OUR MOBILE APP</h2>
            <p className="app-description">
              Order faster, track deliveries, and get exclusive app-only deals with Grace
              Burger for Android
            </p>
            
            <ul className="app-features">
              {features.map((feature, index) => (
                <li key={index} className="app-feature">
                  <span className="feature-icon">✅</span>
                  <span className="feature-text">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button className="btn-download" onClick={handleDownloadApp}>
              <span className="download-icon">📱</span>
              DOWNLOAD FOR ANDROID
            </button>
          </div>
          
          <div className="app-image-container">
            <div className="app-image">
              <div className="phone-placeholder">
                <span style={{ fontSize: '200px' }}>📱</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="overview-footer" id="contact">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🍔</span>
              <span className="logo-text">GRACE BURGER</span>
            </div>
            <p className="footer-description">
              Premium burgers and hot dogs made with love in Abangan Norte since 2011
            </p>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#menu">Menu</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Contact Us</h3>
            <ul className="footer-contact">
              <li>📍 123 Main Street, Abangan Norte</li>
              <li>    Marilao, Bulacan</li>
              <li>📞 +63 912 345 6789</li>
              <li>✉️ info@graceburger.com</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Hours</h3>
            <ul className="footer-hours">
              <li>Monday - Saturday: 8am - 5pm</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Grace Burger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Overview;