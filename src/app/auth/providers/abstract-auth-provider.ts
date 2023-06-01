import { Router } from "@angular/router";
import * as CryptoJS from 'crypto-js';
import { Observable, map, throwError } from "rxjs";
import { StorageService } from "src/app/shared/services/storage.service";
import { Scope } from "../models/scope";
import { Token } from "../models/token";
import { AuthProvider, Type } from "./auth-provider";
import { EmptyAuthProvider } from "./empty-auth-provider";
import { EventService } from "src/app/shared/services/event.service";
import { InfoEvent } from "src/app/shared/models/info-event";

const KEY_AUTH = "auth"

export abstract class AbstractAuthProvider implements AuthProvider {

    constructor(
        private router: Router,
        private storageService: StorageService,
        private eventService: EventService,
        private tokenSecret: string
    ) { }

    abstract getType(): Type

    protected abstract doLogin(username: string, password: string): Observable<Token>

    protected abstract doGetAuthorizationFor(token: Token, scope: Scope): Observable<string>

    getAuthorizationFor(scope: Scope): Observable<string> {
        const token = this.getDecryptedToken()
        if (!token) {
            return throwError(() => new Error("No user logged in"))
        }
        return this.doGetAuthorizationFor(token, scope)
    }

    login(username: string, password: string): Observable<string> {
        return this.doLogin(username, password)
            .pipe(
                map(decryptedToken => {
                    const encryptedToken = this.encrypt(JSON.stringify(decryptedToken))
                    this.storageService.saveStringToLocalStorage(KEY_AUTH, encryptedToken)
                    return username
                }))
    }

    logout() {
        this.storageService.clearObjectInLocalStorage(KEY_AUTH);
        this.storageService.clearCaches();
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        if (this instanceof EmptyAuthProvider) {
            return true;
        }

        const token = this.getDecryptedToken()
        if (!token) {
            return false;
        }

        const now = Math.floor(new Date().getTime() / 1000)
        const expired = now >= token.exp;
        if (expired) {
            this.storageService.clearObjectInLocalStorage(KEY_AUTH);
            this.eventService.emit(new InfoEvent("Login expired"));
        }
        return !expired;
    }

    getUsername(): string {
        const token = this.getDecryptedToken()
        return token ? token.id : "Unknown User"
    }

    private getDecryptedToken(): Token | null {
        const encryptedToken = this.storageService.getStringFromLocalStorage(KEY_AUTH)
        if (!encryptedToken) {
            return null
        }
        return JSON.parse(this.decrypt(encryptedToken)) as Token
    }

    protected encodeCredentialsToBase64(username: string, password: string): string {
        return this.encodeStringToBase64(username + ':' + password)
    }

    private encodeStringToBase64(plainText: string) {
        return btoa(plainText)
        //return Buffer.from(data).toString('base64');
    }

    private decodeBase64ToString(base64String: string) {
        return atob(base64String)
        //return Buffer.from(data, 'base64').toString('ascii');
    }

    private encrypt(value: string): string {
        return CryptoJS.AES.encrypt(value, this.tokenSecret.trim()).toString();
    }

    private decrypt(textToDecrypt: string) {
        return CryptoJS.AES.decrypt(textToDecrypt, this.tokenSecret.trim()).toString(CryptoJS.enc.Utf8);
    }
}
