//Required Node Modules
const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console.table");
const cfonts = require("cfonts");


//
cfonts.say('Middle|Manager', {
	font: 'block',              // define the font face
	align: 'center',            // define text alignment
	colors: ['system'],         // define all colors
	background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
	letterSpacing: 1,           // define letter spacing
	lineHeight: 1,              // define the line height
	space: true,                // define if the output text should have empty lines on top and on the bottom
	maxLength: '0',             // define how many character can be on one line
	gradient: false,            // define your two gradient colors
	independentGradient: false, // define if you want to recalculate the gradient for each new line
	transitionGradient: false,  // define if this is a transition between colors directly
	env: 'node'                 // define the environment cfonts is being executed in
});

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
        'Add Department',
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
            case 'Add Department': addDepartment();
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
        'SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS departments, roles.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id',
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
    mysqlConnection.query('SELECT * FROM roles', (err, roles) => {
        if (err) throw err;

    //Pull Employee Data from Database
    mysqlConnection.query('SELECT * FROM employees', (err, employees) => {
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
                    choices: roles.map((role) => role.title)
                },

                {
                    name: "manager",
                    type: "list",
                    message: "Who is the employee's manager?",
                    choices: [
                        "None",
                        ...employees.map((employees) => `${employees.first_name} ${employees.last_name}`),
                    ]
                }
            ])
        
            .then((answers) => {
                //Pull Role Data from Role Table
                const selectedRole = roles.find((role) => role.title === answers.role);
                
                //If a Manager is Selected, Pull ID Data from Employee Table for Manager ID
                let managerID = null;
                if (answers.manager !== "None") {
                    const selectedManager = employees.find((employees) => `${employees.first_name} ${employees.last_name}` === answers.manager)
                managerID = selectedManager.id;
                }
                //Add New Employee Data to Employee Table Via MySql Query
                mysqlConnection.query("INSERT INTO employees SET ?", {
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

//Update Employee Role Function
function updateEmployeeRole() {
    //Pull Data from Employee Table or Throw Error
    mysqlConnection.query('SELECT * FROM employees', (err, employees) => {
        if (err) throw err;

        //Pull Data from Role Table or Throw Error
        mysqlConnection.query('SELECT * FROM roles', (err, roles) => {
            if (err) throw err;

            //Inquirer Prompts to Update Employee Role
            inquirer
                .prompt([
                    {
                        name: "employee",
                        type: "list",
                        message: "Which employee's role do you want to update?",
                        choices: employees.map((employees) => `${employees.first_name} ${employees.last_name}`),
                    },
                    {
                        name: "role",
                        type: "list",
                        message: "Which role do you want to assign the selected employee?",
                        choices: roles.map((role) => role.title),
                    },
                ])

                .then((answers) => {
                    //Pull Employee Data from Employee Table
                    const selectedEmployee = employees.find((employees) => `${employees.first_name} ${employees.last_name}` === answers.employee);
                    //Pull Role Data from Role Table
                    const selectedRole = roles.find((role) => role.title === answers.role);

                    //Update Employee Role Data to Employee Table Via MySql Query
                    mysqlConnection.query('UPDATE employees SET role_id = ? WHERE id = ?', [selectedRole.id, selectedEmployee.id],
                        //Display Confirmation Message or Throw Error
                        (err) => {
                            if (err) throw err;
                            console.log("Employee role updated.");
                            appInit();
                        }
                    )
                })
        })
    })
};

//View All Roles Function
function viewAllRoles() {
    //Pull Data from Role Table
    mysqlConnection.query('SELECT roles.id, roles.title, roles.salary, departments.name AS departments FROM roles INNER JOIN departments ON roles.department_id = departments.id', (err, res) => {
        //Display Response Results or Throw Error
        if (err) throw err;
        console.table(res);
        appInit();
    })
};

//Add Role Function
function addRole() {
    //Pull Data from Department Table
    mysqlConnection.query('SELECT * FROM departments', (err, departments) => {
        if (err) throw err;

        //Inquirer Prompts to Add Role
        inquirer
            .prompt ([
                {
                    name: "title",
                    type: "input",
                    message: "What is the name of the role?",
                },
                {
                    name:"salary",
                    type: "input",
                    message: "What is the salary of the role?",
                    validate: (value) => {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return "Please enter a valid salary value."
                    },
                },
                {
                    name: "department",
                    type: "list",
                    message: "In which department does this role belong?",
                    choices: departments.map((departments) => departments.name),
                },
            ])

            .then((answers) => {
                //Pull Data From Department Table
                const selectedDepartment = departments.find((departments) => departments.name === answers.department);

            //Add Role Data to Role Table Via MySql Query
            mysqlConnection.query("INSERT INTO roles SET ?", {
                title: answers.title,
                salary: answers.salary,
                department_id: selectedDepartment.id,
            },
                //Display Confirmation Message or Throw Error
                (err) => {
                    if (err) throw err;
                    console.log(`Added ${answers.title} to the database.`)
                    appInit();
                })
            })
    })
};

//View All Departments Function
function viewAllDepartments() {
    //Pull Data from Department Table
    mysqlConnection.query('SELECT * FROM departments', (err, res) => {
        //Display Response Results or Throw Error
        if (err) throw err;
        console.table(res);
        appInit();
    })
};

//Add Department Function
function addDepartment() {
    //Inquirer Prompts to Add Department
    inquirer
        .prompt (
            {
                name: "department",
                type: "input",
                message: "What is the name of the department?",
            }
        )
        //Add Department Data to Department Table Via MySql Query
        .then((answers) => {
            mysqlConnection.query('INSERT INTO departments SET ?', {
                name: answers.department,
            },
            //Display Confirmation Message or Throw Error
            (err) => {
                if (err) throw err;
                console.log(`Added ${answers.department} to the database.`);
                appInit();
            })
        })
};