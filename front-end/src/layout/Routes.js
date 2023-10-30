import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import { currentDateTime } from "../utils/date-time";
import Dashboard from "../dashboard/Dashboard";
import NewReservation from "../reservations/NewReservation";
import EditReservation from "../reservations/EditReservation";
import Seat from "../reservations/Seat";
import NewTable from "../tables/NewTable";
import Search from "../search/Search";
import NotFound from "./NotFound";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
	return (
		<Switch>
			<Route exact={true} path="/">
				<Redirect to={"/dashboard"} />
			</Route>
			<Route exact={true} path="/reservations">
				<Redirect to={"/dashboard"} />
			</Route>
			<Route path="/dashboard">
				<Dashboard date={currentDateTime().slice(0, 10)} />
			</Route>
			<Route path="/reservations/new">
				<NewReservation />
			</Route>
			<Route path="/reservations/:reservation_id/edit">
				<EditReservation />
			</Route>
			<Route path="/reservations/:reservation_id/seat">
				<Seat />
			</Route>
			<Route path="/tables/new">
				<NewTable />
			</Route>
			<Route path="/search">
				<Search />
			</Route>
			<Route>
				<NotFound />
			</Route>
		</Switch>
	);
}

export default Routes;
