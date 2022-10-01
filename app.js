const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");

const titleMaxLength = 80;
const nameMaxLength = 10;

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

database.run(`
    CREATE TABLE IF NOT EXISTS contactInfos(
      id INTEGER PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      date INTEGER,
      description TEXT
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

function getErrorMessagesForProject(title, intro) {
  const errorMessages = [];

  if (title == "") {
    errorMessages.push("Title can't be empty!");
  } else if (titleMaxLength < title.length) {
    errorMessages.push(
      "The max length of title is" + titleMaxLength + "characters long."
    );
  }

  if (intro == "") {
    errorMessages.push("Intro can't be empty!");
  }

  return errorMessages;
}

app.post("/projects/add", function (request, response) {
  const title = request.body.title;
  const intro = request.body.intro;

  const errorMessages = getErrorMessagesForProject(title, intro);

  if (errorMessages.length == 0) {
    const query = `INSERT INTO projects (title,intro) VALUES (?,?)`;

    const values = [title, intro];

    database.run(query, values, function (error) {
      response.redirect("/projects");
    });
  } else {
    const model = {
      errorMessages,
      title,
      intro,
    };

    response.render("create-newproject.hbs", model);
  }
});

app.get("/update-project/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM projects WHERE id=?`;
  const values = [id];

  database.get(query, values, function (error, project) {
    const model = {
      project,
      id,
    };

    response.render("update-project.hbs", model);
  });
});

app.post("/update-project/:id", function (request, response) {
  const id = request.params.id;
  const newTitle = request.body.title;
  const newIntro = request.body.intro;

  const errorMessages = getErrorMessagesForProject(newTitle, newIntro);

  if (errorMessages.length == 0) {
    const query = `UPDATE projects SET title=?,intro=? WHERE id=?`;

    const values = [newTitle, newIntro, id];

    database.get(query, values, function (error, project) {
      response.redirect("/projects" + id);
    });
  } else {
    const model = {
      project: {
        title: newTitle,
        intro: newIntro,
        id,
      },
      errorMessages,
    };

    response.render("update-project.hbs", model);
  }
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

function getErrorMessagesForBlog(title, date, intro) {
  const errorMessages = [];

  if (title == "") {
    errorMessages.push("Title can't be empty!");
  } else if (titleMaxLength < title.length) {
    errorMessages.push(
      "The max length of title is" + titleMaxLength + "characters long."
    );
  }

  if (date == "") {
    errorMessages.push("Please choose a date!");
  }

  if (intro == "") {
    errorMessages.push("Intro can't be empty!");
  }

  return errorMessages;
}

app.post("/blogs/add", function (request, response) {
  const title = request.body.title;
  const date = request.body.date;
  const intro = request.body.intro;

  const errorMessages = getErrorMessagesForBlog(title, date, intro);

  if (errorMessages.length == 0) {
    const query = `INSERT INTO blogs (title,date,intro) VALUES (?,?,?)`;

    const values = [title, date, intro];

    database.run(query, values, function (error) {
      response.redirect("/blogs");
    });
  } else {
    const model = {
      errorMessages,
      title,
      date,
      intro,
    };

    response.render("create-newblog.hbs", model);
  }
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

function getErrorMessagesForContact(
  firstName,
  lastName,
  email,
  date,
  description
) {
  const errorMessages = [];

  if (firstName == "") {
    errorMessages.push("Please enter your first name 🥰");
  } else if (nameMaxLength < firstName.length) {
    errorMessages.push(
      "The max length of the first name is" + nameMaxLength + "characters long."
    );
  }

  if (lastName == "") {
    errorMessages.push("Please enter your last name 🥰");
  } else if (nameMaxLength < lastName.length) {
    errorMessages.push(
      "The max length of the last name is" + nameMaxLength + "characters long."
    );
  }

  if (email == "") {
    errorMessages.push("I need your valid email for contacting 🥰");
  }

  if (date == "") {
    errorMessages.push("Please choose the date 🥰");
  }

  if (description == "") {
    errorMessages.push(
      "I need a short introduction for the project. Thank you 🥰"
    );
  }

  return errorMessages;
}

app.post("/contact", function (request, response) {
  const firstName = request.body.firstName;
  const lastName = request.body.lastName;
  const email = request.body.email;
  const date = request.body.date;
  const description = request.body.description;

  const errorMessages = getErrorMessagesForContact(
    firstName,
    lastName,
    email,
    date,
    description
  );

  if (errorMessages.length == 0) {
    const query = `INSERT INTO contactInfos (firstName,lastName,email,date,description) VALUES (?,?,?,?,?)`;

    const values = [firstName, lastName, email, date, description];

    database.run(query, values, function (error) {
      response.redirect("/contact");
    });
  } else {
    const model = {
      errorMessages,
      firstName,
      lastName,
      email,
      date,
      description,
    };

    response.render("contact.hbs", model);
  }
});

app.get("/contactInfos", function (request, response) {
  const query = `SELECT * FROM contactInfos`;

  database.all(query, function (error, contactInfos) {
    const model = {
      contactInfos,
    };
    response.render("display-contactInfos.hbs", model);
  });
});

app.post("/delete-contactInfo:id", function (request, response) {
  const id = request.params.id;

  const query = `DELETE FROM contactInfos WHERE id=?`;
  const values = [id];

  database.run(query, values, function (error) {
    response.redirect("/contactInfos");
  });
});

app.get("/login", function (request, response) {
  response.render("login.hbs");
});

app.listen(8080);
