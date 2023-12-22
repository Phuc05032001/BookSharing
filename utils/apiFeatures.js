class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'searchByAuthor',
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|regex|options)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  countFilter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [
      'fullName',
      'email',
      'city',
      'country',
      'phoneNumber',
      'bookTitle',
      'author',
      'price',
      'name',
      'performerName',
      'performerEmail',
      'searchByAuthor',
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    this.query = this.query.countDocuments(queryObj);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('_id');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || this.query.length;
    const skip = (page - 1) * limit;

    //page=2&limit=10 , 1-10 page1; 11-20 page2; 21-30 page3;etc so why we need skip 10 result, limit 10
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
