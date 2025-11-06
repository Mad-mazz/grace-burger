import React, { useState } from 'react';
import Overview from './Overview';
import App from './App';

function Main() {
  const [showLoginPage, setShowLoginPage] = useState(false);

  const handleLoginClick = () => {
    setShowLoginPage(true);
  };

  const handleBackToOverview = () => {
    setShowLoginPage(false);
  };

  return (
    <div>
      {!showLoginPage ? (
        <Overview onLoginClick={handleLoginClick} />
      ) : (
        <App onBackToOverview={handleBackToOverview} />
      )}
    </div>
  );
}

export default Main;