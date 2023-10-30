import React from "react";
import Reservation from "./Reservation";

import "../App.css";

function ReservationList({ reservations }) {
	const list = reservations.map((reservation) => {
		return (
			<div className="col-md-4" key={reservation.reservation_id}>
				<Reservation reservation={reservation} />
			</div>
		);
	});

	return (
		<div className="row mb-2">
			{reservations.length > 0 ? (
				list
			) : (
				<h3 className="header-font fw-bold text-center my-5">No Active Reservations</h3>
			)}
		</div>
	);
}

export default ReservationList;
