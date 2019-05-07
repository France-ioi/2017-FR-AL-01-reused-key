export const ALPHABET_SIZE = 26;
export const ALPHABET_START = "A".charCodeAt(0);

// Auxiliary function to decrypt a cipher string given a key.
export function decrypt (cipher, key) {
  var result = "";
  for (var index = 0; index < cipher.length; index++) {
    var letter;
    if (cipher[index] === " ") {
      letter = " ";
    } else {
      letter = String.fromCharCode(
        ((cipher.charCodeAt(index) - ALPHABET_START + key[index].value) %
          ALPHABET_SIZE) +
          ALPHABET_START
      );
    }
    result += letter;
  }
  return result;
}

// Generate a keyWithWord from a key (keyWithWord takes the decrypted word into account).
export function generateKeyWithWord (key, plainWord, wordCharIndex, cipher) {
  const keyWithWord = key.slice();
  const wordStartIndex = Math.max(
    0,
    Math.min(wordCharIndex, key.length - plainWord.length)
  );
  for (
    var index = wordStartIndex;
    index < wordStartIndex + plainWord.length;
    index++
  ) {
    if (cipher[index] !== " ") {
      const newValue =
        (plainWord.charCodeAt(index - wordStartIndex) -
          cipher.charCodeAt(index) +
          ALPHABET_SIZE) %
        ALPHABET_SIZE;
      const cell = (keyWithWord[index] = {...key[index], inWord: true});
      if (cell.isHint) {
        if (cell.value !== newValue) {
          cell.hintMismatch = true;
        }
      } else {
        cell.value = newValue;
      }
    }
  }
  return keyWithWord;
}

/* Helper function to compute the workspace when the task or workspace has
  changed.  The workspace includes enriched versions of the key including
  hints and the placed plain-text word. */
export function updateWorkspace (task, dump) {
  const {plainWord, ciphers, hints} = task;
  const {key, wordCharIndex, wordCipherIndex} = dump;
  // Update the key with hints.
  const keyWithHints = key.map(function (value, index) {
    if (index in hints) {
      return {value: hints[index], isHint: true};
    } else {
      return {value: value, isHint: false};
    }
  });
  // Update the key with the positioned word.
  const keyWithWord =
    wordCipherIndex !== null
      ? generateKeyWithWord(
          keyWithHints,
          plainWord,
          wordCharIndex,
          ciphers[wordCipherIndex]
        )
      : keyWithHints;
  return {...dump, keyWithHints, keyWithWord};
}
