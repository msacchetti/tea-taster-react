import React from 'react';
import { render, wait, waitForElement } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';

import PinDialog from './PinDialog';

describe('<PinDialog />', () => {
  let component: any;
  let mockDismiss: jest.Mock;

  beforeEach(() => {
    mockDismiss = jest.fn();
    component = <PinDialog onDismiss={mockDismiss} setPasscodeMode={true} />;
  });

  describe('initialization', () => {
    describe('set passcode mode', () => {
      it('sets the title to "Create PIN"', async () => {
        const { container } = render(component);
        expect(container).toHaveTextContent(/Create PIN/);
      });

      it('sets the prompt to "Create Session PIN"', async () => {
        const { container } = render(component);
        expect(container).toHaveTextContent(/Create Session PIN/);
      });
    });

    describe('unlock mode', () => {
      beforeEach(() => {
        component = (
          <PinDialog onDismiss={mockDismiss} setPasscodeMode={false} />
        );
      });

      it('sets the title to "Unlock"', async () => {
        const { container } = render(component);
        expect(container).toHaveTextContent(/Unlock/);
      });

      it('sets the prompt to "Enter PIN to Unlock"', async () => {
        const { container } = render(component);
        expect(container).toHaveTextContent(/Enter PIN to Unlock/);
      });
    });

    describe('disable input', () => {
      it('is false if the PIN is empty', async () => {
        const { getByText } = render(component);
        const button = getByText(/1/) as HTMLIonButtonElement;
        expect(button.disabled).toBeFalsy();
      });

      it('is false if the PIN is 8 characters long', async () => {
        const { getByText } = render(component);
        const button = getByText(/1/) as HTMLIonButtonElement;
        await wait(() => {
          for (let i = 0; i < 8; i++) {
            fireEvent.click(button);
          }
        });
        expect(button.disabled).toBeFalsy();
      });

      it('is true if the PIN is 9 characters long', async () => {
        const { getByText } = render(component);
        const button = getByText(/1/) as HTMLIonButtonElement;
        await wait(() => {
          for (let i = 0; i < 9; i++) {
            fireEvent.click(button);
          }
        });
        expect(button.disabled).toBeTruthy();
      });
    });

    describe('disable delete', () => {
      it('is true if the PIN length is zero', async () => {
        const { getByText } = render(component);
        const deleteButton = getByText(/Delete/) as HTMLIonButtonElement;
        expect(deleteButton.disabled).toBeTruthy();
      });

      it('is false if the PIN length is non-zero', async () => {
        const { getByText } = render(component);
        const oneButton = getByText(/1/) as HTMLIonButtonElement;
        const deleteButton = getByText(/Delete/) as HTMLIonButtonElement;
        await wait(() => fireEvent.click(oneButton));
        expect(deleteButton.disabled).toBeFalsy();
      });
    });

    describe('disable enter', () => {
      it('is true if the PIN length is zero', async () => {
        const { getByText } = render(component);
        const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
        expect(enterButton.disabled).toBeTruthy();
      });

      it('is false if the PIN length is three', async () => {
        const { getByText } = render(component);
        const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
        const oneButton = getByText(/1/) as HTMLIonButtonElement;
        await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
        expect(enterButton.disabled).toBeFalsy();
      });

      it('is false if the PIN length is greater than three', async () => {
        const { getByText } = render(component);
        const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
        const oneButton = getByText(/1/) as HTMLIonButtonElement;
        await wait(() => [1, 2, 3, 4].map(() => fireEvent.click(oneButton)));
        expect(enterButton.disabled).toBeFalsy();
      });
    });

    describe('append', () => {
      it('appends a * to the display PIN', async () => {
        const { getByText, container } = render(component);
        const displayPinDiv = container.querySelector('.pin') as HTMLElement;
        const oneButton = getByText(/1/) as HTMLIonButtonElement;
        expect(displayPinDiv).toHaveTextContent('');
        await wait(() => fireEvent.click(oneButton));
        expect(displayPinDiv).toHaveTextContent('*');
        await wait(() => fireEvent.click(oneButton));
        expect(displayPinDiv).toHaveTextContent('**');
        await wait(() => fireEvent.click(oneButton));
        expect(displayPinDiv).toHaveTextContent('***');
      });
    });

    describe('truncate', () => {
      it('removes the last value from the display PIN', async () => {
        const { getByText, container } = render(component);
        const displayPinDiv = container.querySelector('.pin') as HTMLElement;
        const oneButton = getByText(/1/) as HTMLIonButtonElement;
        const deleteButton = getByText(/Delete/) as HTMLIonButtonElement;
        await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
        expect(displayPinDiv).toHaveTextContent('***');
        await wait(() => fireEvent.click(deleteButton));
        expect(displayPinDiv).toHaveTextContent('**');
        await wait(() => fireEvent.click(deleteButton));
        expect(displayPinDiv).toHaveTextContent('*');
      });
    });

    describe('enter', () => {
      describe('set passcode mode', () => {
        describe('first call', () => {
          it('does not dismiss', async () => {
            const { getByText } = render(component);
            const oneButton = getByText(/1/) as HTMLIonButtonElement;
            const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
            await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
            await wait(() => fireEvent.click(enterButton));
            expect(mockDismiss).not.toHaveBeenCalled();
          });

          it('sets the prompt to "Verify PIN"', async () => {
            const { getByText, container } = render(component);
            const promptDiv = container.querySelector('.prompt');
            expect(promptDiv).toHaveTextContent(/Create Session PIN/);
            const oneButton = getByText(/1/) as HTMLIonButtonElement;
            const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
            await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
            await wait(() => fireEvent.click(enterButton));
            expect(promptDiv).toHaveTextContent(/Verify PIN/);
          });

          it('clears the PIN', async () => {
            const { getByText, container } = render(component);
            const displayPinDiv = container.querySelector('.pin');
            const oneButton = getByText(/1/) as HTMLIonButtonElement;
            const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
            await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
            expect(displayPinDiv).toHaveTextContent('***');
            await wait(() => fireEvent.click(enterButton));
            expect(displayPinDiv).toHaveTextContent('');
          });
        });

        describe('second call', () => {
          describe('when the PINs are equal', () => {
            it('dismisses the dialog and returns the pin', async () => {
              const { getByText } = render(component);
              const oneButton = getByText(/1/) as HTMLIonButtonElement;
              const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
              await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
              await wait(() => fireEvent.click(enterButton));
              expect(mockDismiss).not.toHaveBeenCalled();
              await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
              await wait(() => fireEvent.click(enterButton));
              expect(mockDismiss).toHaveBeenCalledWith({ data: '111' });
              expect(mockDismiss).toHaveBeenCalledTimes(1);
            });
          });

          describe('when the PINs are not equal', () => {
            it('does not dismiss the modal', async () => {
              const { getByText } = render(component);
              const oneButton = getByText(/1/) as HTMLIonButtonElement;
              const twoButton = getByText(/2/) as HTMLIonButtonElement;
              const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
              await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
              await wait(() => fireEvent.click(enterButton));
              await wait(() => [1, 2, 3].map(() => fireEvent.click(twoButton)));
              await wait(() => fireEvent.click(enterButton));
              expect(mockDismiss).not.toHaveBeenCalled();
            });

            it('sets an error message', async () => {
              const { getByText, container } = render(component);
              const errorDiv = container.querySelector('.error');
              const oneButton = getByText(/1/) as HTMLIonButtonElement;
              const twoButton = getByText(/2/) as HTMLIonButtonElement;
              const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
              await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
              await wait(() => fireEvent.click(enterButton));
              await wait(() => [1, 2, 3].map(() => fireEvent.click(twoButton)));
              await wait(() => fireEvent.click(enterButton));
              expect(errorDiv).toHaveTextContent(/PINs do not match/);
            });

            it('resets the prompt', async () => {
              const { getByText, container } = render(component);
              const promptDiv = container.querySelector('.prompt');
              const oneButton = getByText(/1/) as HTMLIonButtonElement;
              const twoButton = getByText(/2/) as HTMLIonButtonElement;
              const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
              await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
              await wait(() => fireEvent.click(enterButton));
              expect(promptDiv).toHaveTextContent(/Verify PIN/);
              await wait(() => [1, 2, 3].map(() => fireEvent.click(twoButton)));
              await wait(() => fireEvent.click(enterButton));
              expect(promptDiv).toHaveTextContent(/Create Session PIN/);
            });

            it('sets the PIN to empty', async () => {
              const { getByText, container } = render(component);
              const displayPinDiv = container.querySelector('.pin');
              const oneButton = getByText(/1/) as HTMLIonButtonElement;
              const twoButton = getByText(/2/) as HTMLIonButtonElement;
              const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
              await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
              await wait(() => fireEvent.click(enterButton));
              await wait(() => [1, 2, 3].map(() => fireEvent.click(twoButton)));
              expect(displayPinDiv).toHaveTextContent('***');
              await wait(() => fireEvent.click(enterButton));
              expect(displayPinDiv).toHaveTextContent('');
            });
          });
        });
      });

      describe('unlock mode', () => {
        beforeEach(() => {
          component = (
            <PinDialog onDismiss={mockDismiss} setPasscodeMode={false} />
          );
        });

        it('dismisses the dialog', async () => {
          const { getByText } = render(component);
          const oneButton = getByText(/1/) as HTMLIonButtonElement;
          const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
          await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
          await wait(() => fireEvent.click(enterButton));
          expect(mockDismiss).toHaveBeenCalledTimes(1);
        });

        it('passes back the entered PIN', async () => {
          const { getByText } = render(component);
          const oneButton = getByText(/1/) as HTMLIonButtonElement;
          const enterButton = getByText(/^Enter$/) as HTMLIonButtonElement;
          await wait(() => [1, 2, 3].map(() => fireEvent.click(oneButton)));
          await wait(() => fireEvent.click(enterButton));
          expect(mockDismiss).toHaveBeenCalledWith({ data: '111' });
        });
      });
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
