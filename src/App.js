import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X, CheckCircle } from 'lucide-react';
import bgImage from './images/bg-image.jpg';
import { signInWithGoogle, signUpWithEmail, signInWithEmail, auth } from './firebase';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import './App.css';
import MenuPage from './MenuPage';
import AdminDashboard from './AdminDashboard'; // ADD THIS

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Add notification state
  const [notification, setNotification] = useState(null);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000); // Hide after 5 seconds
  };

  // Function to close modal with animation
  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowCreateAccount(false);
      setIsClosingModal(false);
    }, 300); // Match animation duration
  };

  // Handle Password Reset
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setError('Please enter your email address');
      showNotification('Please enter your email address', 'error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setError('Please enter a valid email address');
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      showNotification('Password reset email sent! Check your inbox.', 'success');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send reset email.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Force sign out on app load to always start at login page
    auth.signOut();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      if (currentUser) {
        console.log('User is logged in:', currentUser.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    console.log('Login button clicked');
    
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    setLoading(true);
    setError('');
    console.log('Attempting to sign in with:', loginData.email);
    
    try {
      const user = await signInWithEmail(loginData.email, loginData.password);
      console.log('Login successful!', user);
      showNotification(`Welcome back, ${user.displayName || user.email}!`, 'success');
    } catch (error) {
      console.error('Login error:', error);
      
      // User-friendly error messages
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = 'Incorrect email or password. Please check your credentials and try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          // Only show the Firebase error in console, not to user
          console.error('Firebase error code:', error.code);
          errorMessage = 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    console.log('Signup button clicked');
    
    if (!signupData.fullName || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setError('Please fill in all fields');
      showNotification('Please fill in all fields', 'error');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match!');
      showNotification('Passwords do not match!', 'error');
      return;
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      showNotification('Please agree to the Terms of Service', 'error');
      return;
    }
    
    setLoading(true);
    setError('');
    console.log('Attempting to sign up with:', signupData.email);
    
    try {
      const user = await signUpWithEmail(signupData.email, signupData.password, signupData.fullName);
      console.log('Signup successful!', user);
      showNotification(`Account created successfully! Welcome, ${signupData.fullName}!`, 'success');
      closeModal();
    } catch (error) {
      console.error('Signup error:', error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to create account. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please login or use a different email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          console.error('Firebase error code:', error.code);
          errorMessage = 'Failed to create account. Please try again.';
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('Google sign-in button clicked');
    setLoading(true);
    setError('');
    
    try {
      const user = await signInWithGoogle();
      console.log('Google sign-in successful!', user);
      showNotification(`Successfully signed in via Google! Welcome, ${user.displayName}!`, 'success');
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      // User-friendly error messages
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      switch (error.code) {
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized. Please contact support.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked by browser. Please allow popups and try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with the same email. Please sign in using your original method.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Only one popup request is allowed at a time.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          console.error('Firebase error code:', error.code);
          errorMessage = 'Google sign-in failed. Please try again.';
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ADD THIS - Check if user is admin
  const isAdmin = user?.email === 'admin@graceburger.com'; // Change this to your admin email

  if (user) {
    // If admin, show Admin Dashboard
    if (isAdmin) {
      return <AdminDashboard user={user} onSignOut={() => auth.signOut()} />;
    }
    // If regular user, show Menu Page
    return <MenuPage user={user} onSignOut={() => auth.signOut()} />;
  }

  return (
    <div className="login-container">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            <CheckCircle size={20} />
            <span>{notification.message}</span>
          </div>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Left Side - Welcome Section */}
      <div className="welcome-section" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${bgImage})` }}>
        <div className="welcome-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <span className="logo-text">GRACE BURGER</span>
          </div>
          
          <h1 className="welcome-title">WELCOME BACK</h1>
          <p className="welcome-subtitle">Your favorite burgers are waiting</p>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🍔</span>
              <span>Order your favorites</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚚</span>
              <span>Track your order</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⭐</span>
              <span>Quality Foods</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="form-section">
        <div className="form-container">
          <h2 className="form-title">SIGN IN</h2>
          <p className="form-subtitle">Access your Grace Burger account</p>
          
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}
          
          <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
            <svg viewBox="0 0 24 24" className="google-icon">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'SIGNING IN...' : 'CONTINUE WITH GOOGLE'}
          </button>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          <div className="login-form">
            <div className="form-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>PASSWORD</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button 
                type="button"
                className="forgot-password" 
                onClick={() => setShowForgotPassword(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>
            
            <button onClick={handleLogin} className="submit-btn" disabled={loading}>
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </div>
          
          <div className="signup-link">
            <span>Don't have an account?</span>
            <button 
              className="create-account-link"
              onClick={() => setShowCreateAccount(true)}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateAccount && (
        <div className={`modal-overlay ${isClosingModal ? 'closing' : ''}`} onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal"
              onClick={closeModal}
            >
              <X size={20} />
            </button>
            
            <h2 className="modal-title">CREATE ACCOUNT</h2>
            <p className="modal-subtitle">Join Grace Burger today</p>
            
            {error && (
              <div className="error-box">
                {error}
              </div>
            )}
            
            <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
              <svg viewBox="0 0 24 24" className="google-icon">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'SIGNING UP...' : 'SIGN UP WITH GOOGLE'}
            </button>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <div className="signup-form">
              <div className="form-group">
                <label>FULL NAME</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>PASSWORD</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 6 characters)"
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>CONFIRM PASSWORD</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="terms">
                  I agree to the{' '}
                  <button 
                    type="button"
                    onClick={() => setShowTerms(true)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#D4A027', 
                      textDecoration: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit'
                    }}
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button 
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#D4A027', 
                      textDecoration: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit'
                    }}
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              
              <button onClick={handleSignup} className="submit-btn" disabled={loading}>
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal"
              onClick={() => setShowForgotPassword(false)}
            >
              <X size={20} />
            </button>
            
            <h2 className="modal-title">RESET PASSWORD</h2>
            <p className="modal-subtitle">Enter your email address and we'll send you a link to reset your password</p>
            
            {error && (
              <div className="error-box">
                {error}
              </div>
            )}
            
            <div className="reset-password-form">
              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordReset();
                    }
                  }}
                />
              </div>
              
              <button 
                onClick={handlePasswordReset} 
                className="submit-btn" 
                disabled={loading}
              >
                {loading ? 'SENDING...' : 'SEND RESET LINK'}
              </button>

              <div style={{ 
                textAlign: 'center', 
                marginTop: '1.5rem',
                color: '#999',
                fontSize: '0.9rem'
              }}>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D4A027',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    font: 'inherit'
                  }}
                >
                  Back to Login
                </button>
              </div>
            </div>

            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#1a1a0a',
              border: '1px solid #333',
              borderRadius: '8px'
            }}>
              <p style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#D4A027' }}>📧 What happens next?</strong>
              </p>
              <ul style={{ 
                color: '#999', 
                fontSize: '0.85rem', 
                marginLeft: '1.5rem',
                lineHeight: '1.6' 
              }}>
                <li>Check your email inbox</li>
                <li>Click the reset link in the email</li>
                <li>Create a new password</li>
                <li>Login with your new password</li>
              </ul>
              <p style={{ 
                color: '#999', 
                fontSize: '0.8rem', 
                marginTop: '0.75rem',
                fontStyle: 'italic' 
              }}>
                Note: The reset link expires in 1 hour. Check your spam folder if you don't see the email.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="policy-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal"
              onClick={() => setShowTerms(false)}
            >
              <X size={20} />
            </button>
            
            <h2 className="modal-title">TERMS OF SERVICE</h2>
            <p className="modal-subtitle">Last updated: October 30, 2025</p>
            
            <div className="policy-content">
              <section>
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using Grace Burger's online ordering system, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>

              <section>
                <h3>2. Use of Service</h3>
                <p>Our service allows you to:</p>
                <ul>
                  <li>Browse our menu and view product information</li>
                  <li>Place orders for pickup</li>
                  <li>Track your order status in real-time</li>
                  <li>View your order history</li>
                </ul>
              </section>

              <section>
                <h3>3. Account Registration</h3>
                <p>To use our service, you must:</p>
                <ul>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Be at least 13 years old</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </section>

              <section>
                <h3>4. Orders and Payments</h3>
                <ul>
                  <li>All orders are subject to availability</li>
                  <li>Prices are subject to change without notice</li>
                  <li>We accept Cash on Store and GCash payments</li>
                  <li>Orders may be cancelled by the restaurant if items are unavailable</li>
                </ul>
              </section>

              <section>
                <h3>5. Cancellation Policy</h3>
                <p>Grace Burger reserves the right to cancel orders at any time for various reasons including but not limited to:</p>
                <ul>
                  <li>Unavailability of ingredients</li>
                  <li>Payment issues</li>
                  <li>Suspicious or fraudulent activity</li>
                </ul>
              </section>

              <section>
                <h3>6. User Conduct</h3>
                <p>You agree not to:</p>
                <ul>
                  <li>Use the service for any illegal purpose</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Attempt to gain unauthorized access</li>
                  <li>Impersonate any person or entity</li>
                </ul>
              </section>

              <section>
                <h3>7. Intellectual Property</h3>
                <p>All content, including logos, designs, text, and images, is the property of Grace Burger and is protected by copyright laws.</p>
              </section>

              <section>
                <h3>8. Limitation of Liability</h3>
                <p>Grace Burger shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
              </section>

              <section>
                <h3>9. Changes to Terms</h3>
                <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
              </section>

              <section>
                <h3>10. Contact Information</h3>
                <p>For questions about these Terms of Service, please contact us at:</p>
                <p><strong>Email:</strong> support@graceburger.com</p>
                <p><strong>Phone:</strong> +63 912 345 6789</p>
              </section>
            </div>

            <button 
              onClick={() => setShowTerms(false)}
              className="submit-btn"
              style={{ marginTop: '2rem' }}
            >
              I UNDERSTAND
            </button>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-overlay" onClick={() => setShowPrivacy(false)}>
          <div className="policy-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal"
              onClick={() => setShowPrivacy(false)}
            >
              <X size={20} />
            </button>
            
            <h2 className="modal-title">PRIVACY POLICY</h2>
            <p className="modal-subtitle">Last updated: October 30, 2025</p>
            
            <div className="policy-content">
              <section>
                <h3>1. Information We Collect</h3>
                <p>We collect information that you provide directly to us, including:</p>
                <ul>
                  <li><strong>Account Information:</strong> Name, email address, password</li>
                  <li><strong>Order Information:</strong> Items ordered, delivery preferences, payment method</li>
                  <li><strong>Contact Information:</strong> Phone number for order notifications</li>
                </ul>
              </section>

              <section>
                <h3>2. How We Use Your Information</h3>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Process and fulfill your orders</li>
                  <li>Send order confirmations and updates</li>
                  <li>Communicate with you about our products and services</li>
                  <li>Improve our website and customer service</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </section>

              <section>
                <h3>3. Information Sharing</h3>
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only:</p>
                <ul>
                  <li>With your consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                </ul>
              </section>

              <section>
                <h3>4. Data Security</h3>
                <p>We implement appropriate security measures to protect your personal information, including:</p>
                <ul>
                  <li>Secure socket layer (SSL) encryption</li>
                  <li>Firebase Authentication for account security</li>
                  <li>Regular security audits</li>
                  <li>Limited access to personal information</li>
                </ul>
              </section>

              <section>
                <h3>5. Authentication Services</h3>
                <p>We use Firebase Authentication and Google Sign-In services. When you use these services:</p>
                <ul>
                  <li>Your authentication is handled securely by Google/Firebase</li>
                  <li>We only receive your name and email address</li>
                  <li>Your password is never stored on our servers</li>
                </ul>
              </section>

              <section>
                <h3>6. Cookies and Tracking</h3>
                <p>We use cookies and similar technologies to:</p>
                <ul>
                  <li>Remember your login session</li>
                  <li>Understand how you use our service</li>
                  <li>Improve user experience</li>
                </ul>
              </section>

              <section>
                <h3>7. Your Rights</h3>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h3>8. Data Retention</h3>
                <p>We retain your personal information for as long as your account is active or as needed to provide services. Order history is retained for business and legal purposes.</p>
              </section>

              <section>
                <h3>9. Children's Privacy</h3>
                <p>Our service is not intended for children under 13. We do not knowingly collect information from children under 13 years of age.</p>
              </section>

              <section>
                <h3>10. Changes to Privacy Policy</h3>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
              </section>

              <section>
                <h3>11. Contact Us</h3>
                <p>If you have questions about this Privacy Policy, please contact us:</p>
                <p><strong>Email:</strong> privacy@graceburger.com</p>
                <p><strong>Phone:</strong> +63 912 345 6789</p>
                <p><strong>Address:</strong> 123 Main Street, Barangay Carmen, Cagayan de Oro City</p>
              </section>
            </div>

            <button 
              onClick={() => setShowPrivacy(false)}
              className="submit-btn"
              style={{ marginTop: '2rem' }}
            >
              I UNDERSTAND
            </button>
          </div>
        </div>
      )}
    </div>
  );
}