
const words = require('./words');
const seedrandom = require('seedrandom');

module.exports = generate;

function generate (params, seed, callback) {
  const rng = seedrandom(seed);
  // TODO choose ciphers and plain word.
  var minLength = words[0][0].length;
  var cipherLengths = [
    [7, 10, 8, 7],
    [10, 9, 9, 4],
    [5, 10, 7, 10],
    [4, 5, 6, 4, 5, 6]
  ];

  var ciphers = [];
  var plainWord = "";
  for (var iCipher = 0; iCipher < cipherLengths.length; iCipher++) {
     var cipher = "";
     for (var iWord = 0; iWord < cipherLengths[iCipher].length; iWord++) {
        if (iWord != 0) {
           cipher += " ";
        }
        var length = cipherLengths[iCipher][iWord];
        var iChoice = Math.trunc(rng() * words[length - minLength].length);
        var word = words[length - minLength][iChoice];
        cipher += word;
        if ((iCipher == 0) && (iWord == cipherLengths[iCipher].length - 1)) {
           plainWord = word;
        }
     }
     ciphers.push(cipher);
  }

  var secretKey = [];
  for (let iKey = 0; iKey < ciphers[0].length; iKey++) {
     secretKey.push(Math.trunc(rng() * 26));
  }

  for (let iCipher = 0; iCipher < ciphers.length; iCipher++) {
     var newCipher = "";
     for (let iLetter = 0; iLetter < secretKey.length; iLetter++) {
        var letter = ciphers[iCipher][iLetter];
        if ((letter == ' ') || (letter == '_')) {
           newCipher += ' ';
        } else {
           var rank = letter.charCodeAt(0) - "A".charCodeAt(0);
           rank = (rank - secretKey[iLetter] + 26) % 26;
           newCipher += String.fromCharCode(rank + "A".charCodeAt(0));
        }
     }
     ciphers[iCipher] = newCipher;
  }
  // TODO hints.
  var task = {ciphers, plainWord, hints: {}};
  var full_task = Object.assign({secretKey: secretKey}, task);

  callback(null, {task, full_task});

};
