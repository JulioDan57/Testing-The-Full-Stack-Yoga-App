# Yoga App (Front-end)

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

## Technologies 
- TypeScript
- SCSS
- Angular
- Jest
- Cypress
- Angular Material
- Project developed with Visual Studio Code 
 
## Test

### E2E

Launching e2e tests:

- Open a terminal and run a server for testing purpose by using the command : 
    > ng run yoga:serve-coverage

- To perform all the e2e tests (you should launch yoga:serve-coverage before) :
    1. Open a new terminal and perform all the e2e tests by using the command :
        > npx cypress run

        ![npx_cypress_run_out](src/assets/npx_cypress_run_out.png) 
    2. Generate coverage report (you should launch npx cypress run command before):

        > npm run e2e:coverage

        ![npm_run_e2e_coverage_summary_out](src/assets/npm_run_e2e_coverage_summary_out.png) 

        Coverage summary report is shown in terminal, and the detailed coverage report is available here:

        > front/coverage/lcov-report/index.html

        ![npm_run_e2e_coverage_rapport_out](src/assets/npm_run_e2e_coverage_rapport_out.png) 

- To perform the e2e tests in GUI mode (you should launch yoga:serve-coverage before) :
    1. Open a new terminal and launch the main cypress user interface by using the command :
        > npm run cypress:open   

        ![npm_run_cypress_open_out](src/assets/npm_run_cypress_open_out.png)        

    2. Select the E2E Testing option.
    ![cypress_main_gui_selection](src/assets/cypress_main_gui_selection.png)      
    3. Choose your preferred browser for E2E testing and start the E2E testing in the selected browser.
    ![cypress_main_gui_browser_selection](src/assets/cypress_main_gui_browser_selection.png)      
    4. Choose a test a click on it to execute it.
    ![cypress_browser_test_selection](src/assets/cypress_browser_test_selection.png)      


### Unit tests

Launching tests:

> npm run test:unit   

![npm_run_test_unit_out](src/assets/npm_run_test_unit_out.png)   

Coverage report is shown in terminal, interactive coverage report is available here: 

> front/coverage/jest/unit/lcov-report/index.html

![npm_run_test_unit_rapport_out](src/assets/npm_run_test_unit_rapport_out.png)   



### Integration tests

Launching tests:

> npm run test:integration

![npm_run_test_integration_out](src/assets/npm_run_test_integration_out.png)   

Coverage report is shown in terminal, interactive coverage report is available here: 

> front/coverage/jest/integration/lcov-report/index.html

![npm_run_test_integration_rapport_out](src/assets/npm_run_test_integration_rapport_out.png)   

### Unit and Integration tests together

Launching tests:

> npm run test:coverage

![npm_run_test_coverage_out](src/assets/npm_run_test_coverage_out.png)   

Coverage report is shown in terminal, interactive coverage report is available here: 

> front/coverage/jest/lcov-report/index.html

![npm_run_test_coverage_rapport_out](src/assets/npm_run_test_coverage_rapport_out.png)   
