import { Observable } from "rxjs"
import { Scope } from "../models/scope"

export interface AuthProvider {

    getType(): Type

    login(username: string, password: string): Observable<string>

    logout(): void

    isAuthenticated(): boolean

    getAuthorizationFor(scope: Scope): Observable<string>

    getUsername(): string

}

export enum Type {
    EMPTY, BASIC, TOKEN
}
