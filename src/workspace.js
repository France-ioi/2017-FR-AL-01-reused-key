import React from 'react';
import EpicComponent from 'epic-component';
import {include, defineAction, addReducer} from 'epic-linker';
import WorkspaceBuilder from 'alkindi-task-lib/simple_workspace';

import {generateKeyWithWord, ALPHABET_SIZE} from './utils';
import {KeyButton, Cipher, Plain, preventDefault} from './views';

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

  const View = EpicComponent(self => {

    self.state = {dragging: false};

    const onKeyChange = function (index, direction) {
      const {key} = self.props.workspace;
      const value = (key[index].value + parseInt(direction) + ALPHABET_SIZE) % ALPHABET_SIZE;
      self.props.dispatch({type: deps.keyChange, index, value});
    };

    const onMouseDown = function (cipherIndex, charIndex) {
      self.setState({dragging: true});
      self.props.dispatch({type: deps.setPlainWordPosition, cipherIndex, charIndex});
    };

    const onHover = function(cipherIndex, charIndex) {
      if (self.state.dragging) {
        self.props.dispatch({type: deps.setPlainWordPosition, cipherIndex, charIndex});
      }
    };

    const onMouseUp = function() {
      self.setState({dragging: false});
    };

    self.render = function () {
      const {score, task, workspace, dispatch} = self.props;
      const {key, keyWithWord, wordCharIndex, wordCipherIndex} = workspace;
      const {ciphers, plainWord} = task;
      const wordStartIndex = Math.max(0, Math.min(wordCharIndex, key.length - plainWord.length));
      return (
        /* TODO how to cach mouse up in entire document? */
        /* preventDefault is called because browsers default to a visual dragging of HTML elements */
        <div onMouseUp={onMouseUp} onMouseMove={preventDefault}>
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
                  <Cipher index={cipherIndex} value={cipherValue} onHover={onHover} />
                  <Plain cipherIndex={cipherIndex} cipherValue={cipherValue} keyWithWord={keyWithWord} wordCharIndex={wordCharIndex} wordCipherIndex={wordCipherIndex} plainWord={plainWord} onMouseDown={onMouseDown} onHover={onHover} />
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

  // Change the key value at the given index.
  yield addReducer('keyChange', function (state, action) {
    const {index, value} = action;
    let {workspace} = state;
    const {plainWord, wordCharIndex} = workspace;
    let {key, keyWithWord} = workspace;

    // Update the key non-destructively.
    key = workspace.key.slice();
    key[index] = {
      value: value
    };

    // Update keyWithWord unless the plain word hides the change.
    if (index < wordCharIndex || index >= wordCharIndex + plainWord.length) {
      keyWithWord = workspace.keyWithWord.slice();
      keyWithWord[index] = {
        value: value
      };
    }

    workspace = {...workspace, key, keyWithWord};
    return {...state, workspace};
  });

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
