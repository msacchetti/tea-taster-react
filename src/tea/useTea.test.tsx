import React from 'react';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { Tea } from '../shared/models';
import { useTea } from './useTea';
import { Plugins } from '@capacitor/core';

jest.mock('../core/auth/useAuthInterceptor', () => ({
  useAuthInterceptor: () => ({
    instance: {
      get: mockInstanceVerb,
    },
  }),
}));

let mockInstanceVerb = jest.fn();

const expectedTeas = [
  {
    id: 1,
    name: 'Green',
    image: 'green.jpg',
    description: 'Green tea description.',
    rating: 1,
  },
  {
    id: 2,
    name: 'Black',
    image: 'black.jpg',
    description: 'Black tea description.',
    rating: 2,
  },
  {
    id: 3,
    name: 'Herbal',
    image: 'herbal.jpg',
    description: 'Herbal Infusion description.',
    rating: 3,
  },
  {
    id: 4,
    name: 'Oolong',
    image: 'oolong.jpg',
    description: 'Oolong tea description.',
    rating: 4,
  },
  {
    id: 5,
    name: 'Dark',
    image: 'dark.jpg',
    description: 'Dark tea description.',
    rating: 5,
  },
  {
    id: 6,
    name: 'Puer',
    image: 'puer.jpg',
    description: 'Puer tea description.',
    rating: 0,
  },
  {
    id: 7,
    name: 'White',
    image: 'white.jpg',
    description: 'White tea description.',
    rating: 0,
  },
  {
    id: 8,
    name: 'Yellow',
    image: 'yellow.jpg',
    description: 'Yellow tea description.',
    rating: 0,
  },
];

const resultTeas = () => {
  return expectedTeas.map((t: Tea) => {
    const tea = { ...t };
    delete tea.image;
    delete tea.rating;
    return tea;
  });
};

describe('useTea', () => {
  beforeEach(() => {
    (Plugins.Storage.get as any) = jest.fn(({ key }: { key: string }) => {
      switch (key) {
        case 'rating1':
          return Promise.resolve({ value: 1 });
        case 'rating2':
          return Promise.resolve({ value: 2 });
        case 'rating3':
          return Promise.resolve({ value: 3 });
        case 'rating4':
          return Promise.resolve({ value: 4 });
        case 'rating5':
          return Promise.resolve({ value: 5 });
        case 'rating6':
          return Promise.resolve({ value: 0 });
        case 'rating7':
          return Promise.resolve({ value: 0 });
        case 'rating8':
          return Promise.resolve({ value: 0 });
        default:
          return Promise.resolve();
      }
    });
  });

  describe('get all teas', () => {
    beforeEach(() => {
      mockInstanceVerb = jest.fn(async () => ({ data: resultTeas() }));
    });

    it('gets the teas', async () => {
      const { result } = renderHook(() => useTea());
      await act(async () => {
        await result.current.getTeas();
      });
      expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
    });

    it('adds an image to each tea item', async () => {
      let teas: Array<Tea> = [];
      const { result } = renderHook(() => useTea());
      await act(async () => {
        teas = await result.current.getTeas();
      });
      expect(teas).toEqual(expectedTeas);
    });
  });

  describe('get a specific tea', () => {
    beforeEach(() => {
      mockInstanceVerb = jest.fn(async () => ({ data: resultTeas()[0] }));
    });

    it('gets the specific tea', async () => {
      const { result } = renderHook(() => useTea());
      await act(async () => {
        await result.current.getTeaById(4);
      });
      expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
    });

    it('adds an image to the Tea object', async () => {
      let tea: Tea | undefined = undefined;
      const { result } = renderHook(() => useTea());
      await act(async () => {
        tea = await result.current.getTeaById(4);
      });
      expect(tea).toEqual(expectedTeas[0]);
    });
  });

  describe('save tea', () => {
    beforeEach(() => (Plugins.Storage.set = jest.fn()));

    it('saves the rating', async () => {
      const tea = { ...expectedTeas[4] };
      tea.rating = 4;
      const { result } = renderHook(() => useTea());
      await act(async () => {
        await result.current.saveTea(tea);
      });
      expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.set).toHaveBeenCalledWith({
        key: 'rating5',
        value: '4',
      });
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
