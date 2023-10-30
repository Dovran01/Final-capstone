import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import "../App.css";

/**
 * Defines the menu for this application.
 *
 * @returns {JSX.Element}
 */

function Menu() {
	const [screenWidth, setScreenWidth] = useState(window.innerWidth);

	// Reload on window resize
	useEffect(() => {
		function handleResize() {
			setScreenWidth(window.innerWidth);
		}

		window.addEventListener("resize", handleResize);
	});

	// Use location to set active nav link
	const location = useLocation();
	// Returns 'true' if page name matches current location pathname, 'false' otherwise
	function isActive(path) {
		if (location.pathname === path) {
			return "page";
		} else {
			return null;
		}
	}

	return (
		<nav className="navbar bg-dark align-items-start ps-1">
			<div className="container-fluid">
				<Link className="navbar-brand text-light pb-2" to="/">
					Periodic Tables
				</Link>
				{screenWidth < 768 ? null : <hr className="border border-light" style={{ width: "96%" }} />}
				<ul className="navbar-nav d-flex ps-1">
					<li className="nav-item my-2" aria-current={isActive("/dashboard")}>
						<Link className="nav-link text-light" to="/dashboard">
							{isActive("/dashboard") ? (
								<i className="bi bi-grid-1x2-fill navbar-icon icon-right-margin"></i>
							) : (
								<i className="bi bi-grid-1x2 navbar-icon icon-right-margin"></i>
							)}
							{screenWidth < 768 ? null : "Dashboard"}
						</Link>
					</li>
					<li className="nav-item my-2" aria-current={isActive("/search")}>
						<Link className="nav-link text-light" to="/search">
							{isActive("/search") ? (
								<i className="bi bi-search-heart-fill navbar-icon icon-right-margin"></i>
							) : (
								<i className="bi bi-search navbar-icon icon-right-margin"></i>
							)}
							{screenWidth < 768 ? null : "Search"}
						</Link>
					</li>
					<li className="nav-item my-2" aria-current={isActive("/reservations/new")}>
						<Link className="nav-link text-light" to="/reservations/new">
							{isActive("/reservations/new") ? (
								<i className="bi bi-calendar-plus-fill navbar-icon icon-right-margin"></i>
							) : (
								<i className="bi bi-calendar-plus navbar-icon icon-right-margin"></i>
							)}
							{screenWidth < 768 ? null : "New Reservation"}
						</Link>
					</li>
					<li className="nav-item my-2" aria-current={isActive("/tables/new")}>
						<Link className="nav-link text-light" to="/tables/new">
							{isActive("/tables/new") ? (
								<i className="bi bi-plus-square-fill navbar-icon icon-right-margin"></i>
							) : (
								<i className="bi bi-plus-square-dotted navbar-icon icon-right-margin"></i>
							)}
							{screenWidth < 768 ? null : "New Table"}
						</Link>
					</li>
				</ul>
			</div>
		</nav>
	);
}

export default Menu;
