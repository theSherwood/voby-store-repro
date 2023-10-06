/* IMPORT */

import * as React from "voby";
import { useEffect } from "voby";
import { render, store } from "voby";

/* SERIALIZE */
// This is (mostly) taken from playwright but looks like pretty typical
// serialization code that's capable of handling cycles.

let limit = 1000;
function innerSerialize(value, visitorInfo) {
  // This limit is never reached?
  if (limit-- < 0) throw "Limit exceeded";
  if (typeof value === "symbol") return { v: "undefined" };
  if (Object.is(value, void 0)) return { v: "undefined" };
  if (Object.is(value, null)) return { v: "null" };
  if (Object.is(value, NaN)) return { v: "NaN" };
  if (Object.is(value, Infinity)) return { v: "Infinity" };
  if (Object.is(value, -Infinity)) return { v: "-Infinity" };
  if (Object.is(value, -0)) return { v: "-0" };
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value;
  if (typeof value === "string") return value;
  const id = visitorInfo.visited.get(value);
  if (id) return { ref: id };
  if (Array.isArray(value)) {
    const a: any = [];
    const id2 = ++visitorInfo.lastId;
    visitorInfo.visited.set(value, id2);
    for (let i = 0; i < value.length; ++i)
      a.push(innerSerialize(value[i], visitorInfo));
    return { a, id: id2 };
  }
  if (typeof value === "object") {
    const o: any = [];
    const id2 = ++visitorInfo.lastId;
    visitorInfo.visited.set(value, id2);
    for (const name of Object.keys(value)) {
      let item;
      try {
        item = value[name];
      } catch (e) {
        continue;
      }
      if (name === "toJSON" && typeof item === "function")
        o.push({ k: name, v: { o: [], id: 0 } });
      else
        o.push({
          k: name,
          v: innerSerialize(item, visitorInfo),
        });
    }
    if (o.length === 0 && value.toJSON && typeof value.toJSON === "function")
      return innerSerialize(value.toJSON(), visitorInfo);
    return { o, id: id2 };
  }
}
export function serialize(value) {
  return innerSerialize(value, {
    visited: /* @__PURE__ */ new Map(),
    lastId: 0,
  });
}

/* MAIN */

let state_no_proxy = {
  value: 0,
  nested: {
    nest: 4,
    arr: [],
  },
};
state_no_proxy.nested.arr = [state_no_proxy.nested];
// Note that the serialization code works fine without the proxies.
console.log("NO PROXY", state_no_proxy, serialize(state_no_proxy));

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
    // This limit is never reached?
    if (limit-- < 0) throw "the heck?";
    state.nested.arr;
    /*  PROXY - uncomment the next line to see serialization fail */
    // console.log("PROXY", serialize(state.nested.arr));
    /* UNWRAPPED PROXY - uncomment the next 2 lines to see serialization fail */
    // let unwrapped = store.unwrap(state);
    // console.log("UNWRAPPED", serialize(unwrapped.nested.arr));
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
