//Required Node Modules
const inquirer = require("inquirer");
const mysql = require("mysql2");


//MySql Connection Object
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employee_db'
});

