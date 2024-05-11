+export function useEffect(callback, dependencies) {
  +  let currentIndex = hookIndex;
  +  if (hookStates[hookIndex]) {
    +      let[destroy, lastDeps] = hookStates[hookIndex];
    +      let same = dependencies && dependencies.every((item, index) => item === lastDeps[index]);
    +      if (same) {
      +        hookIndex++;
      +      } else {
      +        destroy && destroy();
      +        setTimeout(() => {
        +            hookStates[currentIndex]=[callback(), dependencies];
        +        });
      +        hookIndex++;
      +      }
    +  } else {
    +    setTimeout(() => {
      +        hookStates[currentIndex]=[callback(), dependencies];
      +    });
    +    hookIndex++;
    +  }
  +}
const ReactDOM = {
  render
};
export default ReactDOM;