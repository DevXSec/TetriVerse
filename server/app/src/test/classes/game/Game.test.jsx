const Game = require('../../../classes/game/Game');
const Piece = require('../../../classes/piece/Piece');

const createPlayer = (id, name) => ({
  userId: id,
  name,
  getUserId: () => id,
});


jest.mock('../../../classes/piece/Piece', () => {
  return jest.fn().mockImplementation(() => {
    return {
      generatePieceList: jest.fn().mockReturnValue(Array(200).fill('piece')),
    };
  });
});

jest.mock('../../../classes/tetris/Tetris', () => {
const EventEmitter = require("events");
  return jest.fn().mockImplementation(() => {
    const tetrisMock = new EventEmitter();
    tetrisMock.startGame = jest.fn();
    tetrisMock.setGameOver = jest.fn();
    tetrisMock.movePiece = jest.fn();
    tetrisMock.blockLines = jest.fn();
    return tetrisMock;
  });
});


describe("Game", () => {
  let game, player1, player2, viewer;

  beforeEach(() => {
    jest.useFakeTimers();
    player1 = createPlayer("1", "Alice");
    player2 = createPlayer("2", "Bob");
    viewer = createPlayer("3", "Charlie");
    game = new Game("room1", player1);
    piece = new Piece();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  test("le constructeur doit initialiser correctement l'objet", () => {
    expect(game.status).toBe("Waiting");
    expect(game.viewers).toEqual([]);
    expect(game.player1).toBe(player1);
    expect(game.player2).toBeNull();
    expect(game.pieceList).toHaveLength(200);
  });

  test("addPlayer doit affecter player2 si disponible", () => {
    game.addPlayer(player2);
    expect(game.player2).toBe(player2);
  });

  test("addPlayer doit ajouter un viewer si player2 est déjà défini", () => {
    game.addPlayer(player2);
    game.addPlayer(viewer);
    expect(game.viewers).toContain(viewer);
  });

  test("handleGameOver doit appeler endGame et émettre l'événement gameOver", () => {
    const endGameSpy = jest.spyOn(game, "endGame");
    const emitSpy = jest.spyOn(game, "emit");
    game.handleGameOver(player1);
    expect(endGameSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith("gameOver", { roomId: "room1", winner: player1 });
  });

  test("handleLineClear doit appeler blockLines sur le bon tetris", () => {
    game.handleLineClear(1, 2);
    expect(game.tetris2.blockLines).toHaveBeenCalledWith(2);
    game.handleLineClear(2, 3);
    expect(game.tetris1.blockLines).toHaveBeenCalledWith(3);
  });

  test("isFull doit retourner false initialement et true après ajout d'un deuxième joueur", () => {
    expect(game.isFull()).toBe(false);
    game.addPlayer(player2);
    expect(game.isFull()).toBe(true);
  });

  test("getTetris doit retourner tetris1 pour player1 et tetris2 pour player2", () => {
    game.addPlayer(player2);
    expect(game.getTetris(player1)).toBe(game.tetris1);
    expect(game.getTetris(player2)).toBe(game.tetris2);
  });

  test("startGame doit définir le status à Started, lancer les parties et configurer l'intervalle", () => {
    game.addPlayer(player2);
    const applyGravitySpy = jest.spyOn(game, "applyGravity");
    game.startGame();
    expect(game.status).toBe("Started");
    expect(game.tetris1.startGame).toHaveBeenCalled();
    expect(game.tetris2.startGame).toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(applyGravitySpy).toHaveBeenCalled();
    const emitSpy = jest.spyOn(game, "emit");
    jest.advanceTimersByTime(500);
    expect(emitSpy).toHaveBeenCalledWith("gameState");
  });

  test("endGame doit arrêter l'intervalle, changer le status et appeler setGameOver sur les tetris", () => {
    game.startGame();
    game.endGame();
    expect(game.status).toBe("Ended");
    expect(game.tetris1.setGameOver).toHaveBeenCalled();
    expect(game.tetris2.setGameOver).toHaveBeenCalled();
  });

  test("applyGravity doit appeler movePiece sur les deux tetris", () => {
    game.applyGravity();
    expect(game.tetris1.movePiece).toHaveBeenCalledWith(0, 1);
    expect(game.tetris2.movePiece).toHaveBeenCalledWith(0, 1);
  });

  test("getPlayerByUuid doit retourner le joueur correspondant", () => {
    game.addPlayer(player2);
    expect(game.getPlayerByUuid("1")).toBe(player1);
    expect(game.getPlayerByUuid("2")).toBe(player2);
    expect(game.getPlayerByUuid("3")).toBeNull();
  });

  test("est-ce que clear game regenere bien les parties", () => {
    game.clearGame();
    const fakePieceList = Array(200).fill('piece');

    expect(Piece).toHaveBeenCalledTimes(1);
    const pieceInstance = Piece.mock.instances[0];
    // expect(pieceInstance.generatePieceList).toHaveBeenCalledWith(200);
  
    expect(game.pieceList).toEqual(fakePieceList);
    
    const TetrisMock = require('../../../classes/tetris/Tetris');
    expect(TetrisMock).toHaveBeenCalledTimes(4);
    expect(TetrisMock).toHaveBeenNthCalledWith(1, fakePieceList, 'room1', game.getGameMode());
    expect(TetrisMock).toHaveBeenNthCalledWith(2, fakePieceList, 'room1', game.getGameMode());
  
    expect(game.tetris1).toBeDefined();
    expect(game.tetris2).toBeDefined();
  });
  

  describe("updatePlayers", () => {
    test("doit gérer le départ de player1", () => {
      game.addPlayer(player2);
      game.addPlayer(viewer);
      const endGameSpy = jest.spyOn(game, "endGame");
      const emitSpy = jest.spyOn(game, "emit");

      game.status = "Started";
      game.updatePlayers(player1);
      expect(endGameSpy).toHaveBeenCalled();
      expect(game.player1).toBe(player2);
      expect(game.player2).toBe(viewer);
      expect(emitSpy).toHaveBeenCalledWith("updateInfosGame", player1.name);
    });

    test("doit gérer le départ de player2", () => {
      game.addPlayer(player2);
      game.addPlayer(viewer);
      const endGameSpy = jest.spyOn(game, "endGame");
      const emitSpy = jest.spyOn(game, "emit");

      game.updatePlayers(player2);
      expect(endGameSpy).toHaveBeenCalled();
      expect(game.player2).toBe(viewer);
      expect(emitSpy).toHaveBeenCalledWith("gameOver", { winner: player1 });
      expect(emitSpy).toHaveBeenCalledWith("updateInfosGame", player2.name);
    });

    test("doit gérer le départ d'un viewer", () => {
      game.addPlayer(player2);
      game.addPlayer(viewer);
      const emitSpy = jest.spyOn(game, "emit");

      game.updatePlayers(viewer);
      expect(game.viewers).not.toContain(viewer);
      expect(emitSpy).toHaveBeenCalledWith("updateInfosGame", viewer);
    });

    test("doit émettre deleteGame si aucun joueur n'est disponible", () => {
      const emitSpy = jest.spyOn(game, "emit");
      game.updatePlayers(player1);
      expect(emitSpy).toHaveBeenCalledWith("deleteGame");
    });
  });

  test('doit assigner player2 au premier viewer si player2 est null et viewers non vide', () => {
    game.viewers = ['viewer1', 'viewer2'];
    game.player2 = null;
    game.updateViewers();
    expect(game.player2).toBe('viewer1');
    expect(game.viewers).toEqual(['viewer2']);
  });

  test('ne doit pas modifier player2 si player2 n\'est pas null', () => {
    game.viewers = ['viewer1', 'viewer2'];
    game.player2 = 'existingPlayer';
    game.updateViewers();
    expect(game.player2).toBe('existingPlayer');
    expect(game.viewers).toEqual(['viewer1', 'viewer2']);
  });

  test('ne doit rien changer si viewers est vide', () => {
    game.viewers = [];
    game.player2 = null;
    game.updateViewers();
    expect(game.player2).toBe(null);
    expect(game.viewers).toEqual([]);
  });

  test('renvoie le game mode', () => {
    expect(game.getGameMode()).toBe(0)
  });
});
