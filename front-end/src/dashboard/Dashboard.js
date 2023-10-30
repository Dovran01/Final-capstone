import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import useQuery from "../utils/useQuery";
import { previous, today, next } from "../utils/date-time";
import ReservationList from "../reservations/ReservationList";
import TableList from "../tables/TableList";

import "../App.css";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
	// Check for date query, replace default if exists
	const dateQuery = useQuery().get("date");
	if (dateQuery) {
		date = dateQuery;
	}

	// Change YYYY-MM-DD to YYYY/MM/DD for date object to be correct
	const dateString = new Date(date.replace(/-/g, "/")).toDateString();

	const [reservations, setReservations] = useState([]);
	const [tables, setTables] = useState([]);
	const [dashboardError, setDashboardError] = useState(null);

	// Load reservations for given date
	useEffect(() => {
		const abortController = new AbortController();

		async function loadReservations() {
			try {
				setDashboardError(null);
				const reservationList = await listReservations({ date }, abortController.signal);
				setReservations(reservationList);
			} catch (error) {
				setReservations([]);
				setDashboardError([error.message]);
			}
		}
		loadReservations();
		return () => abortController.abort();
	}, [date]);

	// Load tables
	useEffect(() => {
		const abortController = new AbortController();

		async function loadTables() {
			try {
				setDashboardError(null);
				const tableList = await listTables(abortController.signal);
				setTables(tableList);
			} catch (error) {
				setTables([]);
				setDashboardError([error.message]);
			}
		}
		loadTables();
		return () => abortController.abort();
	}, []);

	return (
		<main>
			<div className="container ms-1 mt-3 pt-2">
				<div className="row">
					<div className="col text-center">
						<p className="h3 sub-header-font fw-bold mb-1">Reservations for</p>
						<h1 className="sub-header-font fw-bold">{dateString}</h1>
						<Link to={`/dashboard?date=${previous(date)}`}>
							<button className="btn btn-secondary btn-sm mx-1" type="button">
								<i className="bi bi-chevron-double-left"></i>
							</button>
						</Link>
						<Link to={`/dashboard?date=${today()}`}>
							<button className="btn btn-secondary btn-sm mx-1" type="button">
								Today
							</button>
						</Link>
						<Link to={`/dashboard?date=${next(date)}`}>
							<button className="btn btn-secondary btn-sm mx-1" type="button">
								<i className="bi bi-chevron-double-right"></i>
							</button>
						</Link>
					</div>
				</div>
				<ErrorAlert error={dashboardError} />
				<div className="row my-4">
					<div className="col">
						<ReservationList reservations={reservations} />
					</div>
				</div>
				<div className="row">
					<div className="col">
						<TableList tables={tables} />
					</div>
				</div>
			</div>
		</main>
	);
}

export default Dashboard;
