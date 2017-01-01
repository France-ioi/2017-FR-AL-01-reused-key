import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';
import {include, defineAction, addReducer} from 'epic-linker';
import WorkspaceBuilder from 'alkindi-task-lib/simple_workspace';

export default function* (deps) {

  /* Actions dispatched by the workspace */

  yield defineAction('keyChange', 'Workspace.KeyChange');
  yield defineAction('setPlainWordPosition', 'Workspace.SetPlainWordPosition');

  /* Simple workspace interface: init, dump, load, update, View */

  const init = function (task) {
    const {ciphers} = task;
    const key = [];
    for (let index = 0; index < ciphers[0].length; index++) {
      key.push({
        value: 0
      });
    }
    const keyWithWord = key.slice(0);
    return {key, keyWithWord, wordCharIndex: 0, wordCipherIndex: null};
  };

  const dump = function (workspace) {
    // Extract the smallest part of the workspace that is needed to rebuild it.
    const {key, wordCharIndex, wordCipherIndex} = workspace;
    return {key, wordCharIndex, wordCipherIndex};
  };

  const load = function (dump) {
    // Use a saved dump to rebuild a workspace.  Any computation that depends
    // on the task is done in update.
    const {key, wordCharIndex, wordCipherIndex} = dump;
    return {key, wordCharIndex, wordCipherIndex};
  };

  const update = function (task, workspace) {
    const {plainWord, ciphers} = task;
    const {key, wordCharIndex, wordCipherIndex} = workspace;
    const keyWithWord = generateKeyWithWord(key, plainWord, wordCharIndex, ciphers[wordCipherIndex]);
    return {...workspace, keyWithWord};
  };

  // A button for increasing/decreasing one key number.
  // props: index, direction, onChange
  const KeyButton = EpicComponent(self =>
    const onClick = function () {
      self.props.onChange(self.props.index, self.props.direction);
    };
    self.render = function () {
      const {index, direction} = props;
      var text = "^";
      if(direction == "-1") {
        text = "v";
      }
      return <Button onClick={onClick}>{text}</Button>;
    };
  });

  const View = EpicComponent(self => {

    self.state = {dragging: false};

    const onKeyChange = function (index, direction) {
      self.props.dispatch({type: deps.keyChange, index, direction});
    };

    const onMouseDown = function (cipherIndex, charIndex) {
      self.setState({dragging: true});
      self.props.dispatch({type: deps.setPlainWordPosition, cipherIndex, charIndex});
    };

    const onMouseMove = function(cipherIndex, charIndex) {
      if (self.state.dragging) {
        self.props.dispatch({type: deps.setPlainWordPosition, cipherIndex, charIndex});
      }
    };

    const onMouseUp = function() {
      self.setState({dragging: false});
    };

    // TODO should these components be defined here? Do they need to be consts?

    // A cell containig on encrypted character. Sensitive to mouse movement during drag.
    function CipherChar(props) {
      return <td onMouseMove={() => onMouseMove(props.cipherIndex, props.charIndex)}>{props.value}</td>;
    }

    // A cell containing a decrypted character. Sensitive to mouse movement + mouse down.
    function PlainChar(props) {
      return <td className={props.className} onMouseDown={() => onMouseDown(props.cipherIndex, props.charIndex)} onMouseMove={() => onMouseMove(props.cipherIndex, props.charIndex)}>{props.value}</td>;
    }

    // A displayed cipher (table of cipher character cells).
    function Cipher(props) {
      const cipherArray = props.value.split("");
      return (
        <table className="cipherTable">
          <tr>
            {cipherArray.map(function(charValue, charIndex) {
              return <CipherChar cipherIndex={props.index} charIndex={charIndex} value={charValue}/>
            })}
          </tr>
        </table>
      );
    }

    // Auxiliary function to decrypt a cipher string given a key.
    function decrypt(cipher, key) {
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

    // A displayed decryption (table of plain character cells).
    function Plain(props) {
      const {cipherValue, wordCharIndex, wordCipherIndex, keyWithWord, cipherIndex, plainWord} = props;
      var plainArray = decrypt(cipherValue, keyWithWord).split("");
      var startIndex = Math.max(0, Math.min(wordCharIndex, cipherValue.length - plainWord.length));
      if(wordCipherIndex === cipherIndex) {
        for(var index = startIndex; index < startIndex + plainWord.length; index++) {
          plainArray[index] = plainWord[index - startIndex];
        }
      }
      return (
        <table className="plainTable">
          <tr>
            {plainArray.map(function(charValue, charIndex) {
              if(wordCipherIndex === cipherIndex && charIndex >= startIndex && charIndex < startIndex + plainWord.length) {
                return <PlainChar className="plainChar" cipherIndex={cipherIndex} charIndex={charIndex} value={charValue}/>
              }
              return <PlainChar cipherIndex={cipherIndex} charIndex={charIndex} value={charValue}/>
            })}
          </tr>
        </table>
      );
    }

    self.render = function () {
      const {score, task, workspace, dispatch} = self.props;
      const {key, keyWithWord, wordCharIndex, wordCipherIndex} = workspace;
      const {ciphers, plainWord} = task;
      const wordStartIndex = Math.max(0, Math.min(wordCharIndex, key.length - plainWord.length));
      return (
        /* TODO how to cach mouse up in entire document? */
        /* preventDefault is called because browsers default to a visual dragging of HTML elements */
        <div onMouseUp={() => onMouseUp()} onMouseMove={(event) => event.preventDefault()}>
          <table className="keyTable">
            <tr>
              {key.map(function(keyValue, keyIndex) {
                if(wordCipherIndex !== null && keyIndex >= wordStartIndex && keyIndex < wordStartIndex + plainWord.length) {
                  return <td key={keyIndex}></td>;
                }
                return <td key={keyIndex}><KeyButton index={keyIndex} direction="1" onChange={onKeyChange} /></td>;
              })}
            </tr>
            <tr>
              {keyWithWord.map(function(keyValue, keyIndex) {
                return <td key={keyIndex}>{keyValue.value}</td>;
              })}
            </tr>
            <tr>
              {key.map(function(keyValue, keyIndex) {
                if(wordCipherIndex !== null && keyIndex >= wordStartIndex && keyIndex < wordStartIndex + plainWord.length) {
                  return <td key={keyIndex}></td>;
                }
                return <td key={keyIndex}><KeyButton index={keyIndex} direction="-1" onChange={onKeyChange} /></td>;
              })}
            </tr>
          </table>
          <div className="ciphersAndPlains">
            {ciphers.map(function(cipherValue, cipherIndex) {
              return (
                <div>
                  <Cipher index={cipherIndex} value={cipherValue} />
                  <Plain cipherIndex={cipherIndex} cipherValue={cipherValue} keyWithWord={keyWithWord} wordCharIndex={wordCharIndex} wordCipherIndex={wordCipherIndex} plainWord={plainWord} />
                </div>
              );
            })}
          </div>
        </div>
      );
    };

  });

  yield include(WorkspaceBuilder({init, dump, load, update, View}));

  /*
    Add reducers for workspace actions and any needed sagas below:
  */

  const ALPHABET_SIZE = 26;
  const ALPHABET_START = 'A'.charCodeAt(0);

  // Change key by clicking increase/decrease.
  yield addReducer('keyChange', function (state, action) {
    let {index, direction} = action;
    let {workspace} = state;

    // TODO is this cloning needed? Task seems to work without it, not sure why.
    let key = workspace.key.slice(0);
    let keyWithWord = workspace.keyWithWord.slice(0);

    const newValue = (key[index].value + parseInt(direction) + ALPHABET_SIZE) % ALPHABET_SIZE;
    key[index] = {
      value: newValue
    };
    /* TODO should we check if this index is inside the decrypted word part?
     * (The user should not be able to click such a button, because it's hidden).
     */
    keyWithWord[index] = {
      value: newValue
    };
    workspace = {...workspace, key, keyWithWord};
    return {...state, workspace};
  });

  // Generate a keyWithWord from a key (keyWithWord takes the decrypted word into account).
  function generateKeyWithWord(key, plainWord, wordCharIndex, cipher) {
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

  // Dragging: handle mouse movement.
  yield addReducer('setPlainWordPosition', function (state, action) {
    let {cipherIndex, charIndex} = action;
    let {workspace} = state;
    const wordCharIndex = charIndex;
    const wordCipherIndex = cipherIndex;
    let {key, keyWithWord} = workspace;
    const {plainWord, ciphers} = state.task;
    keyWithWord = generateKeyWithWord(key, plainWord, wordCharIndex, ciphers[cipherIndex]);
    workspace = {...workspace, wordCharIndex, wordCipherIndex, keyWithWord};
    return {...state, workspace};
  });
};
