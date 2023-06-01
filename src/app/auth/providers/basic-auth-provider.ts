import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, map, of, throwError } from "rxjs";
import { Token } from "../models/token";
import { AbstractAuthProvider } from "./abstract-auth-provider";
import { Scope } from "../models/scope";
import { StorageService } from "src/app/shared/services/storage.service";
import { Type } from "./auth-provider";
import { EventService } from "src/app/shared/services/event.service";

export class BasicAuthProvider extends AbstractAuthProvider {

    constructor(router: Router, storageService: StorageService, eventService: EventService, tokenSecret: string, private http: HttpClient, private server: string) {
        super(router, storageService, eventService, tokenSecret)
    }

    override getType(): Type {
        return Type.BASIC
    }

    protected doLogin(username: string, password: string): Observable<Token> {
        const base64Credentials = this.encodeCredentialsToBase64(username, password)
        return this.authenticate(base64Credentials).pipe(
            map(() => new Token(username, base64Credentials))
        )
    }

    private authenticate(base64Credentials: string, scope?: string): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({ 'Authorization': "Basic " + base64Credentials }),
            withCredentials: false, //do not show basic auth prompt
        };
        return this.http.get(this.server, httpOptions)
    }

    override doGetAuthorizationFor(token: Token, scope: Scope): Observable<string> {
        //TODO check result if it matches scope (user management)
        //return this.authenticate(token.base64Credentials, scope.toString).pipe(map(response => TODO))
        return of("Basic " + token.base64Credentials)
    }
}
