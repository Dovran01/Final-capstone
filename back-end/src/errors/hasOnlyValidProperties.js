// Checks that data does not have any invalid properties included

function hasOnlyValidProperties(validProperties) {
	return function (req, res, next) {
		const { data = {} } = req.body;
		try {
			Object.keys(data).forEach((property) => {
				// If property in the data is not a valid property, throw error
				if (!validProperties.includes(property)) {
					return next({
						status: 400,
						message: `Invalid property: "${property}". Valid properties are: ${validProperties.join(
							", "
						)}`,
					});
				}
			});

			next();
		} catch (error) {
			next(error);
		}
	};
}

module.exports = hasOnlyValidProperties;
