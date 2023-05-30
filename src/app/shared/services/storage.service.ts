import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private localStorage = window.localStorage
  private sessionStorage = window.sessionStorage

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

}
