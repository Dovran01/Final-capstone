/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const hasOnlyValidProperties = require("../errors/hasOnlyValidProperties");

/* --- VALIDATION MIDDLEWARE --- */

// Required properties for creating/updating reservation
const REQUIRED_PROPERTIES = [
	"first_name",
	"last_name",
	"mobile_number",
	"reservation_date",
	"reservation_time",
	"people",
];

// Valid properties for creating reservation
const VALID_PROPERTIES_CREATE = [...REQUIRED_PROPERTIES, "status"];

// Valid properties for updating reservation
const VALID_PROPERTIES_UPDATE = [
	...VALID_PROPERTIES_CREATE,
	"reservation_id",
	"created_at",
	"updated_at",
];

// Checks for date or phone number in request query, finds matching reservations
async function dateOrPhoneQuery(req, res, next) {
	const { date, mobile_number } = req.query;
	let reservationsList;

	// If phone number query, use `search()` with phone number
	if (mobile_number) {
		reservationsList = await service.search(mobile_number);
		res.locals.reservationsList = reservationsList;
	} else {
		// If no date query, default to current date
		if (!date) {
			date = new Date();
			// Accomodate for daylight savings
			date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
		}

		reservationsList = await service.list(date);
		res.locals.reservationsList = reservationsList;
	}

	next();
}

// Checks if `reservation_date` property is a valid date input
function dateIsValid(req, res, next) {
	const { reservation_date } = req.body.data;
	// Convert YYYY-MM-DD format to ISO date format - so `Date.parse()` works across all browsers
	try {
		const date = new Date(reservation_date);
		const dateISO = date.toISOString();
		if (dateISO && Date.parse(dateISO) > 0) {
			return next();
		} else {
			throw new Error();
		}
	} catch (error) {
		next({
			status: 400,
			message: `Invalid 'reservation_date' input: "${reservation_date}". Must be a valid date.`,
		});
	}
}

// Checks if `reservation_date` is a tuesday - restaurant closed
function notTuesday(req, res, next) {
	const { reservation_date, reservation_time } = req.body.data;
	// 'Date-time form' interpreted as local time
	const reservationDate = new Date(
		`${reservation_date}T${reservation_time.slice(0, 2)}:${reservation_time.slice(3)}`
	);

	if (reservationDate.getDay() !== 2) {
		return next();
	}

	next({
		status: 400,
		message: `Invalid 'reservation_date' input: "${reservation_date}". Must not be a Tuesday - restaurant closed.`,
	});
}

// Checks if `reservation_time` is a valid time input
function timeIsValid(req, res, next) {
	const { reservation_time } = req.body.data;
	// Validate HH:MM time format
	let regex = new RegExp("([01]?[0-9]|2[0-3]):([0-5][0-9])");
	if (regex.test(reservation_time)) {
		// Check if within business hours - 10:30am-9:30pm
		const earliestTime = 1030;
		const latestTime = 2130;
		const reservationTime = reservation_time.substring(0, 2) + reservation_time.substring(3);

		if (reservationTime >= earliestTime && reservationTime <= latestTime) {
			return next();
		}
	}

	next({
		status: 400,
		message: `Invalid 'reservation_time' input: "${reservation_time}". Must be a valid time between 10:30am - 9:30pm.`,
	});
}

// Checks if `reservation_date` and `reservation_time` are not in the past
function notInPast(req, res, next) {
	const { reservation_date, reservation_time } = req.body.data;
	// 'Date-time form' interpreted as local time
	const reservationDate = new Date(
		`${reservation_date}T${reservation_time.slice(0, 2)}:${reservation_time.slice(3)}`
	);
	const now = new Date(Date.now());
	// Accomodate for daylight savings time
	reservationDate.setTime(
		reservationDate.getTime() - reservationDate.getTimezoneOffset() * 60 * 1000
	);
	now.setTime(now.getTime() - now.getTimezoneOffset() * 60 * 1000);

	if (reservationDate > now) {
		return next();
	}

	next({
		status: 400,
		message: `Invalid 'reservation_date' / 'reservation_time' input(s): "${reservation_date}" / "${reservation_time}". Must be in the future.`,
	});
}

// Checks if `people` property is a valid number input
function peopleIsValid(req, res, next) {
	const { people } = req.body.data;
	const isNumber = Number.isInteger(people);
	// Must be a number and greater than 0
	if (isNumber && people > 0) {
		return next();
	}

	next({
		status: 400,
		message: `Invalid 'people' input: "${people}". Must be a number greater than 0.`,
	});
}

// Checks if reservation with given `reservation_id` exists
async function reservationExists(req, res, next) {
	const { reservation_id } = req.params;
	const data = await service.read(reservation_id);
	if (data) {
		// Save reservation data in locals if exists
		res.locals.reservation = data;
		return next();
	}

	next({
		status: 404,
		message: `Invalid 'reservation_id' parameter: "${reservation_id}". Reservation ID does not exist.`,
	});
}

// Checks if `status` is a valid input
function statusIsValid(req, res, next) {
	const { status } = req.body.data;
	const validStatus = ["booked", "seated", "finished", "cancelled"];
	// Make case-insensitive
	if (validStatus.includes(status.toLowerCase())) {
		// Save status in locals if valid
		res.locals.status = status;
		return next();
	}

	next({
		status: 400,
		message: `Invalid 'status' input: "${status}". Must be one of the following options: ${validStatus.join(
			", "
		)}.`,
	});
}

// Checks if new reservation data has `status` property - if so, must be set to 'booked'
function statusIsBooked(req, res, next) {
	const { status } = req.body.data;
	if (!status || (status && status.toLowerCase() === "booked")) {
		return next();
	}

	next({
		status: 400,
		message: `Invalid 'status' input: "${status}". Status must be "booked" for a new reservation, if included.`,
	});
}

// Checks if `status` being updated is set to 'finished' - cannot update
function statusIsNotFinished(req, res, next) {
	const { reservation } = res.locals;
	if (reservation.status.toLowerCase() !== "finished") {
		return next();
	}

	next({
		status: 400,
		message: `Forbidden action: Reservation with "finished" status cannot be updated.`,
	});
}

/* --- ROUTES --- */

// GET /reservations - lists all active reservations by date
function list(req, res) {
	res.json({ data: res.locals.reservationsList });
}

// POST /reservations/new - creates new reservation
async function create(req, res) {
	const reservation = await service.create(req.body.data);
	res.status(201).json({ data: reservation });
}

// GET /reservations/:reservation_id - returns reservation with given id
function read(req, res) {
	res.json({ data: res.locals.reservation });
}

// PUT /reservations/:reservation_id - updates an existing reservation
async function updateReservation(req, res) {
	const { reservation } = res.locals;
	const { data } = req.body;
	const updatedReservationData = {
		...reservation,
		...data,
	};
	const updatedReservation = await service.update(updatedReservationData);
	res.json({ data: updatedReservation });
}

// PUT /reservations/:reservation_id/status - updates status of existing reservation
async function updateStatus(req, res) {
	const { reservation, status } = res.locals;
	const updatedReservationData = {
		...reservation,
		status: status,
	};
	const updatedReservation = await service.update(updatedReservationData);
	res.json({ data: updatedReservation });
}

module.exports = {
	list: [asyncErrorBoundary(dateOrPhoneQuery), list],
	create: [
		hasProperties(REQUIRED_PROPERTIES),
		hasOnlyValidProperties(VALID_PROPERTIES_CREATE),
		dateIsValid,
		notTuesday,
		timeIsValid,
		notInPast,
		peopleIsValid,
		statusIsBooked,
		asyncErrorBoundary(create),
	],
	read: [asyncErrorBoundary(reservationExists), read],
	updateStatus: [
		hasProperties(["status"]),
		hasOnlyValidProperties(["status"]), // Double check this
		asyncErrorBoundary(reservationExists),
		statusIsValid,
		statusIsNotFinished,
		asyncErrorBoundary(updateStatus),
	],
	updateReservation: [
		asyncErrorBoundary(reservationExists),
		hasProperties(REQUIRED_PROPERTIES),
		hasOnlyValidProperties(VALID_PROPERTIES_UPDATE),
		dateIsValid,
		notTuesday,
		timeIsValid,
		notInPast,
		peopleIsValid,
		statusIsValid,
		asyncErrorBoundary(updateReservation),
	],
};
