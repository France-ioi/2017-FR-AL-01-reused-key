
export function getTask (full_task) {
  const {ciphers, plainWord, hints} = full_task;
  return {ciphers, plainWord, hints};
}

export function grantHint (full_task, request) {
  const {keyIndex} = request;
  const {secretKey, hints} = full_task;
  return {
    ...full_task,
    hints: {...hints, [keyIndex]: secretKey[keyIndex]}
  };
};
