/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema
        .createTable('customers', table => {
            table.string('username', 255).primary();
            table.string('password', 255).notNullable();
        }).createTable('productions', (table) => {
            table.increments('id');
            table.string('name').notNullable();
            table.string('description');
        }).createTable('performances', (table) => {
            table.increments('id');
            table.integer('productionId').notNullable().references('id').inTable('productions');
            table.string('description');
            table.datetime('date').notNullable();
            table.decimal('ticketPrice').notNullable();
            table.integer('ticketCount').unsigned().notNullable();
        }).createTable('reservations', (table) => {
            table.primary(['performanceId', 'seatNumber']);
            table.integer('performanceId').notNullable().references('id').inTable('performances');
            table.integer('seatNumber').unsigned().notNullable();
            table.string('username').notNullable().references('username').inTable('customers');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema
        .dropTable('reservations')
        .dropTable('performances')
        .dropTable('productions')
        .dropTable('customers');
};
