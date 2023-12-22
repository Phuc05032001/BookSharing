/* eslint-disable */
const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');

//npm run start:test statistics.test.js

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

describe('Statistics', () => {
  describe('/GET Accounts Statistics', () => {
    test('It should GET all the accounts statistics on the database', async () => {
      await request(server)
        .get('/http/api/statistics/accounts')
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(typeof res.body.data === 'object').toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET all the accounts statistics on the database', async () => {
      await request(server)
        .get('/http/api/statistics/accounts')
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET all the accounts statistics`, async () => {
      await request(server)
        .get('/http/api/statistics/accounts')
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You do not have permission to perform this action'
          );
        });
    });
  });

  describe('/GET Accounts Statistics by each Year', () => {
    test('It should GET all the accounts statistics specified by each year on the database', async () => {
      await request(server)
        .get('/http/api/statistics/accountsCreatedYearly')
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(typeof res.body.data === 'object').toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET all the accounts statistics accounts statistics specified by each year', async () => {
      await request(server)
        .get('/http/api/statistics/accountsCreatedYearly')
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET all the accounts statistics specified by each year`, async () => {
      await request(server)
        .get('/http/api/statistics/accountsCreatedYearly')
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You do not have permission to perform this action'
          );
        });
    });
  });

  describe('/GET Books Uploaded Statistics', () => {
    test('It should GET all the books uploaded statistics on the database', async () => {
      await request(server)
        .get('/http/api/statistics/books')
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(typeof res.body.data === 'object').toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET all the books uploaded statistics', async () => {
      await request(server)
        .get('/http/api/statistics/books')
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET all the books uploaded statistics`, async () => {
      await request(server)
        .get('/http/api/statistics/books')
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You do not have permission to perform this action'
          );
        });
    });
  });

  describe('/GET Books Uploaded Statistics by each Month', () => {
    test('It should GET all the books uploaded statistics specified by each month on the database', async () => {
      await request(server)
        .get('/http/api/statistics/booksUploadedMonthly')
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(typeof res.body.data === 'object').toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET all the books uploaded statistics specified by each month', async () => {
      await request(server)
        .get('/http/api/statistics/booksUploadedMonthly')
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET all the books uploaded statistics by each month`, async () => {
      await request(server)
        .get('/http/api/statistics/booksUploadedMonthly')
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You do not have permission to perform this action'
          );
        });
    });
  });

  describe('/GET Books Sold Statistics by each Month', () => {
    test('It should GET all the books sold statistics specified by each month on the database', async () => {
      await request(server)
        .get('/http/api/statistics/booksSoldMonthly')
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(typeof res.body.data === 'object').toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET all the books sold statistics specified by each month', async () => {
      await request(server)
        .get('/http/api/statistics/booksSoldMonthly')
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET all the books sold statistics by each month`, async () => {
      await request(server)
        .get('/http/api/statistics/booksSoldMonthly')
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You do not have permission to perform this action'
          );
        });
    });
  });

  describe('/GET Top Books Highest Sales', () => {
    test('It should GET the top five books have highest sales on the database', async () => {
      await request(server)
        .get('/http/api/statistics/topFiveBooksSales')
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(Array.isArray(res.body.data.topFiveBooksSales)).toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET the top five books have highest sales', async () => {
      await request(server)
        .get('/http/api/statistics/topFiveBooksSales')
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET the top five books have highest sales`, async () => {
      await request(server)
        .get('/http/api/statistics/topFiveBooksSales')
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You do not have permission to perform this action'
          );
        });
    });
  });

  describe('/GET Top Books Highest Revenue', () => {
    test('It should GET the top five books have highest revenue on the database', async () => {
      await request(server)
        .get('/http/api/statistics/topFiveBooksRevenue')
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(Array.isArray(res.body.data.topFiveBooksRevenue)).toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET the top five books have highest revenue', async () => {
      await request(server)
        .get('/http/api/statistics/topFiveBooksRevenue')
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET the top five books have highest revenue`, async () => {
      await request(server)
        .get('/http/api/statistics/topFiveBooksRevenue')
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You do not have permission to perform this action'
          );
        });
    });
  });

  describe('/GET Books Revenue Statistics by each Month', () => {
    test('It should GET all the books revenue statistics specified by each month on the database', async () => {
      await request(server)
        .get('/http/api/statistics/totalRevenueMonthly')
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(typeof res.body.data === 'object').toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET all the books revenue statistics specified by each month', async () => {
      await request(server)
        .get('/http/api/statistics/totalRevenueMonthly')
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'You are not logged in or cookies has been disabled. Please try to login again!'
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET all the books revenue statistics specified by each month`, async () => {
      await request(server)
        .get('/http/api/statistics/totalRevenueMonthly')
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
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
