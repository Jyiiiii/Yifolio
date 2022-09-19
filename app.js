const express = require("express");
const expressHandlebars = require("express-handlebars");
const data = require("./data.js");

const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);

app.use(express.static("public"));

app.get("/", function (request, response) {
  response.render("start.hbs");
});

app.get("/projects", function (request, response) {
  const model = {
    projects: data.projects,
  };
  response.render("projects.hbs", model);
});

app.get("/projects/:id", function (request, response) {
  const id = request.params.id;

  const project = data.projects.find((p) => p.id == id); /* w=each project*/

  const model = {
    project: project,
  };
  response.render("project.hbs", model);
});

app.get("/blogs", function (request, response) {
  const model = {
    blogs: data.blogs,
  };
  response.render("blogs.hbs", model);
});

app.get("/blogs/:id", function (request, response) {
  const id = request.params.id;

  const blog = data.blogs.find((b) => b.id == id); /* w=each blog*/

  const model = {
    blog: blog,
  };
  response.render("blog.hbs", model);
});

app.get("/contact", function (request, response) {
  response.render("contact.hbs");
});

app.listen(8080);
