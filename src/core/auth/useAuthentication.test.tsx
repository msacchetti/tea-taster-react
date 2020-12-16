import React from 'react';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { useAuthentication } from './useAuthentication';
import { AuthProvider } from './AuthContext';
import { AuthService, IdentityService } from '../services';
import { User } from '../models';
import { AuthMode } from '@ionic-enterprise/identity-vault';

const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;

const mockUser: User = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

describe('useAuthentication', () => {
  let authService: AuthService;
  let identityService: IdentityService;

  beforeEach(() => {
    authService = AuthService.getInstance();
    identityService = IdentityService.getInstance();
    identityService.init = jest.fn();
  });

  describe('login', () => {
    beforeEach(() => {
      authService.login = jest.fn(() => {
        identityService['_user'] = mockUser;
        return Promise.resolve(true);
      });
      identityService['_user'] = undefined;
    });

    describe('on success', () => {
      it('sets the status to authenticated', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        await act(() => result.current.login('test@test.com', 'P@ssword'));
        expect(result.current.status).toEqual('authenticated');
      });

      it('sets the user on successful login', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        identityService['_user'] = mockUser;
        await act(() => result.current.login('test@test.com', 'P@ssword'));
        expect(result.current.user).toEqual(mockUser);
      });
    });

    describe('on failure', () => {
      beforeEach(() => {
        authService.login = jest.fn(() => Promise.resolve(false));
      });

      it('sets the error', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        await act(() => result.current.login('test@test.com', 'P@ssword'));
        expect(result.current.error).toBeDefined();
      });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      identityService['_user'] = mockUser;
      authService.logout = jest.fn(() => {
        identityService['_user'] = undefined;
        return Promise.resolve();
      });
    });

    it('sets the status to unauthenticated', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthentication(),
        { wrapper },
      );
      await waitForNextUpdate();
      await act(() => result.current.login('test@test.com', 'P@ssword'));
      await act(() => result.current.logout());
      expect(result.current.status).toEqual('unauthenticated');
    });

    it('sets the user to undefined', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthentication(),
        { wrapper },
      );
      await waitForNextUpdate();
      await act(() => result.current.login('test@test.com', 'P@ssword'));
      await act(() => result.current.logout());
      expect(result.current.user).not.toBeDefined();
    });
  });

  describe('canUnlock', () => {
    describe('without a stored session', () => {
      beforeEach(() => {
        identityService.hasStoredSession = jest.fn(async () => false);
      });

      it('returns false', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        expect(await result.current.canUnlock()).toBeFalsy();
      });
    });

    describe('with a stored session', () => {
      beforeEach(() => {
        identityService.hasStoredSession = jest.fn(async () => true);
      });

      it('returns true for passcode', async () => {
        identityService.getAuthMode = jest.fn(
          async () => AuthMode.PasscodeOnly,
        );
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        expect(await result.current.canUnlock()).toBeTruthy();
      });

      it('returns true for biometric and passcode', async () => {
        identityService.getAuthMode = jest.fn(
          async () => AuthMode.BiometricAndPasscode,
        );
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        expect(await result.current.canUnlock()).toBeTruthy();
      });

      it('returns false for biometric when bio is not available', async () => {
        identityService.getAuthMode = jest.fn(
          async () => AuthMode.BiometricOnly,
        );
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        expect(await result.current.canUnlock()).toBeFalsy();
      });

      it('returns true for biometric when bio is available', async () => {
        identityService.getAuthMode = jest.fn(
          async () => AuthMode.BiometricAndPasscode,
        );
        identityService.isBiometricsAvailable = jest.fn(async () => true);
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        expect(await result.current.canUnlock()).toBeTruthy();
      });
    });
  });

  describe('unlock', () => {
    beforeEach(() => {
      identityService['_user'] = mockUser;
      identityService.restoreSession = jest.fn(async () => undefined);
    });

    it('restores the session', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthentication(),
        { wrapper },
      );
      await waitForNextUpdate();
      await act(() => result.current.unlock());
      expect(identityService.restoreSession).toHaveBeenCalledTimes(1);
    });

    it('sets the user', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthentication(),
        { wrapper },
      );
      await waitForNextUpdate();
      await act(() => result.current.unlock());
      expect(result.current.user).toEqual(mockUser);
    });

    it('sets the status to authenticated', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthentication(),
        { wrapper },
      );
      await waitForNextUpdate();
      await act(() => result.current.unlock());
      expect(result.current.status).toEqual('authenticated');
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
