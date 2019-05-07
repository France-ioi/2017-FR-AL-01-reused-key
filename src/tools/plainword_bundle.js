import React from "react";
import {connect} from "react-redux";
import {Button} from "react-bootstrap";

const PlainWord = props => {
  const {dispatch, setPlainWordPosition, plainWord, wordCipherIndex} = props;

  const clickDeleteWord = () => {
    dispatch({
      type: setPlainWordPosition,
      cipherIndex: null,
      charIndex: 0
    });
  };

  const renderDelete = () => {
    return (
      <Button className="deleteWordContainer" onClick={clickDeleteWord}>
        Effacer <i className="fa fa-times" aria-hidden="true" />
      </Button>
    );
  };

  const renderWord = () => {
    return (
      <div className="topPlainWordContainer">
        <span className="topPlainWord">{plainWord}</span>
        {wordCipherIndex !== null && renderDelete()}
      </div>
    );
  };

  return (
    <div>
      {plainWord && (
        <div>
          <p className="text-bold">
            Pour vous aider, voici le mot à placer dans l'un des quatre messages
            :
          </p>
          <div>{renderWord()}</div>
          <p>
            Vous pouvez cliquer à divers endroits des messages pour tenter de
            placer ce mot. La clé est alors modifiée automatiquement pour que
            cela corresponde à cette partie du message déchiffré, et vous pouvez
            voir l'effet sur les autres messages.
          </p>
        </div>
      )}
      <p className="text-bold">Obtenir un indice</p>
      <p>
        Cliquez sur un élément de la clé pour pouvoir demander sa valeur comme
        un indice.
      </p>
      <p className="text-bold">Modifier la clé</p>
      <p>
        Cliquez sur les flèches au-dessus et en dessous des éléments de la clé
        pour modifier leur valeur. La version déchiffrée avec cette clé
        s'affiche sous chacun des quatre messages.
      </p>
    </div>
  );
};

const PlainWordSelector = state => {
  const {
    actions: {setPlainWordPosition},
    taskData: {plainWord},
    workspace: {wordCipherIndex}
  } = state;

  return {
    plainWord,
    wordCipherIndex,
    setPlainWordPosition
  };
};

export default {
  views: {
    PlainWord: connect(PlainWordSelector)(PlainWord)
  }
};
