/* eslint-disable */
const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const Book = require('../models/bookModel');
const { deleteFromCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

//npm run start:test book.test.js

let adminToken;
let managerToken;
let userToken;
beforeEach(async () => {
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

describe('Book', () => {
  describe('/GET Books', () => {
    test('It should GET all the books on the database', async () => {
      await request(server)
        .get('/http/api/books')
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(Array.isArray(res.body.data.books)).toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET all the books on the database', async () => {
      await request(server)
        .get('/http/api/books')
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

  describe('/GET Book', () => {
    test('It should GET a book on the database based on the provided id', async () => {
      const bookId = '630d799e8357beaf95fad758';
      await request(server)
        .get(`/http/api/books/${bookId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.data.book._id).toEqual(bookId);
        });
    });

    test('It should PUSH AN ERROR when GET a book that not existing on the database based on the provided id', async () => {
      const bookId = '63181d05b6deed98a6c797f9';
      await request(server)
        .get(`/http/api/books/${bookId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No book found with that ID!');
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET the book on the database', async () => {
      const bookId = '63181d05b6deed98a6c797f9';
      await request(server)
        .get(`/http/api/books/${bookId}`)
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

  describe('/GET Book Document File', () => {
    test('It should GET the document file of book on the database based on the provided id', async () => {
      const bookId = '63196a4e5a17de3cc0469b9d';
      await request(server)
        .get(`/http/api/books/reading/${bookId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(200)
        .then((res) => {
          expect(res.type).toEqual('application/pdf');
          expect(Buffer.isBuffer(res._body)).toBeTruthy();
        });
    });

    test('It should PUSH AN ERROR when GET the document file of book that not existing on the database based on the provided id', async () => {
      const bookId = '63181d05b6deed98a6c797f9';
      await request(server)
        .get(`/http/api/books/reading/${bookId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');

          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No book found with that ID!');
        });
    });

    test(`It should PUSH AN ERROR when user GET the document file of book but haven't buy that book before`, async () => {
      const bookId = '630d799e8357beaf95fad805';
      await request(server)
        .get(`/http/api/books/reading/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');

          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No book found with that ID!');
        });
    });

    test('It should PUSH AN ERROR when non logged in user GET the document file of book on the database', async () => {
      const bookId = '63181d05b6deed98a6c797f9';
      await request(server)
        .get(`/http/api/books/reading/${bookId}`)
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

  describe('/POST Book', () => {
    test('It should POST a new book to the database', async () => {
      await request(server)
        .post(`/http/api/books`)
        .set({ Authorization: `Bearer ${userToken}` })
        .attach('bookFile', 'tests/files/bookFileTesting.pdf')
        .attach('bookCover', 'tests/files/bookCoverTesting.png')
        .field('bookTitle', 'Testing New Book')
        .field('price', 50)
        .field(
          'summary',
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa'
        )
        .field(
          'description',
          'Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.'
        )
        .field('tags', '630447a68492077f82c19d99')
        .expect(201)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(typeof res.body.data === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.data.book.bookTitle).toEqual('Testing New Book');
          expect(res.body.data.book.price).toEqual(50);
          expect(res.body.data.book.summary).toEqual(
            'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa'
          );
          expect(res.body.data.book.description).toEqual(
            'Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.'
          );

          const newBook = await Book.findOne({
            _id: res.body.data.book._id,
          });
          expect(newBook).toBeTruthy();
          expect(newBook.bookTitle).toEqual('Testing New Book');
          expect(newBook.price).toEqual(50);
          expect(newBook.summary).toEqual(
            'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa'
          );
          expect(newBook.description).toEqual(
            'Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.'
          );

          await Book.findByIdAndDelete(newBook._id);
          await deleteFromCloudinary(newBook.bookCoverPublicId);
          await fs.unlink(`public/booksDocument/${newBook.bookFile}`, (err) => {
            if (err) console.log('ERROR DELETING TESTING BOOK FILE!');
          });
        });
    });

    test('It should PUSH AN ERROR when POST a new book that have the same name with another one user submitted on the database', async () => {
      await request(server)
        .post(`/http/api/books`)
        .set({ Authorization: `Bearer ${userToken}` })
        .attach('bookFile', 'tests/files/bookFileTesting.pdf')
        .attach('bookCover', 'tests/files/bookCoverTesting.png')
        .field('bookTitle', 'C Programming Tutorial')
        .field('price', 50)
        .field(
          'summary',
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa'
        )
        .field(
          'description',
          'Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.'
        )
        .field('tags', '630447a68492077f82c19d99')
        .expect(409)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'Name of the book is duplicate with your another book!'
          );
        });
    });

    test('It should PUSH AN ERROR when POST a new book with wrong cover and document file', async () => {
      await request(server)
        .post(`/http/api/books`)
        .set({ Authorization: `Bearer ${userToken}` })
        .attach('bookFile', 'tests/files/TEST.txt')
        .attach('bookCover', 'tests/files/TEST.txt')
        .expect(400)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(res.body.status).toEqual('fail');
          expect(res.body.message).toEqual(
            'Not valid files! Please upload images for Book Cover and pdf for Book'
          );
        });
    });

    test('It should PUSH AN ERROR when POST a new book to the database but have not defined one required field', async () => {
      await request(server)
        .post(`/http/api/books`)
        .set({ Authorization: `Bearer ${userToken}` })
        .attach('bookFile', 'tests/files/bookFileTesting.pdf')
        .attach('bookCover', 'tests/files/bookCoverTesting.png')
        .field('bookTitle', 'Testing New Book')
        .field(
          'summary',
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa'
        )
        .field(
          'description',
          'Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.'
        )
        .field('tags', '630447a68492077f82c19d99')
        .expect(400)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You must specify all required field! (Title, Summary, Description, Tags, Price)'
          );
        });
    });

    test('It should PUSH AN ERROR when non logged in user POST a new book', async () => {
      await request(server)
        .post(`/http/api/books`)
        .field('bookTitle', 'Testing New Book')
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

  describe('/DELETE Book', () => {
    test('It should DELETE a specific book on the database', async () => {
      fs.copyFile(
        'tests/files/bookFileTesting.pdf',
        'public/booksDocument/bookFileTesting.pdf',
        (err) => {
          if (err)
            return next(
              new AppError(`Problem when upload book! Please try again`, 400)
            );
        }
      );

      const book = await Book.create({
        bookTitle: 'Testing Book Delete',
        author: '62f5d118fc13ae547b00023b',
        createdAt: Date.now(),
        summary: 'Unit Test Book Delete Summary',
        description: 'Unit Test Book Delete Description',
        approvingStatus: 'approved',
        bookCover: 'http://dummyimage.com/800x1280.png/cc0000/ffffff',
        price: 30,
        tags: ['6304489b8492077f82c19ddd'],
        bookFile: 'bookFileTesting.pdf',
        bookCoverPublicId: 'testingBookCoverPublicId',
      });

      await request(server)
        .delete(`/http/api/books/${book._id}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(204);
    });

    test('It should PUSH AN ERROR when DELETE a book that not existing on the database based on the provided id', async () => {
      const bookId = '630d799e8357beaf95fad458';
      await request(server)
        .delete(`/http/api/books/${bookId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .expect(404)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual('No book found with that ID');
        });
    });

    test('It should PUSH AN ERROR when author of book DELETE a book that are published based on the provided id', async () => {
      const bookId = '630d799e8357beaf95fad819';
      await request(server)
        .delete(`/http/api/books/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(403)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            `Book has been published can't be deleted! Submit a ticket for more information!`
          );
        });
    });

    test('It should PUSH AN ERROR when non logged in user DELETE a specific book', async () => {
      const bookId = '630d799e8357beaf95fad458';
      await request(server)
        .delete(`/http/api/books/${bookId}`)
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

    test(`It should PUSH AN ERROR when user whom don't have permission DELETE a specific book`, async () => {
      const bookId = '630d799e8357beaf95fad458';
      await request(server)
        .delete(`/http/api/books/${bookId}`)
        .set({ Authorization: `Bearer ${managerToken}` })
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

  describe('/PATCH Book', () => {
    test('It should PATCH a book on the database', async () => {
      fs.copyFile(
        'tests/files/bookFileTesting.pdf',
        'public/booksDocument/bookFileTesting.pdf',
        (err) => {
          if (err)
            return next(
              new AppError(`Problem when upload book! Please try again`, 400)
            );
        }
      );

      const oldBook = await Book.create({
        bookTitle: 'Testing Book',
        author: '62f5d118fc13ae547b00023b',
        createdAt: Date.now(),
        summary: 'Unit Test Book Summary',
        description: 'Unit Test Book Description',
        approvingStatus: 'pending',
        bookCover: 'http://dummyimage.com/800x1280.png/cc0000/ffffff',
        price: 30,
        tags: ['6304489b8492077f82c19ddd'],
        bookFile: 'bookFileTesting.pdf',
        bookCoverPublicId: 'testBookCoverPublicId',
      });

      await request(server)
        .patch(`/http/api/books/${oldBook._id}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .attach('bookFile', 'tests/files/bookFileTestingUpdate.pdf')
        .attach('bookCover', 'tests/files/bookCoverTestingUpdate.png')
        .field('bookTitle', 'Testing Update Book')
        .field('price', 60)
        .field(
          'summary',
          'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout'
        )
        .field(
          'description',
          'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.'
        )
        .field('tags', '63045283f8418d3ea90b24f4')
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(typeof res.body.data === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.data.book.bookTitle).toEqual('Testing Update Book');
          expect(res.body.data.book.price).toEqual(60);
          expect(res.body.data.book.summary).toEqual(
            'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout'
          );
          expect(res.body.data.book.description).toEqual(
            'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.'
          );

          const book = await Book.findOne({
            _id: res.body.data.book._id,
          });
          expect(book).toBeTruthy();
          expect(book.bookTitle).toEqual('Testing Update Book');
          expect(book.price).toEqual(60);
          expect(book.summary).toEqual(
            'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout'
          );
          expect(book.description).toEqual(
            'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.'
          );

          await deleteFromCloudinary(book.bookCoverPublicId);
          await fs.unlink(`public/booksDocument/${book.bookFile}`, (err) => {
            if (err) console.log('ERROR DELETING TESTING BOOK FILE!');
          });
          await Book.findByIdAndDelete(book._id);
        });
    });

    test('It should PUSH AN ERROR when PATCH a book on the database but have not defined one required field', async () => {
      fs.copyFile(
        'tests/files/bookFileTesting.pdf',
        'public/booksDocument/bookFileTesting.pdf',
        (err) => {
          if (err)
            return next(
              new AppError(`Problem when upload book! Please try again`, 400)
            );
        }
      );

      const oldBook = await Book.create({
        bookTitle: 'Testing Book',
        author: '62f5d118fc13ae547b00023b',
        createdAt: Date.now(),
        summary: 'Unit Test Book Summary',
        description: 'Unit Test Book Description',
        approvingStatus: 'pending',
        bookCover: 'http://dummyimage.com/800x1280.png/cc0000/ffffff',
        price: 30,
        tags: ['6304489b8492077f82c19ddd'],
        bookFile: 'bookFileTesting.pdf',
        bookCoverPublicId: 'testBookCoverPublicId',
      });

      await request(server)
        .patch(`/http/api/books/${oldBook._id}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .attach('bookFile', 'tests/files/bookFileTesting.pdf')
        .attach('bookCover', 'tests/files/bookCoverTesting.png')
        .field('bookTitle', 'Testing New Book')
        .field(
          'summary',
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa'
        )
        .field(
          'description',
          'Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.'
        )
        .field('tags', '630447a68492077f82c19d99')
        .expect(400)
        .then((res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'You must specify all required field! (Title, Summary, Description, Tags, Price)'
          );
        });

      await Book.findByIdAndDelete(oldBook._id);
      await deleteFromCloudinary(oldBook.bookCoverPublicId);
      await fs.unlink(`public/booksDocument/${oldBook.bookFile}`, (err) => {
        if (err) console.log('ERROR DELETING TESTING BOOK FILE!');
      });
    });

    test('It should PUSH AN ERROR when PATCH a book that not existing on the database based on the provided id', async () => {
      const bookId = '630d799e8357beaf95fad458';
      await request(server)
        .patch(`/http/api/books/${bookId}`)
        .set({ Authorization: `Bearer ${adminToken}` })
        .field('bookTitle', 'Testing New Book')
        .expect(404)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'Book does not exist! Please try again'
          );
        });
    });

    test('It should PUSH AN ERROR when author of book PATCH a book that are published based on the provided id', async () => {
      const bookId = '63196a4e5a17de3cc0469b9d';
      await request(server)
        .patch(`/http/api/books/${bookId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .field('bookTitle', 'Testing New Book')
        .expect(403)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'Your book has been published! You need to submit a support request if you want to editing published book'
          );
        });
    });

    test('It should PUSH AN ERROR when non logged in user PATCH a book on the database', async () => {
      const bookId = '630d799e8357beaf95fad458';
      await request(server)
        .patch(`/http/api/books/${bookId}`)
        .field('bookTitle', 'Testing New Book')
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

    test(`It should PUSH AN ERROR when user whom don't have permission PATCH a specific book`, async () => {
      const bookId = '630d799e8357beaf95fad458';
      await request(server)
        .patch(`/http/api/books/${bookId}`)
        .set({ Authorization: `Bearer ${managerToken}` })
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

  describe('/PATCH Approving Status', () => {
    test('It should PATCH a book approving status on the database', async () => {
      fs.copyFile(
        'tests/files/bookFileTesting.pdf',
        'public/booksDocument/bookFileTesting.pdf',
        (err) => {
          if (err)
            return next(
              new AppError(`Problem when upload book! Please try again`, 400)
            );
        }
      );

      const newBook = await Book.create({
        bookTitle: 'Testing Book',
        author: '62f5d118fc13ae547b00023b',
        createdAt: Date.now(),
        summary: 'Unit Test Book Summary',
        description: 'Unit Test Book Description',
        approvingStatus: 'pending',
        bookCover: 'http://dummyimage.com/800x1280.png/cc0000/ffffff',
        price: 30,
        tags: ['6304489b8492077f82c19ddd'],
        bookFile: 'bookFileTesting.pdf',
        bookCoverPublicId: 'testBookCoverPublicId',
      });

      await request(server)
        .patch(`/http/api/books/setBookStatus/${newBook._id}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .send({ status: 'approved', reason: 'Book Status Approved' })
        .expect(200)
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res.body === 'object').toBeTruthy();
          expect(typeof res.body.data === 'object').toBeTruthy();
          expect(res.body.status).toEqual('success');
          expect(res.body.data.book.approvingStatus).toEqual('approved');

          const book = await Book.findOne({
            _id: res.body.data.book._id,
          });
          expect(book).toBeTruthy();
          expect(book.approvingStatus).toEqual('approved');

          await deleteFromCloudinary(book.bookCoverPublicId);
          await fs.unlink(`public/booksDocument/${book.bookFile}`, (err) => {
            if (err) console.log('ERROR DELETING TESTING BOOK FILE!');
          });
          await Book.findByIdAndDelete(book._id);
        });
    });

    test('It should PUSH AN ERROR when PATCH a book that not existing on the database based on the provided id', async () => {
      const bookId = '630d799e8357beaf95fad458';
      await request(server)
        .patch(`/http/api/books/setBookStatus/${bookId}`)
        .set({ Authorization: `Bearer ${managerToken}` })
        .send({ status: 'approved', reason: 'Book Status Approved' })
        .then(async (res) => {
          expect(res.type).toEqual('application/json');
          expect(typeof res._body === 'object').toBeTruthy();
          expect(res._body.status).toEqual('fail');
          expect(res._body.message).toEqual(
            'Book does not exist! Please try again'
          );
        });
    });

    test('It should PUSH AN ERROR when non logged in user PATCH a book on the database', async () => {
      const bookId = '630d799e8357beaf95fad458';
      await request(server)
        .patch(`/http/api/books/setBookStatus/${bookId}`)
        .send({ status: 'approved', reason: 'Book Status Approved' })
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

    test(`It should PUSH AN ERROR when user whom don't have permission PATCH a book on the database`, async () => {
      const bookId = '630d799e8357beaf95fad458';
      await request(server)
        .patch(`/http/api/books/setBookStatus/${bookId}`)
        .send({ status: 'approved', reason: 'Book Status Approved' })
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
