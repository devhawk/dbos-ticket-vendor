import { TestingRuntime, createTestingRuntime } from "@dbos-inc/dbos-sdk";
import { TicketVendor } from "./operations";
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

  test("test-productions-endpoint", async () => {
    const res = await request(testRuntime.getHandlersCallback()).get(
      "/api/productions"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual([
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

  test("test-performances-endpoint", async () => {
    const res = await request(testRuntime.getHandlersCallback()).get(
      "/api/performances/1"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual([
      { "id": 1, "productionId": 1, "description": "Opening Night", "date": "2025-03-14T07:00:00.000Z", "ticketPrice": "25.00", "ticketCount": 10, "soldTicketCount": 5 },
      { "id": 2, "productionId": 1, "description": "Saturday Matinee", "date": "2025-03-15T07:00:00.000Z", "ticketPrice": "25.00", "ticketCount": 10, "soldTicketCount": 0 },
      { "id": 3, "productionId": 1, "description": "Saturday Night", "date": "2025-03-15T07:00:00.000Z", "ticketPrice": "25.00", "ticketCount": 10, "soldTicketCount": 6 },
      { "id": 4, "productionId": 1, "description": "Final Performance", "date": "2025-03-16T07:00:00.000Z", "ticketPrice": "25.00", "ticketCount": 10, "soldTicketCount": 6 }
    ]);
  });

  test("test-available-seats-endpoint", async () => {
    const res = await request(testRuntime.getHandlersCallback()).get(
      "/api/available-seats/1"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      "availableSeats": [1, 3, 5, 7, 9],
      "soldSeats": [2, 10, 6, 8, 4]
    });
  });

  test("reserve-seats-works", async () => {
    try {
      await testRuntime.invoke(TicketVendor).reserveSeats(1, "kate", [1, 3, 5]);
    } finally {
      await testRuntime.queryUserDB('DELETE FROM reservations WHERE username = $1', 'kate');
    }
  })

  test("reserve-seats-fails", async () => {
    expect(() => testRuntime.invoke(TicketVendor).reserveSeats(1, 'kate', [1, 2, 3, 5])).rejects.toThrow();
    expect(() => testRuntime.invoke(TicketVendor).reserveSeats(1, 'invalid', [1, 3, 5])).rejects.toThrow();
  })
});

