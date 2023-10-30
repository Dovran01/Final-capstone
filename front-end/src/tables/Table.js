import React, { useState } from "react";
import { finishTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

import "../App.css";

function Table({ table }) {
	const [finishError, setFinishError] = useState(null);
	const { table_id, table_name, capacity, status, reservation_id } = table;

	// 'Finish' button handler
	const handleFinish = async (event) => {
		event.preventDefault();
		const abortController = new AbortController();

		if (window.confirm(`Is this table ready to seat new guests? This cannot be undone.`)) {
			try {
				// DELETE request to finish table
				await finishTable(table, abortController.signal);
				// Refresh dashboard
				window.location.reload();
			} catch (error) {
				setFinishError([error.message]);
			}
		}
	};

	// Color coding based on status
	const setStatusColor = () => {
		if (status.toLowerCase() === "free") {
			return "text-primary"; // or success?
		} else if (status.toLowerCase() === "occupied") {
			return "text-secondary"; // or dark?
		}
	};
	const statusColor = setStatusColor();

	return (
		<div className="card table-card main-font shadow-sm mb-3">
			<ErrorAlert error={finishError} />
			<div className="card-body p-2">
				<div className="row">
					<div className="col-4 col-md-6">
						<h5 className="card-title fw-bold mb-1">{table_name}</h5>
						<small className="id text-muted fst-italic">{`ID: ${table_id}`}</small>
					</div>
					<div className="col-8 col-md-6 d-flex flex-column">
						<p className="card-text mx-0 mb-1">
							<i className="bi bi-person-bounding-box text-muted icon-right-margin"></i>
							{capacity}
						</p>
						<p
							data-table-id-status={table_id}
							className={`card-text m-0 text-capitalize fw-bold ${statusColor}`}>
							<i className="bi bi-bar-chart-fill text-muted icon-right-margin"></i>
							{status}
						</p>
					</div>
				</div>
				<div className="card-footer bg-transparent px-0 pb-0">
					{status.toLowerCase() === "occupied" ? (
						<div className="d-flex align-items-center">
							<p className="card-text m-0">{`Reservation: ${reservation_id}`}</p>
							<button
								data-table-id-finish={table_id}
								type="button"
								className="btn btn-sm btn-danger ms-auto"
								onClick={handleFinish}>
								Finish
							</button>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default Table;
