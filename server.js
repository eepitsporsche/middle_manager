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
                //Display Response Results or Throw Error
                if (err) throw err;
                console.table(res);
                appInit();
            }
    )
};


//Add Employee Function
function addEmployee() {
    //Pull Role Data from Database
    mysqlConnection.query('SELECT * FROM role', (err, role) => {
        if (err) throw err;

    //Pull Employee Data from Database
    mysqlConnection.query('SELECT * FROM employee', (err, employee) => {
        if (err) throw err;

        //Inquirer Prompts to Add New Employee Data
        inquirer
            .prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "What is the employee's first name?"
                },

                {
                    name: "lastName",
                    type: "input",
                    message: "What is the employee's last name?"
                },

                {
                    name: "role",
                    type: "list",
                    message: "What is the employee's role?",
                    choices: role.map((role) => role.title)
                },

                {
                    name: "manager",
                    type: "list",
                    message: "Who is the employee's manager?",
                    choices: [
                        "None",
                        ...employee.map((employee) => `${employee.first_name} ${employee.last_name}`),
                    ]
                }
            ])
        
            .then((answers) => {
                //Pull Role Data from Role Table
                const selectedRole = role.find((role) => role.title === answers.role);
                
                //If a Manager is Selected, Pull ID Data from Employee Table for Manager ID
                let managerID = null;
                if (answers.manager !== "None") {
                    const selectedManager = employee.find((employee) => `${employee.first_name} ${employee.last_name}` === answers.manager)
                managerID = selectedManager.id;
                }
                //Add New Employee Data to Employee Table Via MySql Query
                mysqlConnection.query("INSERT INTO employee SET ?", {
                    first_name: answers.firstName,
                    last_name: answers.lastName,
                    role_id: selectedRole.id,
                    manager_id: managerID,
                },
                //Display Confirmation Message or Throw Error
                (err) => {
                    if (err) throw err;
                    console.log("New employee added.");
                    appInit();
                })
            })
    })
    })
};
