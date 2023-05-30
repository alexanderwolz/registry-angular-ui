import { Event } from "./event";

export class InfoEvent extends Event {
    constructor(message: string) {
        super(message)
    }
}
