class APIfeatures {
    constructor(MongooseQuery, queryString) {
        this.MongooseQuery = MongooseQuery;
        this.queryString = queryString;
        this.options = {};
    }

    filter() {
        let queryObj = { ...this.queryString };
        const excludeFields = ['page', 'sort', 'fields', 'limit'];
        // console.log(queryObj);

        //A.1:make it advanced (use condition) query
        queryObj = JSON.parse(
            JSON.stringify(queryObj).replace(
                /\b(gte|gt|lt|lte)\b/g,
                (match) => `$${match}`
            )
        );

        //excludeFields and make options for sorting and pagination
        excludeFields.map((elm) => {
            this.options[elm] = queryObj[elm];
            delete queryObj[elm];
        });

        //A.2:make the options more relevat
        this.options = JSON.parse(
            JSON.stringify(this.options).replace(/\b(,)\b/g, ' ')
        );

        this.MongooseQuery = this.MongooseQuery.find(queryObj);

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            this.MongooseQuery = this.MongooseQuery.sort(this.options.sort);
        } else {
            //default sort
            this.MongooseQuery = this.MongooseQuery.sort('-createdAt');
        }
        return this;
    }

    project() {
        if (this.queryString.fields) {
            this.MongooseQuery = this.MongooseQuery.select(
                `-_id ${this.options.fields}`
            );
        } else {
            //TODO:enable this on delivery
            // if (process.env.NODE_ENV === 'development') {
            //     this.MongooseQuery = this.MongooseQuery.select('-__v');
            // } else if (process.env.NODE_ENV === 'production') {
            //     this.MongooseQuery = this.MongooseQuery.select('-__v -_id');
            // }
            //TODO:delete this on delivery
            this.MongooseQuery = this.MongooseQuery.select('-__v');
        }
        return this;
    }

    pagination(length) {
        const page = this.options.page * 1;
        const limit = this.options.limit * 1;
        const skip = (page - 1) * limit;
        this.MongooseQuery = this.MongooseQuery.skip(skip).limit(limit);
        if (this.queryString.page) {
            if (skip >= length) {
                throw new Error('this page does not exist');
            }
        }
        return this;
    }
}

module.exports = APIfeatures;
