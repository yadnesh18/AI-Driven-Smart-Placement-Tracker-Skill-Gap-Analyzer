// src/services/authService.js
import axios from 'axios';

const baseURL = 'http://localhost:3000/api/auth';

/**
 * Send registration data to the backend.
 * @param {{name:string,email:string,password:string}} data
 * @returns {Promise<any>} response data
 */
export async function registerUser(data) {
  const response = await axios.post(`${baseURL}/register`, data);
  return response.data;
}