import { TestingRuntime, createTestingRuntime } from "@dbos-inc/dbos-sdk";
import { AvailableTickets, TicketVendor } from "./operations";
import request from "supertest";

describe("operations-test", () => {
  let testRuntime: TestingRuntime;

  beforeAll(async () => {
    testRuntime = await createTestingRuntime([TicketVendor]);
  });

  afterAll(async () => {
    await testRuntime.destroy();
  });

  test("login", async () => {
    await testRuntime.invoke(TicketVendor).login('alice', 'password');
    expect(() => testRuntime.invoke(TicketVendor).login('alice', 'incorrect-password')).rejects.toThrow();
    expect(() => testRuntime.invoke(TicketVendor).login('zed', 'incorrect-password')).rejects.toThrow();
  });

  test("getProductions", async () => {
    const productions = await testRuntime.invoke(TicketVendor).getProductions();
    expect(productions).toStrictEqual([
      {
        "id": 1, "name": "Starship Sonata",
        "description": "An epic space opera musical featuring rival starship captains vying for control of the galaxy, with catchy tunes and futuristic dance numbers."
      },
      {
        "id": 2, "name": "Whisker Wonderland",
        "description": "A whimsical feline fantasy where cats rule the enchanted land of Meowtopia, facing off against a villainous pack of mischievous mice."
      },
      {
        "id": 3, "name": "Fantasy Factory",
        "description": "In a magical workshop, toys come to life in this whimsical musical about friendship, imagination, and the power of believing in magic."
      }
    ]);
  });

  test("getProduction", async () => {
    const production = await testRuntime.invoke(TicketVendor).getProduction(1);
    expect(production).toStrictEqual(
      {
        "id": 1, "name": "Starship Sonata",
        "description": "An epic space opera musical featuring rival starship captains vying for control of the galaxy, with catchy tunes and futuristic dance numbers."
      });
  });

  test("getPerformances", async () => {
    const performances = await testRuntime.invoke(TicketVendor).getPerformances(1);
    expect(performances).toStrictEqual([
      { "id": 1, "productionId": 1, "description": "Opening Night", "date": new Date("2025-03-15T02:00:00.000Z"), "ticketPrice": "25.00", "ticketCount": 10, "soldTicketCount": 5 },
      { "id": 2, "productionId": 1, "description": "Saturday Matinee", "date": new Date("2025-03-15T20:00:00.000Z"), "ticketPrice": "25.00", "ticketCount": 10, "soldTicketCount": 0 },
      { "id": 3, "productionId": 1, "description": "Saturday Night", "date": new Date("2025-03-16T02:00:00.000Z"), "ticketPrice": "25.00", "ticketCount": 10, "soldTicketCount": 6 },
      { "id": 4, "productionId": 1, "description": "Final Performance", "date": new Date("2025-03-16T20:00:00.000Z"), "ticketPrice": "25.00", "ticketCount": 10, "soldTicketCount": 6 }
    ]);
  });

  test("getAvailableSeats", async () => {
    const { availableSeats, soldSeats } = await testRuntime.invoke(TicketVendor).getAvailableSeats(1);
    expect(availableSeats.sort((a, b) => a - b)).toEqual([1, 3, 5, 7, 9]);
    expect(soldSeats.sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10]);
  });

  test("reserveSeats-works", async () => {
    const performanceId = 1;
    const username = 'kate';
    const seats = [1, 3, 5];
    const query = 'select * from reservations where "performanceId" = $1 and username = $2';

    try {
      const before = await testRuntime.queryUserDB(query, performanceId, username);
      expect(before).toHaveLength(0);

      await testRuntime.invoke(TicketVendor).reserveSeats(performanceId, username, seats);

      const after = await testRuntime.queryUserDB(query, performanceId, username);
      expect(after).toHaveLength(seats.length);

    } finally {
      await testRuntime.queryUserDB('DELETE FROM reservations WHERE username = $1', username);
    }
  })

  test("reserveSeats-fails", async () => {
    expect(() => testRuntime.invoke(TicketVendor).reserveSeats(1, 'kate', [1, 2, 3, 5])).rejects.toThrow();
    expect(() => testRuntime.invoke(TicketVendor).reserveSeats(1, 'invalid', [1, 3, 5])).rejects.toThrow();
  })

  test("delete-seats-works", async () => {
    const performanceId = 1;
    const username = 'irene';
    const seats = [2, 4];
    const query = 'select * from reservations where "performanceId" = $1 and username = $2';

    try {
      const before = await testRuntime.queryUserDB(query, performanceId, username);
      expect(before).toHaveLength(seats.length);

      await testRuntime.invoke(TicketVendor).deleteReservation(performanceId, username, seats);

      const after = await testRuntime.queryUserDB(query, performanceId, username);
      expect(after).toHaveLength(0);
    } finally {
      for (const seat of seats) {
        await testRuntime.queryUserDB(`
          INSERT INTO reservations ("performanceId", "seatNumber", username)
          VALUES ($1, $2, $3)`,
          performanceId, seat, username);
      }
    }
  })
});

