/**
 * CSRF Protection utilities
 * 
 * This module provides functions to get the CSRF token from cookies
 * and add it to requests to prevent Cross-Site Request Forgery attacks.
 */

/**
 * Gets the CSRF token from cookies
 * @returns The CSRF token value or undefined if not found
 */
export function getCSRFToken(): string | undefined {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  return undefined;
}

/**
 * Adds the CSRF token to the headers of a fetch request
 * @param options The fetch options to modify
 * @returns The modified fetch options with CSRF token headers
 */
export function addCSRFToken(options: RequestInit = {}): RequestInit {
  const token = getCSRFToken();
  
  if (!token) {
    console.warn('CSRF token not found in cookies. Requests may fail.');
    return options;
  }
  
  const headers = {
    ...options.headers,
    'X-CSRF-Token': token
  };
  
  return {
    ...options,
    headers
  };
}

/**
 * A wrapper around fetch that automatically adds the CSRF token
 * @param url The URL to fetch
 * @param options The fetch options
 * @returns A promise that resolves to the fetch response
 */
export function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, addCSRFToken(options));
}