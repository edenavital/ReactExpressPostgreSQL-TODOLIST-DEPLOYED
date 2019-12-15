const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pg = require("pg");
const morgan = require("morgan");

const app = express();

const pool = new pg.Pool({
  user: "postgres",
  database: "postgres",
  password: "1a2d3i4",
  host: "localhost",
  port: 5432,
  max: 10
});

const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/api/todos", (req, res) => {
  //Call back function - Connect to the pool of clients of the database if it's not full
  //If the pool is not full, a new client will be created. db - A new client inside the database, done is a release function
  pool.connect((err, db, done) => {
    if (err) {
      return res.status(400).send(err);
    }

    db.query("SELECT * from todolist", (err, table) => {
      done();
      if (err) {
        return res.status(400).send(err);
      }
      return res.status(200).send(table.rows);
    });
  });
});

// Post a new TODO item
app.post("/api/postTodo", (req, res) => {
  console.log(req.body);

  const title = req.body.title;
  const description = req.body.description;
  const values = [title, description];

  pool.connect((err, db, done) => {
    if (err) return res.status(400).send(err);

    db.query(
      "INSERT INTO todolist (title, description) VALUES($1, $2)",
      [...values],
      err => {
        done();
        if (err) return res.status(400).send(err);

        console.log("INSERTED DATA SUCCESSFULLY");
        res.status(201).send({ msg: "Data inserted!" });
      }
    );
  });
});

app.listen(PORT, () => console.log("Listening on port " + PORT));
