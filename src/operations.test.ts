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

  /**
   * Test the transaction.
   */
  // test("test-transaction", async () => {
  //   const res = await testRuntime.invoke(Hello).helloTransaction("dbos");
  //   expect(res).toMatch("Hello, dbos! You have been greeted");

  //   // Check the greet count.
  //   const rows = await testRuntime.queryUserDB<dbos_hello>("SELECT * FROM dbos_hello WHERE name=$1", "dbos");
  //   expect(rows[0].greet_count).toBe(1);
  // });

  /**
   * Test the HTTP endpoint.
   */
  test("test-productions-endpoint", async () => {
    const res = await request(testRuntime.getHandlersCallback()).get(
      "/productions"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  test("test-performances-endpoint", async () => {
    const res = await request(testRuntime.getHandlersCallback()).get(
      "/performances/1"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(4);
  });

  test("test-available-seats-endpoint", async () => {
    const res = await request(testRuntime.getHandlersCallback()).get(
      "/available-seats/1"
    );
    expect(res.statusCode).toBe(200);
    // expect(res.body).toHaveLength(4);
  });
});

