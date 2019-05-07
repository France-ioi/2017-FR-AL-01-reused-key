var generate = require("./generate");

/* prefer JSON config file at project root?  depend on NODE_ENV? */
module.exports.config = {
  cache_task_data: false
};

module.exports.taskData = function (args, callback) {
  // hints array
  const hintsRequested = getHintsRequested(args.task.hints_requested);
  const {publicData} = generateTaskData(
    args.task.params,
    args.task.random_seed,
    hintsRequested
  );
  callback(null, publicData);
};

module.exports.requestHint = function (args, callback) {
  const request = args.request;
  const hints_requested = args.task.hints_requested
    ? JSON.parse(args.task.hints_requested)
    : [];
  for (var hintRequest of hints_requested) {
    if (hintRequest === null) {
      /* XXX Happens, should not. */
      /* eslint-disable-next-line no-console */
      console.log("XXX", args.task.hints_requested);
      continue;
    }
    if (typeof hintRequest === "string") {
      hintRequest = JSON.parse(hintRequest);
    }
    if (hintRequestEqual(hintRequest, request)) {
      return callback(new Error("hint already requested"));
    }
  }
  callback(null, args.request);
};

module.exports.gradeAnswer = function (args, task_data, callback) {
  try {
    // hints array
    const hintsRequested = getHintsRequested(args.answer.hints_requested);

    const {
      publicData: {hints},
      privateData: {secretKey}
    } = generateTaskData(
      args.task.params,
      args.task.random_seed,
      hintsRequested
    );

    const {key} = JSON.parse(args.answer.value);
    let nCorrect = 0;
    secretKey.forEach(function (value, index) {
      if (value === key[index]) {
        nCorrect += 1;
      }
    });
    const is_full_solution = nCorrect === secretKey.length;
    const highestPossibleScore = getHighestPossibleScore(hints);
    const score = is_full_solution ? highestPossibleScore : 0;

    let message = "";
    if (is_full_solution) {
      message = " Votre réponse est exacte.";
    } else {
      message = " Votre réponse est incorrecte.";
    }

    callback(null, {
      score,
      message
    });
  } catch (error) {
    callback(error, null);
  }
};

/**
 * task methods
 */
function getHintsRequested (hints_requested) {
  return (hints_requested ? JSON.parse(hints_requested) : []).filter(
    hr => hr !== null
  );
}

function generateTaskData (params, random_seed, hintsRequested) {
  const {publicData, privateData} = generate(params, random_seed);
  console.log("secretKey :", JSON.stringify(privateData.secretKey));
  const hints = grantHints(privateData.secretKey, hintsRequested);
  publicData.hints = hints;
  publicData.highestPossibleScore = getHighestPossibleScore(hints);
  return {publicData, privateData};
}

function hintRequestEqual (h1, h2) {
  return h1.keyIndex === h2.keyIndex;
}

function grantHints (secretKey, hintRequests) {
  const hints = {};
  hintRequests.forEach(request => {
    hints[request.keyIndex] = secretKey[request.keyIndex];
  });

  return hints;
}

function getHighestPossibleScore (hints) {
  const nHints = Object.keys(hints).length;
  return Math.max(0, 150 - nHints * 20);
}
