
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
    var text = "^";
    if(direction == "-1") {
      text = "v";
    }
    return <Button onClick={onClick}>{text}</Button>;
  };
});


// A cell containing an encrypted character.
// props: cipherIndex, charIndex, onHover, className
export const CipherChar = EpicComponent(self => {
  function onHover() {
    self.props.onHover(self.props.cipherIndex, self.props.charIndex);
  }
  self.render = function () {
    const {className, value} = self.props;
    return <td className={className} onMouseMove={onHover}>{value}</td>
  };
});

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
    return <td className={className} onMouseDown={onMouseDown} onMouseMove={onHover}>{value}</td>;
  };
});

// A displayed cipher (table of cipher character cells).
// props: value, index, onHover
export const Cipher = EpicComponent(self => {
  self.render = function () {
    const {value, index, onHover} = self.props;
    const cipherArray = value.split("");
    return (
      <table className="cipherTable">
        <tr>
          {cipherArray.map(function(charValue, charIndex) {
            return <CipherChar cipherIndex={index} charIndex={charIndex} value={charValue} onHover={onHover}/>
          })}
        </tr>
      </table>
    );
  };
});

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
      <table className="plainTable">
        <tr>
          {plainArray.map(function(charValue, charIndex) {
            const inPlain = wordCipherIndex === cipherIndex && charIndex >= startIndex && charIndex < startIndex + plainWord.length;
            return <PlainChar className={inPlain && "plainChar"} cipherIndex={cipherIndex} charIndex={charIndex} value={charValue} onMouseDown={onMouseDown} onHover={onHover}/>;
          })}
        </tr>
      </table>
    );
  };
});

const preventDefault = function (event) {
  event.preventDefault();
};

export const View = actions => EpicComponent(self => {

  self.state = {dragging: false};

  const onKeyChange = function (index, direction) {
    const {key} = self.props.workspace;
    self.props.dispatch({type: actions.keyChange, index, direction});
  };

  const onMouseDown = function (cipherIndex, charIndex) {
    self.setState({dragging: true});
    self.props.dispatch({type: actions.setPlainWordPosition, cipherIndex, charIndex});
  };

  const onHover = function(cipherIndex, charIndex) {
    if (self.state.dragging) {
      self.props.dispatch({type: actions.setPlainWordPosition, cipherIndex, charIndex});
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
