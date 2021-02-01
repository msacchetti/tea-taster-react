import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { TastingNote } from '../shared/models';
import { useTastingNotes } from './useTastingNotes';

jest.mock('../core/auth/useAuthInterceptor', () => ({
  useAuthInterceptor: () => ({
    instance: {
      get: mockInstanceVerb,
      post: mockInstanceVerb,
      delete: mockInstanceVerb,
    },
  }),
}));

let mockInstanceVerb = jest.fn();

const mockNote = {
  id: 4,
  brand: 'Lipton',
  name: 'Yellow Label',
  notes: 'Overly acidic, highly tannic flavor',
  rating: 1,
  teaCategoryId: 3,
};

describe('useTastingNotes', () => {
  describe('get all notes', () => {
    beforeEach(() => {
      mockInstanceVerb = jest.fn(async () => ({ data: [mockNote] }));

      it('gets the notes', async () => {
        let notes: Array<TastingNote> = [];
        const { result } = renderHook(() => useTastingNotes());
        await act(async () => {
          notes = await result.current.getNotes();
        });
        expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
        expect(notes).toEqual([mockNote]);
      });
    });
  });

  describe('get a singular note', () => {
    beforeEach(() => {
      mockInstanceVerb = jest.fn(async () => ({ data: mockNote }));
    });

    it('gets a single TastingNote', async () => {
      let note: TastingNote | undefined = undefined;
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        note = await result.current.getNoteById(4);
      });
      expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
      expect(note).toEqual(mockNote);
    });
  });

  describe('delete a note', () => {
    beforeEach(() => {
      mockInstanceVerb = jest.fn(() => Promise.resolve());
    });

    it('deletes a single note', async () => {
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.deleteNote(4);
      });
      expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
    });
  });

  describe('save a note', () => {
    beforeEach(() => {
      mockInstanceVerb = jest.fn(() => Promise.resolve());
    });

    it('saves a single note', async () => {
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.saveNote(mockNote);
      });
      expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
