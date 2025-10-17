import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X, CheckCircle } from 'lucide-react';
import bgImage from './images/bg-image.jpg';
import { signInWithGoogle, signUpWithEmail, signInWithEmail, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';
import MenuPage from './MenuPage';

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
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
      setError(error.message);
      showNotification(error.message, 'error');
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
      setShowCreateAccount(false);
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      showNotification(error.message, 'error');
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
      setError(error.message);
      
      if (error.code === 'auth/unauthorized-domain') {
        showNotification('Error: localhost is not authorized. Please add it to Firebase Console', 'error');
      } else if (error.code === 'auth/popup-closed-by-user') {
        showNotification('Sign-in cancelled', 'error');
      } else {
        showNotification(error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
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
              <span>Exclusive member deals</span>
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
                onClick={() => alert('Password reset feature coming soon!')}
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
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="close-modal"
              onClick={() => setShowCreateAccount(false)}
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
                    onClick={() => alert('Terms of Service coming soon!')}
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
                    onClick={() => alert('Privacy Policy coming soon!')}
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
    </div>
  );
}