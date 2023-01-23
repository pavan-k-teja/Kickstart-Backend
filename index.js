const express        = require('express');
const mongoose       = require('mongoose');
const dotenv         = require('dotenv');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const session        = require('express-session');
const MongoDBStore   = require('connect-mongodb-session')(session);
const cors           = require('cors');
const morgan         = require('morgan');
const fs             = require('fs');
const path           = require('path');
const yaml           = require('yamljs');
const swaggerui      = require('swagger-ui-express');
const swaggerDoc     = yaml.load(path.join(__dirname, "api.yaml"));

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
});
// Parsing .env File
dotenv.config();

app.use(express.json());
app.use(cors());
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan(':method :url :status :date[iso] :response-time ms', { stream: accessLogStream}));
app.use(morgan(':method :url :status :date[iso] :response-time ms'));

// Two routes
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false,
    store: store
  }))

// Two Routes
app.get("/healthcheck", (req, res) => {
  const healthcheck = {
		uptime: process.uptime(),
		message: 'OK',
		timestamp: Date.now()
	};
	try {
		res.send(healthcheck);
	} catch (e) {
		healthcheck.message = e;
		res.status(503).send();
	}
});
app.use('/apidocs', swaggerui.serve, swaggerui.setup(swaggerDoc));
app.use("/admin",adminRoutes);
app.use("/user",userRoutes);


mongoose
  .connect(process.env.MONGODB_URI)
  .then(result => {
    app.listen(process.env.PORT || 5003);
    console.log(`Server started on Port ${process.env.PORT}`);
  })
  .catch(err => {
    console.log(err);
  });

module.exports = app;