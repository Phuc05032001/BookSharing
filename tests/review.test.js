/* eslint-disable */
const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const Review = require('../models/reviewModel');

//npm run start:test review.test.js

let adminToken;
let managerToken;
let userToken;
beforeAll(async () => {
  const resAdmin = await request(server)
    .post('/http/api/users/login')
    .send({
      email: process.env.TEST_ACCOUNT_ADMIN_EMAIL,
      password: process.env.TEST_ACCOUNT_ADMIN_PASSWORD,
    })
    .set('Accept', 'application/json');
  adminToken = resAdmin.body.token;

  const resManager = await request(server)
    .post('/http/api/users/login')
    .send({
      email: process.env.TEST_ACCOUNT_MANAGER_EMAIL,
      password: process.env.TEST_ACCOUNT_MANAGER_PASSWORD,
    })
    .set('Accept', 'application/json');
  managerToken = resManager.body.token;

  const resUser = await request(server)
    .post('/http/api/users/login')
    .send({
      email: process.env.TEST_ACCOUNT_CUSTOMER_EMAIL,
      password: process.env.TEST_ACCOUNT_CUSTOMER_PASSWORD,
    })
    .set('Accept', 'application/json');
  userToken = resUser.body.token;
}, 5000);

describe('Review', () => {
  describe('/GET Reviews', () => {
    test('It should GET all the reviews on the database', async () => {
      await request(server)
        .get('/http/api/reviews')
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(Array.isArray(res.body.data.reviews)).toBeTruthy();
        });
    });
  });

  describe('/GET Review', () => {
    test('It should GET a review on the database based on the provided id', async () => {
      const reviewId = '63181d05b6deed98a6c797f9';
      await request(server)
        .get(`/http/api/reviews/${reviewId}`)
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.data.review._id).toEqual(reviewId);
        });
    });

    test('It should PUSH AN ERROR when GET a review that not existing on the database based on the provided id', async () => {
      const reviewId = '63181d05b6deed98a6c797a3';
      await request(server)
        .get(`/http/api/reviews/${reviewId}`)
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No review found with that ID');
        });
    });
  });

  describe('/POST Review', () => {
    test('It should POST a new review to the database', async () => {
      const bookId = '630d799e8357beaf95fad749';
      const review = {
        review: 'New Review Unit Testing',
        rating: 4,
      };
      await request(server)
        .post(`/http/api/reviews/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(review)
        .expect(201)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(typeof res.body.data === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.data.review).toEqual(`${review.review}`);
          expect(res.body.data.rating).toEqual(review.rating);

          const newReview = await Review.findOne({
            _id: res.body.data._id,
          });
          expect(newReview).toBeTruthy();
          expect(newReview.review).toEqual(`${review.review}`);
          expect(newReview.rating).toEqual(review.rating);

          await Review.findByIdAndDelete(res.body.data._id);
        });
    });

    test('It should PUSH AN ERROR when POST a new review but have not defined one required field', async () => {
      const bookId = '630d799e8357beaf95fad749';
      const review = {
        rating: 4,
      };
      await request(server)
        .post(`/http/api/reviews/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(review)
        .expect(400)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'Invalid input data. Review cannot be empty'
          );
        });
    });

    test(`It should PUSH AN ERROR when when logged in customer user doesn't buy a book related to provided id POST a new review`, async () => {
      const bookId = '630d799e8357beaf95fad79b';
      const review = {
        review: 'New Review Unit Testing',
        rating: 4,
      };
      await request(server)
        .post(`/http/api/reviews/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(review)
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You need to buy this book before review it!'
          );
        });
    });

    test(`It should PUSH AN ERROR when logged in customer user whom already reviewed the book related to provided id POST a new review`, async () => {
      const bookId = '630d799e8357beaf95fad734';
      const review = {
        review: 'New Review Unit Testing',
        rating: 4,
      };
      await request(server)
        .post(`/http/api/reviews/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(review)
        .expect(409)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You have already reviewed this book!'
          );
        });
    });

    test('It should PUSH AN ERROR when POST a new review but the the book related to provided id is not existing on the database', async () => {
      const bookId = '63181d05b6deed98a6c797f9';
      const review = {
        review: 'New Review Unit Testing',
        rating: 4,
      };
      await request(server)
        .post(`/http/api/reviews/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(review)
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You need to buy this book before review it!'
          );
        });
    });

    test('It should PUSH AN ERROR when non logged in user POST a new review based on provided book id', async () => {
      const bookId = '63181d05b6deed98a6c797f9';
      const review = {
        review: 'New Review Unit Testing',
        rating: 4,
      };
      await request(server)
        .post(`/http/api/reviews/${bookId}`)
        .send(review)
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission POST a new review based on provided book id`, async () => {
      const bookId = '63181d05b6deed98a6c797f9';
      const review = {
        review: 'New Review Unit Testing',
        rating: 4,
      };
      await request(server)
        .post(`/http/api/reviews/${bookId}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .send(review)
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You do not have permission to perform this action'
          );
        });
    });
  });

  describe('/DELETE Review', () => {
    test('It should DELETE a specific review on the database', async () => {
      const review = await Review.create({
        book: '630d799e8357beaf95fad79b',
        user: '62f5d118fc13ae547b00021d',
        rating: 2,
        review: 'Unit Test Delete Review',
      });

      await request(server)
        .delete(`/http/api/reviews/${review._id}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(204);
    });

    test('It should DELETE a specific review on the database when logged in user is the author of that review', async () => {
      const review = await Review.create({
        book: '630d799e8357beaf95fad79b',
        user: '62f5cfc3d2a9b8a2d2f0d262',
        rating: 2,
        review: 'Unit Test Delete Review',
      });

      await request(server)
        .delete(`/http/api/reviews/${review._id}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(204);
    });

    test('It should DELETE a review of logged in customer user on the database', async () => {
      const review = await Review.create({
        book: '630d799e8357beaf95fad749',
        user: '62f5cfc3d2a9b8a2d2f0d262',
        rating: 3,
        review: 'Unit Test Delete Review',
      });

      await request(server)
        .delete(`/http/api/reviews/${review._id}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(204);
    });

    test('It should PUSH AN ERROR when DELETE a review that not given by logged in customer', async () => {
      const reviewId = '63181d05b6deed98a6c79801';
      await request(server)
        .delete(`/http/api/reviews/${reviewId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No review found with that ID');
        });
    });

    test('It should PUSH AN ERROR when DELETE a review that not existing on the database based on the provided id', async () => {
      const reviewId = '630446f28492077f82c19d8b';
      await request(server)
        .delete(`/http/api/reviews/${reviewId}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No review found with that ID');
        });
    });

    test('It should PUSH AN ERROR when non logged in user DELETE an existing review', async () => {
      const reviewId = '630446f28492077f82c19d8b';
      await request(server)
        .delete(`/http/api/reviews/${reviewId}`)
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission DELETE an existing review`, async () => {
      const reviewId = '630446f28492077f82c19d8b';
      await request(server)
        .delete(`/http/api/reviews/${reviewId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You do not have permission to perform this action'
          );
        });
    });
  });
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
});
