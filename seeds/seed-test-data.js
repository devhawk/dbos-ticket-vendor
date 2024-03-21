// use a pseudo random number generator for reproducibility
const seedrandom = require('seedrandom');
const rng = seedrandom('seed');

const productions = [
  {
    "id": 1,
    "name": "Starship Sonata",
    "description": "An epic space opera musical featuring rival starship captains vying for control of the galaxy, with catchy tunes and futuristic dance numbers."
  },
  {
    "id": 2,
    "name": "Whisker Wonderland",
    "description": "A whimsical feline fantasy where cats rule the enchanted land of Meowtopia, facing off against a villainous pack of mischievous mice."
  },
  {
    "id": 3,
    "name": "Fantasy Factory",
    "description": "In a magical workshop, toys come to life in this whimsical musical about friendship, imagination, and the power of believing in magic."
  }
]

const performances = [
  { date: new Date('2025-03-14 19:00'), description: 'Opening Night', ticketPrice: 25.00, ticketCount: 10 },
  { date: new Date('2025-03-15 13:00'), description: 'Saturday Matinee', ticketPrice: 25.00, ticketCount: 10 },
  { date: new Date('2025-03-15 19:00'), description: 'Saturaday Night', ticketPrice: 25.00, ticketCount: 10 },
  { date: new Date('2025-03-16 13:00'), description: 'Final Performance', ticketPrice: 25.00, ticketCount: 10 },
]

const users = [
  "alice",
  "bob",
  "colin",
  "david",
  "ethan",
  "frank",
  "grace",
  "harry",
  "irene",
  "jacob",
  "kate",
]

// 'password' hashed 10 rounds on https://bcrypt-generator.com/
const password = "$2a$10$mDzjkw/hqB1ZqI1/.MJ6e.wnsYTVH9THq1ilUbV/N6FK4Ye.BMrXu"

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {

  await knex('customers').insert(users.map(username => ({ username, password })));
  await knex('productions').insert(productions);

  for (const { id } of productions) {
    for (const perf of performances) {
      const performanceIds = await knex('performances').insert({ productionId: id, ...perf }, 'id');
      if (performanceIds.length !== 1) { throw new Error(`Expected exactly one performance ID not ${performanceIds.length}`); }
      const performanceId = performanceIds[0].id;

      const seatSet = new Set();
      const soldTicketCount = Math.floor(rng() * perf.ticketCount);
      for (let i = 0; i < soldTicketCount; i++) {
        const username = users[Math.floor(rng() * users.length)];
        while (true) {
          const seatNumber = Math.floor(rng() * perf.ticketCount) + 1;
          if (!seatSet.has(seatNumber)) {
            seatSet.add(seatNumber);
            await knex('reservations').insert({ performanceId, username, seatNumber });
            break;
          }
        }
      }
    }
  }
};
