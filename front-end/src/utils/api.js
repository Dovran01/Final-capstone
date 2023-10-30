/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
	try {
		const response = await fetch(url, options);

		if (response.status === 204) {
			return null;
		}

		const payload = await response.json();

		if (payload.error) {
			return Promise.reject({ message: payload.error });
		}
		return payload.data;
	} catch (error) {
		if (error.name !== "AbortError") {
			console.error(error.stack);
			throw error;
		}
		return Promise.resolve(onCancel);
	}
}

/**
 * Retrieves all existing reservations.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservations saved in the database.
 */
export async function listReservations(params, signal) {
	const url = new URL(`${API_BASE_URL}/reservations`);
	Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value.toString()));
	return await fetchJson(url, { headers, signal }, [])
		.then(formatReservationDate)
		.then(formatReservationTime);
}

/**
 * Retrieves all existing reservations matching a given phone number.
 *
 * @param mobile_number
 *  the phone number to match
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of matching reservations saved in the database.
 */
export async function searchByPhone(mobile_number, signal) {
	const url = `${API_BASE_URL}/reservations?mobile_number=${mobile_number}`;
	return await fetchJson(url, { signal });
}

/**
 * Saves new reservation to the database.
 *
 * @param reservation
 *  the reservation to save, which must not have an `id` property
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the saved reservation, which will now have an `id` property.
 */
export async function createReservation(reservation, signal) {
	const url = `${API_BASE_URL}/reservations`;
	const options = {
		method: "POST",
		headers,
		body: JSON.stringify({ data: reservation }),
		signal,
	};
	return await fetchJson(url, options, {});
}

/**
 * Retrieves an existing reservation by id.
 *
 * @param reservation_id
 * 	id of the reservation to retrieve
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the reservation with the matching id.
 */
export async function readReservation(reservation_id, signal) {
	const url = `${API_BASE_URL}/reservations/${reservation_id}`;
	return await fetchJson(url, { signal });
}

/**
 * Saves updated reservation to the database when seated at a table.
 *
 * @param reservation_id
 *  id of the reservation to be updated
 * @param table
 *  the table the reservation is being seated at
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the updated reservation.
 */
export async function seatReservation(reservation_id, table, signal) {
	const { table_id } = table;
	const url = `${API_BASE_URL}/tables/${table_id}/seat`;
	const options = {
		method: "PUT",
		headers,
		body: JSON.stringify({ data: { reservation_id: reservation_id } }),
		signal,
	};
	return await fetchJson(url, options, {});
}

/**
 * Updates an existing reservation.
 *
 * @param reservation
 *  the updated reservation data
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the updated reservation.
 */
export async function updateReservation(reservation, signal) {
	const url = `${API_BASE_URL}/reservations/${reservation.reservation_id}`;
	const options = {
		method: "PUT",
		headers,
		body: JSON.stringify({ data: reservation }),
		signal,
	};
	return await fetchJson(url, options, {});
}

/**
 * Updates an existing reservation's 'status' property.
 *
 * @param reservation_id
 *  the id of the reservation to update
 * @param status
 * 	the new status property
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the updated reservation.
 */
export async function updateReservationStatus(reservation_id, status, signal) {
	const url = `${API_BASE_URL}/reservations/${reservation_id}/status`;
	const options = {
		method: "PUT",
		headers,
		body: JSON.stringify({ data: { status: status } }),
		signal,
	};
	return await fetchJson(url, options, {});
}

/**
 * Retrieves all existing tables.
 *
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<[table]>}
 *  a promise that resolves to a possibly empty array of tables saved in the database.
 */
export async function listTables(signal) {
	const url = `${API_BASE_URL}/tables`;
	return await fetchJson(url, { signal });
}

/**
 * Saves new table to the database.
 *
 * @param table
 *  the table to save, which must not have an `id` property
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<[table]>}
 *  a promise that resolves to the saved table, which will now have an `id` property.
 */
export async function createTable(table, signal) {
	const url = `${API_BASE_URL}/tables`;
	const options = {
		method: "POST",
		headers,
		body: JSON.stringify({ data: table }),
		signal,
	};
	return await fetchJson(url, options, {});
}

/**
 * Retrieves the table with the given reservation id.
 *
 * @param reservation_id
 * 	reservation id to match
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<[table]>}
 *  a promise that resolves to the table with the matching reservation id.
 */
export async function readTableByReservation(reservation_id, signal) {
	const url = `${API_BASE_URL}/tables/seated/${reservation_id}`;
	return await fetchJson(url, { signal });
}

/**
 * Saves updated table to the database when a reservation is finished.
 *
 * @param table
 *  the table being made available
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<[table]>}
 *  a promise that resolves to the updated table.
 */
export async function finishTable(table, signal) {
	const { table_id } = table;
	const url = `${API_BASE_URL}/tables/${table_id}/seat`;
	const options = {
		method: "DELETE",
		headers,
		signal,
	};
	return await fetchJson(url, options, {});
}
