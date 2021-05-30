# R-Land-Library

A library management system built in Express.js with MySQL.

## Setup

* Clone the repository.
* Create 2 MySQL tables, `create table users (uuid char(36) PRIMARY KEY, email varchar(255), password char(88), admin tinyint(1) DEFAULT 0);` and `create table book (uuid char(36) PRIMARY KEY, name varchar(255), issuereq varchar(255), issuedby varchar(255), issuedon datetime, returnby datetime, returnon datetime, fine double);`.
> To make a user admin, do it manually through MySQL.

## Run

* Run `npm install` to install the node_modules.
* Start the server with `npm start`.
