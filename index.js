const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const methodOverride = require('method-override');
const { v4: uuidv4 } = require('uuid');

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'learn',
    password: 'Lakshay0308',
});

// Function to create a random user using Faker
let createRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};

app.get('/', (req, res) => {
    let q = `SELECT COUNT(*) FROM user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]['count(*)'];
            console.log(count);
            res.render('home.ejs', { count });
        });
    } catch (err) {
        console.log('Some error occurred:', err);
    }
});

app.get('/users', (req, res) => {
    let q = 'SELECT * FROM user';
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let users = result;
            console.log(users);
            res.render('users.ejs', { users });
        });
    } catch (err) {
        console.log('Some error occurred:', err);
    }
});

app.get('/users/:id/edit', (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = ?`; // Use parameterized query
    try {
        connection.query(q, [id], (err, result) => {
            if (err) throw err;
            let user = result[0];
            console.log(user);
            res.render('edit.ejs', { user });
        });
    } catch (err) {
        console.log('Some error occurred:', err);
    }
});

app.patch('/users/:id', (req, res) => {
    let { id } = req.params;
    let { password , username } = req.body;
    let q = `SELECT * FROM user WHERE id = ?`; // Use parameterized query
    try {
        connection.query(q, [id], (err, result) => {
            if (err) throw err;
            let user = result[0];
            console.log(user);
            if (password !== user.password) {
                res.send("WRONG PASSWORD!!");
            } else {
                let q2 = `UPDATE user SET username = ? WHERE id = ?`; // Use parameterized query
                connection.query(q2, [username, user.id], (err, result) => {
                    if (err) throw err;
                    res.redirect('/users');
                });
            }
        });
    } catch (err) {
        console.log('Some error occurred:', err);
    }
});

app.get('/users/add', (req, res) => {
    res.render('add.ejs');
});

app.post('/posts', (req, res) => {
    let id = uuidv4();
    let { username, email, password } = req.body;
    let q = `INSERT INTO user VALUES('${id}', '${username}', '${email}', '${password}')`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            res.redirect('/users');
        });
    } catch (err) {
        console.log(err);
    }
});

app.get("/users/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("delete.ejs", { user });
        });
    } catch (err) {
        res.send("Some error with DB");
    }
});

app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];

            if (user.password != password) {
                res.send("WRONG Password entered!");
            } else {
                let q2 = `DELETE FROM user WHERE id='${id}'`; // Query to Delete
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    console.log(result);
                    console.log("Deleted!");
                    res.redirect("/users");
                });
            }
        });
    } catch (err) {
        res.send("Some error with DB");
    }
});

// Start the server
app.listen(port, () => {
    console.log("Listening on port", port);
});