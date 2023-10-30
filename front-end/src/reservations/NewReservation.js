import React from "react";
import ReservationForm from "./ReservationForm";

import "../App.css";

function NewReservation() {
	return (
		<div className="container ms-1">
			<h1 className="header-font fw-bold text-center my-4">Add New Reservation</h1>
			<ReservationForm />
		</div>
	);
}

export default NewReservation;
