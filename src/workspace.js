import React from 'react';
import EpicComponent from 'epic-component';
import {include, defineAction, addReducer} from 'epic-linker';
import WorkspaceBuilder from 'alkindi-task-lib/simple_workspace';

import {generateKeyWithWord, ALPHABET_SIZE} from './utils';
import {View} from './views';

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

  yield include(WorkspaceBuilder({init, dump, load, update, View: View(deps)}));

  /*
    Add reducers for workspace actions and any needed sagas below:
  */

  // Change the key value at the given index.
  yield addReducer('keyChange', function (state, action) {
    const {index, direction} = action;
    let {workspace, task} = state;
    const {plainWord} = task;
    const {wordCharIndex} = workspace;
    let {key, keyWithWord} = workspace;
    const newValue = (key[index].value + parseInt(direction) + ALPHABET_SIZE) % ALPHABET_SIZE;

    // Update the key non-destructively.
    key = workspace.key.slice();
    key[index] = {
      value: newValue
    };

    // Update keyWithWord unless the plain word hides the change.
    if (index < wordCharIndex || index >= wordCharIndex + plainWord.length) {
      keyWithWord = workspace.keyWithWord.slice();
      keyWithWord[index] = {
        value: newValue
      };
    }

    workspace = {...workspace, key, keyWithWord};
    return {...state, workspace};
  });

  // Update the key so that the plain word appears at a specific position in
  // the deciphered text.
  yield addReducer('setPlainWordPosition', function (state, action) {
    const {cipherIndex, charIndex} = action;
    let {workspace} = state;
    const {plainWord, ciphers} = state.task;
    const keyWithWord = generateKeyWithWord(workspace.key, plainWord, charIndex, ciphers[cipherIndex]);
    workspace = {...workspace, wordCharIndex: charIndex, wordCipherIndex: cipherIndex, keyWithWord};
    return {...state, workspace};
  });
};
