
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

export const preventDefault = function (event) {
  event.preventDefault();
};
