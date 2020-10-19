import {
  IdentityVault,
  IonicNativeAuthPlugin,
  PluginOptions,
} from '@ionic-enterprise/identity-vault';
import { BrowserVault } from './BrowserVault';

export class BrowserAuthPlugin implements IonicNativeAuthPlugin {
  private static instance: BrowserAuthPlugin | undefined = undefined;

  private constructor() {}

  public static getInstance(): BrowserAuthPlugin {
    if (!BrowserAuthPlugin.instance) {
      BrowserAuthPlugin.instance = new BrowserAuthPlugin();
    }
    return BrowserAuthPlugin.instance;
  }

  getVault(config: PluginOptions): IdentityVault {
    config.onReady!(BrowserVault.getInstance());
    return BrowserVault.getInstance();
  }
}
