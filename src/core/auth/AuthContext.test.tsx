import React, { useContext } from 'react';
import {
  render,
  cleanup,
  wait,
  waitForElement,
  act,
} from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthContext';
import { User } from '../models';
import { IdentityService } from '../services';

const MockConsumer: React.FC = () => {
  const { state } = useContext(AuthContext);

  return (
    <div>
      <div data-testid="status">{state.status}</div>
      <div data-testid="error">{state.error}</div>
      <div data-testid="user">{JSON.stringify(state.user)}</div>
    </div>
  );
};

const ComponentTree = (
  <AuthProvider>
    <MockConsumer />
  </AuthProvider>
);

const mockUser: User = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

describe('<AuthProvider />', () => {
  let identityService: IdentityService;

  beforeEach(() => {
    identityService = IdentityService.getInstance();
    identityService.init = jest.fn(() => Promise.resolve());
  });

  it('displays the loader when initializing', async () => {
    const { container } = render(ComponentTree);
    expect(container).toHaveTextContent(/Loading.../);
    await wait(() => expect(container).not.toHaveTextContent(/Loading.../));
  });

  describe('when a token is stored', () => {
    beforeEach(() => {
      identityService.init = jest.fn(async () => {
        (identityService as any).session = {
          token: '3884915llf950',
          username: mockUser.email,
        };
        identityService['_user'] = mockUser;
        return (identityService as any).session;
      });
    });

    it('sets the status to authenticated', async () => {
      const { getByTestId } = render(ComponentTree);
      const status = await waitForElement(() => getByTestId('status'));
      expect(status.textContent).toEqual('authenticated');
    });

    it('sets the user profile', async () => {
      const { getByTestId } = render(ComponentTree);
      const user = await waitForElement(() => getByTestId('user'));
      expect(user.textContent).toEqual(JSON.stringify(mockUser));
    });
  });

  describe('when a token is not stored', () => {
    beforeEach(() => {
      identityService.init = jest.fn(async () => {
        (identityService as any).session = undefined;
      });
    });

    it('sets the status to unauthenticated', async () => {
      const { getByTestId } = render(ComponentTree);
      const status = await waitForElement(() => getByTestId('status'));
      expect(status.textContent).toEqual('unauthenticated');
    });

    it('does not set the user profile', async () => {
      const { getByTestId } = render(ComponentTree);
      const user = await waitForElement(() => getByTestId('user'));
      expect(user.textContent).toEqual('');
    });
  });

  describe('when the vault is locked', () => {
    beforeEach(() => {
      identityService.init = jest.fn(async () => {
        (identityService as any).session = {
          token: '3884915llf950',
          username: mockUser.email,
        };
        identityService['_user'] = mockUser;
        return (identityService as any).session;
      });
    });

    it('sets the status to unauthenticated', async () => {
      const { getByTestId } = render(ComponentTree);
      const status = await waitForElement(() => getByTestId('status'));
      expect(status.textContent).toEqual('authenticated');
      await act(() =>
        identityService.onVaultLocked({ saved: true, timeout: true }),
      );
      expect(status.textContent).toEqual('unauthenticated');
    });

    it('removes the user profile', async () => {
      const { getByTestId } = render(ComponentTree);
      const user = await waitForElement(() => getByTestId('user'));
      expect(user.textContent).toEqual(JSON.stringify(mockUser));
      await act(() =>
        identityService.onVaultLocked({ saved: true, timeout: true }),
      );
      expect(user.textContent).toEqual('');
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
