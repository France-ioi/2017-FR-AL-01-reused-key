
// Auxiliary function to decrypt a cipher string given a key.
export function decrypt(cipher, key) {
  var result = "";
  for(var index = 0; index < cipher.length; index++) {
    var letter;
    if(cipher[index] === ' ') {
      letter = ' ';
    }
    else {
      letter = ((cipher.charCodeAt(index) - ALPHABET_START + key[index].value) % ALPHABET_SIZE) + ALPHABET_START;
    }
    result += String.fromCharCode(letter);
  }
  return result;
}

// Generate a keyWithWord from a key (keyWithWord takes the decrypted word into account).
export function generateKeyWithWord(key, plainWord, wordCharIndex, cipher) {
  var keyWithWord = key.slice(0);
  const wordStartIndex = Math.max(0, Math.min(wordCharIndex, key.length - plainWord.length));
  for(var index = wordStartIndex; index < wordStartIndex + plainWord.length; index++) {
    if(cipher[index] === ' ') {
      // TODO is this the desired behavior?
      keyWithWord[index] = {
        value: 0
      };
    }
    else {
      keyWithWord[index] = {
        value: (plainWord.charCodeAt(index - wordStartIndex) - cipher.charCodeAt(index) + ALPHABET_SIZE) % ALPHABET_SIZE
      };
    }
  }
  return keyWithWord;
}

export const preventDefault = function (event) {
  event.preventDefault();
};
