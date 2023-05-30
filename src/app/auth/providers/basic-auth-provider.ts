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

    realm: string;

    constructor(router: Router, storageService: StorageService, eventService: EventService, tokenSecret: string, wwwAuthenticate: string, private http: HttpClient, private server: string) {
        super(router, storageService, eventService, tokenSecret)
        this.realm = this.parseAuthenticate(wwwAuthenticate).realm;
    }

    override getType(): Type {
        return Type.BASIC
    }

    private parseAuthenticate(authenticate: string): any {
        //token auth: Basic realm="any string"
        authenticate = authenticate.replace("Basic ", "").replaceAll('"', "").replaceAll(" ", "");
        var authenticate = '{"' + authenticate.replaceAll(",", '", "').replaceAll("=", '": "') + '"}';
        return JSON.parse(authenticate)
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
        return of("Basic " + token.base64Credentials)
    }
}
