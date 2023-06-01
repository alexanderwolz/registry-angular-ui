import { Cache } from "./cache";

export class MapCache<K, V> implements Cache {

    private map = new Map<K, V>()

    clear() {
        this.map.clear()
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    get(key: K): V | undefined {
        return this.map.get(key)
    }

    set(key: K, value: V) {
        this.map.set(key, value);
    }

    delete(key: K): boolean {
        return this.map.delete(key);
    }


}
