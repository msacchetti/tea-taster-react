import { AuthMode } from '@ionic-enterprise/identity-vault';
import { useCallback, useContext } from 'react';
import { AuthContext } from '.';
import { AuthService, IdentityService } from '../services';

export const useAuthentication = () => {
  const authService = AuthService.getInstance();
  const identityService = IdentityService.getInstance();

  const { state, dispatch } = useContext(AuthContext);

  if (state === undefined) {
    throw new Error('useAuthentication must be used with an AuthProvider');
  }

  const login = async (username: string, password: string): Promise<void> => {
    const isSuccessful = await authService.login(username, password);
    if (isSuccessful)
      return dispatch({ type: 'LOGIN_SUCCESS', user: identityService.user! });
    return dispatch({
      type: 'LOGIN_FAILURE',
      error: new Error('Unable to log in, please try again'),
    });
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const canUnlock = useCallback(async (): Promise<boolean> => {
    if (!(await identityService.hasStoredSession())) {
      return false;
    }
    const mode = await identityService.getAuthMode();
    return (
      mode === AuthMode.PasscodeOnly ||
      mode === AuthMode.BiometricAndPasscode ||
      (mode === AuthMode.BiometricOnly &&
        (await identityService.isBiometricsAvailable()))
    );
  }, [identityService]);

  const unlock = async (): Promise<void> => {
    await identityService.restoreSession();
    dispatch({ type: 'LOGIN_SUCCESS', user: identityService.user! });
  };

  return {
    status: state.status,
    user: state.user,
    error: state.error,
    login,
    logout,
    canUnlock,
    unlock,
  };
};
