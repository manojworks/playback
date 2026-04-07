import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly prefix = 'solo-web_';

  constructor() {}

  /**
   * Set an item in localStorage
   */
  setItem<T>(key: string, value: T): void {
    try {
      const prefixedKey = this.prefix + key;
      const serialized = JSON.stringify(value);
      localStorage.setItem(prefixedKey, serialized);
    } catch (error: unknown) {
      console.error(`Failed to set item ${key}:`, error);
    }
  }

  /**
   * Get an item from localStorage
   */
  getItem<T>(key: string): T | null {
    try {
      const prefixedKey = this.prefix + key;
      const item = localStorage.getItem(prefixedKey);
      return item ? JSON.parse(item) as T : null;
    } catch (error: unknown) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove an item from localStorage
   */
  removeItem(key: string): void {
    try {
      const prefixedKey = this.prefix + key;
      localStorage.removeItem(prefixedKey);
    } catch (error: unknown) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  }

  /**
   * Clear all items with the app prefix
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key: string) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error: unknown) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Check if an item exists in localStorage
   */
  hasItem(key: string): boolean {
    const prefixedKey = this.prefix + key;
    return localStorage.getItem(prefixedKey) !== null;
  }

  /**
   * Get all stored keys (without prefix)
   */
  getAllKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }
}
