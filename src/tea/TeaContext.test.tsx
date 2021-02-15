import React, { useContext } from 'react';
import { render, cleanup, waitForElement } from '@testing-library/react';
import { mockTeas } from './__mocks__/mockTeas';
import { TeaContext, TeaProvider } from './TeaContext';

const mockAxios: any = jest.genMockFromModule('axios');
jest.mock('../core/auth/useAuthInterceptor', () => ({
  useAuthInterceptor: () => ({ instance: mockAxios }),
}));

const MockConsumer: React.FC = () => {
  const { state } = useContext(TeaContext);

  return (
    <>
      <div data-testid="teas">{JSON.stringify(state.teas)}</div>
    </>
  );
};

const ComponentTree = (
  <TeaProvider>
    <MockConsumer />
  </TeaProvider>
);

describe('<TeaProvider />', () => {
  beforeEach(() => {
    (mockAxios.get as any) = jest.fn(async () => ({ data: mockTeas }));
  });

  describe('initialization', () => {
    it('fetches the list of teas', async () => {
      mockTeas.forEach(t => (t.rating = 0));
      const { getByTestId } = render(ComponentTree);
      const teas = await waitForElement(() => getByTestId('teas'));
      expect(teas.textContent).toEqual(JSON.stringify(mockTeas));
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
