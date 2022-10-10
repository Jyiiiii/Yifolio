const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");
const expressSession = require("express-session");
const SQLiteStore = require("connect-sqlite3")(expressSession);

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

app.use(
  expressSession({
    secret: "bahbhbhdck",
    saveUninitialized: false,
    resave: false,
    store: new SQLiteStore(),
  })
);

const adminUsername = "itzYi";
const adminPassword = "1111";

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

app.use(function (request, response, next) {
  const isLoggedIn = request.session.isLoggedIn;

  response.locals.isLoggedIn = isLoggedIn;

  next();
});

app.get("/", function (request, response) {
  response.render("start.hbs");
});

//pages about projects
app.get("/projects", function (request, response) {
  const query = `SELECT * FROM projects`;

  database.all(query, function (error, projects) {
    const model = {
      projects,
    };

    response.render("projects.hbs", model);
  });
});

app.get("/create-newproject", function (request, response) {
  if (request.session.isLoggedIn) {
    response.render("create-newproject.hbs");
  } else {
    response.redirect("/login");
  }
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

app.post("/create-newproject", function (request, response) {
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

    database.run(query, values, function (error) {
      if (error) {
        console.log(error);
      } else {
        response.redirect("/projects/" + id);
      }
    });
  } else {
    const model = {
      errorMessages,
      project: {
        title: newTitle,
        intro: newIntro,
      },
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

//detail page for each project
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

//search function for projects
app.get("/projects-search", function (request, response) {
  const searchValue = request.query.searchValue;

  const errorMessages = [];

  if (searchValue == "") {
    errorMessages.push("Searchbar cannot be empty!");
  }

  if (errorMessages.length == 0) {
    const query = `SELECT * FROM projects WHERE title LIKE ? OR intro LIKE ?`;
    const values = ["%" + searchValue + "%", "%" + searchValue + "%"];

    database.all(query, values, function (error, projects) {
      if (error) {
        console.log("Internal server error!Related to search function!");
      } else {
        const model = {
          searchValue,
          projects,
        };
        response.render("projects.hbs", model);
      }
    });
  } else {
    const model = {
      errorMessages,
      searchValue,
    };

    response.render("projects.hbs", model);
  }
});

//pages for blogs
app.get("/blogs", function (request, response) {
  const query = `SELECT * FROM blogs`;

  database.all(query, function (error, blogs) {
    const model = {
      blogs,
    };

    response.render("blogs.hbs", model);
  });
});

app.get("/create-newblog", function (request, response) {
  if (request.session.isLoggedIn) {
    response.render("create-newblog.hbs");
  } else {
    response.redirect("/login");
  }
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

app.post("/create-newblog", function (request, response) {
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

app.get("/update-blog/:id", function (request, response) {
  const id = request.params.id;

  const query = `SELECT * FROM blogs WHERE id=?`;
  const values = [id];

  database.get(query, values, function (error, blog) {
    const model = {
      blog,
    };

    response.render("update-blog.hbs", model);
  });
});

app.post("/update-blog/:id", function (request, response) {
  const id = request.params.id;
  const newTitle = request.body.title;
  const newDate = request.body.date;
  const newIntro = request.body.intro;

  const errorMessages = getErrorMessagesForBlog(newTitle, newDate, newIntro);

  if (errorMessages.length == 0) {
    const query = `UPDATE blogs SET title=?,date=?,intro=? WHERE id=?`;

    const values = [newTitle, newDate, newIntro, id];

    database.run(query, values, function (error) {
      if (error) {
        console.log(error);
      } else {
        response.redirect("/blogs/" + id);
      }
    });
  } else {
    const model = {
      blog: {
        title: newTitle,
        date: newDate,
        intro: newIntro,
      },
      errorMessages,
    };

    response.render("update-blog.hbs", model);
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

//detail page for each blog
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

//search function for blogs
app.get("/blogs-search", function (request, response) {
  const searchValue = request.query.searchValue;

  const errorMessages = [];

  if (searchValue == "") {
    errorMessages.push("Searchbar cannot be empty!");
  }

  if (errorMessages.length == 0) {
    const query = `SELECT * FROM blogs WHERE title LIKE ? OR date LIKE ?`;
    const values = ["%" + searchValue + "%", "%" + searchValue + "%"];

    database.all(query, values, function (error, blogs) {
      if (error) {
        console.log("Internal server error!Related to search function!");
      } else {
        const model = {
          searchValue,
          blogs,
        };

        response.render("blogs.hbs", model);
      }
    });
  } else {
    const model = {
      errorMessages,
      searchValue,
    };

    response.render("blogs.hbs", model);
  }
});

//contact page
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

//display contact informations
app.get("/contactInfos", function (request, response) {
  const query = `SELECT * FROM contactInfos`;

  database.all(query, function (error, contactInfos) {
    const model = {
      contactInfos,
    };
    if (request.session.isLoggedIn) {
      response.render("display-contactInfos.hbs", model);
    } else {
      response.redirect("/login");
    }
  });
});

app.get("/contactInfos-search", function (request, response) {
  const searchValue = request.query.searchValue;

  const errorMessages = [];

  if (searchValue == "") {
    errorMessages.push("Searchbar cannot be empty!");
  }

  if (errorMessages.length == 0) {
    const query = `SELECT * FROM contactInfos WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR date LIKE ? `;
    const values = [
      "%" + searchValue + "%",
      "%" + searchValue + "%",
      "%" + searchValue + "%",
      "%" + searchValue + "%",
    ];

    database.all(query, values, function (error, contactInfos) {
      if (error) {
        console.log("Internal server error!Related to search function!");
      } else {
        const model = {
          searchValue,
          contactInfos,
        };

        response.render("display-contactInfos.hbs", model);
      }
    });
  } else {
    const model = {
      errorMessages,
      searchValue,
    };

    response.render("display-contactInfos.hbs", model);
  }
});

app.post("/delete-contactInfo:id", function (request, response) {
  const id = request.params.id;

  const query = `DELETE FROM contactInfos WHERE id=?`;
  const values = [id];

  database.run(query, values, function (error) {
    response.redirect("/contactInfos");
  });
});

//login page
app.get("/login", function (request, response) {
  response.render("login.hbs");
});

app.post("/login", function (request, response) {
  const enteredUsername = request.body.username;
  const enteredPassword = request.body.password;

  const invalidAccount = [];

  if (enteredUsername != adminUsername && enteredPassword != adminPassword) {
    invalidAccount.push("It is a invalid account!");
  }

  if (invalidAccount.length == 0) {
    request.session.isLoggedIn = true;
    response.redirect("/");
  } else {
    const model = { invalidAccount };
    response.render("login.hbs", model);
  }
});

//when the admin is loggedin the link become logout
app.post("/logout", function (request, response) {
  request.session.isLoggedIn = false;
  response.redirect("/");
});

app.listen(8080);
