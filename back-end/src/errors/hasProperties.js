// Checks that all required properties exist

function hasProperties(properties) {
	return function (req, res, next) {
		const { data = {} } = req.body;
		try {
			properties.forEach((property) => {
				// If a required property is missing or empty, throw error
				if (!data[property] || data[property] === "") {
					return next({
						status: 400,
						message: `Missing input: "${property}" property is required.`,
					});
				}
			});

			next();
		} catch (error) {
			next(error);
		}
	};
}

module.exports = hasProperties;
