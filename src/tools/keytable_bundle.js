import React from "react";
import classnames from "classnames";
import {connect} from "react-redux";
import {Button} from "react-bootstrap";
import {ALPHABET_SIZE, updateWorkspace} from "../utils";

// A button for increasing/decreasing one key number.
// props: index, direction, onChange
const KeyButton = props => {
  const {index, direction, onChange} = props;
  const onClick = () => {
    onChange(index, direction);
  };
  const iconClasses = [
    "fa",
    direction == "-1" ? "fa-caret-down" : "fa-caret-up"
  ];

  return (
    <Button onClick={onClick}>
      <i className={classnames(iconClasses)} aria-hidden="true" />
    </Button>
  );
};

// Display a number in the key, click to get a hint.
// props: index, value, isHint, onRequestHint, hintRequest, hintMismatch.
const KeyValue = props => {
  const {
    index,
    isHint,
    hintMismatch,
    isHintRequest,
    value,
    onSetHintRequest
  } = props;
  const onClick = () => {
    if (!isHint) {
      onSetHintRequest(index);
    }
  };
  const classes = [
    isHint && "is-hint",
    hintMismatch && "is-hint-mismatch",
    isHintRequest && "is-hint-request",
    "keyValue"
  ];

  return (
    <span className={classnames(classes)} onClick={onClick}>
      {value}
    </span>
  );
};

const KeyTable = props => {
  const {
    keyWithWord,
    hintRequest,
    keyChange,
    updateHintRequest,
    dispatch
  } = props;

  const onKeyChange = (index, direction) => {
    dispatch({
      type: keyChange,
      index,
      direction
    });
  };

  const onSetHintRequest = keyIndex => {
    dispatch({
      type: updateHintRequest,
      request: {keyIndex}
    });
  };

  const renderButtonArrows = direction => {
    return keyWithWord.map((keyValue, keyIndex) => {
      if (keyValue.inWord) {
        return <span key={keyIndex} />;
      } else {
        return (
          <span key={keyIndex}>
            {keyValue.isHint || (
              <KeyButton
                index={keyIndex}
                direction={direction}
                onChange={onKeyChange}
              />
            )}
          </span>
        );
      }
    });
  };

  const renderKeyStr = () => {
    return keyWithWord.map((keyValue, keyIndex) => {
      return (
        <KeyValue
          key={keyIndex}
          index={keyIndex}
          value={keyValue.value}
          isHint={keyValue.isHint}
          hintMismatch={keyValue.hintMismatch}
          isHintRequest={hintRequest && hintRequest.keyIndex === keyIndex} // selected hint request index, for highlighting
          onSetHintRequest={onSetHintRequest}
        />
      );
    });
  };

  return (
    <div className="keyTable">
      <div>{renderButtonArrows("1")}</div>
      <div>{renderKeyStr()} </div>
      <div>{renderButtonArrows("-1")}</div>
    </div>
  );
};

const KeyTableSelector = state => {
  const {
    actions: {keyChange, updateHintRequest},
    workspace: {keyWithWord, hintRequest}
  } = state;

  return {
    keyWithWord,
    hintRequest,
    keyChange,
    updateHintRequest
  };
};

/* keyChange {index, direction} updates the key by incrementing/decrementing
     a value in the key. */
const keyChangeReducer = (state, action) => {
  const {index, direction} = action;
  let {dump, taskData} = state;
  const key = dump.key.slice();
  key[index] =
    (key[index] + parseInt(direction) + ALPHABET_SIZE) % ALPHABET_SIZE;
  dump = {...dump, key};
  const workspace = updateWorkspace(taskData, dump);
  return {...state, dump, workspace};
};

export default {
  actions: {
    keyChange: "Workspace.KeyChange"
  },
  actionReducers: {
    keyChange: keyChangeReducer
  },
  views: {
    KeyTable: connect(KeyTableSelector)(KeyTable)
  }
};
