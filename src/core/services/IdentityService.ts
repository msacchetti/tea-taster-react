import { isPlatform } from '@ionic/react';
import {
  AuthMode,
  DefaultSession,
  IonicIdentityVaultUser,
  IonicNativeAuthPlugin,
} from '@ionic-enterprise/identity-vault';
import Axios from 'axios';
import { BrowserVaultPlugin } from './browser-vault/BrowserVaultPlugin';
import { User } from '../models';

export class IdentityService extends IonicIdentityVaultUser<DefaultSession> {
  private static instance: IdentityService | undefined = undefined;
  private _user: User | undefined = undefined;

  get user(): User | undefined {
    return this._user;
  }

  private constructor() {
    super(
      { ready: () => Promise.resolve(true) },
      {
        unlockOnAccess: true,
        hideScreenOnBackground: true,
        lockAfter: 5000,
      },
    );
  }

  public static getInstance(): IdentityService {
    if (!IdentityService.instance) {
      IdentityService.instance = new IdentityService();
    }
    return IdentityService.instance;
  }

  async init(): Promise<void> {
    await this.restoreSession();
    if (this.token) {
      this._user = await this.fetchUser(this.token);
    }
  }

  async set(user: User, token: string): Promise<void> {
    this._user = user;
    const mode = (await this.isBiometricsAvailable())
      ? AuthMode.BiometricOnly
      : AuthMode.PasscodeOnly;
    await this.login({ username: user.email, token }, mode);
  }

  async clear(): Promise<void> {
    this._user = undefined;
    await this.logout();
  }

  getPlugin(): IonicNativeAuthPlugin {
    if (isPlatform('capacitor')) return super.getPlugin();
    return BrowserVaultPlugin.getInstance();
  }

  private async fetchUser(token: string): Promise<User> {
    const headers = { Authorization: 'Bearer ' + token };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
    const { data } = await Axios.get(url, { headers });
    return data;
  }
}
