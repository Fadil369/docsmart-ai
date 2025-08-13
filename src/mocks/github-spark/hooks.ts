import { useState, useEffect } from 'react';

// Mock implementation of useKV hook from @github/spark
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`spark_kv_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      try {
        localStorage.setItem(`spark_kv_${key}`, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn('Failed to store value in localStorage:', error);
      }
      return valueToStore;
    });
  };

  return [value, setStoredValue];
}