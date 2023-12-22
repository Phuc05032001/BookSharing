/* eslint-disable */
const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const User = require('../models/userModel');

//npm run start:test user.test.js

let adminToken;
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

  const resUser = await request(server)
    .post('/http/api/users/login')
    .send({
      email: process.env.TEST_ACCOUNT_CUSTOMER_EMAIL,
      password: process.env.TEST_ACCOUNT_CUSTOMER_PASSWORD,
    })
    .set('Accept', 'application/json');
  userToken = resUser.body.token;
}, 5000);

describe('User', () => {
  describe('/GET Users', () => {
    test('It should GET all the users account on the database', async () => {
      await request(server)
        .get('/http/api/users')
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(Array.isArray(res.body.data.users)).toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET all the users account on the database', async () => {
      await request(server)
        .get('/http/api/users')
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

    test(`It should PUSH AN ERROR when user whom don't have permission GET all the users account on the database`, async () => {
      await request(server)
        .get('/http/api/users')
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

  describe('/GET User', () => {
    test('It should GET a user account on the database based on the provided id', async () => {
      const userId = '62f61b6d16755391cd18bde0';
      await request(server)
        .get(`/http/api/users/${userId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .then((res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.data.user._id).toEqual(userId);
        });
    });

    test('It should PUSH AN ERROR when GET a user account that not existing on the database based on the provided id', async () => {
      const userId = '630446f28492077f82c19d86';
      await request(server)
        .get(`/http/api/users/${userId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No user found with that ID');
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET a user account on the database', async () => {
      const userId = '62f61b6d16755391cd18bde0';
      await request(server)
        .get(`/http/api/users/${userId}`)
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

  describe('/PATCH User Status', () => {
    test('It should PATCH a user account status on the database based on the provided id', async () => {
      const userId = '62f61b6d16755391cd18bde0';
      const status = {
        active: false,
      };
      await request(server)
        .patch(`/http/api/users/setAccountStatus/${userId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send(status)
        .then(async (res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.message).toEqual(
            'Account status changed successfully!'
          );

          const user = await User.findOne({
            _id: userId,
          });
          expect(user).toBeTruthy();
          expect(user.active).toEqual(status.active);

          await User.findByIdAndUpdate(userId, {
            active: true,
          });
        });
    });

    test('It should PUSH AN ERROR when PATCH a user account status that not existing on the database based on the provided id', async () => {
      const userId = '630446f28492077f82c19d86';
      const status = {
        active: false,
      };
      await request(server)
        .patch(`/http/api/users/setAccountStatus/${userId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send(status)
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No user found with that ID');
        });
    });

    test('It should PUSH AN ERROR when non logged in user PATCH a user account status on the database', async () => {
      const userId = '62f61b6d16755391cd18bde0';
      const status = {
        active: false,
      };
      await request(server)
        .patch(`/http/api/users/setAccountStatus/${userId}`)
        .send(status)
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

    test(`It should PUSH AN ERROR when user whom don't have permission PATCH a user account status on the database`, async () => {
      await request(server);
      const userId = '62f61b6d16755391cd18bde0';
      const status = {
        active: false,
      };
      await request(server)
        .patch(`/http/api/users/setAccountStatus/${userId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(status)
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

  describe('/PATCH User Role', () => {
    test('It should PATCH a user account role on the database based on the provided id', async () => {
      const userId = '62f61b6d16755391cd18bde0';
      const role = {
        role: 'manager',
      };
      await request(server)
        .patch(`/http/api/users/setAccountRole/${userId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send(role)
        .then(async (res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.message).toEqual(
            'Account role changed successfully!'
          );

          const user = await User.findOne({
            _id: userId,
          });
          expect(user).toBeTruthy();
          expect(user.role).toEqual(role.role);

          await User.findByIdAndUpdate(userId, {
            role: 'customer',
          });
        });
    });

    test('It should PUSH AN ERROR when PATCH a user account role that not existing on the database based on the provided id', async () => {
      const userId = '630446f28492077f82c19d86';
      const role = {
        role: 'manager',
      };
      await request(server)
        .patch(`/http/api/users/setAccountRole/${userId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send(role)
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No user found with that ID');
        });
    });

    test('It should PUSH AN ERROR when non logged in user PATCH a user account role on the database', async () => {
      const userId = '62f61b6d16755391cd18bde0';
      const role = {
        role: 'manager',
      };
      await request(server)
        .patch(`/http/api/users/setAccountRole/${userId}`)
        .send(role)
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

    test(`It should PUSH AN ERROR when user whom don't have permission PATCH a user account role on the database`, async () => {
      await request(server);
      const userId = '62f61b6d16755391cd18bde0';
      const role = {
        role: 'manager',
      };
      await request(server)
        .patch(`/http/api/users/setAccountRole/${userId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(role)
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
