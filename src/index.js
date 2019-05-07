import algoreaReactTask from "./algorea_react_task";
import {updateWorkspace} from "./utils";

import "font-awesome/css/font-awesome.css";
import "bootstrap/dist/css/bootstrap.css";
import "./style.css";
import "./platform.css";
import "rc-tooltip/assets/bootstrap.css";

import WorkspaceBundle from "./workspace_bundle";
import PlainwordBundle from "./tools/plainword_bundle";
import HintsBundle from "./tools/hints_bundle";
import KeyTableBundle from "./tools/keytable_bundle";
import CiphersAndPlainsBundle from "./tools/ciphersandplains_bundle";

const TaskBundle = {
  actionReducers: {
    appInit: appInitReducer,
    taskInit: taskInitReducer /* possibly move to algorea-react-task */,
    taskRefresh: taskRefreshReducer /* possibly move to algorea-react-task */,
    taskAnswerLoaded: taskAnswerLoaded,
    taskStateLoaded: taskStateLoaded
  },
  includes: [PlainwordBundle, HintsBundle, KeyTableBundle, CiphersAndPlainsBundle, WorkspaceBundle],
  selectors: {
    getTaskState,
    getTaskAnswer
  }
};

if (process.env.NODE_ENV === "development") {
  /* eslint-disable no-console */
  TaskBundle.earlyReducer = function (state, action) {
    console.log("ACTION", action.type, action);
    return state;
  };
}

function appInitReducer (state, _action) {
  const taskMetaData = {
    id: "http://concours-alkindi.fr/tasks/2018/enigma",
    language: "fr",
    version: "fr.01",
    authors: "Sébastien Carlier",
    translators: [],
    license: "",
    taskPathPrefix: "",
    modulesPathPrefix: "",
    browserSupport: [],
    fullFeedback: true,
    acceptedAnswers: [],
    usesRandomSeed: true
  };
  return {...state, taskMetaData};
}

function taskInitReducer (state, _action) {
  const {ciphers} = state.taskData;
  const key = [];
  for (let index = 0; index < ciphers[0].length; index++) {
    key.push(0);
  }
  const dump = {key, wordCharIndex: 0, wordCipherIndex: null};
  const workspace = updateWorkspace(state.taskData, dump);
  return {...state, dump, workspace, taskReady: true};
}

function taskRefreshReducer (state, _action) {
  ``;
  const workspace = updateWorkspace(state.taskData, state.dump);
  /* state.dump could be reconciled with new state.task here */
  return {...state, workspace};
}

function getTaskAnswer (state) {
  return {key: state.workspace.keyWithWord.map(c => c.value)};
}

function taskAnswerLoaded (state, {payload: {key}}) {
  const {wordCharIndex, wordCipherIndex} = state.workspace;
  const dump = {key, wordCharIndex, wordCipherIndex};
  const workspace = updateWorkspace(state.taskData, dump);
  return {...state, workspace};
}

function getTaskState (state) {
  const {key, wordCharIndex, wordCipherIndex} = state.workspace;
  return {key, wordCharIndex, wordCipherIndex};
}

function taskStateLoaded (state, {payload: {dump}}) {
  const workspace = updateWorkspace(state.taskData, dump);
  /* state.dump could be reconciled with new state.task here */
  return {...state, workspace};
}

export function run (container, options) {
  return algoreaReactTask(container, options, TaskBundle);
}
