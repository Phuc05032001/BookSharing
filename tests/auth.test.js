/* eslint-disable */
const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const User = require('../models/userModel');

//npm run start:test auth.test.js

let userToken;
beforeEach(async () => {
  const resUser = await request(server)
    .post('/http/api/users/login')
    .send({
      email: 'ghug1h@cnbc.com',
      password: 'newPassword@123',
    })
    .set('Accept', 'application/json');
  userToken = resUser.body.token;
}, 5000);

describe('Authentication', () => {
  describe('/POST Register', () => {
    test('It should POST information to register new account on the database', async () => {
      const information = {
        fullName: 'Unit Test Account',
        email: 'me@unittest.com',
        password: 'myPassword@123',
        passwordConfirm: 'myPassword@123',
      };
      await request(server)
        .post(`/http/api/users/register`)
        .send(information)
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('success');
          expect(res._body.message).toEqual(
            'Verification email have been sent to your email address!'
          );

          const user = await User.findOne({
            email: information.email,
          });
          expect(user).toBeTruthy();
          expect(user.fullName).toEqual(information.fullName);
          expect(user.email).toEqual(information.email);

          await User.findByIdAndDelete(user._id);
        });
    });

    test('It should PUSH AN ERROR when POST information to register new account on the database with registered email before', async () => {
      const information = {
        fullName: 'Unit Test Account',
        email: 'emckissack0@cloudflare.com',
        password: 'myPassword@123',
        passwordConfirm: 'myPassword@123',
      };
      await request(server)
        .post(`/http/api/users/register`)
        .send(information)
        .expect(409)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('User is already registered!');
        });
    });

    test('It should PUSH AN ERROR when POST information to register new account on the database but have not defined one required field', async () => {
      const information = {
        fullName: 'Unit Test Account',
        password: 'myPassword@123',
        passwordConfirm: 'myPassword@123',
      };
      await request(server)
        .post(`/http/api/users/register`)
        .send(information)
        .expect(400)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'Invalid input data. Please provide a email address'
          );
        });
    });
  });

  describe('/POST Login', () => {
    test('It should POST information to get account login information from the the database', async () => {
      const account = {
        email: 'emckissack0@cloudflare.com',
        password: 'Linhnguyen0123@',
      };
      await request(server)
        .post(`/http/api/users/login`)
        .send(account)
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.token).toBeTruthy();
          expect(res.body.data.user.email).toEqual(account.email);
        });
    });

    test('It should PUSH AN ERROR when POST wrong information to get account login information from the database', async () => {
      const account = {
        email: 'emckissack0@cloudflare.com',
        password: 'Emckissack0@123',
      };
      await request(server)
        .post(`/http/api/users/login`)
        .send(account)
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            `Incorrect Email, Password or Your Account haven't been Confirmed!`
          );
        });
    });

    test('It should PUSH AN ERROR when POST information to get account login information from the database but the account of the provided information is deactivated', async () => {
      const account = {
        email: 'rviger1c@microsoft.com',
        password: 'Linhnguyen0123@',
      };
      await request(server)
        .post(`/http/api/users/login`)
        .send(account)
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            `Your account have been deactivated! please sent an email to support@BookSharing.io for reactivate your account`
          );
        });
    });

    test('It should PUSH AN ERROR when POST information to get account login information from the database but have not defined one required field', async () => {
      const account = {
        password: 'Emckissack0@123',
      };
      await request(server)
        .post(`/http/api/users/login`)
        .send(account)
        .expect(400)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'Please provide your email and password!'
          );
        });
    });
  });

  describe('/GET Logout', () => {
    test('It should GET logout cookie from the server to logging out user from the system', async () => {
      await request(server)
        .get(`/http/api/users/logout`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.message).toEqual('You have logged out!');
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET logout cookie from the server', async () => {
      await request(server)
        .get(`/http/api/users/logout`)
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
  });

  describe('/PATCH Account Information Update', () => {
    test('It should PATCH information of logged in user account', async () => {
      await request(server)
        .patch(`/http/api/users/updateMyInfo`)
        .set({ Authorization: `Bearer ${userToken}` })
        .attach('photo', 'tests/files/profileImageTesting.png')
        .field('fullName', 'Testing User fullName')
        .field('gender ', 'male')
        .field('phoneNumber', '0985687536')
        .field('dateOfBirth', '2022-09-23')
        .field('address', 'Testing User Address')
        .field('country', 'Testing User Country')
        .field('city', 'Testing User City')
        .field('zipCode', '34999')
        .field('specialization', 'Testing User Specialization')
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(typeof res.body.data.user === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.data.user.fullName).toEqual('Testing User fullName');
          expect(res.body.data.user.gender).toEqual('male');
          expect(res.body.data.user.phoneNumber).toEqual('0985687536');
          expect(res.body.data.user.address).toEqual('Testing User Address');
          expect(res.body.data.user.country).toEqual('Testing User Country');
          expect(res.body.data.user.city).toEqual('Testing User City');
          expect(res.body.data.user.zipCode).toEqual(34999);
          expect(res.body.data.user.specialization).toEqual(
            'Testing User Specialization'
          );

          const user = await User.findOne({
            _id: res.body.data.user._id,
          });
          expect(user).toBeTruthy();
          expect(user.fullName).toEqual('Testing User fullName');
          expect(user.gender).toEqual('male');
          expect(user.phoneNumber).toEqual('0985687536');
          expect(user.address).toEqual('Testing User Address');
          expect(user.country).toEqual('Testing User Country');
          expect(user.city).toEqual('Testing User City');
          expect(user.zipCode).toEqual(34999);
          expect(user.specialization).toEqual('Testing User Specialization');

          await User.findByIdAndUpdate(
            res.body.data.user._id,
            {
              fullName: 'Greer Hug',
              gender: 'male',
              address: '8 Packers Place',
              city: 'Bradenton',
              phoneNumber: '0986583654',
              zipCode: 26833,
              country: 'United States',
              specialization: 'Senior Sales Associate',
              photo:
                'https://robohash.org/eumnostrumvoluptatum.png?size=50x50&set=set1',
              dateOfBirth: '1984-11-03', //1984-11-03T14:34:23.000+00:00
            },
            {
              new: true,
              runValidators: true,
            }
          );
        });
    });

    test('It should PUSH AN ERROR when PATCH information of logged in user account with wrong image file', async () => {
      await request(server)
        .patch(`/http/api/users/updateMyInfo`)
        .set({ Authorization: `Bearer ${userToken}` })
        .attach('photo', 'tests/files/bookFileTesting.pdf')
        .expect(400)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'Not an valid image! Please upload only images.'
          );
        });
    });

    test('It should PUSH AN ERROR when user PATCH password in account information update route', async () => {
      await request(server)
        .patch(`/http/api/users/updateMyInfo`)
        .set({ Authorization: `Bearer ${userToken}` })
        .field('password', 'NOTUPDATEHERE')
        .expect(400)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'This route is not for password updates. Please use /updateMyPassword.'
          );
        });
    });

    test('It should PUSH AN ERROR when user PATCH email in account information update route', async () => {
      await request(server)
        .patch(`/http/api/users/updateMyInfo`)
        .set({ Authorization: `Bearer ${userToken}` })
        .field('email', 'NOTUPDATEHERE@mail.com')
        .expect(400)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'This route is not for email updates. Please use /updateMyEmail.'
          );
        });
    });

    test('It should PUSH AN ERROR when non logged in user PATCH account information', async () => {
      await request(server)
        .patch(`/http/api/users/updateMyInfo`)
        .field('fullName', 'Testing User fullName')
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
  });

  describe('/PATCH Password Update', () => {
    test('It should PATCH new password of logged in user account', async () => {
      const newPassword = {
        currentPassword: 'newPassword@123',
        newPassword: 'newPassword@123',
        passwordConfirm: 'newPassword@123',
      };
      await request(server)
        .patch(`/http/api/users/updateMyPassword`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(newPassword)
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.success).toBeTruthy();
          expect(res.body.message).toEqual(
            'Your account password was updated! Please log in again'
          );
        });
    });

    test('It should PUSH AN ERROR when user PATCH new password for account but provided wrong current password', async () => {
      const newPassword = {
        currentPassword: 'newPassword@1234',
        newPassword: 'newPassword@123',
        passwordConfirm: 'newPassword@123',
      };
      await request(server)
        .patch(`/http/api/users/updateMyPassword`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(newPassword)
        .expect(401)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'Your current password is wrong!. Please try again'
          );
        });
    });

    test('It should PUSH AN ERROR when user PATCH new password for account but new password and password confirm field are not the same', async () => {
      const newPassword = {
        currentPassword: 'newPassword@123',
        newPassword: 'newPassword@123',
        passwordConfirm: 'newPassword@1234',
      };
      await request(server)
        .patch(`/http/api/users/updateMyPassword`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(newPassword)
        .expect(400)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'Invalid input data. Password and Password Confirm are not the same!'
          );
        });
    });

    test('It should PUSH AN ERROR when non logged in user PATCH new password for account', async () => {
      const newPassword = {
        currentPassword: 'newPassword@123',
        newPassword: 'newPassword@123',
        passwordConfirm: 'newPassword@123',
      };
      await request(server)
        .patch(`/http/api/users/updateMyPassword`)
        .send(newPassword)
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
  });

  describe('/PATCH Email Update', () => {
    test('It should PATCH new email of logged in user account', async () => {
      const newEmail = {
        email: 'newemail@cnbc.com',
      };
      await request(server)
        .patch(`/http/api/users/updateMyEmail`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(newEmail)
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.message).toEqual(
            'Verification email have been sent to your email address!'
          );
        });

      const user = await User.findOne({
        email: newEmail.email,
      });
      expect(user).toBeTruthy();
      expect(user.email).toEqual(newEmail.email);

      await User.findByIdAndUpdate(
        user._id,
        {
          email: 'ghug1h@cnbc.com',
          isConfirmed: true,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    });

    test('It should PUSH AN ERROR when user PATCH new email but the new email provided have been using on another account', async () => {
      const newEmail = {
        email: 'ghug1h@cnbc.com',
      };
      await request(server)
        .patch(`/http/api/users/updateMyEmail`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send(newEmail)
        .expect(409)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'That email have been already used by another user or duplicate with the old one in your account'
          );
        });
    });

    test('It should PUSH AN ERROR when non logged in user PATCH new password for account', async () => {
      const newEmail = {
        email: 'newemail@cnbc.com',
      };
      await request(server)
        .patch(`/http/api/users/updateMyEmail`)
        .send(newEmail)
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
  });

  describe('/PATCH Account Deactivation', () => {
    test('It should PATCH a request to deactivate logged in user account', async () => {
      await request(server)
        .patch(`/http/api/users/deactivateAccount`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.message).toEqual(
            'User account is deactivated successfully!'
          );
        });

      const user = await User.findOne({
        email: 'ghug1h@cnbc.com',
      });
      expect(user).toBeTruthy();
      expect(user.active).toEqual(false);

      await User.findByIdAndUpdate(
        user._id,
        {
          email: 'ghug1h@cnbc.com',
          active: true,
          isConfirmed: false,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    });

    test('It should PUSH AN ERROR when non logged in user PATCH a request to deactivate account', async () => {
      await request(server)
        .patch(`/http/api/users/deactivateAccount`)
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
  });

  describe('/POST Forgot Password', () => {
    test('It should POST a request to receive email for recovery account password', async () => {
      const account = {
        email: 'ghug1h@cnbc.com',
      };
      await request(server)
        .post(`/http/api/users/forgotPassword`)
        .send(account)
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.message).toEqual(
            'Password reset token have been sent to your email address!'
          );

          const user = await User.findOne({
            email: 'ghug1h@cnbc.com',
          });
          expect(user).toBeTruthy();
          expect(user.emailVerificationToken).toBeTruthy();

          await User.findByIdAndUpdate(
            user._id,
            {
              passwordResetExpires: null,
              passwordResetToken: null,
            },
            {
              new: true,
              runValidators: true,
            }
          );
        });
    });

    test('It should PUSH AN ERROR when POST wrong information to receive email for recovery account password', async () => {
      const account = {
        email: 'abcdxyz@lmnts.com',
      };
      await request(server)
        .post(`/http/api/users/forgotPassword`)
        .send(account)
        .expect(404)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
        });
    });
  });

  describe('/POST Email Verification', () => {
    test('It should POST a request to receive email for verifying account', async () => {
      const account = {
        email: 'ghug1h@cnbc.com',
      };
      await request(server)
        .post(`/http/api/users/sendEmailVerification`)
        .send(account)
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.message).toEqual(
            'Verification email have been sent to your email address!'
          );

          const user = await User.findOne({
            email: 'ghug1h@cnbc.com',
          });
          expect(user).toBeTruthy();
          expect(user.emailVerificationToken).toBeTruthy();

          await User.findByIdAndUpdate(
            user._id,
            {
              emailVerificationToken: null,
              isConfirmed: true,
            },
            {
              new: true,
              runValidators: true,
            }
          );
        });
    });

    test('It should PUSH AN ERROR when POST wrong information to receive email for verifying account', async () => {
      const account = {
        email: 'abcdxyz@lmnts.com',
      };
      await request(server)
        .post(`/http/api/users/sendEmailVerification`)
        .send(account)
        .expect(404)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
        });
    });

    test('It should PUSH AN ERROR when POST a request receive email for verifying account but that provided account is already confirmed', async () => {
      const account = {
        email: 'abcdxyz@lmnts.com',
      };
      await request(server)
        .post(`/http/api/users/sendEmailVerification`)
        .send(account)
        .expect(404)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
        });
    });
  });
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
});
