// Read the actual content of Modern.pgn
const modernPgn = `[Event "Steinitz - Chigorin World Championship Match"]
[Site "Havana CUB"]
[Date "1892.01.01"]
[Round "1"]
[White "Steinitz, William"]
[Black "Chigorin, Mikhail"]
[Result "1-0"]
[ECO "C65"]
[PlyCount "85"]

1.e4 d6 2.d4 g6 3.c4 Bg7 4.Nc3 Nc6 5.Be3 e5 6.d5 Nce7 7.c5 Nh6 8.f3 f5 9.cxd6 cxd6
10.Bb5+ Kf8 11.Qa4 f4 12.Bf2 Bf6 13.Nge2 Kg7 14.Rc1 a6 15.O-O g5 16.Rc2 Rb8
17.Bd3 Nf7 18.Rfc1 Qd7 19.Bb6 Qxa4 20.Nxa4 Bd7 21.Nec3 Rbc8 22.Ba5 Bxa4 23.Nxa4 Rxc2
24.Rxc2 Rc8 25.Nb6 Rxc2 26.Bxc2 h5 27.Ba4 g4 28.Bd7 gxf3 29.gxf3 Ng5 30.Kf2 Kf8
31.Nc4 Ng6 32.Bc8 Be7 33.Bxb7 Nh4 34.Nd2 Nh3+ 35.Kf1  1-0`;

export function setupMockFs() {
  if (typeof window !== 'undefined') {
    window.fs = {
      readdir: async (path: string) => {
        if (path === '/app/games') {
          return Promise.resolve(['Modern.pgn']);
        }
        return Promise.resolve([]);
      },
      readFile: async (path: string) => {
        if (path === '/app/games/Modern.pgn') {
          return Promise.resolve(modernPgn);
        }
        throw new Error(`File not found: ${path}`);
      }
    };
  }
} 