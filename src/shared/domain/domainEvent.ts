export interface DomainEvent {
  readonly eventName: string;
  readonly occurredOn: Date;
}
