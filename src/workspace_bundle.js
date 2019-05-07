import React from "react";
import {connect} from "react-redux";

const Workspace = props => {
  const onPreventDefault = event => {
    event.preventDefault();
  };
  const {PlainWord, HintsDialog, KeyTable, CiphersAndPlains} = props.views;

  return (
    /* preventDefault is called because browsers default to a visual dragging of HTML elements */
    <div onMouseMove={onPreventDefault} className="taskWrapper">
      <div className="taskInstructions">
        <PlainWord />
        <HintsDialog />
      </div>
      <KeyTable />
      <CiphersAndPlains />
    </div>
  );
};

/* The 'Workspace' view displays the main task view to the contestant. */
function WorkspaceSelector (state) {
  return {
    views: state.views
  };
}

export default {
  views: {
    Workspace: connect(WorkspaceSelector)(Workspace)
  }
};
