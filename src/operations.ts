import { TransactionContext, Transaction, GetApi, ArgSource, ArgSources } from '@dbos-inc/dbos-sdk';
import { Knex } from 'knex';

// The schema of the database table used in this example.
export interface dbos_hello {
  name: string;
  greet_count: number;
}

interface Customer {
  username: string;
  email: string;
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

interface Reservation {
  performanceId: number;
  seatNumber: number;
  username: string;
}

export class TicketVendor {

  @GetApi('/productions')
  @Transaction({ readOnly: true })
  static async getProductions(ctxt: TransactionContext<Knex>): Promise<Production[]> {
    const query = ctxt.client<Production>('productions');
    const results = await query;
    return results;
  }

  @GetApi('/performances/:productionId')
  @Transaction({ readOnly: true })
  static async getPerformances(ctxt: TransactionContext<Knex>, @ArgSource(ArgSources.URL) productionId: number) {
    const query = ctxt.client<Performance & { reservationCount: number }>('performances')
      .select('id', 'productionId', 'description', 'date', 'ticketPrice', 'ticketCount', ctxt.client.raw('COUNT(reservations.*)::integer as "soldTicketCount"'))
      .where('productionId', productionId)
      .leftJoin<Reservation>('reservations', 'id', 'performanceId')
      .groupBy('id');

    const results = await query;
    return results;
  }

  @GetApi('/available-seats/:performanceId')
  @Transaction({ readOnly: true })
  static async getAvailableSeats(ctxt: TransactionContext<Knex>, @ArgSource(ArgSources.URL) performanceId: number) {
    const performance = await ctxt.client<Performance>('performances')
      .select('ticketCount')
      .where('id', performanceId)
      .first();
    if (!performance) { throw new Error('Performance not found'); }

    const { ticketCount } = performance; 
    const seatSet = new Set<number>();
    const reservations = await ctxt.client<Reservation>('reservations')
      .select('seatNumber')
      .where('performanceId', performanceId);
    for (const { seatNumber } of reservations) {
      if (seatNumber > ticketCount) { throw new Error(`Invalid seat number ${seatNumber} of ${ticketCount}`); }
      seatSet.add(seatNumber);
    }

    const seatMap = new Map<number, boolean>();
    for (let i = 1; i <= performance.ticketCount; i++) { 
      seatMap.set(i, !seatSet.has(i));
    }

    return Object.fromEntries(seatMap);
  }

}
