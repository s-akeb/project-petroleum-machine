const buildListQuery = (baseQuery, req, searchFields = []) => {
    const query = { ...baseQuery };

    if (req.query.search && searchFields.length) {
        query.$or = searchFields.map((field) => ({
            [field]: { $regex: req.query.search, $options: 'i' },
        }));
    }

    if (req.query.fromDate || req.query.toDate) {
        query.createdAt = {};
        if (req.query.fromDate) {
            query.createdAt.$gte = new Date(req.query.fromDate);
        }
        if (req.query.toDate) {
            query.createdAt.$lte = new Date(req.query.toDate);
        }
    }

    const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        sort: { createdAt: -1 },
    };

    return { query, options };
};

module.exports = { buildListQuery };
