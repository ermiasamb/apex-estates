'use client';
import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'apex_estates_history';
const MAX_HISTORY_LENGTH = 10;

export const useBrowsingHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to parse browsing history from localStorage', error);
    }
  }, []);

  const addView = useCallback((propertyId: string) => {
    setHistory((prevHistory) => {
      // Add new item to the front, remove duplicates, and trim to max length
      const newHistory = [propertyId, ...prevHistory.filter(id => id !== propertyId)].slice(0, MAX_HISTORY_LENGTH);
      
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save browsing history to localStorage', error);
      }
      
      return newHistory;
    });
  }, []);

  return { history, addView };
};
