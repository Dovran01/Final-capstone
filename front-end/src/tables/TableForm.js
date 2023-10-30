import React from "react";
import { useHistory } from "react-router-dom";

import "../App.css";

function TableForm({ formData, handleChange, handleSubmit }) {
	const history = useHistory();

	return (
		<form className="form-main sub-header-font" onSubmit={handleSubmit}>
			<div className="row">
				<label htmlFor="table_name" className="col-12 col-md-2 col-form-label col-form-label-lg">
					Table Name
				</label>
				<div className="col-12 col-md-10">
					<input
						className="form-control form-control-lg form-item"
						type="text"
						id="table_name"
						name="table_name"
						minLength={2}
						required={true}
						value={formData.table_name}
						onChange={handleChange}
					/>
				</div>
			</div>
			<div className="row">
				<label htmlFor="capacity" className="col-12 col-md-2 col-form-label col-form-label-lg">
					Capacity
				</label>
				<div className="col-12 col-md-10">
					<input
						className="form-control form-control-lg form-item"
						type="number"
						id="capacity"
						name="capacity"
						min={1}
						required={true}
						value={formData.capacity}
						onChange={handleChange}
					/>
				</div>
			</div>
			<div className="d-flex justify-content-between">
				<button className="btn btn-lg btn-secondary" type="button" onClick={() => history.goBack()}>
					Cancel
				</button>
				<button className="btn btn-lg btn-primary" type="submit">
					Submit
				</button>
			</div>
		</form>
	);
}

export default TableForm;
