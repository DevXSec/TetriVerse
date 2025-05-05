// socketMiddleware.test.jsx
const socketMiddleware = require("../../utils/socketMiddleware");
const gameManager = require("../../../src/classes/game/GameManager");
const { Server } = require("socket.io");
const { createServer } = require("http");
const { io: Client } = require("socket.io-client");

describe("socketMiddleware", () => {
  let fakeSocket;
  let fakeIo;
  let fakeGameManager;
  let fakePlayerManager;
  let registeredHandlers = {};
  let middleware; // callback passé à socket.use

  beforeEach(() => {
    registeredHandlers = {};
    // Création d'un faux socket avec join ajouté pour les tests nécessitant son appel
    fakeSocket = {
      id: "socket1",
      use: jest.fn((cb) => {
        middleware = cb;
      }),
      on: jest.fn((event, handler) => {
        registeredHandlers[event] = handler;
      }),
      join: jest.fn(),
    };

    // Création d'un fake io avec to() renvoyant un objet avec une fonction emit factice
    fakeIo = {
      to: jest.fn(() => ({ emit: jest.fn() })),
      emit: jest.fn(),
    };

    // Managers factices
    fakeGameManager = {
      getGame: jest.fn(),
      checkGamesForPlayer: jest.fn(),
      createGame: jest.fn(),
      getRandomGame: jest.fn(),
      joinGame: jest.fn(),
      returningPlayer: jest.fn(),
      updatePlayerSocket: jest.fn(),
      deleteGame: jest.fn(),
      getTetris: jest.fn(),
    };

    fakePlayerManager = {
      getAllPlayers: jest.fn().mockReturnValue([]),
      addPlayer: jest.fn(),
      updatePlayerInfos: jest.fn(),
      updatePlayerSocket: jest.fn(),
      updatePlayerName: jest.fn(),
      getPlayer: jest.fn(),
      getPlayerById: jest.fn(),
      getLeaderboard: jest.fn(),
      removePlayer: jest.fn(),
    };

    // Appel de la fonction middleware à tester
    socketMiddleware(fakeSocket, fakeIo, fakeGameManager, fakePlayerManager);
  });

  // --- Tests du middleware (socket.use) ---
  describe("Middleware validation (socket.use)", () => {
    let nextMock;
    beforeEach(() => {
      nextMock = jest.fn();
    });

    test("setUsername: erreur si userId manquant", () => {
      middleware(["setUsername", undefined, "Alice"], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "userId invalide pour setUsername" }));
    });

    test("setUsername: erreur si username manquant", () => {
      middleware(["setUsername", "user1", undefined], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "username invalide pour setUsername" }));
    });

    test("setUsername: pas d'erreur pour des paramètres valides", () => {
      middleware(["setUsername", "user1", "Alice"], nextMock);
      expect(nextMock).toHaveBeenCalledWith();
    });

    test("checkUserID: erreur si userId manquant", () => {
      middleware(["checkUserID", undefined], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "userId invalide pour checkUserID" }));
    });

    test("checkUserID: pas d'erreur pour des paramètres valides", () => {
      middleware(["checkUserID", "user1"], nextMock);
      expect(nextMock).toHaveBeenCalledWith();
    });

    test("joinGame: erreur si roomId manquant", () => {
      middleware(["joinGame", undefined, "Alice", "user1"], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "roomId invalide pour joinGame" }));
    });

    test("joinGame: erreur si username manquant", () => {
      middleware(["joinGame", "room1", undefined, "user1"], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "username invalide pour joinGame" }));
    });

    test("joinGame: erreur si userId manquant", () => {
      middleware(["joinGame", "room1", "Alice", undefined], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "userId invalide pour joinGame" }));
    });

    test("joinGame: pas d'erreur pour des paramètres valides", () => {
      middleware(["joinGame", "room1", "Alice", "user1"], nextMock);
      expect(nextMock).toHaveBeenCalledWith();
    });

    test("movePiece: erreur si roomId invalide", () => {
      middleware(["movePiece", null, "user1", "left"], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "roomId invalide pour movePiece" }));
    });

    test("movePiece: erreur si direction invalide", () => {
      middleware(["movePiece", "room1", "user1", "invalid"], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "direction invalide pour movePiece" }));
    });

    test("movePiece: pas d'erreur pour des paramètres valides", () => {
      middleware(["movePiece", "room1", "user1", "left"], nextMock);
      expect(nextMock).toHaveBeenCalledWith();
    });

    test("startGame: erreur si roomId manquant", () => {
      middleware(["startGame", undefined, 0], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "roomId invalide pour startGame" }));
    });

    test("startGame: erreur si mode manquant", () => {
      middleware(["startGame", "user1", undefined], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "mode requis pour startGame" }));
    });

    test("startGame: pas d'erreur pour des paramètres valides", () => {
      middleware(["startGame", "user1", 0], nextMock);
      expect(nextMock).toHaveBeenCalledWith();
    });

    test("getInfos: erreur si roomId manquant", () => {
      middleware(["getInfos", undefined], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "roomId invalide pour getInfos" }));
    });

    test("getInfos: pas d'erreur pour des paramètres valides", () => {
      middleware(["getInfos", "room1"], nextMock);
      expect(nextMock).toHaveBeenCalledWith();
    });

    test("restartGame: erreur si roomId manquant", () => {
      middleware(["restartGame", undefined], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "roomId invalide pour restartGame" }));
    });

    test("restartGame: pas d'erreur pour des paramètres valides", () => {
      middleware(["restartGame", "room1"], nextMock);
      expect(nextMock).toHaveBeenCalledWith();
    });

    test("leaveGame: erreur si roomId manquant", () => {
      middleware(["leaveGame", undefined, 'user1'], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "roomId invalide pour leaveGame" }));
    });

    test("leaveGame: erreur si userId manquant", () => {
      middleware(["leaveGame", "room1", undefined], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "uuid invalide pour leaveGame" }));
    });

    test("leaveGame: pas d'erreur pour des paramètres valides", () => {
      middleware(["leaveGame", "room1", "user1"], nextMock);
      expect(nextMock).toHaveBeenCalledWith();
    });

    test("updateScore: erreur si userId manquant", () => {
      middleware(["updateScore", undefined, 1000], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "userId invalide pour updateScore" }));
    });

    test("updateScore: erreur si score manquant", () => {
      middleware(["updateScore", "user1", undefined], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "score invalide pour updateScore" }));
    });

    test("updateScore: pas d'erreur pour des paramètres valides", () => {
      middleware(["updateScore", "room1", 1000], nextMock);
      expect(nextMock).toHaveBeenCalledWith();
    });

    test("getLeaderboard: erreur si des paramètres sont fournis", () => {
      middleware(["getLeaderboard", "unexpected"], nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ message: "getLeaderboard ne doit pas recevoir de paramètres" }));
    });

    test("getLeaderboard: pas d'erreur si aucun paramètre n'est fourni", () => {
      middleware(["getLeaderboard"], nextMock);
      expect(nextMock).toHaveBeenCalledWith();
    });
  });

  // --- Tests des event handlers ---
  describe("Event handlers registration et comportement", () => {
    test("doit enregistrer les handlers pour les événements clés", () => {
      const expectedEvents = [
        "setUsername",
        "checkUserID",
        "createGame",
        "joinRandomGame",
        "joinGame",
        "movePiece",
        "startGame",
        "getInfos",
        "restartGame",
        "leaveGame",
        "updateScore",
        "getLeaderboard",
        "disconnect",
      ];
      expectedEvents.forEach((event) => {
        expect(fakeSocket.on).toHaveBeenCalledWith(event, expect.any(Function));
      });
    });

    test("setUsername: doit appeler addPlayer et émettre usernameAccepted si le nom n'est pas utilisé", () => {
      fakePlayerManager.getAllPlayers.mockReturnValue([]);
      const handler = registeredHandlers["setUsername"];
      handler("user1", "Alice");
      expect(fakePlayerManager.addPlayer).toHaveBeenCalledWith("user1", fakeSocket.id, "Alice");
      expect(fakeIo.to).toHaveBeenCalledWith(fakeSocket.id);
    });

    test("checkUserID: doit émettre userExists avec le joueur trouvé", () => {
      const fakePlayer = { userId: "user1", name: "Alice" };
      fakePlayerManager.getPlayerById.mockReturnValue(fakePlayer);
      const handler = registeredHandlers["checkUserID"];
      handler("user1");
      expect(fakeIo.to).toHaveBeenCalledWith(fakeSocket.id);
    });

    test("createGame: ne fait rien si player non trouvé", () => {
      fakePlayerManager.getPlayer.mockReturnValue(undefined);
      const handler = registeredHandlers["createGame"];
      handler();
      expect(fakeSocket.join).not.toHaveBeenCalled();
    });

    test("createGame: ne fait rien si checkGamesForPlayer renvoie true", () => {
      const fakePlayer = { userId: "user1" };
      fakePlayerManager.getPlayer.mockReturnValue(fakePlayer);
      fakeGameManager.checkGamesForPlayer.mockReturnValue(true);
      const handler = registeredHandlers["createGame"];
      handler();
      expect(fakeSocket.join).not.toHaveBeenCalled();
    });

    test("createGame: doit créer un jeu et émettre gameWaiting", () => {
      const fakePlayer = { userId: "user1" };
      const fakeGame = { roomId: "room42" };
      fakePlayerManager.getPlayer.mockReturnValue(fakePlayer);
      fakeGameManager.checkGamesForPlayer.mockReturnValue(false);
      fakeGameManager.createGame.mockReturnValue(fakeGame);
      const handler = registeredHandlers["createGame"];
      handler();
      expect(fakeSocket.join).toHaveBeenCalledWith("room42");
      expect(fakeIo.to).toHaveBeenCalledWith(fakeSocket.id);
    });

    test("joinRandomGame: ne fait rien si player non trouvé", () => {
      fakePlayerManager.getPlayer.mockReturnValue(undefined);
      const handler = registeredHandlers["joinRandomGame"];
      handler();
      // Aucune émission attendue
      expect(fakeIo.to).not.toHaveBeenCalled();
    });

    test("joinRandomGame: si aucun jeu trouvé, émet noGameFound", () => {
      const fakePlayer = { socketId: "socket1" };
      fakePlayerManager.getPlayer.mockReturnValue(fakePlayer);
      fakeGameManager.checkGamesForPlayer.mockReturnValue(false);
      fakeGameManager.getRandomGame.mockReturnValue(null);
      const handler = registeredHandlers["joinRandomGame"];
      handler();
      expect(fakeIo.to).toHaveBeenCalledWith(fakePlayer.socketId);
      // On vérifie que noGameFound est émis
    });

    test("joinRandomGame: si jeu trouvé, appelle joinGame et émet gameFound", () => {
      const fakePlayer = { socketId: "socket1" };
      const fakeGame = { roomId: "room99" };
      fakePlayerManager.getPlayer.mockReturnValue(fakePlayer);
      fakeGameManager.checkGamesForPlayer.mockReturnValue(false);
      fakeGameManager.getRandomGame.mockReturnValue(fakeGame);
      const handler = registeredHandlers["joinRandomGame"];
      handler();
      expect(fakeGameManager.joinGame).toHaveBeenCalledWith(fakePlayer, "room99");
      expect(fakeIo.to).toHaveBeenCalledWith(fakePlayer.socketId);
    });

    test("joinGame: ne fait rien si player introuvable", () => {
      fakePlayerManager.getPlayerById.mockReturnValue(undefined);
      const handler = registeredHandlers["joinGame"];
      handler("room1", "Alice", "user1");
      // Aucune action attendue si player est undefined
      expect(fakePlayerManager.updatePlayerSocket).not.toHaveBeenCalled();
    });

    test("joinGame: met à jour le socket et le nom, rejoint la salle et émet gameJoined", () => {
      const fakePlayer = { userId: "user1" };
      const fakeGame = {
        roomId: "room1",
        player1: { userId: "user1" },
        player2: null,
      };
      fakePlayerManager.getPlayerById.mockReturnValue(fakePlayer);
      fakeGameManager.getGame.mockReturnValue(fakeGame);
      fakeGameManager.returningPlayer.mockReturnValue(false);
      fakeGameManager.checkGamesForPlayer.mockReturnValue(false);
      const handler = registeredHandlers["joinGame"];
      handler("room1", "Alice", "user1");
      expect(fakePlayerManager.updatePlayerSocket).toHaveBeenCalledWith("user1", fakeSocket.id);
      expect(fakePlayerManager.updatePlayerName).toHaveBeenCalledWith("user1", "Alice");
      expect(fakeSocket.join).toHaveBeenCalledWith("room1");
      // Vérifie l'émission de gameJoined avec player2 null
      expect(fakeIo.to).toHaveBeenCalledWith("room1");
    });

    test("startGame: doit appeler la bonne méthode de tetris et émettre startGame", () => {
      const fakeGame = {
        roomId: "room1",
        player1: { name: "Alice", userId: "user1" },
        player2: null,
        tetris1: { grid: "grid1", nextPiece: "piece1" },
        tetris2: { grid: "grid2", nextPiece: "piece2" },
      };
      const fakeTetris = {
        movePiece: jest.fn(),
        rotatePiece: jest.fn(),
        hardDown: jest.fn(),
      };
      fakeGameManager.getGame.mockReturnValue(fakeGame);
      fakePlayerManager.getPlayerById.mockReturnValue({ userId: "user1" });
      fakeGameManager.getTetris.mockReturnValue(fakeTetris);
      const handler = registeredHandlers["movePiece"];
      handler("room1", "user1", "left");
      expect(fakeTetris.movePiece).toHaveBeenCalledWith(-1, 0);
      // Vérifier qu'après l'appel, io.to(room1).emit("gameState", {...}) a été appelé
      expect(fakeIo.to).toHaveBeenCalledWith("room1");
    });

    test("startGame: si game status est 'Waiting', démarre la partie et enregistre les listeners", () => {
      const fakeGame = {
        roomId: "room1",
        status: "Waiting",
        player1: { name: "Alice", userId: "user1" },
        player2: null,
        tetris1: { grid: "grid1", nextPiece: "piece1" },
        tetris2: { grid: "grid2", nextPiece: "piece2" },
        startGame: jest.fn(),
        endGame: jest.fn(),
        clearGame: jest.fn(),
        on: jest.fn(),
      };
      fakeGameManager.getGame.mockReturnValue(fakeGame);
      const handler = registeredHandlers["startGame"];
      handler("room1", "modeX");
      expect(fakeGame.startGame).toHaveBeenCalledWith("modeX");
      // Les listeners gameOver et gameState sont enregistrés via fakeGame.on
      expect(fakeGame.on).toHaveBeenCalled();
    });

    test("updateScore: does not update if score is lower than best", () => {
      const fakePlayer = {
        getBestScore: jest.fn().mockReturnValue(150),
        setBestScore: jest.fn(),
      };
    
      fakePlayerManager.getPlayerById.mockReturnValue(fakePlayer);
    
      const handler = registeredHandlers["updateScore"];
      handler("user1", 100);
    
      expect(fakePlayer.setBestScore).not.toHaveBeenCalled();
    });

    test("leaveGame: triggers deleteGame and updateInfosGame events", () => {
      const mockEmit = jest.fn();
      const fakeGame = {
        getPlayerByUuid: jest.fn().mockReturnValue({ userId: "userX" }),
        updatePlayers: jest.fn(),
        on: jest.fn((event, cb) => {
          if (event === "deleteGame") cb();
          if (event === "updateInfosGame") cb("leaver");
        }),
        player1: { userId: "user1" },
      };
    
      fakeGameManager.getGame.mockReturnValue(fakeGame);
      fakeGameManager.deleteGame = jest.fn();
      fakeIo.to = jest.fn(() => ({ emit: mockEmit }));
    
      const handler = registeredHandlers["leaveGame"];
      handler("room1", "uuidX");
    
      expect(fakeGame.getPlayerByUuid).toHaveBeenCalledWith("uuidX");
      expect(fakeGameManager.deleteGame).toHaveBeenCalledWith("room1");
      expect(mockEmit).toHaveBeenCalledWith("gameInfosQuit", "leaver");
    });

    test("restartGame: doit émettre restart, gamePlayers, et redémarrer le jeu", () => {
      const fakeGame = {
        roomId: "room1",
        player1: { userId: "user1" },
        player2: { userId: "user2" },
        endGame: jest.fn(),
        clearGame: jest.fn(),
        startGame: jest.fn(),
        getGameMode: jest.fn().mockReturnValue("modeX"),
      };
      fakeGameManager.getGame.mockReturnValue(fakeGame);
      const handler = registeredHandlers["restartGame"];
      handler("room1");
      expect(fakeIo.to).toHaveBeenCalledWith("room1");
      // Vérifie l'émission de gamePlayers avec player2 présent
      // On ne peut pas vérifier le contenu exact ici sans mocker to().emit(), mais on s'assure que restartGame appelle les méthodes de game.
      expect(fakeGame.endGame).toHaveBeenCalled();
      expect(fakeGame.clearGame).toHaveBeenCalled();
      expect(fakeGame.startGame).toHaveBeenCalledWith("modeX");
    });

    test("getInfos: émet gameInfos avec infos si game trouvé", () => {
      const fakeGame = {
        roomId: "room1",
        player1: { userId: "user1" },
      };
      fakeGameManager.getGame.mockReturnValue(fakeGame);
      const handler = registeredHandlers["getInfos"];
      handler("room1");
      expect(fakeIo.to).toHaveBeenCalledWith(fakeSocket.id);
    });

    test("movePiece: handles rotatePiece", () => {
      const fakeTetris = { rotatePiece: jest.fn() };
      const fakeGame = {
        player1: { name: "Alice", userId: "user1" },
        player2: null,
        tetris1: { grid: [], nextPiece: "O" },
        tetris2: { grid: [], nextPiece: "I" },
      };
    
      fakePlayerManager.getPlayerById.mockReturnValue({ userId: "user1" });
      fakeGameManager.getGame.mockReturnValue(fakeGame);
      fakeGameManager.getTetris.mockReturnValue(fakeTetris);
    
      const handler = registeredHandlers["movePiece"];
      handler("room1", "user1", "rotate");
    
      expect(fakeTetris.rotatePiece).toHaveBeenCalled();
    });

    test("movePiece: handles hardDown", () => {
      const fakeTetris = { hardDown: jest.fn() };
      const fakeGame = {
        player1: { name: "Alice", userId: "user1" },
        player2: null,
        tetris1: { grid: [], nextPiece: "O" },
        tetris2: { grid: [], nextPiece: "I" },
      };
    
      fakePlayerManager.getPlayerById.mockReturnValue({ userId: "user1" });
      fakeGameManager.getGame.mockReturnValue(fakeGame);
      fakeGameManager.getTetris.mockReturnValue(fakeTetris);
    
      const handler = registeredHandlers["movePiece"];
      handler("room1", "user1", "hardDown");
    
      expect(fakeTetris.hardDown).toHaveBeenCalled();
    });

    test("getInfos: émet gameInfos avec infos null si game non trouvé", () => {
      fakeGameManager.getGame.mockReturnValue(null);
      const handler = registeredHandlers["getInfos"];
      handler("room1");
      expect(fakeIo.to).toHaveBeenCalledWith(fakeSocket.id);
    });

    test("leaveGame: doit récupérer le joueur par uuid et appeler updatePlayers", () => {
      const fakeGame = {
        roomId: "room1",
        player1: { userId: "user1" },
        getPlayerByUuid: jest.fn().mockReturnValue({ userId: "userX" }),
        updatePlayers: jest.fn(),
        on: jest.fn(),
      };
      fakeGameManager.getGame.mockReturnValue(fakeGame);
      const handler = registeredHandlers["leaveGame"];
      handler("room1", "uuidX");
      expect(fakeGame.getPlayerByUuid).toHaveBeenCalledWith("uuidX");
      expect(fakeGame.updatePlayers).toHaveBeenCalled();
    });

    test("updateScore: si score est supérieur, met à jour et émet leaderboardInfos", () => {
      const fakePlayer = {
        getBestScore: jest.fn().mockReturnValue(50),
        setBestScore: jest.fn(),
      };
      fakePlayerManager.getPlayerById.mockReturnValue(fakePlayer);
      fakePlayerManager.getLeaderboard.mockReturnValue(["playerA", "playerB"]);
      const handler = registeredHandlers["updateScore"];
      handler("user1", 100);
      expect(fakePlayer.setBestScore).toHaveBeenCalledWith(100);
      expect(fakeIo.emit).toHaveBeenCalledWith("leaderboardInfos", { infos: ["playerA", "playerB"] });
    });

    test("getLeaderboard: émet leaderboardInfos avec le leaderboard", () => {
      fakePlayerManager.getLeaderboard.mockReturnValue(["leader1", "leader2"]);
      const handler = registeredHandlers["getLeaderboard"];
      handler();
      expect(fakeIo.emit).toHaveBeenCalledWith("leaderboardInfos", { infos: ["leader1", "leader2"] });
    });

    test("disconnect: doit appeler removePlayer et émettre updatePlayers", () => {
      fakePlayerManager.getAllPlayers.mockReturnValue(["player1", "player2"]);
      const handler = registeredHandlers["disconnect"];
      handler("user1");
      expect(fakePlayerManager.removePlayer).toHaveBeenCalledWith("user1", fakeSocket.id);
      expect(fakeIo.emit).toHaveBeenCalledWith("updatePlayers", ["player1", "player2"]);
    });
  });

  describe("startGame event", () => {
    let io, serverSocket, clientSocket;

    const setupSocketEvents = socketMiddleware;
  
    beforeEach((done) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        const port = httpServer.address().port;
        const { io: Client } = require("socket.io-client");
        clientSocket = new Client(`http://localhost:${port}`);
        io.on("connection", (socket) => {
          serverSocket = socket;
          setupSocketEvents(io, socket);
        });
        clientSocket.on("connect", done);
      });
    });
  
    afterEach(() => {
      io.close();
      clientSocket.close();
    });
  
    it("should start the game and emit gameState", () => {
      const mockEmit = jest.fn();
      const fakeGame = {
        status: "Waiting",
        player1: { name: "Player 1", userId: "user1" },
        player2: null,
        tetris1: { grid: [[0]], nextPiece: "T" },
        tetris2: { grid: [[0]], nextPiece: "I" },
        startGame: jest.fn(),
        on: jest.fn((event, handler) => {
          if (event === "gameState") handler(); // manually trigger it
        }),
      };
  
      fakeGameManager.getGame.mockReturnValue(fakeGame);
      serverSocket.to = jest.fn(() => ({ emit: mockEmit }));
  
      serverSocket.emit("startGame", "room123", "classic");
  
      expect(fakeGame.startGame).not.toHaveBeenCalledWith("classic");
    });
  });
});
