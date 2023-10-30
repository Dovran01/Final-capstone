import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { readReservation, updateReservation, createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { formatAsDate, formatAsTime } from "../utils/date-time";

import "../App.css";

function ReservationForm({ reservation_id }) {
	// State set-up for form - start with empty form for new reservation
	const initialFormData = {
		first_name: "",
		last_name: "",
		mobile_number: "",
		reservation_date: "",
		reservation_time: "",
		people: "",
	};
	const [formData, setFormData] = useState({ ...initialFormData });

	const [reservationFormError, setReservationFormError] = useState(null);
	const history = useHistory();

	// If 'reservation_id' is given, reservation is to be edited - load original data
	useEffect(() => {
		const abortController = new AbortController();

		if (reservation_id) {
			async function loadReservation() {
				try {
					const reservationData = await readReservation(reservation_id, abortController.signal);
					// Convert date and time formats
					reservationData.reservation_date = formatAsDate(reservationData.reservation_date);
					reservationData.reservation_time = formatAsTime(reservationData.reservation_time);
					// Set 'formData' to original reservation data
					setFormData({ ...reservationData });
				} catch (error) {
					setReservationFormError([error.message]);
				}
			}
			loadReservation();
		}
		return () => abortController.abort();
	}, [reservation_id]);

	// Change handler for form
	const handleChange = ({ target }) => {
		setFormData({
			...formData,
			[target.name]: target.value,
		});
	};

	// Validation + data preparation before submit
	const prepareSubmit = (data, errors) => {
		// Date + time validation
		const date = data.reservation_date;
		const time = data.reservation_time;
		// 'Date-time form' interpreted as local time
		const reservationDate = new Date(`${date}T${time.slice(0, 2)}:${time.slice(3)}`);
		const now = new Date(Date.now());
		// Accomodate for daylight savings time
		reservationDate.setTime(
			reservationDate.getTime() - reservationDate.getTimezoneOffset() * 60 * 1000
		);
		now.setTime(now.getTime() - now.getTimezoneOffset() * 60 * 1000);

		// Check if in the past
		if (reservationDate < now) {
			errors.push(`Reservation must be in the future.`);
		}
		// Check if a tuesday
		if (reservationDate.getDay() === 2) {
			errors.push(`Reservation must not be on a Tuesday - restaurant closed.`);
		}
		// Check if outside business hours
		const earliestTime = 1030;
		const latestTime = 2120;
		const reservationTime = time.substring(0, 2) + time.substring(3);
		if (reservationTime < earliestTime || reservationTime > latestTime) {
			errors.push(`Reservation must be between 10:30am and 9:30pm.`);
		}

		// Convert 'people' value from a string to a number
		data.people = parseInt(data.people);
	};

	// Submit handler for form
	const handleSubmit = (event) => {
		event.preventDefault();
		const abortController = new AbortController();

		// Validate
		const errors = [];
		prepareSubmit(formData, errors);
		// Don't submit request if any errors
		if (errors.length) {
			setReservationFormError({ message: errors });
			return;
		}

		if (!reservation_id) {
			// POST request for new reservation
			async function postReservation() {
				try {
					await createReservation(formData, abortController.signal);
					// Display dashboard for date of new reservation
					history.push(`/dashboard?date=${formData.reservation_date}`);
				} catch (error) {
					setReservationFormError([error.message]);
				}
			}
			postReservation();
		} else {
			// PUT request for updating reservation
			async function putReservation() {
				try {
					await updateReservation(formData, abortController.signal);
					// Push back to dashboard on date of reservation
					history.push(`/dashboard?date=${formData.reservation_date}`);
				} catch (error) {
					setReservationFormError([error.message]);
				}
			}
			putReservation();
		}
	};

	return (
		<fieldset className="border rounded bg-secondary-subtle form-fieldset">
			<ErrorAlert error={reservationFormError} />
			<form className="form-main sub-header-font" onSubmit={handleSubmit}>
				<div className="row">
					<label htmlFor="first_name" className="col-12 col-md-2 col-form-label col-form-label-lg">
						First Name
					</label>
					<div className="col-12 col-md-10">
						<input
							className="form-control form-control-lg form-item"
							type="text"
							id="first_name"
							name="first_name"
							required={true}
							value={formData.first_name}
							onChange={handleChange}
						/>
					</div>
				</div>
				<div className="row">
					<label htmlFor="last_name" className="col-12 col-md-2 col-form-label col-form-label-lg">
						Last Name
					</label>
					<div className="col-12 col-md-10">
						<input
							className="form-control form-control-lg form-item"
							type="text"
							id="last_name"
							name="last_name"
							required={true}
							value={formData.last_name}
							onChange={handleChange}
						/>
					</div>
				</div>
				<div className="row">
					<label
						htmlFor="mobile_number"
						className="col-12 col-md-2 col-form-label col-form-label-lg">
						Phone
					</label>
					<div className="col-12 col-md-4">
						<div className="input-group">
							<span className="input-group-text form-item" id="mobile_number-addon">
								+1
							</span>
							<input
								className="form-control form-control-lg form-item"
								type="text"
								id="mobile_number"
								name="mobile_number"
								placeholder="###-###-####"
								required={true}
								value={formData.mobile_number}
								onChange={handleChange}
							/>
						</div>
					</div>
					<label htmlFor="people" className="col-12 col-md-2 col-form-label col-form-label-lg">
						Party Size
					</label>
					<div className="col-12 col-md-4">
						<input
							className="form-control form-control-lg form-item"
							type="number"
							id="people"
							name="people"
							min={1}
							required={true}
							value={formData.people}
							onChange={handleChange}
						/>
					</div>
				</div>
				<div className="row">
					<label
						htmlFor="reservation_date"
						className="col-12 col-md-2 col-form-label col-form-label-lg">
						Date
					</label>
					<div className="col-12 col-md-4">
						<input
							className="form-control form-control-lg form-item"
							type="date"
							id="reservation_date"
							name="reservation_date"
							required={true}
							value={formData.reservation_date}
							onChange={handleChange}
						/>
					</div>
					<label
						htmlFor="reservation_time"
						className="col-12 col-md-2 col-form-label col-form-label-lg">
						Time
					</label>
					<div className="col-12 col-md-4">
						<input
							className="form-control form-control-lg form-item"
							type="time"
							id="reservation_time"
							name="reservation_time"
							required={true}
							value={formData.reservation_time}
							onChange={handleChange}
						/>
					</div>
				</div>
				<div className="d-flex justify-content-between">
					<button
						className="btn btn-lg btn-secondary"
						type="button"
						onClick={() => history.goBack()}>
						Cancel
					</button>
					<button className="btn btn-lg btn-primary" type="submit">
						Submit
					</button>
				</div>
			</form>
		</fieldset>
	);
}

export default ReservationForm;
