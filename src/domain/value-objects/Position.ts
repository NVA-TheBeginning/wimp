import { PositionSchema, type Position as PositionType } from "../schemas/schemas";

export class Position {
  readonly x: number;
  readonly y: number;

  private constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static create(x: number, y: number): Position {
    PositionSchema.parse({ x, y });
    return new Position(x, y);
  }

  static fromData(data: PositionType): Position {
    return new Position(data.x, data.y);
  }

  equals(other: Position): boolean {
    return this.x === other.x && this.y === other.y;
  }

  isAdjacent(other: Position): boolean {
    const dx = Math.abs(this.x - other.x);
    const dy = Math.abs(this.y - other.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1);
  }

  toKey(): string {
    return `${this.x},${this.y}`;
  }

  toData(): PositionType {
    return { x: this.x, y: this.y };
  }
}
