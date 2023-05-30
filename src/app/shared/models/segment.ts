import { Params } from "@angular/router";

export class Segment {
    constructor(
        readonly name: string,
        readonly routerLink?: string | null,
        readonly active?: boolean | null,
        readonly queryParams?: Params | null
    ) {
    }
}