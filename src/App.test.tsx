import React from 'react';
import { render } from '@testing-library/react';
import { Plugins } from '@capacitor/core';
import { TeaTaster } from './App';
import { isPlatform } from '@ionic/react';
jest.mock('@ionic/react', () => {
  const actual = jest.requireActual('@ionic/react');
  return { ...actual, isPlatform: jest.fn() };
});

describe('<TeaTaster />', () => {
  beforeEach(() => {
    (Plugins.SplashScreen as any) = jest.fn();
    (Plugins.SplashScreen.hide as any) = jest.fn();
  });

  describe('initialization', () => {
    describe('in an Android context', () => {
      beforeEach(() => (isPlatform as any).mockImplementation(() => true));

      it('should hide the splash screen', () => {
        const { container } = render(<TeaTaster />);
        expect(container).toBeDefined();
        expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
      });

      afterEach(() => (isPlatform as any).mockRestore());
    });

    describe('in an iOS context', () => {
      beforeEach(() => (isPlatform as any).mockImplementation(() => true));

      it('should hide the splash screen', () => {
        const { container } = render(<TeaTaster />);
        expect(container).toBeDefined();
        expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
      });

      afterEach(() => (isPlatform as any).mockRestore());
    });

    describe('in a web context', () => {
      beforeEach(() => (isPlatform as any).mockImplementation(() => false));

      it('should not hide the splash screen', () => {
        const { container } = render(<TeaTaster />);
        expect(container).toBeDefined();
        expect(Plugins.SplashScreen.hide).not.toHaveBeenCalled();
      });

      afterEach(() => (isPlatform as any).mockRestore());
    });
  });

  afterEach(() => {
    (Plugins.SplashScreen as any).mockRestore();
    (Plugins.SplashScreen.hide as any).mockRestore();
  });
});
