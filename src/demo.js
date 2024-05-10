let hookStates = [];
let hookIndex = 0;
let scheduleUpdate;
function render(vdom, container) {
  mount(vdom, container);
  scheduleUpdate = () => {
    hookIndex = 0;
    compareTwoVdom(container, vdom, vdom);
  }
}
export function useState(initialState) {
  hookStates[hookIndex] = hookStates[hookIndex] || initialState;
  let currentIndex = hookIndex;
  function setState(newState) {
    if (typeof newState === 'function') newState = newState(hookStates[currentIndex]);
    hookStates[currentIndex] = newState;
    scheduleUpdate();
  }
  return [hookStates[hookIndex++], setState];
}
+export function useMemo(factory, deps) {
  +    if (hookStates[hookIndex]) {
    +      let[lastMemo, lastDeps] = hookStates[hookIndex];
    +      let same = deps.every((item, index) => item === lastDeps[index]);
    +      if (same) {
      +        hookIndex++;
      +        return lastMemo;
      +      } else {
      +        let newMemo = factory();
      +        hookStates[hookIndex++]=[newMemo, deps];
      +        return newMemo;
      +      }
    +    } else {
    +      let newMemo = factory();
    +      hookStates[hookIndex++]=[newMemo, deps];
    +      return newMemo;
    +    }
  +}
+export function useCallback(callback, deps) {
  +    if (hookStates[hookIndex]) {
    +      let[lastCallback, lastDeps] = hookStates[hookIndex];
    +      let same = deps.every((item, index) => item === lastDeps[index]);
    +      if (same) {
      +        hookIndex++;
      +        return lastCallback;
      +      } else {
      +        hookStates[hookIndex++]=[callback, deps];
      +        return callback;
      +      }
    +    } else {
    +      hookStates[hookIndex++]=[callback, deps];
    +      return callback;
    +    }
  +}
const ReactDOM = {
  render
};
export default ReactDOM;