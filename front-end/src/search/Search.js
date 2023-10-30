import React, { useState } from "react";
import { searchByPhone } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

import "../App.css";
import ReservationList from "../reservations/ReservationList";

function Search() {
	// State set-up for form
	const initialFormData = {
		mobile_number: "",
	};
	const [formData, setFormData] = useState({ ...initialFormData });

	const [searchResults, setSearchResults] = useState([]);
	const [searchError, setSearchError] = useState(null);

	// Change handler for form
	const handleChange = ({ target }) => {
		setFormData({
			...formData,
			[target.name]: target.value,
		});
	};

	// Submit handler for form
	const handleSubmit = async (event) => {
		event.preventDefault();
		const abortController = new AbortController();

		try {
			const results = await searchByPhone(formData.mobile_number, abortController.signal);
			if (results.length > 0) {
				setSearchResults(results);
			}
		} catch (error) {
			setSearchError([error.message]);
		}
	};

	return (
		<div className="container ms-1">
			<h1 className="header-font fw-bold text-center my-4">Search By Phone</h1>
			<fieldset className="border rounded bg-secondary-subtle form-fieldset mb-5">
				<ErrorAlert error={searchError} />
				<form className="form-main sub-header-font" onSubmit={handleSubmit}>
					<div className="row pb-3">
						<label
							htmlFor="mobile_number"
							className="col-12 col-md-4 col-form-label col-form-label-lg">
							Customer's Phone Number:
						</label>
						<div className="col-10 col-md-7">
							<input
								className="form-control form-control-lg"
								type="text"
								id="mobile_number"
								name="mobile_number"
								placeholder="###-###-####"
								required={true}
								value={formData.mobile_number}
								onChange={handleChange}
							/>
							<div className="form-text ps-1 pt-1" id="mobile_number-note">
								Full or partial phone numbers are accepted
							</div>
						</div>
						<button className="btn btn-lg btn-primary search-button col-2 col-md-1" type="submit">
							<i className="bi bi-search"></i>
						</button>
					</div>
				</form>
			</fieldset>
			{searchResults.length === 0 ? (
				<h3 className="header-font fw-bold text-center my-5">No Reservations Found</h3>
			) : (
				<ReservationList reservations={searchResults} />
			)}
		</div>
	);
}

export default Search;
