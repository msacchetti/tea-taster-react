import React from 'react';
import Axios from 'axios';
import { Plugins } from '@capacitor/core';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { AuthProvider } from './AuthContext';
import { mockSession } from './__mocks__/authMocks';
import { useAuthInterceptor } from './useAuthInterceptor';

const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;

describe('useAuthInterceptor', () => {
  beforeEach(() => {
    (Plugins.Storage as any) = jest.fn();
  });

  describe('when a session is stored', () => {
    beforeEach(() => {
      (Plugins.Storage.get as any) = jest.fn(async () => ({
        value: mockSession.token,
      }));
      (Axios.get as any) = jest.fn(async () => ({ data: mockSession.user }));
    });

    it('sets the Authorization header in the configuration', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthInterceptor(),
        { wrapper },
      );
      await waitForNextUpdate();
      const request: any = result.current.instance.interceptors.request;
      const { headers } = await request.handlers[0].fulfilled({ headers: {} });
      expect(headers.Authorization).toEqual('Bearer ' + mockSession.token);
    });

    it('sets the baseURL of requests', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthInterceptor(),
        { wrapper },
      );
      await waitForNextUpdate();
      const baseURL = result.current.instance.defaults.baseURL;
      expect(baseURL).toEqual('https://cs-demo-api.herokuapp.com');
    });
  });

  describe('when a session is not stored', () => {
    beforeEach(() => {
      (Plugins.Storage.get as any) = jest.fn(async () => ({
        value: undefined,
      }));
    });

    it('throws an error', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthInterceptor(),
        { wrapper },
      );
      await waitForNextUpdate();
      try {
        const request: any = result.current.instance.interceptors.request;
        await request.handlers[0].fulfilled({ headers: {} });
        expect(true).toBeFalsy();
      } catch (error) {
        expect(error.message).toEqual(
          'This operation requires authorization, please sign in.',
        );
      }
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
