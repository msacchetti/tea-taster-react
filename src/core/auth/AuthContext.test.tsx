import React, { useContext } from 'react';
import { render, cleanup, wait, waitForElement } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthContext';
import { mockSession } from './__mocks__/mockSession';
import { Plugins } from '@capacitor/core';
import Axios from 'axios';

const MockConsumer: React.FC = () => {
  const { state } = useContext(AuthContext);

  return <div data-testid="session">{JSON.stringify(state.session)}</div>;
};

const ComponentTree = (
  <AuthProvider>
    <MockConsumer />
  </AuthProvider>
);

describe('<AuthProvider />', () => {
  beforeEach(() => {
    (Plugins.Storage as any) = jest.fn();
    (Plugins.Storage.get as any) = jest.fn(async () => ({ value: null }));
  });

  it('displays the loader when initializing', async () => {
    const { container } = render(ComponentTree);
    expect(container).toHaveTextContent(/Loading.../);
    await wait(() => expect(container).not.toHaveTextContent(/Loading.../));
  });

  describe('when a token is stored', () => {
    beforeEach(() => {
      (Plugins.Storage.get as any) = jest.fn(async () => ({
        value: mockSession.token,
      }));
      (Axios.get as any) = jest.fn(async () => ({ data: mockSession.user }));
    });

    it('obtains the token from storage', async () => {
      render(ComponentTree);
      await wait(() => {
        expect(Plugins.Storage.get).toHaveBeenCalledTimes(1);
        expect(Plugins.Storage.get).toHaveBeenCalledWith({ key: 'auth-token' });
      });
    });

    it('GETs the user profile', async () => {
      render(ComponentTree);
      const headers = { Authorization: 'Bearer ' + mockSession.token };
      const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
      await wait(() => {
        expect(Axios.get).toHaveBeenCalledTimes(1);
        expect(Axios.get).toHaveBeenCalledWith(url, { headers });
      });
    });

    it('sets the session', async () => {
      const { getByTestId } = render(ComponentTree);
      const session = await waitForElement(() => getByTestId('session'));
      expect(session.textContent).toEqual(JSON.stringify(mockSession));
    });
  });

  describe('when a token is not stored', () => {
    it('does not set the session', async () => {
      const { getByTestId } = render(ComponentTree);
      const session = await waitForElement(() => getByTestId('session'));
      expect(session.textContent).toEqual('');
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
