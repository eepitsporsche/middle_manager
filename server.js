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

//Handle and Console Log Connection
mysqlConnection.connect((err) => {
    if (err) throw err;
    console.log('Middle Manager Connection Successful');
    appInit();
});

//Initialize App Function
function appInit() {
    //Inuirer Prompt for App Directory
    inquirer
    .prompt({
        name: "directory",
        type: 'list',
        message: 'What would you like to do?',
        choices: [
        'View All Employees',
        'Add Employee',
        'Update Employee Role',
        'View All Roles',
        'Add Role',
        'View All Departments',
        'Exit'
    ]
    })

    //Then Function to Handle User's Selection
    .then((input) => {
        switch (input.directory) {
            case 'View All Employees': viewAllEmplyees();
            break;
            case 'Add Employee': addEmployee();
            break;
            case 'Update Employee Role': updateEmployeeRole();
            break;
            case 'View All Roles': viewAllRoles();
            break;
            case 'Add Role': addRole();
            break;
            case 'View All Departments': viewAllDepartments();
            break;
            case 'Exit': mysqlConnection.end();
            break;
            default: console.log('Invalid response - try again.');
            appInit();
        }
    })
};


//View All Employees Function
function viewAllEmplyees() {
    mysqlConnection.query(
        //Pull Data from Employee Table and Attach Respective Manager Data
        'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager_id',
            (err, res) => {
                //Throw Error Otherwise, Display Response Results
                if (err) throw err;
                console.table(res);
                appInit();
            }
    )
};
