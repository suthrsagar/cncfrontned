import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../api/config';
import messaging from '@react-native-firebase/messaging';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);

  // Setup Axios Interceptor for 401 Unauthorized errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          console.log('Token expired or invalid. Logging out automatically.');
          await logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const syncFcmToken = async (token) => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        // Run axios without awaiting to prevent blocking
        axios.put(`${API_URL}/users/profile/fcm-token`, { token: fcmToken }, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(() => console.log('FCM Token synced with backend'))
          .catch(err => console.log('Backend sync failed:', err.message));
      }
    } catch (err) {
      console.log('Error getting FCM Token:', err);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.token) {
        setUserInfo(res.data);
        setUserToken(res.data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        await AsyncStorage.setItem('userToken', res.data.token);
        syncFcmToken(res.data.token); // Don't await
      }
    } catch (e) {
      console.error('Login error:', e.response?.data?.message || e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, phone, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, phone, password });
      if (res.data.token) {
        setUserInfo(res.data);
        setUserToken(res.data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        await AsyncStorage.setItem('userToken', res.data.token);
        syncFcmToken(res.data.token); // Don't await
      }
    } catch (e) {
      console.error('Register error:', e.response?.data?.message || e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      setUserToken(null);
      setUserInfo(null);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let userInfo = await AsyncStorage.getItem('userInfo');
      let userToken = await AsyncStorage.getItem('userToken');
      let langCheck = await AsyncStorage.getItem('@has_selected_language');
      
      if (langCheck === 'true') {
        setHasSelectedLanguage(true);
      }
      
      if (userInfo && userToken) {
        setUserInfo(JSON.parse(userInfo));
        setUserToken(userToken);
        syncFcmToken(userToken); // Don't await so app boots instantly
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const completeLanguageSelection = async () => {
    await AsyncStorage.setItem('@has_selected_language', 'true');
    setHasSelectedLanguage(true);
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, register, isLoading, userToken, userInfo, hasSelectedLanguage, completeLanguageSelection }}>
      {children}
    </AuthContext.Provider>
  );
};
