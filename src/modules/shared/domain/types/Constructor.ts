export interface Constructor<T> extends Function {
  new (...args: any[]): T;
}
