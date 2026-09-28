import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  initialState,
  loadState,
  reducer,
  type Action,
  type State,
} from "./store";
const Context = createContext<{ state: State; dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => {},
});
export function CollectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem("cinescope-v1", JSON.stringify(state));
    } catch {
      // Report an external storage failure, not a value derived from React state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageError(true);
    }
  }, [state]);
  return (
    <Context.Provider value={{ state, dispatch }}>
      {storageError && (
        <p role="alert" className="notice">
          La sauvegarde locale est indisponible. Exportez vos données avant de
          quitter.
        </p>
      )}
      {children}
    </Context.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useCollection = () => useContext(Context);
