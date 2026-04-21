"use client";

import { useState } from "react";

type StateUpdater<T> = T | ((current: T) => T);

type UndoRedoState<T> = {
  state: T;
  setState: (updater: StateUpdater<T>) => void;
  replaceState: (nextState: T) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

const HISTORY_LIMIT = 100;

export function useUndoRedoState<T>(initialState: T): UndoRedoState<T> {
  const [past, setPast] = useState<T[]>([]);
  const [state, setPresentState] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  const setState = (updater: StateUpdater<T>) => {
    setPresentState((current) => {
      const nextState = typeof updater === "function" ? (updater as (value: T) => T)(current) : updater;
      if (serializeState(nextState) === serializeState(current)) {
        return current;
      }

      setPast((previous) => [...previous.slice(-HISTORY_LIMIT + 1), cloneState(current)]);
      setFuture([]);
      return cloneState(nextState);
    });
  };

  const replaceState = (nextState: T) => {
    setPast([]);
    setFuture([]);
    setPresentState(cloneState(nextState));
  };

  const undo = () => {
    setPast((previous) => {
      const nextState = previous.at(-1);
      if (!nextState) {
        return previous;
      }

      setFuture((currentFuture) => [cloneState(state), ...currentFuture]);
      setPresentState(cloneState(nextState));
      return previous.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((currentFuture) => {
      const nextState = currentFuture[0];
      if (!nextState) {
        return currentFuture;
      }

      setPast((previous) => [...previous.slice(-HISTORY_LIMIT + 1), cloneState(state)]);
      setPresentState(cloneState(nextState));
      return currentFuture.slice(1);
    });
  };

  return {
    state,
    setState,
    replaceState,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undo,
    redo,
  };
}

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function serializeState<T>(value: T) {
  return JSON.stringify(value);
}
