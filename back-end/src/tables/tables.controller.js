/**
 * List handler for table resources
 */
const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const hasOnlyValidProperties = require("../errors/hasOnlyValidProperties");

/* --- VALIDATION MIDDLEWARE --- */

// Required properties for creating table
const REQUIRED_PROPERTIES = ["table_name", "capacity"];

// Valid properties for creating table
const VALID_PROPERTIES = [...REQUIRED_PROPERTIES, "status", "reservation_id"];

// Checks if `table_name` property is a valid input
function nameIsValid(req, res, next) {
	const { table_name } = req.body.data;
	// Must be at least 2 characters
	if (table_name.length >= 2) {
		return next();
	}

	next({
		status: 400,
		message: `Invalid 'table_name' input: "${table_name}". Must be at least 2 characters.`,
	});
}

// Checks if `capacity` property is a valid number input
function capacityIsValid(req, res, next) {
	const { capacity } = req.body.data;
	const isNumber = Number.isInteger(capacity);
	// Must be a number and greater than 0
	if (isNumber && capacity > 0) {
		return next();
	}

	next({
		status: 400,
		message: `Invalid 'capacity' input: "${capacity}". Must be a number greater than 0.`,
	});
}

// Checks if table with given `table_id` exists
async function tableExists(req, res, next) {
	const { table_id } = req.params;
	const data = await service.read(table_id);
	if (data) {
		// Save table data in locals if exists
		res.locals.table = data;
		return next();
	}

	next({
		status: 404,
		message: `Invalid 'table_id' parameter: "${table_id}". Table ID does not exist.`,
	});
}

// Checks if reservation with given `reservation_id` exists - when `reservation_id` is in req.body
async function reservationExistsBody(req, res, next) {
	const { reservation_id } = req.body.data;
	const reservation = await reservationsService.read(reservation_id);
	if (reservation) {
		// Save reservation data in locals if exists
		res.locals.reservation = reservation;
		return next();
	}

	next({
		status: 404,
		message: `Invalid 'reservation_id' parameter: "${reservation_id}". Reservation ID does not exist.`,
	});
}

// Checks if reservation with given `reservation_id` exists - when `reservation_id` is in req.params
async function reservationExistsParams(req, res, next) {
	const { reservation_id } = req.params;
	const reservation = await reservationsService.read(reservation_id);
	if (reservation) {
		// Save reservation data in locals if exists
		res.locals.reservation = reservation;
		return next();
	}

	next({
		status: 404,
		message: `Invalid 'reservation_id' parameter: "${reservation_id}". Reservation ID does not exist.`,
	});
}

// Checks if a table has enough capacity for a reservation
function tableHasCapacity(req, res, next) {
	const { table } = res.locals;
	const { reservation } = res.locals;
	if (table.capacity >= reservation.people) {
		return next();
	}

	next({
		status: 400,
		message: `Forbidden action: Table "${table.table_id}" does not have sufficient capacity for reservation "${reservation.reservation_id}".`,
	});
}

// Checks if a table's `status` is 'free'
function tableIsFree(req, res, next) {
	const { table } = res.locals;
	if (table.status.toLowerCase() === "free") {
		return next();
	}

	next({
		status: 400,
		message: `Forbidden action: Table "${table.table_id}" is already occupied.`,
	});
}

// Checks if a table's `status` is 'occupied'
function tableIsOccupied(req, res, next) {
	const { table } = res.locals;
	if (table.status.toLowerCase() === "occupied") {
		return next();
	}

	next({
		status: 400,
		message: `Forbidden action: Table "${table.table_id}" is not occupied.`,
	});
}

// Checks if a reservation's `status` is `seated`
function reservationIsSeated(req, res, next) {
	const { reservation } = res.locals;
	if (reservation.status.toLowerCase() === "seated") {
		return next();
	}

	next({
		status: 400,
		message: `Forbidden action: Reservation "${reservation.reservation_id}" is not seated.`,
	});
}

// Checks if a reservation's `status` is NOT 'seated'
function reservationIsNotSeated(req, res, next) {
	const { reservation } = res.locals;
	if (reservation.status.toLowerCase() !== "seated") {
		return next();
	}

	next({
		status: 400,
		message: `Forbidden action: Reservation "${reservation.reservation_id}" is already seated.`,
	});
}

/* --- ROUTES --- */

// GET /tables - lists all existing tables by name
async function list(req, res) {
	res.json({ data: await service.list() });
}

// POST /tables/new - creates new table
async function create(req, res) {
	const table = await service.create(req.body.data);
	res.status(201).json({ data: table });
}

// GET /tables/:reservation_id - returns table with given `reservation_id`
async function read(req, res) {
	const { reservation_id } = res.locals.reservation;
	res.json({ data: await service.readByReservation(reservation_id) });
}

// PUT /tables/:table_id/seat - seats a reservation at a table
async function seat(req, res) {
	const { table, reservation } = res.locals;
	const updatedTableData = {
		...table,
		reservation_id: reservation.reservation_id,
		status: "Occupied",
	};
	const updatedTable = await service.seat(updatedTableData);

	// Set reservation status to 'seated'
	const updatedReservationData = {
		...reservation,
		status: "seated",
	};
	await reservationsService.update(updatedReservationData);
	res.json({ data: updatedTable });
}

// DELETE /tables/:table_id/seat - finishes a reservation and opens up table
async function finish(req, res) {
	const { table } = res.locals;
	const updatedTableData = {
		...table,
		reservation_id: null,
		status: "free",
	};
	const updatedTable = await service.finish(updatedTableData);

	// Set reservation status to 'finished'
	const reservation = await reservationsService.read(table.reservation_id);
	const updatedReservationData = {
		...reservation,
		status: "finished",
	};
	await reservationsService.update(updatedReservationData);

	res.json({ data: updatedTable });
}

module.exports = {
	list: asyncErrorBoundary(list),
	create: [
		hasProperties(REQUIRED_PROPERTIES),
		hasOnlyValidProperties(VALID_PROPERTIES),
		nameIsValid,
		capacityIsValid,
		asyncErrorBoundary(create),
	],
	read: [
		asyncErrorBoundary(reservationExistsParams),
		reservationIsSeated,
		asyncErrorBoundary(read),
	],
	seat: [
		hasProperties(["reservation_id"]),
		hasOnlyValidProperties(["reservation_id"]),
		asyncErrorBoundary(tableExists),
		asyncErrorBoundary(reservationExistsBody),
		reservationIsNotSeated,
		tableHasCapacity,
		tableIsFree,
		asyncErrorBoundary(seat),
	],
	finish: [asyncErrorBoundary(tableExists), tableIsOccupied, asyncErrorBoundary(finish)],
};
