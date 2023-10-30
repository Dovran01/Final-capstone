import React from "react";
import Table from "./Table";

function TableList({ tables }) {
	const list = tables.map((table) => {
		return (
			<div className="col-6 col-md-3" key={table.table_id}>
				<Table key={table.table_id} table={table} />
			</div>
		);
	});

	return <div className="row">{list}</div>;
}

export default TableList;
