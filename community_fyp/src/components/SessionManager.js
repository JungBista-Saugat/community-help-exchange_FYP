import { useEffect } from 'react';

// This component manages authentication sessions across multiple tabs
const SessionManager = () => {
  useEffect(() => {
    // Create unique ID for this tab session
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the tab ID in session storage (which is tab-specific)
    sessionStorage.setItem('currentTabId', tabId);
    
    // Initialize tab-specific token if not already done
    const currentToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (currentToken) {
      sessionStorage.setItem('token', currentToken);
    }
    
    // Override localStorage methods to maintain tab isolation
    const originalGetItem = localStorage.getItem;
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    // Override getItem to use sessionStorage for token
    localStorage.getItem = function(key) {
      if (key === 'token') {
        return sessionStorage.getItem('token');
      }
      return originalGetItem.apply(this, arguments);
    };
    
    // Override setItem to store tokens in sessionStorage
    localStorage.setItem = function(key, value) {
      if (key === 'token') {
        // Save the previous state to detect login/logout
        const previousToken = sessionStorage.getItem('token');
        sessionStorage.setItem('token', value);
        
        // Dispatch a custom event when token changes (login)
        if (!previousToken && value) {
          const event = new CustomEvent('user-login', { detail: { tabId } });
          window.dispatchEvent(event);
        }
        
        // Still update localStorage too
        originalSetItem.apply(this, arguments);
        return;
      }
      originalSetItem.apply(this, arguments);
    };
    
    // Override removeItem to clear both storages
    localStorage.removeItem = function(key) {
      if (key === 'token') {
        // Save the previous state to detect login/logout
        const previousToken = sessionStorage.getItem('token');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userData');
        
        // Dispatch a custom event when token is removed (logout)
        if (previousToken) {
          const event = new CustomEvent('user-logout', { detail: { tabId } });
          window.dispatchEvent(event);
        }
      }
      originalRemoveItem.apply(this, arguments);
    };
    
    // Clean up
    return () => {
      localStorage.getItem = originalGetItem;
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  return null; // This component doesn't render anything
};

export default SessionManager; 