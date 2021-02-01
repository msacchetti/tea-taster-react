import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useContext } from 'react';
import { useHistory } from 'react-router';
import { AuthContext } from './AuthContext';

export const useAuthInterceptor = () => {
  const { state, dispatch } = useContext(AuthContext);
  const history = useHistory();
  const instance = Axios.create({
    baseURL: process.env.REACT_APP_DATA_SERVICE,
  });

  if (state === undefined) {
    throw new Error('useAuthInterceptor must be used with an AuthProvider');
  }

  instance.interceptors.request.use((config: AxiosRequestConfig) => {
    if (state.session)
      config.headers.Authorization = `Bearer ${state.session.token}`;
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse<any>) => response,
    (error: any) => {
      if (error.response.status === 401) dispatch({ type: 'CLEAR_SESSION' });
      return Promise.reject(error);
    },
  );

  return { instance };
};
