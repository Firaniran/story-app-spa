// src/model/authModel.js
import Api from '../api/api.js';
import AuthStorage from './authStorage.js';

const AuthModel = {
  register: async (name, email, password) => {
    return await Api.register(name, email, password);
  },

  login: async (email, password) => {
    const response = await Api.login(email, password);
    if (response.error) {
      throw new Error(response.message || 'Login gagal');
    }
    if (response.loginResult) {
      AuthStorage.setToken(response.loginResult.token);
      AuthStorage.setUserName(response.loginResult.name);
    }
    return response;
  },

  logout: () => {
    AuthStorage.clearAll();
  },

  getToken: () => {
    return AuthStorage.getToken();
  },

  getUserName: () => {
    return AuthStorage.getUserName();
  },

  isLoggedIn: () => {
    return !!AuthStorage.getToken();
  }
};

export default AuthModel;