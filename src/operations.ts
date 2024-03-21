import { TransactionContext, Transaction, GetApi, ArgSource, ArgSources, PostApi, WorkflowContext, DBOSResponseError, Workflow } from '@dbos-inc/dbos-sdk';
import { BcryptCommunicator } from '@dbos-inc/communicator-bcrypt';
import { Knex } from 'knex';
import { Frontend } from './frontend';

export { Frontend };

export interface Customer {
  username: string;
  password: string;
}

export interface Production {
  id: number;
  name: string;
  description: string;
}

export interface Performance {
  id: number;
  productionId: number;
  description: string;
  date: Date;
  ticketPrice: number;
  ticketCount: number;
}

export type PerformanceWithSoldTicketCount = Performance & { soldTicketCount: number; };

export interface Reservation {
  performanceId: number;
  seatNumber: number;
  username: string;
}

export interface AvailableTickets {
  availableSeats: number[];
  soldSeats: number[];
}

export class TicketVendor {

  @PostApi('/api/login')
  @Transaction({ readOnly: true })
  static async login(ctx: TransactionContext<Knex>, username: string, password: string): Promise<void> {
    const user = await ctx.client<Customer>('customers').select("password").where({ username }).first();
    if (!(user && await BcryptCommunicator.bcryptCompare(password, user.password))) {
      throw new DBOSResponseError("Invalid username or password", 400);
    }
  }

  @PostApi('/api/register')
  @Workflow()
  static async register(ctx: WorkflowContext, username: string, password: string): Promise<void> {
    const hashedPassword = await ctx.invoke(BcryptCommunicator).bcryptHash(password, 10);
    await ctx.invoke(TicketVendor).saveNewUser(username, hashedPassword);
  }

  @Transaction()
  static async saveNewUser(ctx: TransactionContext<Knex>, username: string, hashedPassword: string): Promise<void> {
    const user = await ctx.client<Customer>('customers').select().where({ username }).first();
    if (user) {
      throw new DBOSResponseError("Username already exists", 400);
    }
    await ctx.client<Customer>('customers').insert({ username, password: hashedPassword });
  }

  @GetApi('/api/productions')
  @Transaction({ readOnly: true })
  static async getProductions(ctx: TransactionContext<Knex>): Promise<Production[]> {
    const query = ctx.client<Production>('productions');
    const results = await query;
    return results;
  }

  @GetApi('/api/production/:id')
  @Transaction({ readOnly: true })
  static async getProduction(ctx: TransactionContext<Knex>, @ArgSource(ArgSources.URL) id: number): Promise<Production> {
    const query = ctx.client<Production>('productions')
      .where('id', id)
      .first();
    const result = await query;
    if (!result) { throw new DBOSResponseError('Production not found', 404); }
    return result;
  }

  @GetApi('/api/performances/:productionId')
  @Transaction({ readOnly: true })
  static async getPerformances(ctx: TransactionContext<Knex>, @ArgSource(ArgSources.URL) productionId: number): Promise<PerformanceWithSoldTicketCount[]> {
    const query = ctx.client<Performance>('performances')
      .select('id', 'productionId', 'description', 'date', 'ticketPrice', 'ticketCount', ctx.client.raw('COUNT(reservations.*)::integer as "soldTicketCount"'))
      .where('productionId', productionId)
      .leftJoin<Reservation>('reservations', 'id', 'performanceId')
      .groupBy('id');

    const results = await query;
    // Knex type inference logic doesn't handle the raw COUNT() expression, so explicitly cast the results 
    return results as unknown as PerformanceWithSoldTicketCount[];
  }

  @GetApi('/api/available-seats/:performanceId')
  @Transaction({ readOnly: true })
  static async getAvailableSeats(ctx: TransactionContext<Knex>, @ArgSource(ArgSources.URL) performanceId: number): Promise<AvailableTickets> {
    // get the total ticket count for the performance
    const performance = await ctx.client<Performance>('performances')
      .select('ticketCount')
      .where('id', performanceId)
      .first();
    if (!performance) { throw new Error('Performance not found'); }

    // get the seat numbers that are already reserved
    const { ticketCount } = performance;
    const soldSeats = new Set<number>();
    const reservations = await ctx.client<Reservation>('reservations')
      .select('seatNumber')
      .where('performanceId', performanceId);
    for (const { seatNumber } of reservations) {
      if (seatNumber > ticketCount) { throw new Error(`Invalid seat number ${seatNumber} of ${ticketCount}`); }
      if (soldSeats.has(seatNumber)) { throw new Error(`Duplicate seat number ${seatNumber}`); }
      soldSeats.add(seatNumber);
    }

    // return a map of seat numbers to availability
    const availableSeats = new Array<number>();
    for (let i = 1; i <= performance.ticketCount; i++) {
      if (!soldSeats.has(i)) { availableSeats.push(i); }
    }
    return {
      availableSeats,
      soldSeats: Array.from(soldSeats)
    };
  }

  // @Workflow()
  // static async purchaseTickets(ctx: WorkflowContext, performanceId: number, username: string, seatNumbers: ReadonlyArray<number>): Promise<void> {
  //   const _availability = await ctx.invoke(TicketVendor).getAvailableSeats(performanceId);


  // }

  @Transaction()
  static async reserveSeats(ctx: TransactionContext<Knex>, performanceId: number, username: string, seats: ReadonlyArray<number>): Promise<void> {
    await ctx.client<Reservation>('reservations')
      .insert(seats.map(seatNumber => ({ performanceId, username, seatNumber })));
  }

  @Transaction()
  static async deleteReservation(ctx: TransactionContext<Knex>, performanceId: number, username: string, seats: ReadonlyArray<number>): Promise<void> {
    await ctx.client<Reservation>('reservations')
      .delete()
      .where('performanceId', performanceId)
      .andWhere('username', username)
      .andWhere('seatNumber', 'in', seats);
  }
}
