import React from "react";
import classnames from "classnames";
import {connect} from "react-redux";
import {updateWorkspace, decrypt} from "../utils";

// A cell containing an encrypted character.
// props: cipherIndex, charIndex, onHover, onMouseDown, className
const Char = props => {
  const {cipherIndex, charIndex, className, value, hintMismatch} = props;
  const onHover = () => {
    props.onHover(cipherIndex, charIndex);
  };
  const onMouseDown = () => {
    props.onMouseDown(cipherIndex, charIndex);
  };
  const classes = [className, hintMismatch && "is-hint-mismatch"];

  return (
    <span
      className={classnames(classes)}
      onMouseMove={onHover}
      onMouseDown={onMouseDown}
    >
      {value}
    </span>
  );
};

// A displayed cipher (table of cipher character cells).
// props: value, index, onHover, onMouseDown
const Cipher = props => {
  const {value, index, onHover, onMouseDown} = props;
  const cipherArray = value.split("");
  return (
    <div className="cipherTable">
      {cipherArray.map((charValue, charIndex) => {
        return (
          <Char
            key={charIndex}
            cipherIndex={index}
            charIndex={charIndex}
            value={charValue}
            onHover={onHover}
            onMouseDown={onMouseDown}
          />
        );
      })}
    </div>
  );
};

// A displayed decryption (table of plain character cells).
// props: cipherValue, wordCharIndex, wordCipherIndex, keyWithWord, cipherIndex, plainWord,
//        onHover, onMouseDown
const Plain = props => {
  const {
    cipherValue,
    wordCharIndex,
    wordCipherIndex,
    keyWithWord,
    cipherIndex,
    plainWord,
    onMouseDown,
    onHover
  } = props;

  const plainArray = decrypt(cipherValue, keyWithWord).split("");

  let startIndex;

  if (plainWord && wordCipherIndex === cipherIndex) {
    startIndex = Math.max(
      0,
      Math.min(wordCharIndex, cipherValue.length - plainWord.length)
    );
    for (
      let index = startIndex;
      index < startIndex + plainWord.length;
      index++
    ) {
      plainArray[index] = plainWord[index - startIndex];
    }
  }

  return (
    <div className="plainTable">
      {plainArray.map((charValue, charIndex) => {
        const inPlain =
          wordCipherIndex === cipherIndex &&
          charIndex >= startIndex &&
          charIndex < startIndex + plainWord.length;
        return (
          <Char
            key={charIndex}
            className={inPlain && "plainChar"}
            cipherIndex={cipherIndex}
            charIndex={charIndex}
            value={charValue}
            onMouseDown={onMouseDown}
            onHover={onHover}
            hintMismatch={keyWithWord[charIndex].hintMismatch}
          />
        );
      })}
    </div>
  );
};

class CiphersAndPlains extends React.PureComponent {
  state = {dragging: false, dropOutside: false};

  onMouseDown = (cipherIndex, charIndex) => {
    if (!this.props.plainWord) return;
    this.setState({dragging: true, dropOutside: false});
    this.props.dispatch({
      type: this.props.setPlainWordPosition,
      cipherIndex,
      charIndex
    });
  };

  onHover = (cipherIndex, charIndex) => {
    if (this.state.dragging) {
      this.setState({dropOutside: false});
      this.props.dispatch({
        type: this.props.setPlainWordPosition,
        cipherIndex,
        charIndex
      });
    }
  };

  onMouseLeave = () => {
    if (this.state.dragging) {
      this.setState({dropOutside: true});
    }
  };

  onMouseUp = () => {
    this.setState({dragging: false});
    if (this.state.dropOutside) {
      this.props.dispatch({
        type: this.props.setPlainWordPosition,
        cipherIndex: null,
        charIndex: 0
      });
    }
  };

  componentDidMount () {
    document.addEventListener("mouseup", this.onMouseUp);
  }

  componentWillUnmount () {
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  render () {
    const {
      ciphers,
      keyWithWord,
      wordCharIndex,
      wordCipherIndex,
      plainWord
    } = this.props;

    return (
      <div className="ciphersAndPlains">
        {ciphers.map((cipherValue, cipherIndex) => {
          return (
            <div key={cipherIndex} onMouseLeave={this.onMouseLeave}>
              <Cipher
                index={cipherIndex}
                value={cipherValue}
                onHover={this.onHover}
                onMouseDown={this.onMouseDown}
              />
              <Plain
                cipherIndex={cipherIndex}
                cipherValue={cipherValue}
                keyWithWord={keyWithWord}
                wordCharIndex={wordCharIndex}
                wordCipherIndex={wordCipherIndex}
                plainWord={plainWord}
                onMouseDown={this.onMouseDown}
                onHover={this.onHover}
              />
            </div>
          );
        })}
      </div>
    );
  }
}

const CiphersAndPlainsSelector = state => {
  const {
    actions: {setPlainWordPosition},
    workspace: {keyWithWord, wordCharIndex, wordCipherIndex},
    taskData: {ciphers, plainWord}
  } = state;

  return {
    plainWord,
    setPlainWordPosition,
    ciphers,
    keyWithWord,
    wordCharIndex,
    wordCipherIndex
  };
};

/* setPlainWordPosition {cipherIndex, charIndex} updates the key so that the
     plain word appears at a specific position in the deciphered text. */
function setPlainWordPositionReducer (state, action) {
  const {cipherIndex, charIndex} = action;
  let {dump, taskData} = state;
  dump = {...dump, wordCharIndex: charIndex, wordCipherIndex: cipherIndex};
  const workspace = updateWorkspace(taskData, dump);
  return {...state, dump, workspace};
}

export default {
  actions: {
    setPlainWordPosition: "Workspace.SetPlainWordPosition"
  },
  actionReducers: {
    setPlainWordPosition: setPlainWordPositionReducer
  },
  views: {
    CiphersAndPlains: connect(CiphersAndPlainsSelector)(CiphersAndPlains)
  }
};
