import React, { createContext, useEffect, useReducer } from 'react';
import { User } from '../models';
import { IdentityService } from '../services';

type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: User | undefined;
  error: any | undefined;
}

const initialState: AuthState = {
  status: 'pending',
  user: undefined,
  error: undefined,
};

export type AuthAction =
  | { type: 'LOGOUT' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGIN_FAILURE'; error: any };

const reducer = (
  state: AuthState = initialState,
  action: AuthAction,
): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, status: 'authenticated', user: action.user };
    case 'LOGIN_FAILURE':
      return { ...state, status: 'unauthenticated', error: action.error };
    case 'LOGOUT':
      return {
        ...state,
        status: 'unauthenticated',
        user: undefined,
        error: undefined,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext<{
  state: typeof initialState;
  dispatch: (action: AuthAction) => void;
}>({
  state: initialState,
  dispatch: () => {},
});

export const AuthProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const identityService = IdentityService.getInstance();

  identityService.onVaultLockedHandler = () => {
    return dispatch({ type: 'LOGOUT' });
  };

  identityService.onSessionRestoredHandler = () => {
    return dispatch({ type: 'LOGIN_SUCCESS', user: identityService.user! });
  };

  useEffect(() => {
    const init = async () => {
      await identityService.init();
      if (identityService.token)
        return dispatch({ type: 'LOGIN_SUCCESS', user: identityService.user! });
      else return dispatch({ type: 'LOGOUT' });
    };
    init();
  }, [identityService]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {state.status === 'pending' ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
