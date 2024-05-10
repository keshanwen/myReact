+import * as hooks from './react-dom';

const React = {
  createElement,
  Component,
  PureComponent,
  createRef,
  createContext,
  cloneElement,
  memo,
+   ...hooks
};
export default React;