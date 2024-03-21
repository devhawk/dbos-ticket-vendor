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
  { date: new Date('2025-03-15 19:00'), description: 'Saturday Night', ticketPrice: 25.00, ticketCount: 10 },
  { date: new Date('2025-03-16 13:00'), description: 'Final Performance', ticketPrice: 25.00, ticketCount: 10 },
]

const soldTickets = [
  { performanceId: 1, seatNumber: 2, username: 'irene' },
  { performanceId: 1, seatNumber: 10, username: 'frank' },
  { performanceId: 1, seatNumber: 6, username: 'bob' },
  { performanceId: 1, seatNumber: 8, username: 'alice' },
  { performanceId: 1, seatNumber: 4, username: 'irene' },
  { performanceId: 3, seatNumber: 8, username: 'alice' },
  { performanceId: 3, seatNumber: 2, username: 'ethan' },
  { performanceId: 3, seatNumber: 5, username: 'ethan' },
  { performanceId: 3, seatNumber: 7, username: 'frank' },
  { performanceId: 3, seatNumber: 3, username: 'grace' },
  { performanceId: 3, seatNumber: 1, username: 'ethan' },
  { performanceId: 4, seatNumber: 10, username: 'bob' },
  { performanceId: 4, seatNumber: 5, username: 'grace' },
  { performanceId: 4, seatNumber: 7, username: 'harry' },
  { performanceId: 4, seatNumber: 3, username: 'irene' },
  { performanceId: 4, seatNumber: 9, username: 'bob' },
  { performanceId: 4, seatNumber: 2, username: 'david' },
  { performanceId: 5, seatNumber: 2, username: 'irene' },
  { performanceId: 5, seatNumber: 5, username: 'frank' },
  { performanceId: 5, seatNumber: 10, username: 'alice' },
  { performanceId: 5, seatNumber: 6, username: 'frank' },
  { performanceId: 5, seatNumber: 9, username: 'colin' },
  { performanceId: 5, seatNumber: 1, username: 'harry' },
  { performanceId: 5, seatNumber: 7, username: 'harry' },
  { performanceId: 6, seatNumber: 4, username: 'colin' },
  { performanceId: 6, seatNumber: 8, username: 'frank' },
  { performanceId: 7, seatNumber: 9, username: 'alice' },
  { performanceId: 7, seatNumber: 6, username: 'bob' },
  { performanceId: 7, seatNumber: 7, username: 'jacob' },
  { performanceId: 7, seatNumber: 8, username: 'colin' },
  { performanceId: 8, seatNumber: 9, username: 'jacob' },
  { performanceId: 8, seatNumber: 1, username: 'bob' },
  { performanceId: 8, seatNumber: 5, username: 'alice' },
  { performanceId: 9, seatNumber: 7, username: 'harry' },
  { performanceId: 9, seatNumber: 1, username: 'irene' },
  { performanceId: 9, seatNumber: 6, username: 'irene' },
  { performanceId: 9, seatNumber: 8, username: 'frank' },
  { performanceId: 9, seatNumber: 5, username: 'irene' },
  { performanceId: 10, seatNumber: 10, username: 'irene' },
  { performanceId: 10, seatNumber: 1, username: 'david' },
  { performanceId: 10, seatNumber: 5, username: 'frank' },
  { performanceId: 10, seatNumber: 6, username: 'ethan' },
  { performanceId: 10, seatNumber: 7, username: 'david' },
  { performanceId: 11, seatNumber: 8, username: 'ethan' },
  { performanceId: 11, seatNumber: 10, username: 'colin' },
  { performanceId: 11, seatNumber: 7, username: 'colin' },
  { performanceId: 11, seatNumber: 2, username: 'irene' },
  { performanceId: 11, seatNumber: 6, username: 'david' },
  { performanceId: 12, seatNumber: 1, username: 'jacob' },
  { performanceId: 12, seatNumber: 10, username: 'jacob' },
  { performanceId: 12, seatNumber: 4, username: 'jacob' },
  { performanceId: 12, seatNumber: 7, username: 'harry' },
  { performanceId: 12, seatNumber: 3, username: 'colin' },
  { performanceId: 12, seatNumber: 6, username: 'jacob' },
  { performanceId: 12, seatNumber: 9, username: 'ethan' },
  { performanceId: 12, seatNumber: 8, username: 'frank' },
  { performanceId: 12, seatNumber: 2, username: 'frank' }
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

  for (const { id: productionId } of productions) {
    await knex('performances').insert(performances.map(p => ({ ...p, productionId })));
  }

  await knex('reservations').insert(soldTickets);
};
