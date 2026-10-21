require('dotenv').config();
var cors = require('cors');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
//var session = require('express-session');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usuariosRouter = require('./routes/Usuario');
var classificacaoRouter = require('./routes/classificacao');
var itemRouter = require("./routes/item");
var app = express();
//var sessionSecret = process.env.SESSION_SECRET;
//var allowedOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
//  .split(',')
//  .map(function(origin) { return origin.trim(); })
//  .filter(Boolean);

//if (!sessionSecret && process.env.NODE_ENV === 'production') {
//  throw new Error('SESSION_SECRET precisa ser definido em produção.');
//}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/usuarios', usuariosRouter);
app.use('/Usuarios', usuariosRouter);
app.use('/classificacao', classificacaoRouter);
app.use('/Classificacao', classificacaoRouter);
app.use('/item', itemRouter);
app.use('/itens', itemRouter);
app.use('/Itens', itemRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;