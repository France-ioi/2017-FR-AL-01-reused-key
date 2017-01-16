
const alkindiTaskServer = require('alkindi-task-lib/server');

alkindiTaskServer({
  webpackConfig: require('../webpack.config.js'),
  generate: require('./generate'),
  gradeAnswer
});

function gradeAnswer (full_task, task, answer, callback) {
  const {secretKey} = full_task;
  const {hints} = task;
  const {key} = answer;
  const nHints = Object.keys(hints).length;
  let nCorrect = 0;
  secretKey.forEach(function (value, index) {
    if (value === key[index]) {
      nCorrect += 1;
    }
  });
  const is_full_solution = nCorrect === secretKey.length;
  const is_solution = is_full_solution;  // could be nCorrect > 0
  const feedback = is_full_solution;
  const score = is_full_solution ? Math.max(0, 150 - nHints * 20) : 0;
  callback(null, {
    feedback, score, is_solution, is_full_solution
  });
}
