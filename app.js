const express = require("express");
const createError = require("http-errors");
var firebase = require("firebase");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
app.use(morgan("dev"));
//middleware set
app.use(express.json());

//CURS SET
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  //restricted link - https://leacturedot.herokuapp.com
  res.header("Access-Control-Allow-Origin", "*");

  // Request headers you wish to allow
  res.header(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization"
  );

  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  if (req.method === "OPTIONS") {
    // Request methods you wish to allow
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    return res.status(200).json({});
  }
  // Pass to next layer of middleware
  next();
});
//END curs
//firebase environment
const fire = firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY, // Auth / General Use
  appId: process.env.REACT_APP_FIREBASE_APP_ID, // General Use
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID, // General Use
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN, // Auth with popup/redirect
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL, // Realtime Database
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET, // Storage
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID, // Cloud Messaging
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID, // Analytics
});
const auth = fire.auth();
const database = fire.database();
//end firebase
//route part
app.get("/data", async (req, res, next) => {
  try {
    res.json({ data: "data send" });
  } catch (error) {
    next(error);
  }
});
// functions
const userData = async (data, uid) => {
  await database.ref(`Users/${uid}/`).set(data);
  return 1;
};
const mentor = async (data, uid) => {
  await database.ref(`Mentors/${uid}/`).set(data);
  return 1;
};

//function end
//for stall entry
app.post("/", async (req, res, next) => {
  try {
    const {
      email,
      password,
      fullName,
      designation,
      about,
      info,
      profileImage,
      category,
      gender,
      phoneNumber,
    } = req.body;
    if (!email || !password)
      throw createError.BadRequest(
        "Email,password and role, All three field are required.."
      );
    const response = await auth.createUserWithEmailAndPassword(email, password);
    const setInUser = {
      email,
      password,
      fullName,
      designation,
      about,
      info,
      profileImage,
      category,
      role: "Mentor",
      gender,
      phoneNumber,
    };
    const saveUserData = await userData(setInUser, response.user.uid);
    if (!saveUserData) throw createError.Forbidden("User data is not save...");
    const rawData = {
      about,
      info,
    };
    const saveInMentor = await mentor(rawData, response.user.uid);
    if (!saveInMentor)
      throw createError.Forbidden("Data is not save in mentor data base...");
    res.json({ data: "data save successful...", uid: response.user.uid });
  } catch (error) {
    if (error.status === 500) {
      error.status = 400;
      next(error);
    } else {
      next(error);
    }
  }
});
//route end
//error handel
app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 400);
  res.send({
    error: {
      status: err.status || 400,
      message: err.message,
    },
  });
});
//error handel end
//port manage
app.listen(process.env.PORT || 4000, () => {
  console.log("5000 port is ready to start");
});
