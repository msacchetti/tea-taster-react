import { Plugins } from '@capacitor/core';
import { AuthMode, DefaultSession } from '@ionic-enterprise/identity-vault';
import Axios from 'axios';
import { User } from '../models';
import { IdentityService } from './IdentityService';

const mockUser: User = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

describe('IdentityService', () => {
  let identityService: IdentityService;

  beforeEach(() => {
    identityService = IdentityService.getInstance();
    identityService['_user'] = undefined;
  });

  it('should use a single instance', () => {
    expect(identityService).toBeDefined();
  });

  describe('init', () => {
    beforeEach(() => {
      (Axios.get as any) = jest.fn(() => Promise.resolve({ data: mockUser }));
      identityService.restoreSession = jest.fn(async () => undefined);
    });

    it('restores the session', async () => {
      await identityService.init();
      expect(identityService.restoreSession).toHaveBeenCalledTimes(1);
    });

    describe('if there is a token', () => {
      beforeEach(() => {
        identityService.restoreSession = jest.fn(async () => {
          (identityService as any).session = {
            token: '3884915llf950',
            username: mockUser.email,
          };
          return (identityService as any).session;
        });
      });

      it('assigns the token', async () => {
        await identityService.init();
        expect(identityService.token).toEqual('3884915llf950');
      });

      it('gets the current user', async () => {
        await identityService.init();
        const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
        const headers = { Authorization: 'Bearer ' + '3884915llf950' };
        expect(Axios.get).toHaveBeenCalledWith(url, { headers });
      });

      it('assigns the user', async () => {
        await identityService.init();
        expect(identityService.user).toEqual(mockUser);
      });
    });

    describe('if there is not a token', () => {
      beforeEach(() => {
        identityService.restoreSession = jest.fn(async () => undefined);
        (identityService as any).session = undefined;
      });

      it('does not assign a token', async () => {
        await identityService.init();
        expect(identityService.token).toBeUndefined();
      });

      it('does not get the current user', async () => {
        await identityService.init();
        expect(identityService.user).toBeUndefined();
      });
    });
  });

  describe('set', () => {
    beforeEach(() => {
      (Plugins.Storage as any) = jest.fn();
      (Plugins.Storage.set as any) = jest.fn(() => Promise.resolve());
      (Plugins.Storage.clear as any) = jest.fn(() => Promise.resolve());
    });

    it('sets the user', async () => {
      await identityService.set(mockUser, '19940059fkkf039');
      expect(identityService.user).toEqual(mockUser);
    });

    it('calls the base class login', async () => {
      identityService.isBiometricsAvailable = jest.fn(async () => true);
      identityService.login = jest.fn(async () => {});
      await identityService.set(mockUser, '19940059fkkf039');
      expect(identityService.login).toHaveBeenCalledTimes(1);
      expect(identityService.login).toHaveBeenCalledWith(
        {
          username: mockUser.email,
          token: '19940059fkkf039',
        },
        AuthMode.BiometricOnly,
      );
    });

    it('uses passcode if biometrics are not available', async () => {
      identityService.isBiometricsAvailable = jest.fn(async () => false);
      identityService.login = jest.fn(async () => {});
      await identityService.set(mockUser, '19940059fkkf039');
      expect(identityService.login).toHaveBeenCalledTimes(1);
      expect(identityService.login).toHaveBeenCalledWith(
        {
          username: mockUser.email,
          token: '19940059fkkf039',
        },
        AuthMode.PasscodeOnly,
      );
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      identityService['_user'] = mockUser;
      (Plugins.Storage as any) = jest.fn();
      (Plugins.Storage.remove as any) = jest.fn(() => Promise.resolve());
    });

    it('calls the logout method', async () => {
      identityService.logout = jest.fn(async () => {});
      await identityService.clear();
      expect(identityService.logout).toHaveBeenCalledTimes(1);
    });
  });

  // MOVE TO AUTH CONTEXT TESTS
  // --------------------------
  // describe('on vault locked', () => {
  //   it('calls the onVaultLockedHandler method', () => {
  //     identityService.onVaultLockedHandler = jest.fn();
  //     identityService.onVaultLocked({ saved: true, timeout: true });
  //     expect(identityService.onVaultLockedHandler).toHaveBeenCalledTimes(1);
  //   });
  // });

  // describe('on session restored', () => {
  //   it('calls the onSessionRestoredHandler method', () => {
  //     let session: DefaultSession = {
  //       username: mockUser.email,
  //       token: '19940059fkkf039',
  //     };
  //     identityService.onSessionRestoredHandler = jest.fn();
  //     identityService.onSessionRestored(session);
  //     expect(identityService.onSessionRestoredHandler).toHaveBeenCalledTimes(1);
  //   });
  // });

  afterEach(() => jest.restoreAllMocks());
});
