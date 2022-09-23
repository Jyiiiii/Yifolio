const express = require("express");
const expressHandlebars = require("express-handlebars");
// const data = require("./data.js");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");

const database = new sqlite3.Database("Yifolio-database.db");

database.run(`
  CREATE TABLE IF NOT EXISTS projects(
      id INTEGER PRIMARY KEY, 
      title TEXT, 
      intro TEXT
  )
`);

database.run(`
  CREATE TABLE IF NOT EXISTS blogs(
      id INTEGER PRIMARY KEY, 
      title TEXT,
      date TEXT, 
      intro TEXT
  )
`);

const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.get("/", function (request, response) {
  response.render("start.hbs");
});

app.get("/projects", function (request, response) {
  const query = `SELECT * FROM projects`;

  database.all(query, function (error, projects) {
    const model = {
      projects,
    };

    response.render("projects.hbs", model);
  });
});

app.get("/projects/add", function (request, response) {
  response.render("create-newproject.hbs");
});

app.post("/projects/add", function (request, response) {
  const title = request.body.title;
  const intro = request.body.intro;

  const query = `INSERT INTO projects (title,intro) VALUES (?,?)`;

  const values = [title, intro];

  database.run(query, values, function (error) {
    response.redirect("/projects");
  });
});

app.post("/delete-project/:id", function (request, response) {
  const id = request.params.id;

  const query = `DELETE FROM projects WHERE id=?`;
  const values = [id];

  database.run(query, values, function (error) {
    response.redirect("/projects");
  });
});

app.get("/projects/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM projects WHERE id=?`;
  const values = [id];

  database.get(query, values, function (error, project) {
    const model = {
      project,
    };

    response.render("project.hbs", model);
  });
});

app.get("/blogs", function (request, response) {
  const query = `SELECT * FROM blogs`;

  database.all(query, function (error, blogs) {
    const model = {
      blogs,
    };

    response.render("blogs.hbs", model);
  });
});

app.get("/blogs/add", function (request, response) {
  response.render("create-newblog.hbs");
});

app.post("/blogs/add", function (request, response) {
  const title = request.body.title;
  const date = request.body.date;
  const intro = request.body.intro;

  const query = `INSERT INTO blogs (title,date,intro) VALUES (?,?,?)`;

  const values = [title, date, intro];

  database.run(query, values, function (error) {
    response.redirect("/blogs");
  });
});

app.post("/delete-blog/:id", function (request, response) {
  const id = request.params.id;

  const query = `DELETE FROM blogs WHERE id=?`;
  const values = [id];

  database.run(query, values, function (error) {
    response.redirect("/blogs");
  });
});

app.get("/blogs/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM blogs WHERE id=?`;
  const values = [id];

  database.get(query, values, function (error, blog) {
    const model = {
      blog,
    };

    response.render("blog.hbs", model);
  });
});

app.get("/contact", function (request, response) {
  response.render("contact.hbs");
});

app.listen(8080);
