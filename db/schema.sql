SROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

--Department Table--
CREATE TABLE department (
    id INT NOT NULL AUTO-INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

--Role Table--
CREATE TABLE role (
    id INT NOT NULL AUTO-INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL(10,2),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department(id)
        ON DELETE SET NULL
);

--EMPLOYEE TABLE--
CREATE TABLE employee (
    id INT NOT NULL AUTO-INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
        FOREIGN KEY (role_id) REFERENCES role(id)
            ON DELETE CASCADE,
    manager_id INT,
        FOREIGN KEY (manager_id) REFERENCES employee(id)
            ON DELETE SET NULL
);