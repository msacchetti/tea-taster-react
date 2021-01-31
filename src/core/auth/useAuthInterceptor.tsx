import Axios, { AxiosRequestConfig } from 'axios';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuthInterceptor = () => {
  const { state } = useContext(AuthContext);
  const instance = Axios.create({
    baseURL: process.env.REACT_APP_DATA_SERVICE,
  });

  if (state === undefined) {
    throw new Error('useAuthInterceptor must be used with an AuthProvider');
  }

  instance.interceptors.request.use((config: AxiosRequestConfig) => {
    if (!state.session)
      throw new Error('This operation requires authorization, please sign in.');

    config.headers.Authorization = `Bearer ${state.session.token}`;
    return config;
  });

  return { instance };
};
