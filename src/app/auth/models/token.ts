const HOURS = 60 * 60 * 1000

export class Token {

    //token is valid for 2 hours
    private static EXPIRATION_TIMEOUT_IN_MS = 2 * HOURS;

    readonly exp: number

    constructor(readonly id: string, readonly base64Credentials: string) {
        this.exp = Math.floor((new Date().getTime() + Token.EXPIRATION_TIMEOUT_IN_MS) / 1000)
    }

}
