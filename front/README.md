# Yoga (Front-end)

is an interactive web page that helps users manage their yoga sessions.
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.0.

## Start the project

Git clone:

> git clone https://github.com/JulioDan57/Testing-The-Full-Stack-Yoga-App

Go inside folder:

> cd yoga

Install dependencies:

> npm install

Launch Front-end:

> npm run start;


## Ressources

### Mockoon env 

### Postman collection

For Postman import the collection

> ressources/postman/yoga.postman_collection.json 

by following the documentation: 

https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman


### MySQL

SQL script for creating the schema is available `ressources/sql/script.sql`

By default the admin account is:
- login: yoga@studio.com
- password: test!1234


### Test

#### E2E

Launching e2e tests:

-Open a terminal and run a server for testing purpose by using the command : 
> ng run yoga:serve-coverage

-To perform all the e2e tests (you should launch yoga:serve-coverage before) :
1. Open a new terminal and perform all the e2e tests by using the command :
> npx cypress run

2. Generate coverage report (you should launch npx cypress run command before):

> npm run e2e:coverage

Coverage summary report is shown in terminal, and the detailed coverage report is available here:

> front/coverage/lcov-report/index.html

#### Unitary tests

Launching tests:

> npm run test:unit   

Coverage report is shown in terminal, interactive coverage report is available here: 

> front/coverage/jest/unit/lcov-report/index.html


#### Integration tests

Launching tests:

> npm run test:integration

Coverage report is shown in terminal, interactive coverage report is available here: 

> front/coverage/jest/integration/lcov-report/index.html

#### Unitary and Integration tests

Launching tests:

> npm run test:coverage

Coverage report is shown in terminal, interactive coverage report is available here: 

> front/coverage/jest/lcov-report/index.html