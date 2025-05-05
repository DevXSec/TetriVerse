const Player = require('../../../classes/player/Player');

const player = new Player("user-id", "io-jajaja", "juzuo");

describe('Player', () => {
  describe('Constructor', () => {
    test("Creation et assignation d'un player", () => {
      expect(player.userId).toBe("user-id");
      expect(player.socketId).toBe("io-jajaja");
      expect(player.name).toBe("juzuo");
    });
  });

  describe('Vérification des getters', () => {
    test("Retourner l'username du player", () => {
      expect(player.getUsername()).toBe("juzuo")
    });

    test("Retourner l'userId du player", () => {
      expect(player.getUserId()).toBe("user-id")
    });

    test("Retourner le socketId du player", () => {
      expect(player.getSocketId()).toBe("io-jajaja")
    });

    test("Retourner le score du player", () => {
      expect(player.getBestScore()).toBe(null)
    });
  });

  describe('Vérification des setters', () => {
    test("Set le nouveau username", () => {
      player.setUsername("nowa-k")
      expect(player.getUsername()).toBe("nowa-k")
    });
  });

});
