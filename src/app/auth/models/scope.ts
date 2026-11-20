export class Scope {
  constructor(
    readonly type: string,
    readonly name: string,
    readonly actions: string[],
  ) {}

  toString(): string {
    return this.type + ':' + this.name + ':' + this.actions.toString();
  }
}
