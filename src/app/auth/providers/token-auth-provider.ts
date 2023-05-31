import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, map, of } from "rxjs";
import { EventService } from "src/app/shared/services/event.service";
import { StorageService } from "src/app/shared/services/storage.service";
import { Scope } from "../models/scope";
import { Token } from "../models/token";
import { AbstractAuthProvider } from "./abstract-auth-provider";
import { Type } from "./auth-provider";


export class TokenAuthProvider extends AbstractAuthProvider {

    private server: string;
    private clientId: string;

    constructor(router: Router, storageService: StorageService, eventService: EventService, tokenSecret: string, server: string, clientId: string, private http: HttpClient) {
        super(router, storageService, eventService, tokenSecret);
        this.server=server;
        this.clientId=clientId;
    }

    override getType(): Type {
        return Type.TOKEN
    }

    protected doLogin(username: string, password: string): Observable<Token> {
        const base64Credentials = this.encodeCredentialsToBase64(username, password)
        return this.authenticate(base64Credentials).pipe(
            map(() => new Token(username, base64Credentials))
        )
    }

    private authenticate(base64Credentials: string, scope?: Scope): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({ 'Authorization': "Basic " + base64Credentials }),
            params: this.getQueryParams(scope),
            withCredentials: false //do not show basic auth prompt,
        };
        return this.http.get(this.server, httpOptions)
    }

    private getQueryParams(scope?: Scope): HttpParams {
        let params = new HttpParams();
        params = params.append("service", this.clientId);
        if (scope) {
            params = params.append("scope", scope.toString());
        }
        return params;
    }

    private tokenCache = new Map<string, string>()

    override doGetAuthorizationFor(token: Token, scope: Scope): Observable<string> {

        const scopeString = scope.toString()
        const jwt = this.tokenCache.get(scopeString)
        if (jwt && !this.isTokenExpired(jwt)) {
            return of("Bearer " + jwt)
        }
        if (jwt && this.isTokenExpired(jwt)) {
            this.tokenCache.delete(scopeString)
        }

        return this.authenticate(token.base64Credentials, scope)
            .pipe(
                map(tokenResponse => {
                    const payload = this.parseJwt(tokenResponse.token)
                    if (payload.access.length == 0) {
                        throw new Error("No Access items for scope " + scopeString + " (check permissions)")
                    }
                    //TODO check access items against scope object
                    this.tokenCache.set(scopeString, tokenResponse.token)
                    return "Bearer " + tokenResponse.token
                }))
    }

    private parseJwt(token: string): any {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    };

    private isTokenExpired(token: string): boolean {
        const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
        const threshold = 5 // in seconds
        return Math.floor((new Date).getTime() / 1000) + threshold >= expiry;
    }

}
