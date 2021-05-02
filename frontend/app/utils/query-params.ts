export function getQP(name = 't') {
  let qpT = new URLSearchParams(location.search).get(name);

  return qpT;
}
