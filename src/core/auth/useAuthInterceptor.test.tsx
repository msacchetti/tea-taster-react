import React from 'react';
import Axios from 'axios';
import { Plugins } from '@capacitor/core';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { AuthProvider } from './AuthContext';
import { mockSession } from './__mocks__/mockSession';
import { useAuthInterceptor } from './useAuthInterceptor';

const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;

describe('useAuthInterceptor', () => {
  beforeEach(() => {
    (Plugins.Storage as any) = jest.fn();
    (Plugins.Storage.get as any) = jest.fn(async () => ({ value: undefined }));
    (Axios.get as any) = jest.fn(async () => ({ data: {} }));
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

  describe('request', () => {
    describe('when a session is stored', () => {
      beforeEach(() => {
        (Plugins.Storage.get as any) = jest.fn(async () => ({
          value: mockSession.token,
        }));
      });

      it('sets the Authorization header in the configuration', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthInterceptor(),
          { wrapper },
        );
        await waitForNextUpdate();
        const request: any = result.current.instance.interceptors.request;
        const { headers } = await request.handlers[0].fulfilled({
          headers: {},
        });
        expect(headers.Authorization).toEqual('Bearer ' + mockSession.token);
      });
    });

    describe('when a session is not stored', () => {
      it('does not set the Authorization header in the configuration', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthInterceptor(),
          { wrapper },
        );
        await waitForNextUpdate();
        const request: any = result.current.instance.interceptors.request;
        const { headers } = await request.handlers[0].fulfilled({
          headers: {},
        });
        expect(headers.Authorization).toBeUndefined();
      });
    });
  });

  describe('response', () => {
    beforeEach(() => {
      (Plugins.Storage.get as any) = jest.fn(async () => ({
        value: mockSession.token,
      }));
    });

    describe('when a 401 error status is returned', () => {
      it('clears the session', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthInterceptor(),
          { wrapper },
        );
        await waitForNextUpdate();

        const response: any = result.current.instance.interceptors.response;
        act(() => {
          const rejected = response.handlers[0].rejected({
            response: { status: 401 },
          });
          expect(rejected).rejects.toBeDefined();
          expect(rejected).rejects.toEqual({
            message: 'Unauthorized session.',
            response: { status: 401 },
          });
        });
      });
    });

    describe('when a non-401 error status is returned', () => {
      it('does not clear the session', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthInterceptor(),
          { wrapper },
        );
        await waitForNextUpdate();
        const response: any = result.current.instance.interceptors.response;
        act(() => {
          const rejected = response.handlers[0].rejected({
            response: { status: 400 },
          });
          expect(rejected).rejects.toBeDefined();
        });
        const request: any = result.current.instance.interceptors.request;
        const { headers } = request.handlers[0].fulfilled({
          headers: {},
        });
        expect(headers.Authorization).toEqual('Bearer ' + mockSession.token);
      });
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
