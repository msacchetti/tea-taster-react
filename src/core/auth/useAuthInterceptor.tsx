import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useContext, useMemo } from 'react';
import { AuthContext } from './AuthContext';

export const useAuthInterceptor = () => {
  const { state, dispatch } = useContext(AuthContext);

  if (state === undefined) {
    throw new Error('useAuthInterceptor must be used with an AuthProvider');
  }

  const instance = useMemo(() => {
    const axios = Axios.create({
      baseURL: process.env.REACT_APP_DATA_SERVICE,
    });

    axios.interceptors.request.use((config: AxiosRequestConfig) => {
      if (state.session)
        config.headers.Authorization = `Bearer ${state.session.token}`;
      return config;
    });

    axios.interceptors.response.use(
      (response: AxiosResponse<any>) => response,
      (error: any) => {
        if (error.response.status === 401) dispatch({ type: 'CLEAR_SESSION' });
        return Promise.reject(error);
      },
    );

    return axios;
  }, [state, dispatch]);

  return { instance };
};
