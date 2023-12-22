/* istanbul ignore file */
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const tagRouter = require('./routes/tagRoutes');
const bookRouter = require('./routes/bookRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const statisticsRouter = require('./routes/statisticsRoutes');
const conversationRouter = require('./routes/conversationRoutes');
const messageRouter = require('./routes/messageRoutes');

const app = express();

//swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookSharing - API Documentation',
      version: '1.0.0',
      description:
        'This is a REST API documentation application made with Express, SwaggerUIExpress and SwaggerJsDoc.',
      license: {
        name: 'Licensed Under MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'BookSharing - Github Repository',
        url: 'https://github.com/Phuc05032001/BookSharing',
      },
    },
    servers: [
      {
        url: 'http://127.0.0.1:8000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};
const openApiSpecification = swaggerJsdoc(options);

//critital middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
// Add headers before the routes are defined
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});
app.use(express.json());
app.use(cookieParser());

//ROUTES
app.use(
  '/http/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(openApiSpecification)
);
app.use('/http/api/users', userRouter);
app.use('/http/api/tags', tagRouter);
app.use('/http/api/books', bookRouter);
app.use('/http/api/transactions', transactionRouter);
app.use('/http/api/reviews', reviewRouter);
app.use('/http/api/statistics', statisticsRouter);
app.use('/http/api/support/conversation', conversationRouter);
app.use('/http/api/support/message', messageRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
