
import React from 'react';
import {Button} from 'react-bootstrap';
import EpicComponent from 'epic-component';

import {decrypt} from './utils';

// A button for increasing/decreasing one key number.
// props: index, direction, onChange
export const KeyButton = EpicComponent(self => {
  const onClick = function () {
    self.props.onChange(self.props.index, self.props.direction);
  };
  self.render = function () {
    const {index, direction} = self.props;
    var iconClassNames = "fa fa-caret-up";
    if(direction == "-1") {
      iconClassNames = "fa fa-caret-down";
    }
    return <Button onClick={onClick}><i className={iconClassNames} aria-hidden='true'></i></Button>;
  };
}, {displayName: 'KeyButton'});


// Display a number in the key, click to get a hint.
// props: index, value, isHint, onRequestHint
export const KeyValue = EpicComponent(self => {
  const onClick = function () {
    if (!self.props.isHint) {
      self.props.onRequestHint(self.props.index);
    }
  };
  self.render = function () {
    const {isHint, value} = self.props;
    return <span className={isHint && "is-hint"} onClick={onClick}>{value}</span>;
  };
}, {displayName: 'KeyValue'});


// A cell containing an encrypted character.
// props: cipherIndex, charIndex, onHover, className
export const CipherChar = EpicComponent(self => {
  function onHover() {
    self.props.onHover(self.props.cipherIndex, self.props.charIndex);
  }
  self.render = function () {
    const {className, value} = self.props;
    return <span className={className} onMouseMove={onHover}>{value}</span>
  };
}, {displayName: 'CipherChar'});

// A cell containing a decrypted character.
// props: cipherIndex, charIndex, onHover, className
export const PlainChar = EpicComponent(self => {
  function onHover() {
    self.props.onHover(self.props.cipherIndex, self.props.charIndex);
  }
  function onMouseDown() {
    self.props.onMouseDown(self.props.cipherIndex, self.props.charIndex);
  }
  self.render = function () {
    const {className, value} = self.props;
    return <span className={className} onMouseDown={onMouseDown} onMouseMove={onHover}>{value}</span>;
  };
}, {displayName: 'PlainChar'});

// A displayed cipher (table of cipher character cells).
// props: value, index, onHover
export const Cipher = EpicComponent(self => {
  self.render = function () {
    const {value, index, onHover} = self.props;
    const cipherArray = value.split("");
    return (
      <div className="cipherTable">
        {cipherArray.map(function(charValue, charIndex) {
          return <CipherChar key={charIndex} cipherIndex={index} charIndex={charIndex} value={charValue} onHover={onHover}/>
        })}
      </div>
    );
  };
}, {displayName: 'Cipher'});

// A displayed decryption (table of plain character cells).
// props: cipherValue, wordCharIndex, wordCipherIndex, keyWithWord, cipherIndex, plainWord,
//        onHover, onMouseDown
export const Plain = EpicComponent(self => {
  self.render = function () {
    const {cipherValue, wordCharIndex, wordCipherIndex, keyWithWord, cipherIndex, plainWord, onMouseDown, onHover} = self.props;
    const plainArray = decrypt(cipherValue, keyWithWord).split("");
    let startIndex;
    if(wordCipherIndex === cipherIndex) {
      startIndex = Math.max(0, Math.min(wordCharIndex, cipherValue.length - plainWord.length));
      for(let index = startIndex; index < startIndex + plainWord.length; index++) {
        plainArray[index] = plainWord[index - startIndex];
      }
    }
    return (
      <div className="plainTable">
        {plainArray.map(function(charValue, charIndex) {
          const inPlain = wordCipherIndex === cipherIndex && charIndex >= startIndex && charIndex < startIndex + plainWord.length;
          return <PlainChar key={charIndex} className={inPlain && "plainChar"} cipherIndex={cipherIndex} charIndex={charIndex} value={charValue} onMouseDown={onMouseDown} onHover={onHover}/>;
        })}
      </div>
    );
  };
}, {
  displayName: 'Plain',
  propTypes: {
    cipherValue: React.PropTypes.string.isRequired,
    wordCharIndex: React.PropTypes.number.isRequired,
    wordCipherIndex: React.PropTypes.number,
    keyWithWord: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    cipherIndex: React.PropTypes.number.isRequired,
    plainWord: React.PropTypes.string.isRequired,
    onHover: React.PropTypes.func.isRequired,
    onMouseDown: React.PropTypes.func.isRequired
  }
});

const preventDefault = function (event) {
  event.preventDefault();
};

export const View = actions => EpicComponent(self => {

  self.state = {dragging: false, dropOutside: false};

  const onKeyChange = function (index, direction) {
    const {key} = self.props.workspace;
    self.props.dispatch({type: actions.keyChange, index, direction});
  };

  const onMouseDown = function (cipherIndex, charIndex) {
    self.setState({dragging: true, dropOutside: false});
    self.props.dispatch({type: actions.setPlainWordPosition, cipherIndex, charIndex});
  };

  const onHover = function(cipherIndex, charIndex) {
    if (self.state.dragging) {
      self.setState({dropOutside: false});
      self.props.dispatch({type: actions.setPlainWordPosition, cipherIndex, charIndex});
    }
  };

  const onMouseLeave = function() {
    if (self.state.dragging) {
      self.setState({dropOutside: true});
    }
  };

  const onRequestHint = function (keyIndex) {
    const request = {keyIndex};
    self.props.dispatch({type: actions.requestHint, request});
  };

  const onMouseUp = function() {
    self.setState({dragging: false});
    if(self.state.dropOutside) {
      self.props.dispatch({type: actions.setPlainWordPosition, cipherIndex: null, charIndex: 0});
    }
  };

  self.componentDidMount = function () {
    document.addEventListener('mouseup', onMouseUp);
  };

  self.componentWillUnmount = function () {
    document.removeEventListener('mouseup', onMouseUp);
  };

  self.render = function () {
    const {score, task, workspace, dispatch} = self.props;
    const {keyWithHints, keyWithWord, wordCharIndex, wordCipherIndex} = workspace;
    const {ciphers, plainWord} = task;
    const wordStartIndex = Math.max(0, Math.min(wordCharIndex, keyWithHints.length - plainWord.length));
    return (
      /* preventDefault is called because browsers default to a visual dragging of HTML elements */
      <div onMouseMove={preventDefault}>
        <div className="keyTable">
          <div>
            {keyWithHints.map(function(keyValue, keyIndex) {
              if(wordCipherIndex !== null && keyIndex >= wordStartIndex && keyIndex < wordStartIndex + plainWord.length) {
                return <span key={keyIndex}></span>;
              }
              return (
                <span key={keyIndex}>
                  {keyValue.isHint || <KeyButton index={keyIndex} direction="1" onChange={onKeyChange} />}
                </span>
              );
            })}
          </div>
          <div>
            {keyWithWord.map(function(keyValue, keyIndex) {
              return (
                <KeyValue key={keyIndex} index={keyIndex} value={keyValue.value} isHint={keyValue.isHint} onRequestHint={onRequestHint}/>
              );
            })}
          </div>
          <div>
            {keyWithHints.map(function(keyValue, keyIndex) {
              if(wordCipherIndex !== null && keyIndex >= wordStartIndex && keyIndex < wordStartIndex + plainWord.length) {
                return <span key={keyIndex}></span>;
              }
              return (
                <span key={keyIndex}>
                  {keyValue.isHint || <KeyButton index={keyIndex} direction="-1" onChange={onKeyChange} />}
                </span>
              );
            })}
          </div>
        </div>
        <div className="ciphersAndPlains">
          {ciphers.map(function(cipherValue, cipherIndex) {
            return (
              <div key={cipherIndex} onMouseLeave={onMouseLeave}>
                <Cipher index={cipherIndex} value={cipherValue} onHover={onHover} />
                <Plain cipherIndex={cipherIndex} cipherValue={cipherValue} keyWithWord={keyWithWord} wordCharIndex={wordCharIndex} wordCipherIndex={wordCipherIndex} plainWord={plainWord} onMouseDown={onMouseDown} onHover={onHover} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

}, {displayName: 'View'});
