declare module 'stockfish.js' {
  interface StockfishEngine {
    postMessage: (msg: string) => void;
    onmessage: (event: { data: string }) => void;
    terminate: () => void;
  }

  function Stockfish(): StockfishEngine;
  export = Stockfish;
} 