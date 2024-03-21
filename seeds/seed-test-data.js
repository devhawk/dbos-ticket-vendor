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

const soldTickets = {
  "1": [
    { seatNumber: 2, username: 'irene' },
    { seatNumber: 10, username: 'frank' },
    { seatNumber: 6, username: 'bob' },
    { seatNumber: 8, username: 'alice' },
    { seatNumber: 4, username: 'irene' },
  ],
  "3": [
    { seatNumber: 8, username: 'alice' },
    { seatNumber: 2, username: 'ethan' },
    { seatNumber: 5, username: 'ethan' },
    { seatNumber: 7, username: 'frank' },
    { seatNumber: 3, username: 'grace' },
    { seatNumber: 1, username: 'ethan' },
  ],
  "4": [
    { seatNumber: 10, username: 'bob' },
    { seatNumber: 5, username: 'grace' },
    { seatNumber: 7, username: 'harry' },
    { seatNumber: 3, username: 'irene' },
    { seatNumber: 9, username: 'bob' },
    { seatNumber: 2, username: 'david' },
  ],
  "5": [
    { seatNumber: 2, username: 'irene' },
    { seatNumber: 5, username: 'frank' },
    { seatNumber: 10, username: 'alice' },
    { seatNumber: 6, username: 'frank' },
    { seatNumber: 9, username: 'colin' },
    { seatNumber: 1, username: 'harry' },
    { seatNumber: 7, username: 'harry' },
  ],
  "6": [
    { seatNumber: 4, username: 'colin' },
    { seatNumber: 8, username: 'frank' },
  ],
  "7": [
    { seatNumber: 9, username: 'alice' },
    { seatNumber: 6, username: 'bob' },
    { seatNumber: 7, username: 'jacob' },
    { seatNumber: 8, username: 'colin' },
  ],
  "8": [
    { seatNumber: 9, username: 'jacob' },
    { seatNumber: 1, username: 'bob' },
    { seatNumber: 5, username: 'alice' },
  ],
  "9": [
    { seatNumber: 7, username: 'harry' },
    { seatNumber: 1, username: 'irene' },
    { seatNumber: 6, username: 'irene' },
    { seatNumber: 8, username: 'frank' },
    { seatNumber: 5, username: 'irene' },
  ],
  "10": [
    { seatNumber: 10, username: 'irene' },
    { seatNumber: 1, username: 'david' },
    { seatNumber: 5, username: 'frank' },
    { seatNumber: 6, username: 'ethan' },
    { seatNumber: 7, username: 'david' },
  ],
  "11": [
    { seatNumber: 8, username: 'ethan' },
    { seatNumber: 10, username: 'colin' },
    { seatNumber: 7, username: 'colin' },
    { seatNumber: 2, username: 'irene' },
    { seatNumber: 6, username: 'david' },
  ],
  "12": [
    { seatNumber: 1, username: 'jacob' },
    { seatNumber: 2, username: 'frank' },
    { seatNumber: 3, username: 'colin' },
    { seatNumber: 4, username: 'jacob' },
    { seatNumber: 5, username: 'jacob' },
    { seatNumber: 6, username: 'jacob' },
    { seatNumber: 7, username: 'harry' },
    { seatNumber: 8, username: 'frank' },
    { seatNumber: 9, username: 'ethan' },
    { seatNumber: 10, username: 'jacob' },
  ]
}

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

  for (const [$performanceId, tickets] of Object.entries(soldTickets)) {
    const performanceId = parseInt($performanceId, 10);
    await knex('reservations').insert(tickets.map(({ seatNumber, username }) => ({ performanceId, seatNumber, username })));
  }
};
