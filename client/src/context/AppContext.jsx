import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [account, setAccount] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(true);

  const [tweets, setTweets] = useState([]);
  const [loadingTweets, setLoadingTweets] = useState(false);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const [botStatus, setBotStatus] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  // Fetch account details
  const fetchAccount = useCallback(async () => {
    try {
      setLoadingAccount(true);
      const data = await api.getAccount();
      if (data.success) {
        setAccount(data.account || null);
        setIsLive(data.isLive || false);
        setRateLimit(data.rateLimit || null);
      }
    } catch (err) {
      console.error('Failed to fetch account:', err);
      showToast(err.message, 'error');
    } finally {
      setLoadingAccount(false);
    }
  }, [showToast]);

  // Fetch tweets
  const fetchTweets = useCallback(async () => {
    try {
      setLoadingTweets(true);
      const data = await api.getTweets();
      if (data.success) {
        setTweets(data.tweets || []);
      }
    } catch (err) {
      console.error('Failed to fetch tweets:', err);
    } finally {
      setLoadingTweets(false);
    }
  }, []);

  // Fetch bot status
  const fetchBotStatus = useCallback(async () => {
    try {
      const status = await api.getBotStatus();
      setBotStatus(status);
    } catch (err) {
      console.error('Failed to fetch bot status:', err);
    }
  }, []);

  // Toggle Bot status
  const toggleBot = async () => {
    try {
      const res = await api.toggleBot();
      setBotStatus(prev => ({ ...prev, isActive: res.isActive }));
      showToast(res.isActive ? 'Bot Automation Started' : 'Bot Automation Paused', res.isActive ? 'success' : 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    try {
      await api.disconnectAccount();
      setAccount(null);
      setIsLive(false);
      setTweets([]);
      setRateLimit(null);
      showToast('X account disconnected.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    // Check URL parameters for OAuth redirect callbacks
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_success')) {
      showToast('🎉 X Account successfully connected via OAuth 2.0!', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('auth_error')) {
      showToast(`OAuth Error: ${params.get('auth_error')}`, 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    fetchAccount();
    fetchTweets();
    fetchBotStatus();
  }, [fetchAccount, fetchTweets, fetchBotStatus, showToast]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        account,
        isLive,
        rateLimit,
        loadingAccount,
        tweets,
        loadingTweets,
        isConnectModalOpen,
        setIsConnectModalOpen,
        botStatus,
        toast,
        showToast,
        fetchAccount,
        fetchTweets,
        handleDisconnect,
        toggleBot
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
