import { Cache } from "./cache";

export class ArrayCache<V> implements Cache {

    private _values: Array<V> = new Array<V>();
   
    clear(): void {
        this._values = new Array<V>()
    }

    get values(): Array<V> {
        return this._values;
    }

    set(values: Array<V>) {
        this._values = values;
    }

}
