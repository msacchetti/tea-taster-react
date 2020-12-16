import React from 'react';
import { render, wait, waitForElement } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import LoginPage from './LoginPage';

let mockCanUnlock = jest.fn();

jest.mock('../core/auth', () => {
  const actual = jest.requireActual('../core/auth');
  return {
    ...actual,
    useAuthentication: () => ({
      ...actual.useAuthentication(),
      canUnlock: mockCanUnlock,
    }),
  };
});

describe('<LoginPage />', () => {
  it('displays the header', async () => {
    const { container } = render(<LoginPage />);
    await wait(() => expect(container).toHaveTextContent(/Login/));
  });

  it('renders consistently', async () => {
    const { asFragment } = render(<LoginPage />);
    await wait(() => expect(asFragment()).toMatchSnapshot());
  });

  describe('sign in button', () => {
    it('starts disabled', async () => {
      const { container } = render(<LoginPage />);
      const button = await waitForElement(
        () => container.querySelector('ion-button')! as HTMLIonButtonElement,
      );
      expect(button.disabled).toBeTruthy();
    });

    it('is disabled with just an e-mail address', async () => {
      const { container } = render(<LoginPage />);
      const [button, email] = await waitForElement(() => [
        container.querySelector('ion-button')! as HTMLIonButtonElement,
        container.querySelector('#email-input')! as HTMLIonInputElement,
      ]);
      await wait(() => fireEvent.ionChange(email, 'test@test.com'));
      expect(button.disabled).toBeTruthy();
    });

    it('is disabled with just a password', async () => {
      const { container } = render(<LoginPage />);
      const [button, password] = await waitForElement(() => [
        container.querySelector('ion-button')! as HTMLIonButtonElement,
        container.querySelector('#password-input')! as HTMLIonInputElement,
      ]);
      await wait(() => fireEvent.ionChange(password, 'P@ssword123'));
      expect(button.disabled).toBeTruthy();
    });

    it('is enabled with both an email address and a password', async () => {
      const { container } = render(<LoginPage />);
      const [button, email, password] = await waitForElement(() => [
        container.querySelector('ion-button')! as HTMLIonButtonElement,
        container.querySelector('#email-input')! as HTMLIonInputElement,
        container.querySelector('#password-input')! as HTMLIonInputElement,
      ]);
      await wait(() => {
        fireEvent.ionChange(email, 'test@test.com');
        fireEvent.ionChange(password, 'P@ssword123');
      });
      expect(button.disabled).toBeFalsy();
    });
  });

  describe('error messages', () => {
    it('starts with no error message', async () => {
      const { container } = render(<LoginPage />);
      const errorDiv = await waitForElement(
        () => container.querySelector('.error-message')!,
      );
      expect(errorDiv.textContent).toEqual('');
    });

    it('dsiplays an error message if the e-mail address is dirty and empty', async () => {
      const expected = /E-Mail Address is required/;
      const { container } = render(<LoginPage />);
      const [errorDiv, email] = await waitForElement(() => [
        container.querySelector('.error-message')!,
        container.querySelector('#email-input')! as HTMLIonInputElement,
      ]);
      await wait(() => {
        fireEvent.ionChange(email, 'test@test.com');
        fireEvent.ionChange(email, '');
      });
      expect(errorDiv).toHaveTextContent(expected);
    });

    it('displays an error messae if the e-mail address has an invalid format', async () => {
      const expected = /E-Mail Address must have a valid format/;
      const { container } = render(<LoginPage />);
      const [errorDiv, email] = await waitForElement(() => [
        container.querySelector('.error-message')!,
        container.querySelector('#email-input')! as HTMLIonInputElement,
      ]);
      await wait(() => {
        fireEvent.ionChange(email, 'test.com');
      });
      expect(errorDiv).toHaveTextContent(expected);
    });

    it('displays an error message if the password is dirty and empty', async () => {
      const expected = /Password is required/;
      const { container } = render(<LoginPage />);
      const [errorDiv, password] = await waitForElement(() => [
        container.querySelector('.error-message')!,
        container.querySelector('#password-input')! as HTMLIonInputElement,
      ]);
      await wait(() => {
        fireEvent.ionChange(password, 'P@ssword123');
        fireEvent.ionChange(password, '');
      });
      expect(errorDiv).toHaveTextContent(expected);
    });
  });

  describe('initialization', () => {
    describe('without a stored session', () => {
      beforeEach(() => (mockCanUnlock = jest.fn(() => Promise.resolve(false))));

      it('does not show the unlock panel', async () => {
        const expected = /Unlock/;
        const { container } = render(<LoginPage />);
        await wait(() => expect(container).not.toHaveTextContent(expected));
      });
    });

    describe('with a stored session', () => {
      beforeEach(() => (mockCanUnlock = jest.fn(() => Promise.resolve(true))));

      it('does not show the unlock panel', async () => {
        const expected = /Unlock/;
        const { container } = render(<LoginPage />);
        await wait(() => expect(container).toHaveTextContent(expected));
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
