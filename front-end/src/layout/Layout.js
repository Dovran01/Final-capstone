import React from "react";
import Menu from "./Menu";
import Routes from "./Routes";

/**
 * Defines the main layout of the application.
 *
 * @returns {JSX.Element}
 */
function Layout() {
	return (
		<div className="container-fluid">
			<div className="row">
				<div className="col-md-2 px-0">
					<Menu />
				</div>
				<div className="col-md-10">
					<Routes />
				</div>
			</div>
		</div>
	);
}

export default Layout;
