/* eslint-disable */
const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');

//npm run start:test message.test.js

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

describe('Message', () => {
  describe('/GET Message', () => {
    test('It should GET messages in conversation on the database based on the conversation id', async () => {
      const conversationId = '6343e96ded8debd34b34ac90';
      await request(server)
        .get(`/http/api/support/message/${conversationId}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(Array.isArray(res.body.data.messages)).toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when GET messages but the provided conversation id is not existing on the database', async () => {
      const conversationId = '6343e96ded8debd34b34ac9a';
      await request(server)
        .get(`/http/api/support/message/${conversationId}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(`Conversation does not exist!`);
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission GET messages in conversation`, async () => {
      const conversationId = '6343e96ded8debd34b34ac9a';
      await request(server)
        .get(`/http/api/support/message/${conversationId}`)
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

    test('It should PUSH AN ERROR when non logged in user GET messages in conversation', async () => {
      const conversationId = '6343e96ded8debd34b34ac9a';
      await request(server)
        .get(`/http/api/support/message/${conversationId}`)
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

  describe('/POST Message', () => {
    test('It should POST a new message to conversation on the database', async () => {
      const conversation = await Conversation.create({
        createdAt: new Date(),
        members: ['62f5d118fc13ae547b000209', '62f5d118fc13ae547b00021d'],
      });
      const message = {
        conversationId: conversation._id,
        sender: '62f5d118fc13ae547b000209',
        text: 'Hello, world!',
      };
      await request(server)
        .post(`/http/api/support/message/`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(message)
        .expect(201)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(typeof res.body.data.newMessage === 'object').toBeTruthy();
          expect(res.body.data.newMessage.conversationId.toString()).toEqual(
            message.conversationId.toString()
          );
          expect(res.body.data.newMessage.sender).toEqual(message.sender);
          expect(res.body.data.newMessage.text).toEqual(message.text);

          const newMessage = await Message.findOne({
            _id: res.body.data.newMessage._id,
          });
          expect(newMessage).toBeTruthy();
          expect(newMessage.conversationId).toEqual(
            message.conversationId.toString()
          );
          expect(newMessage.sender).toEqual(message.sender);
          expect(newMessage.text).toEqual(message.text);

          await Conversation.findByIdAndDelete(conversation._id);
          await Message.findByIdAndDelete(res.body.data.newMessage._id);
        });
    });

    test('It should PUSH AN ERROR when POST a new message but the provided conversation id is not existing on the database', async () => {
      const message = {
        conversationId: '630d799e8357beaf95fad758',
        sender: '62f5d118fc13ae547b000209',
        text: 'Hello, world!',
      };
      await request(server)
        .post(`/http/api/support/message/`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(message)
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(`Conversation does not exist!`);
        });
    });

    test(`It should PUSH AN ERROR when user whom don't have permission POST a new message to conversation`, async () => {
      const message = {
        conversationId: '630d799e8357beaf95fad758',
        sender: '62f5d118fc13ae547b000209',
        text: 'Hello, world!',
      };
      await request(server)
        .post(`/http/api/support/message/`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .send(message)
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

    test('It should PUSH AN ERROR when non logged in user POST a new message to conversation', async () => {
      const message = {
        conversationId: '630d799e8357beaf95fad758',
        sender: '62f5d118fc13ae547b000209',
        text: 'Hello, world!',
      };
      await request(server)
        .post(`/http/api/support/message/`)
        .send(message)
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
