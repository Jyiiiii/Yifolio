const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const SQLiteStore = require("connect-sqlite3")(expressSession);
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const database = require("./db.js");

const titleMaxLength = 80;
const nameMaxLength = 10;

//for upload the files
const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, "public/uploadedImages");
  },
  filename: (request, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

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
const adminPassword =
  "$2b$10$auZgqHRe7qcwoFKaywiWk.MNoldbBHx6ydUSS8t3ZLZGlegJ16xHa";

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
  database.getAllProjects(function (error, projects) {
    if (error) {
      console.log(error);
    } else {
      const model = {
        projects,
      };

      response.render("projects.hbs", model);
    }
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

app.post(
  "/create-newproject",
  upload.single("image"),
  function (request, response) {
    const title = request.body.title;
    const intro = request.body.intro;

    const errorMessages = getErrorMessagesForProject(title, intro);
    if (!request.file) {
      errorMessages.push("Please upload a image!");
    }

    if (errorMessages.length == 0) {
      const imgURL = request.file.filename;

      database.createProject(title, intro, imgURL, function (error) {
        if (error) {
          console.log(error);
        } else {
          response.redirect("/projects");
        }
      });
    } else {
      const model = {
        errorMessages,
        title,
        intro,
      };

      response.render("create-newproject.hbs", model);
    }
  }
);

//detail page for each project
app.get("/projects/:id", function (request, response) {
  const id = request.params.id;

  database.getProjectById(id, function (error, project) {
    if (error) {
      console.log(error);
    } else {
      const model = {
        project,
      };

      response.render("project.hbs", model);
    }
  });
});

app.get("/update-project/:id", function (request, response) {
  const id = request.params.id;

  database.getProjectById(id, function (error, project) {
    if (error) {
      console.log(error);
    } else {
      const model = {
        project,
      };

      response.render("update-project.hbs", model);
    }
  });
});

app.post(
  "/update-project/:id",
  upload.single("image"),
  function (request, response) {
    const id = request.params.id;
    const newTitle = request.body.title;
    const newIntro = request.body.intro;

    const errorMessages = getErrorMessagesForProject(newTitle, newIntro);
    if (!request.file) {
      errorMessages.push("Please upload a image!");
    }

    if (errorMessages.length == 0) {
      const newimgURL = request.file.filename;
      database.updateProject(
        newTitle,
        newIntro,
        newimgURL,
        id,
        function (error) {
          if (error) {
            console.log(error);
          } else {
            response.redirect("/projects/" + id);
          }
        }
      );
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
  }
);

app.post("/delete-project/:id", function (request, response) {
  const id = request.params.id;

  database.deleteProject(id, function (error) {
    if (error) {
      console.log(error);
    } else {
      response.redirect("/projects");
    }
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
    database.searchProjects(searchValue, function (error, projects) {
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
    database.getAllProjects(function (error, projects) {
      if (error) {
        console.log(error);
      } else {
        const model = {
          errorMessages,
          projects,
        };

        response.render("projects.hbs", model);
      }
    });
  }
});

//pages for blogs
app.get("/blogs", function (request, response) {
  database.getAllBLogs(function (error, blogs) {
    if (error) {
      console.log(error);
    } else {
      const model = {
        blogs,
      };

      response.render("blogs.hbs", model);
    }
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

app.post(
  "/create-newblog",
  upload.single("image"),
  function (request, response) {
    const title = request.body.title;
    const date = request.body.date;
    const intro = request.body.intro;

    const errorMessages = getErrorMessagesForBlog(title, date, intro);
    if (!request.file) {
      errorMessages.push("Please upload a image!");
    }

    if (errorMessages.length == 0) {
      const imgURL = request.file.filename;

      database.createBlog(title, date, intro, imgURL, function (error) {
        if (error) {
          console.log(error);
        } else {
          response.redirect("/blogs");
        }
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
  }
);

//detail page for each blog
app.get("/blogs/:id", function (request, response) {
  const id = request.params.id;

  database.getBlogById(id, function (error, blog) {
    if (error) {
      console.log(error);
    } else {
      const model = {
        blog,
      };

      response.render("blog.hbs", model);
    }
  });
});

app.get("/update-blog/:id", function (request, response) {
  const id = request.params.id;

  database.getBlogById(id, function (error, blog) {
    if (error) {
      console.log(error);
    } else {
      const model = {
        blog,
      };

      response.render("update-blog.hbs", model);
    }
  });
});

app.post(
  "/update-blog/:id",
  upload.single("image"),
  function (request, response) {
    const id = request.params.id;
    const newTitle = request.body.title;
    const newDate = request.body.date;
    const newIntro = request.body.intro;

    const errorMessages = getErrorMessagesForBlog(newTitle, newDate, newIntro);
    if (!request.file) {
      errorMessages.push("Please upload a image!");
    }

    if (errorMessages.length == 0) {
      const newimgURL = request.file.filename;
      database.updateBlog(
        newTitle,
        newDate,
        newIntro,
        newimgURL,
        id,
        function (error) {
          if (error) {
            console.log(error);
          } else {
            response.redirect("/blogs/" + id);
          }
        }
      );
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
  }
);

app.post("/delete-blog/:id", function (request, response) {
  const id = request.params.id;

  database.deleteBlog(id, function (error) {
    if (error) {
      console.log(error);
    } else {
      response.redirect("/blogs");
    }
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
    database.searchBlogs(searchValue, function (error, blogs) {
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
    database.getAllBLogs(function (error, blogs) {
      if (error) {
        console.log(error);
      } else {
        const model = {
          errorMessages,
          blogs,
        };

        response.render("blogs.hbs", model);
      }
    });
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
    database.createContactInfo(
      firstName,
      lastName,
      email,
      date,
      description,
      function (error) {
        if (error) {
          console.log(error);
        } else {
          response.redirect("/contact");
        }
      }
    );
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
  database.getAllContactInfos(function (error, contactInfos) {
    if (error) {
      console.log(error);
    } else {
      const model = {
        contactInfos,
      };

      if (request.session.isLoggedIn) {
        response.render("display-contactInfos.hbs", model);
      } else {
        response.redirect("/login");
      }
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
    database.searchContactInfos(searchValue, function (error, contactInfos) {
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
    database.getAllContactInfos(function (error, contactInfos) {
      if (error) {
        console.log(error);
      } else {
        const model = {
          errorMessages,
          contactInfos,
        };

        response.render("display-contactInfos.hbs", model);
      }
    });
  }
});

app.post("/delete-contactInfo:id", function (request, response) {
  const id = request.params.id;

  database.deleteContactInfo(id, function (error) {
    if (error) {
      console.log(error);
    } else {
      response.redirect("/contactInfos");
    }
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
  const correctPassword = bcrypt.compareSync(enteredPassword, adminPassword);

  if (enteredUsername != adminUsername || correctPassword === false) {
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
