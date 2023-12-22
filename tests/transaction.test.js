/* eslint-disable */
const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const Transaction = require('../models/transactionModel');

//npm run start:test transaction.test.js

let managerToken;
let userToken;
beforeAll(async () => {
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

describe('Transaction', () => {
  describe('/GET Checkout Session', () => {
    test('It should GET a checkout session for purchasing the book', async () => {
      const bookId = '630d799e8357beaf95fad784';
      await request(server)
        .get(`/http/api/transactions/checkoutSession/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(typeof res.body.session === 'object').toBeTruthy();
          expect(res.body.session.client_reference_id).toEqual(bookId);
        });
    });

    test('It should PUSH AN ERROR when user GET checkout session for purchasing the book with book that not existing on the database based on the provided id', async () => {
      const bookId = '633f8df4094422a9d21e7344';
      await request(server)
        .get(`/http/api/transactions/checkoutSession/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No book found with that ID');
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET checkout session for purchasing the book based on provided book id', async () => {
      const bookId = '633f8df4094422a9d21e7344';
      await request(server)
        .get(`/http/api/transactions/checkoutSession/${bookId}`)
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
  });

  describe('/GET Transactions', () => {
    test('It should GET all the transactions on the database', async () => {
      await request(server)
        .get('/http/api/transactions')
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(Array.isArray(res.body.data.transactions)).toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET all the transactions on the database', async () => {
      await request(server)
        .get('/http/api/transactions')
        .expect(401)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET all the transactions on the database`, async () => {
      await request(server)
        .post('/http/api/tags')
        .set({ Authorization: `Bearer ${userToken}` })
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

  describe('/DELETE Transaction', () => {
    test('It should DELETE a specific transaction on the database', async () => {
      const transaction = await Transaction.create({
        book: '633f8df4094422a9d21e7654',
        user: '62f5d118fc13ae547b000267',
        price: 200,
        paid: true,
      });

      await request(server)
        .delete(`/http/api/transactions/${transaction._id}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(204);
    });

    test('It should PUSH AN ERROR when DELETE a transaction that not existing on the database based on the provided id', async () => {
      const transactionsId = '633f8df4094422a9d21e7344';
      await request(server)
        .delete(`/http/api/transactions/${transactionsId}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'No transaction found with that ID'
          );
        });
    });

    test('It should PUSH AN ERROR when non logged in user DELETE a existing transaction', async () => {
      const transactionsId = '633f8df4094422a9d21e7344';
      await request(server)
        .delete(`/http/api/transactions/${transactionsId}`)
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

    test(`It should PUSH AN ERROR when user whom don't have permission DELETE an existing transaction`, async () => {
      const transactionsId = '633f8df4094422a9d21e7344';
      await request(server)
        .delete(`/http/api/transactions/${transactionsId}`)
        .set({ Authorization: `Bearer ${userToken}` })
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

  describe('/GET Transactions Inventory', () => {
    test('It should GET all the transactions has been performed by logged in user on the database', async () => {
      await request(server)
        .get('/http/api/transactions/myInventory')
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(Array.isArray(res.body.data.transaction)).toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user try to GET the performed transactions on the database', async () => {
      await request(server)
        .get('/http/api/transactions/myInventory')
        .expect(401)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });
  });

  describe('/GET Transaction IsOwnBook', () => {
    test('It should GET the transaction of user who has successfully purchased the book based on provided book id', async () => {
      const bookId = '630d799e8357beaf95fad7b3';
      await request(server)
        .get(`/http/api/transactions/isOwnBook/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(Array.isArray(res.body.data.transaction)).toBeTruthy();
        });
    });

    test(`It should return EMPTY ARRAY when user haven't bought the book GET the transaction of that book`, async () => {
      const bookId = '630d799e8357beaf95fad7fa';
      await request(server)
        .get(`/http/api/transactions/isOwnBook/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(Array.isArray(res.body.data.transaction)).toBeTruthy();
          expect(res.body.data.transaction.length).toEqual(0);
        });
    });

    test('It should PUSH AN ERROR when non logged in user try to GET the transaction of book', async () => {
      const bookId = '630d799e8357beaf95fad7b3';
      await request(server)
        .get(`/http/api/transactions/isOwnBook/${bookId}`)
        .expect(401)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });
  });
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
});
