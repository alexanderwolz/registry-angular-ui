import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { StorageService } from "src/app/shared/services/storage.service";
import { Scope } from "../models/scope";
import { Token } from "../models/token";
import { AbstractAuthProvider } from "./abstract-auth-provider";
import { Type } from "./auth-provider";
import { EventService } from "src/app/shared/services/event.service";

export class EmptyAuthProvider extends AbstractAuthProvider {

    constructor(router: Router, storageService: StorageService, eventService: EventService, tokenSecret: string) {
        super(router, storageService, eventService, tokenSecret)
    }

    override getType(): Type {
        return Type.EMPTY
    }

    protected doLogin(username: string, password: string): Observable<Token> {
        return of(new Token(username, ""))
    }

    override doGetAuthorizationFor(token: Token, scope: Scope): Observable<string> {
        return of("")
    }
}
