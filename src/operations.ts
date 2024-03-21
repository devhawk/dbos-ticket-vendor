import { TransactionContext, Transaction, GetApi, ArgSource, ArgSources, PostApi, WorkflowContext, DBOSResponseError, Workflow } from '@dbos-inc/dbos-sdk';
import { BcryptCommunicator } from '@dbos-inc/communicator-bcrypt';
import { Knex } from 'knex';

interface Customer {
  username: string;
  password: string;
}

interface Production {
  id: number;
  title: string;
  description: string;
}

interface Performance {
  id: number;
  productionId: number;
  description: string;
  date: Date;
  ticketPrice: number;
  ticketCount: number;
}

type PerformanceWithSoldTicketCount = Performance & { soldTicketCount: number; };

interface Reservation {
  performanceId: number;
  seatNumber: number;
  username: string;
}

interface AvailableTickets {
  availableSeats: number[];
  soldSeats: number[];
}

export class TicketVendor {

  @PostApi('/api/login')
  @Transaction({ readOnly: true })
  static async login(ctxt: TransactionContext<Knex>, username: string, password: string): Promise<void> {
    const user = await ctxt.client<Customer>('customers').select("password").where({ username }).first();
    if (!(user && await BcryptCommunicator.bcryptCompare(password, user.password))) {
      throw new DBOSResponseError("Invalid username or password", 400);
    }
  }

  @PostApi('/api/register')
  @Workflow()
  static async register(ctxt: WorkflowContext, username: string, password: string): Promise<void> {
    const hashedPassword = await ctxt.invoke(BcryptCommunicator).bcryptHash(password, 10);
    await ctxt.invoke(TicketVendor).saveNewUser(username, hashedPassword);
  }

  @Transaction()
  static async saveNewUser(ctxt: TransactionContext<Knex>, username: string, hashedPassword: string): Promise<void> {
    const user = await ctxt.client<Customer>('customers').select().where({ username }).first();
    if (user) {
      throw new DBOSResponseError("Username already exists", 400);
    }
    await ctxt.client<Customer>('customers').insert({ username, password: hashedPassword });
  }

  @GetApi('/api/productions')
  @Transaction({ readOnly: true })
  static async getProductions(ctxt: TransactionContext<Knex>): Promise<Production[]> {
    const query = ctxt.client<Production>('productions');
    const results = await query;
    return results;
  }

  @GetApi('/api/performances/:productionId')
  @Transaction({ readOnly: true })
  static async getPerformances(ctxt: TransactionContext<Knex>, @ArgSource(ArgSources.URL) productionId: number): Promise<PerformanceWithSoldTicketCount[]> {
    const query = ctxt.client<Performance>('performances')
      .select('id', 'productionId', 'description', 'date', 'ticketPrice', 'ticketCount', ctxt.client.raw('COUNT(reservations.*)::integer as "soldTicketCount"'))
      .where('productionId', productionId)
      .leftJoin<Reservation>('reservations', 'id', 'performanceId')
      .groupBy('id');

    const results = await query;
    // Knex type inference logic doesn't handle the raw COUNT() expression, so we need to cast the results. 
    return results as unknown as PerformanceWithSoldTicketCount[];
  }

  @GetApi('/api/available-seats/:performanceId')
  @Transaction({ readOnly: true })
  static async getAvailableSeats(ctxt: TransactionContext<Knex>, @ArgSource(ArgSources.URL) performanceId: number): Promise<AvailableTickets> {
    // get the total ticket count for the performance
    const performance = await ctxt.client<Performance>('performances')
      .select('ticketCount')
      .where('id', performanceId)
      .first();
    if (!performance) { throw new Error('Performance not found'); }

    // get the seat numbers that are already reserved
    const { ticketCount } = performance;
    const soldSeats = new Set<number>();
    const reservations = await ctxt.client<Reservation>('reservations')
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
}
