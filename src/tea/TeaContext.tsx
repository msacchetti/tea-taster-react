import { Plugins } from '@capacitor/core';
import React, { createContext, useEffect, useReducer } from 'react';
import { useAuthInterceptor } from '../core/auth';
import { Tea } from '../shared/models';

interface TeaState {
  teas: Tea[];
  loading: boolean;
  error: string;
}

const images: Array<string> = [
  'green',
  'black',
  'herbal',
  'oolong',
  'dark',
  'puer',
  'white',
  'yellow',
];

const initialState: TeaState = { teas: [], loading: false, error: '' };

type TeaAction =
  | { type: 'GET_TEAS' }
  | { type: 'GET_TEAS_SUCCESS'; teas: Tea[] }
  | { type: 'GET_TEAS_FAILURE'; error: string }
  | { type: 'SAVE_TEA'; tea: Tea };

const reducer = (
  state: TeaState = initialState,
  action: TeaAction,
): TeaState => {
  switch (action.type) {
    case 'GET_TEAS':
      return { ...state, loading: true, error: '' };
    case 'GET_TEAS_SUCCESS':
      return { ...state, loading: false, teas: action.teas };
    case 'GET_TEAS_FAILURE':
      return { ...state, loading: false, error: action.error };
    case 'SAVE_TEA': {
      const teas = state.teas.filter(t => t.id !== action.tea.id);
      return { ...state, loading: false, teas: [...teas, action.tea] };
    }
    default:
      return state;
  }
};

export const TeaContext = createContext<{
  state: TeaState;
  // getTeaById: (id: number) => Tea | undefined;
  // saveTea: (tea: Tea) => Promise<void>;
}>({
  state: initialState,
  // getTeaById: id => undefined,
  // saveTea: tea => Promise.resolve(),
});

export const TeaProvider: React.FC = ({ children }) => {
  const { instance } = useAuthInterceptor();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const url = `/tea-categories`;
      try {
        const { data } = await instance.get(url);
        const teas: Tea[] = await Promise.all(
          data.map(async (item: any) => await transformTea(item)),
        );
        dispatch({ type: 'GET_TEAS_SUCCESS', teas });
      } catch (error) {
        dispatch({ type: 'GET_TEAS_FAILURE', error: error.message });
      }
    })();
  }, [instance]);

  const transformTea = async (data: any): Promise<Tea> => {
    const { Storage } = Plugins;
    const rating = await Storage.get({ key: `rating${data.id}` });
    return {
      ...data,
      image: require(`../assets/images/${images[data.id - 1]}.jpg`),
      rating: parseInt(rating?.value || '0', 10),
    };
  };

  return (
    <TeaContext.Provider value={{ state }}>{children}</TeaContext.Provider>
  );
};
