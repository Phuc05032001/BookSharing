/* eslint-disable */
const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const Conversation = require('../models/conversationModel');

//npm run start:test conversation.test.js

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

describe('Conversation', () => {
  describe('/GET Conversation', () => {
    test('It should GET conversations on the database based on the user id', async () => {
      const userId = '62f5cf75d2a9b8a2d2f0d25c';
      await request(server)
        .get(`/http/api/support/conversation/${userId}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(Array.isArray(res.body.data.conversations)).toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when GET conversations but the provided user id is not existing on the database', async () => {
      const userId = '630446f28492077f82c19d8b';
      await request(server)
        .get(`/http/api/support/conversation/${userId}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            `This user doesn't have any conversations!`
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET conversations`, async () => {
      const userId = '630446f28492077f82c19d8b';
      await request(server)
        .get(`/http/api/support/conversation/${userId}`)
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

    test('It should PUSH AN ERROR when non logged in user GET conversations', async () => {
      const userId = '630446f28492077f82c19d8b';
      await request(server)
        .get(`/http/api/support/conversation/${userId}`)
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

  describe('/POST Conversation', () => {
    test('It should POST a new conversation to the database', async () => {
      const conversation = {
        senderId: '62f5d118fc13ae547b000245',
      };
      await request(server)
        .post(`/http/api/support/conversation`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(conversation)
        .expect(201)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(
            typeof res.body.data.newConversation === 'object'
          ).toBeTruthy();
          expect(
            Array.isArray(res.body.data.newConversation.members)
          ).toBeTruthy();
          expect(res.body.data.newConversation.members[0]).toEqual(
            conversation.senderId
          );

          const newConversation = await Conversation.findOne({
            _id: res.body.data.newConversation._id,
          });
          expect(newConversation).toBeTruthy();
          expect(newConversation.members[0]).toEqual(conversation.senderId);

          await Conversation.findByIdAndDelete(
            res.body.data.newConversation._id
          );
        });
    });

    test('It should PUSH AN ERROR when user is customer already have a conversation POST a new conversation to the database', async () => {
      const conversation = {
        senderId: '62f61b6d16755391cd18bde0',
      };
      await request(server)
        .post(`/http/api/support/conversation`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(conversation)
        .expect(409)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            `This customer user already have conversation!`
          );
        });
    });

    test('It should PUSH AN ERROR when POST a new conversation but the provided sender user id is not existing on the database', async () => {
      const conversation = {
        senderId: '630446f28492077f82c19d8b',
      };
      await request(server)
        .post(`/http/api/support/conversation`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(conversation)
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            `User with provided id is not found!`
          );
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission POST a new conversation`, async () => {
      const conversation = {
        senderId: '62f61b6d16755391cd18bde0',
      };
      await request(server)
        .post(`/http/api/support/conversation`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send(conversation)
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

    test('It should PUSH AN ERROR when non logged in user GET a conversation', async () => {
      const conversation = {
        senderId: '62f61b6d16755391cd18bde0',
      };
      await request(server)
        .post(`/http/api/support/conversation`)
        .send(conversation)
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
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
});
