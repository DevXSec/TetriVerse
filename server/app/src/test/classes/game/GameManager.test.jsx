const GameManager = require('../../../classes/game/GameManager');

jest.mock('../../../classes/game/Game', () => {
    const EventEmitter = require('events');
    class Game extends EventEmitter {
      constructor(roomId, player) {
        super();
        this.roomId = roomId;
        this.player1 = player;
        this.player2 = null;
        this.status = "Waiting";
        this.viewers = [];
        this.tetris1 = { dummy: true };
        this.tetris2 = { dummy: true };
      }
      addPlayer(player) {
        if (!this.player2) {
          this.player2 = player;
        } else {
          this.viewers.push(player);
        }
      }
      isFull() {
        return this.player2 !== null;
      }
    }
    return Game;
  });
  
  
  const createPlayer = (id, name, socketId) => ({
    userId: id,
    name,
    socketId: socketId || null,
  });
  
  describe("GameManager", () => {
    let gameManager, player1, player2, viewer;
  
    beforeEach(() => {
      gameManager = new GameManager();
      player1 = createPlayer("1", "Alice", "socket1");
      player2 = createPlayer("2", "Bob", "socket2");
      viewer = createPlayer("3", "Charlie", "socket3");
    });
  
    test("createGame doit créer une nouvelle partie et l'ajouter à la liste", () => {
      const newGame = gameManager.createGame(player1);
      expect(newGame).toBeDefined();
      expect(newGame.player1).toBe(player1);
      expect(gameManager.games).toContain(newGame);
    });
  
    test("joinGame doit ajouter un joueur à une partie existante", () => {
      const newGame = gameManager.createGame(player1);
      const joinedGame = gameManager.joinGame(player2, newGame.roomId);
      expect(joinedGame).toBeDefined();
      expect(newGame.player2).toBe(player2);
    });
  
    test("joinGame ne doit rien modifier si la partie n'existe pas", () => {
      const joinedGame = gameManager.joinGame(player2, "nonexistent-room");
      expect(joinedGame).toBeUndefined();
    });
  
    test("checkGamesForPlayer doit retourner true si le joueur est player1", () => {
      const newGame = gameManager.createGame(player1);
      const result = gameManager.checkGamesForPlayer(player1);
      expect(result).toBe(true);
    });
  
    test("checkGamesForPlayer doit retourner true si le joueur est player2", () => {
      const newGame = gameManager.createGame(player1);
      newGame.addPlayer(player2);
      const result = gameManager.checkGamesForPlayer(player2);
      expect(result).toBe(true);
    });
  
    test("checkGamesForPlayer doit retourner true si le joueur est viewer", () => {
      const newGame = gameManager.createGame(player1);
      newGame.addPlayer(player2);
      newGame.addPlayer(viewer);
      const result = gameManager.checkGamesForPlayer(viewer);
      expect(result).toBe(true);
    });
  
    test("checkGamesForPlayer doit retourner false si le joueur n'est dans aucune partie", () => {
      const result = gameManager.checkGamesForPlayer(player1);
      expect(result).toBe(false);
    });
  
    test("getRandomGame doit retourner une partie en attente et non complète", () => {
      const waitingGame = gameManager.createGame(player1);
      const randomGame = gameManager.getRandomGame();
      expect(randomGame).toBe(waitingGame);
      // On complète la partie en ajoutant un deuxième joueur
      waitingGame.addPlayer(player2);
      const noRandomGame = gameManager.getRandomGame();
      expect(noRandomGame).toBeUndefined();
    });
  
    test("getGame doit retourner la partie correspondante au roomId", () => {
      const newGame = gameManager.createGame(player1);
      const foundGame = gameManager.getGame(newGame.roomId);
      expect(foundGame).toBe(newGame);
    });
  
    test("getTetris doit retourner tetris1 pour player1 et tetris2 pour player2", () => {
      const newGame = gameManager.createGame(player1);
      newGame.addPlayer(player2);
      const tetrisForPlayer1 = gameManager.getTetris(newGame, player1);
      const tetrisForPlayer2 = gameManager.getTetris(newGame, player2);
      expect(tetrisForPlayer1).toEqual(newGame.tetris1);
      expect(tetrisForPlayer2).toEqual(newGame.tetris2);
    });
  
    test("returningPlayer doit retourner true si le joueur fait partie de la partie", () => {
      const newGame = gameManager.createGame(player1);
      newGame.addPlayer(player2);
      newGame.addPlayer(viewer);
      expect(gameManager.returningPlayer(player1, newGame)).toBe(true);
      expect(gameManager.returningPlayer(player2, newGame)).toBe(true);
      expect(gameManager.returningPlayer(viewer, newGame)).toBe(true);
    });
  
    test("returningPlayer doit retourner false si le joueur n'est pas dans la partie", () => {
      const newGame = gameManager.createGame(player1);
      expect(gameManager.returningPlayer(player2, newGame)).toBe(false);
    });
  
    test("updatePlayerSocket doit mettre à jour le socketId du joueur dans la partie", () => {
      const newGame = gameManager.createGame(player1);
      newGame.addPlayer(player2);
      // Mise à jour pour player1
      const updatedPlayer1 = createPlayer("1", "Alice", "newSocket1");
      gameManager.updatePlayerSocket(updatedPlayer1, newGame.roomId);
      expect(newGame.player1.socketId).toBe("newSocket1");
  
      // Mise à jour pour player2
      const updatedPlayer2 = createPlayer("2", "Bob", "newSocket2");
      gameManager.updatePlayerSocket(updatedPlayer2, newGame.roomId);
      expect(newGame.player2.socketId).toBe("newSocket2");
    });
  
    test("deleteGame doit supprimer la partie de la liste", () => {
      const newGame = gameManager.createGame(player1);
      expect(gameManager.games).toContain(newGame);
      gameManager.deleteGame(newGame.roomId);
      expect(gameManager.games).not.toContain(newGame);
    });
  });
  