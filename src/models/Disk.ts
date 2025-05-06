export class Disk {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly capacity: number,
    public readonly isExternal: boolean,
  ) {}
}
