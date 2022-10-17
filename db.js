const sqlite3 = require("sqlite3");
const database = new sqlite3.Database("Yifolio-database.db");

//projects
database.run(`
  CREATE TABLE IF NOT EXISTS projects(
      id INTEGER PRIMARY KEY, 
      title TEXT, 
      intro TEXT
  )
`);

exports.getAllProjects = function (callback) {
  const query = `SELECT * FROM projects`;

  database.all(query, function (error, projects) {
    callback(error, projects);
  });
};

exports.createProject = function (title, intro, imgURL, callback) {
  const query = `INSERT INTO projects (title,intro,imgURL) VALUES (?,?,?)`;

  const values = [title, intro, imgURL];

  database.run(query, values, function (error) {
    callback(error);
  });
};

exports.getProjectById = function (id, callback) {
  const query = `SELECT * FROM projects WHERE id=?`;

  const values = [id];

  database.get(query, values, function (error, project) {
    callback(error, project);
  });
};

exports.updateProject = function (newTitle, newIntro, newimgURL, id, callback) {
  const query = `UPDATE projects SET title=?,intro=?,imgURL=? WHERE id=?`;

  const values = [newTitle, newIntro, newimgURL, id];

  database.run(query, values, function (error) {
    callback(error);
  });
};

exports.deleteProject = function (id, callback) {
  const query = `DELETE FROM projects WHERE id=?`;

  const values = [id];

  database.run(query, values, function (error) {
    callback(error);
  });
};

exports.searchProjects = function (searchValue, callback) {
  const query = `SELECT * FROM projects WHERE title LIKE ? OR intro LIKE ?`;
  const values = ["%" + searchValue + "%", "%" + searchValue + "%"];

  database.all(query, values, function (error, projects) {
    callback(error, projects);
  });
};

//blogs
database.run(`
  CREATE TABLE IF NOT EXISTS blogs(
      id INTEGER PRIMARY KEY, 
      title TEXT,
      date TEXT, 
      intro TEXT
    )
`);

exports.getAllBLogs = function (callback) {
  const query = `SELECT * FROM blogs`;

  database.all(query, function (error, blogs) {
    callback(error, blogs);
  });
};

exports.createBlog = function (title, date, intro, imgURL, callback) {
  const query = `INSERT INTO blogs (title,date,intro,imgURL) VALUES (?,?,?,?)`;

  const values = [title, date, intro, imgURL];

  database.run(query, values, function (error) {
    callback(error);
  });
};

exports.getBlogById = function (id, callback) {
  const query = `SELECT * FROM blogs WHERE id=?`;

  const values = [id];

  database.get(query, values, function (error, blog) {
    callback(error, blog);
  });
};

exports.updateBlog = function (
  newTitle,
  newDate,
  newIntro,
  newimgURL,
  id,
  callback
) {
  const query = `UPDATE blogs SET title=?,date=?,intro=?,imgURL=? WHERE id=?`;

  const values = [newTitle, newDate, newIntro, newimgURL, id];

  database.run(query, values, function (error) {
    callback(error);
  });
};

exports.deleteBlog = function (id, callback) {
  const query = `DELETE FROM blogs WHERE id=?`;

  const values = [id];

  database.run(query, values, function (error) {
    callback(error);
  });
};

exports.searchBlogs = function (searchValue, callback) {
  const query = `SELECT * FROM blogs WHERE title LIKE ? OR date LIKE ?`;
  const values = ["%" + searchValue + "%", "%" + searchValue + "%"];

  database.all(query, values, function (error, blogs) {
    callback(error, blogs);
  });
};

//contacts
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

exports.getAllContactInfos = function (callback) {
  const query = `SELECT * FROM contactInfos`;

  database.all(query, function (error, contactInfos) {
    callback(error, contactInfos);
  });
};

exports.createContactInfo = function (
  firstName,
  lastName,
  email,
  date,
  description,
  callback
) {
  const query = `INSERT INTO contactInfos (firstName,lastName,email,date,description) VALUES (?,?,?,?,?)`;

  const values = [firstName, lastName, email, date, description];

  database.run(query, values, function (error) {
    callback(error);
  });
};

exports.searchContactInfos = function (searchValue, callback) {
  const query = `SELECT * FROM contactInfos WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR date LIKE ? `;
  const values = [
    "%" + searchValue + "%",
    "%" + searchValue + "%",
    "%" + searchValue + "%",
    "%" + searchValue + "%",
  ];

  database.all(query, values, function (error, contactInfos) {
    callback(error, contactInfos);
  });
};

exports.deleteContactInfo = function (id, callback) {
  const query = `DELETE FROM contactInfos WHERE id=?`;

  const values = [id];

  database.run(query, values, function (error) {
    callback(error);
  });
};
