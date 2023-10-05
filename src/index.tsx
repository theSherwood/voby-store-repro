/* IMPORT */

import * as React from "voby";
import { useEffect } from "voby";
import { render, store } from "voby";

/* MAIN */

let state_no_proxy = {
  value: 0,
  nested: {
    nest: 4,
    arr: [],
  },
};
state_no_proxy.nested.arr = [state_no_proxy.nested];
console.log(state_no_proxy);

const Counter = () => {
  const state = store({
    value: 0,
    nested: {
      nest: 4,
      arr: [],
    },
  });

  let limit = 100;
  useEffect(() => {
    if (limit-- < 0) throw "the heck?";
    state.nested.arr;
    console.log(state.nested.arr);
    let unwrapped = store.unwrap(state);
    console.log(unwrapped.nested.arr);
  });

  const increment = () => {
    state.value += 1;
    state.nested.arr = [...state.nested.arr, state.nested];
  };
  const decrement = () => (state.value -= 1);

  return (
    <>
      <h1>Store Counter</h1>
      <p>{() => state.value}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </>
  );
};

render(<Counter />, document.body);
