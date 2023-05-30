import { Event } from "./event";

export class ErrorEvent extends Event {
    constructor(message: string, readonly cause: Error | null) {
        super(message)
    }
}
