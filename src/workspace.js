import React from 'react';
import EpicComponent from 'epic-component';
import {include, use, defineAction, addReducer, addSaga} from 'epic-linker';
import WorkspaceBuilder from 'alkindi-task-lib/simple_workspace';

import {generateKeyWithWord, ALPHABET_SIZE} from './utils';
import {View} from './views';
import {grantHint, getTask} from './hints';

export default function* (deps) {

  /* Actions dispatched by the workspace */

  yield defineAction('keyChange', 'Workspace.KeyChange');
  yield defineAction('setPlainWordPosition', 'Workspace.SetPlainWordPosition');

  // The 'requestHint' action is passed to the workspace's View.
  yield use('requestHint');
  yield defineAction('showHintRequest', 'Hint.ShowRequest');

  /* Simple workspace interface: init, dump, load, update, View */

  const init = function (task) {
    const {ciphers} = task;
    const key = [];
    for (let index = 0; index < ciphers[0].length; index++) {
      key.push(0);
    }
    return update(task, {key, wordCharIndex: 0, wordCipherIndex: null});
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
    const {plainWord, ciphers, hints} = task;
    const {key, wordCharIndex, wordCipherIndex} = workspace;
    // Update the key with hints.
    const keyWithHints = key.map(function (value, index) {
      if (index in hints) {
        return {value: hints[index], isHint: true};
      } else {
        return {value: value, isHint: false};
      }
    });
    // Update the key with the positioned word.
    const keyWithWord = (wordCipherIndex !== null) ? generateKeyWithWord(keyWithHints, plainWord, wordCharIndex, ciphers[wordCipherIndex]) : keyWithHints;
    return {...workspace, keyWithHints, keyWithWord};
  };

  yield include(WorkspaceBuilder({init, dump, load, update, View: View(deps)}));

  // TODO: move to alkindi-task-lib, and hintRequest out of workspace
  yield addReducer('showHintRequest', function (state, action) {
    const {workspace} = state;
    const {keyIndex} = action;
    let hintRequest = null;
    if (keyIndex !== false) {
      hintRequest = {keyIndex};
    }
    return {...state, workspace: {...workspace, hintRequest}};
  });

  /*
    Temporary reducer for local processing of hints during development.
    This will ultimately be provided by the WorkspaceBuilder.
  */
  yield addReducer('requestHint', function (state, action) {
     // Process the hint request locally only if full_task is available.
     let {full_task} = state;
     if (!full_task) {
        return state;
     }
     const {request} = action;
     full_task = grantHint(full_task, request);
     const task = getTask(full_task);
     return {...state, task, full_task, workspace: {...update(task, state.workspace), hintRequest: false}};
  });

  /*
    Add reducers for workspace actions and any needed sagas below:
  */

  // Change the key value at the given index.
  yield addReducer('keyChange', function (state, action) {
    const {index, direction} = action;
    let {workspace, task} = state;
    const {plainWord} = task;
    const {wordCharIndex, wordCipherIndex} = workspace;
    let {key, keyWithWord} = workspace;
    const newValue = (key[index] + parseInt(direction) + ALPHABET_SIZE) % ALPHABET_SIZE;

    // Update the key non-destructively.
    key = workspace.key.slice();
    key[index] = newValue;

    workspace = update(task, {...workspace, key});
    return {...state, workspace};
  });

  // Update the key so that the plain word appears at a specific position in
  // the deciphered text.
  yield addReducer('setPlainWordPosition', function (state, action) {
    const {cipherIndex, charIndex} = action;
    let {workspace} = state;
    workspace = update(state.task, {...workspace, wordCharIndex: charIndex, wordCipherIndex: cipherIndex});
    return {...state, workspace};
  });
};
