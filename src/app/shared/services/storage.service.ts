import { Injectable } from '@angular/core';
import { ArrayCache } from '../models/array-cache';
import { Cache } from '../models/cache';
import { MapCache } from '../models/map-cache';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private localStorage = window.localStorage
  private sessionStorage = window.sessionStorage

  private caches = new Map<string, Cache>()

  constructor() { }

  getStringFromLocalStorage(key: string): string | null {
    return this.localStorage.getItem(key)
  }

  saveStringToLocalStorage(key: string, value: string) {
    this.localStorage.setItem(key, value)
  }

  getObjectFromLocalStorage(key: string): any | null {
    const auth = this.localStorage.getItem(key);
    return auth != null ? JSON.parse(auth) : null;
  }

  saveObjectToLocalStorage(key: string, object: any) {
    this.localStorage.removeItem(key);
    if (typeof object === 'string') {
      this.localStorage.setItem(key, object);
    } else {
      this.localStorage.setItem(key, JSON.stringify(object));
    }
  }

  clearObjectInLocalStorage(key: string) {
    this.localStorage.removeItem(key);
  }

  existsInLocalStorage(key: string): boolean {
    return this.localStorage.getItem(key) != null
  }

  clearCaches() {
    this.caches.forEach((cache: Cache, key:string) => {
      console.log("Clearing cache: "+key)
      cache.clear();
    });
  }

  getMapCache<K, V>(key: string): MapCache<K, V> {
    let cache = this.caches.get(key);
    if (!cache) {
      cache = new MapCache<K, V>()
      this.caches.set(key, cache);
    }
    return cache as MapCache<K, V>;
  }

  getArrayCache<V>(key: string): ArrayCache<V> {
    let cache = this.caches.get(key);
    if (!cache) {
      cache = new ArrayCache<V>()
      this.caches.set(key, cache);
    }
    return cache as ArrayCache<V>;
  }

}
