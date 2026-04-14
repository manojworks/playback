/**
 * API Configuration
 * Centralized configuration for API endpoints and base URLs
 */

export const API_CONFIG = {
  baseUrl: 'http://localhost:8000', // Change this for different environments
  endpoints: {
    search: '/api/v1/search',
    songs: '/api/v1/songs',
    hello: '/api/v1/hello'
  }
};
