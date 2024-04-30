DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

-- Department Table --
CREATE TABLE departments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

-- Role Table --
CREATE TABLE roles (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL(10,2),
    department_id INT,
        FOREIGN KEY (department_id) REFERENCES departments(id)
            ON DELETE SET NULL
);

-- EMPLOYEE TABLE --
CREATE TABLE employees (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
        FOREIGN KEY (role_id) REFERENCES roles(id)
            ON DELETE cascade,
    manager_id INT,
        FOREIGN KEY (manager_id) REFERENCES employees(id)
            ON DELETE SET NULL
);