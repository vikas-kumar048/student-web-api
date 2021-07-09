/** @format */

let express = require("express");
let app = express();
const MongoClient = require("mongodb").MongoClient;
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Authorization, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  next();
});
// please provide your the database link here
const url = "Your url for the database";
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
const client = new MongoClient(url, connectionParams);

app.get("/text", function (req, res) {
  let record = {
    id: 1,
    name: "Vikas",
    email: "vikas@email.com",
    scores: {
      first_round: 8,
      second_round: 9,
      third_round: 5,
    },
  };
  client.connect(function (err, client) {
    const db = client.db("student_test");
    db.collection("students_info").updateOne(
      { id: 1 },
      { $set: record },
      function (er, resp) {
        res.send(resp);
      }
    );
  });
});

app.post("/student", function (req, res) {
  const body = req.body;
  if (!body.name || body.name == "") res.sendStatus(400);
  if (!body.email || body.email == "") res.sendStatus(400);
  const record = {
    name: body.name,
    email: body.email,
    scores: {
      first_round: null,
      second_round: null,
      third_round: null,
    },
  };
  client.connect(function (err, client) {
    const db = client.db("student_test");
    db.collection("students_info").insertOne(record, function (er, resp) {
      res.send(resp);
      if (err) res.sendStatus(500);
    });
  });
});
app.put("/student", function (req, res) {
  let body = req.body;
  if (!body.email || body.email == "") res.sendStatus(400);
  if (!body.scores) res.sendStatus(400);
  console.log(body);
  client.connect(function (err, client) {
    const db = client.db("student_test");
    db.collection("students_info").updateOne(
      { email: body.email },
      { $set: { scores: body.scores } },
      function (err, result) {
        if (!err) res.send(result);
      }
    );
  });
});
app.get("/highest", function (req, res) {
  client.connect(function (err, client) {
    const db = client.db("student_test");
    db.collection("students_info")
      .find()
      .toArray(function (er, result) {
        if (!er) {
          let highest_st = result.reduce((acc, cur) => {
            let avg_score =
              cur.scores.first_round +
              cur.scores.second_round +
              cur.scores.third_round;
            if (acc < avg_score) return avg_score;
            else return acc;
          }, 0);
          let candidate = result.find(
            (cand) =>
              cand.scores.first_round +
                cand.scores.second_round +
                cand.scores.third_round ===
              highest_st
          );
          res.send(candidate);
        }
      });
  });
});

app.get("/average-scores", function (req, res) {
  client.connect(function (err, client) {
    const db = client.db("student_test");
    db.collection("students_info")
      .find()
      .toArray(function (er, result) {
        if (!er) {
          result = result.map((cand) => {
            let avg_score =
              cand.scores.first_round +
              cand.scores.second_round +
              cand.scores.third_round;
            avg_score = (avg_score / 3).toFixed(2);
            return { name: cand.name, avgScore: avg_score };
          });
          res.send(result);
        }
      });
  });
});

const port = process.env.PORT || 2450;
app.listen(port, () => console.log("Listening on port:", port));
