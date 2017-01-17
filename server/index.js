
const alkindiTaskServer = require('alkindi-task-lib/server');

alkindiTaskServer({
  webpackConfig: require('../webpack.config.js'),
  generate: require('./generate'),
  gradeAnswer,
  grantHint
});

function gradeAnswer (full_task, task, answer, callback) {
  const {secretKey} = full_task;
  const {hints} = task;
  const {key} = answer;
  let nCorrect = 0;
  secretKey.forEach(function (value, index) {
    if (value === key[index]) {
      nCorrect += 1;
    }
  });
  const is_full_solution = nCorrect === secretKey.length;
  const is_solution = is_full_solution;  // could be nCorrect > 0
  const feedback = is_full_solution;
  const highestPossibleScore = getHighestPossibleScore(hints);
  const score = is_full_solution ? highestPossibleScore : 0;
  callback(null, {
    feedback, score, is_solution, is_full_solution
  });
}

function grantHint (full_task, task, query, callback) {
  const {keyIndex} = query;
  const {secretKey} = full_task;
  if (typeof keyIndex !== 'number' || keyIndex < 0 || keyIndex >= secretKey.length) {
    callback(null, {success: false});
  }
  // Update task in-place is it is freshly loaded JSON.
  task.hints[keyIndex] = secretKey[keyIndex];
  task.highestPossibleScore = getHighestPossibleScore(task.hints);
  callback(null, {success: true, task: task});
};

function getHighestPossibleScore (hints) {
  const nHints = Object.keys(hints).length;
  return Math.max(0, 150 - nHints * 20);
}
