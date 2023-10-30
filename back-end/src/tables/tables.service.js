const knex = require("../db/connection");

// Returns all existing tables, ordered by table name
function list() {
	return knex("tables").select("*").orderBy("table_name");
}

// Creates new table
function create(table) {
	return knex("tables")
		.insert(table)
		.returning("*")
		.then((returnedRecords) => returnedRecords[0]);
}

// Returns the table matching a given ID - helper only
function read(tableId) {
	return knex("tables")
		.select("*")
		.where({ table_id: tableId })
		.then((returnedRecords) => returnedRecords[0]);
}

// Returns the table matching a given `reservation_id`
function readByReservation(reservationId) {
	return knex("tables")
		.select("*")
		.where({ reservation_id: reservationId })
		.then((returnedRecords) => returnedRecords[0]);
}

// Seats a reservation at a table - sets `reservation_id` and updates `status` to 'Occupied'
function seat(updatedTable) {
	return knex("tables")
		.select("*")
		.where({ table_id: updatedTable.table_id })
		.update(updatedTable, "*")
		.then((returnedRecords) => returnedRecords[0]);
}

// Finishes a reservation at a table - sets `reservation_id` to null and updates `status` to 'Free'
function finish(updatedTable) {
	return knex("tables")
		.select("*")
		.where({ table_id: updatedTable.table_id })
		.update(updatedTable, "*")
		.then((returnedRecords) => returnedRecords[0]);
}

module.exports = {
	list,
	create,
	read,
	readByReservation,
	seat,
	finish,
};
