/**
 * @type {Cypress.PluginConfig}
 */
import codeCoverageTask from '@cypress/code-coverage/task';

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  codeCoverageTask(on, config); // note : pas de `return`
  return config;
};


/*
import registerCodeCoverageTasks from '@cypress/code-coverage/task';

export default (on, config) => {
  registerCodeCoverageTasks(on, config);
  return config;
};
*/

 /*
  import * as registerCodeCoverageTasks from '@cypress/code-coverage/task';

 export default (on, config) => {
   return registerCodeCoverageTasks(on, config);
 };

 */