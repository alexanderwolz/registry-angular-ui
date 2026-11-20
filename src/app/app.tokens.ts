import { InjectionToken } from '@angular/core';

/** Base url of the registry, e.g. http://localhost:5000 */
export const REGISTRY_HOST = new InjectionToken<string>('REGISTRY_HOST');

/** Secret used to encrypt the login token in the local storage */
export const TOKEN_SECRET = new InjectionToken<string>('TOKEN_SECRET');

/** Whether repositories the user may not pull from are hidden */
export const CHECK_PULL_ACCESS = new InjectionToken<boolean>('CHECK_PULL_ACCESS');
