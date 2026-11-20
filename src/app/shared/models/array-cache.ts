import { Cache } from './cache';

export class ArrayCache<V> implements Cache {
  private _values: V[] = new Array<V>();

  clear(): void {
    this._values = new Array<V>();
  }

  get values(): V[] {
    return this._values;
  }

  set(values: V[]) {
    this._values = values;
  }
}
