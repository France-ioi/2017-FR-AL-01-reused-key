import React from "react";
import update from "immutability-helper";
import {connect} from "react-redux";
import {Button} from "react-bootstrap";

const HintsDialog = props => {
  const {dispatch, hints, hintRequest, requestHint, updateHintRequest} = props;

  const allowHints = true;
  const maximumScore = 150;
  const hintCost = 20;
  const highestPossibleScore = Math.max(
    0,
    maximumScore - Object.keys(hints).length * hintCost
  );

  const noHints = () => {
    return (
      <div className="hintsDialog">
        <p>
          <strong>{"Les indices seront bientôt disponibles."}</strong>
        </p>
        <p className="text-center">
          <Button onClick={onCloseHintRequest}>{"Annuler"}</Button>
        </p>
      </div>
    );
  };

  const onCloseHintRequest = () => {
    dispatch({
      type: updateHintRequest,
      request: null
    });
  };

  const onRequestHint = () => {
    dispatch({
      type: requestHint,
      payload: {request: hintRequest}
    });
    onCloseHintRequest();
  };

  if (hintRequest) {
    if (!allowHints) {
      return noHints();
    } else {
      return (
        <div className="hintsDialog">
          <p>
            <strong>{"Indice demandé : "}</strong>
            {"Valeur pour la position "}
            <strong>{hintRequest.keyIndex}</strong>
          </p>
          <p>
            <strong>{"Coût : "}</strong> {hintCost}
          </p>
          <p>
            <strong>{"Score disponible : "}</strong>
            {highestPossibleScore}
          </p>
          <p className="text-center">
            <Button onClick={onRequestHint}>{"Valider"}</Button>
            <Button onClick={onCloseHintRequest}>{"Annuler"}</Button>
          </p>
        </div>
      );
    }
  } else {
    return null;
  }
};

const HintsDialogSelector = (state) => {
  const {
    actions: {requestHint, updateHintRequest},
    taskData: {hints},
    workspace: {hintRequest}
  } = state;

  return {
    hints,
    hintRequest,
    requestHint,
    updateHintRequest
  };
};

const updateHintRequestReducer = (state, {request}) => {
  return update(state, {
    workspace: {hintRequest: {$set: request}}
  });
};

const taskInitReducer = (state, _action) => {
  return update(state, {
    workspace: {hintRequest: {$set: null}}
  });
};

export default {
  actions: {
    updateHintRequest: "Hints.UpdateHintRequest"
  },
  actionReducers: {
    taskInit: taskInitReducer,
    updateHintRequest: updateHintRequestReducer
  },
  views: {
    HintsDialog: connect(HintsDialogSelector)(HintsDialog)
  }
};
