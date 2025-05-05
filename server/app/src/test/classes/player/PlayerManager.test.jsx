const PlayerManager = require('../../../classes/player/PlayerManager');

describe("PlayerManager", () => {
  let playerManager;

  beforeEach(() => {
    playerManager = new PlayerManager();
    jest.spyOn(console, "log").mockImplementation(() => {}); // pour éviter le log lors des tests
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("addPlayer doit ajouter un nouveau joueur et logger le message", () => {
    playerManager.addPlayer("1", "socket1", "Alice");
    expect(playerManager.players.length).toBe(1);
    expect(playerManager.players[0].userId).toBe("1");
    expect(playerManager.players[0].socketId).toBe("socket1");
    expect(playerManager.players[0].name).toBe("Alice");
    expect(console.log).toHaveBeenCalledWith("Joueur ajouté: 1 Alice (socket1)");
  });

  test("updatePlayerSocket doit mettre à jour le socketId du joueur", () => {
    playerManager.addPlayer("1", "socket1", "Alice");
    playerManager.updatePlayerSocket("1", "socketNew");
    expect(playerManager.players[0].socketId).toBe("socketNew");
  });

  test("updatePlayerSocket doit ne mets pas à jour le socketId", () => {
    playerManager.addPlayer("1", "socket1", "Alice");
    playerManager.updatePlayerSocket("0", "socketNew");
  });

  test("updatePlayerName doit mettre à jour le nom du joueur", () => {
    playerManager.addPlayer("1", "socket1", "Alice");
    playerManager.updatePlayerName("1", "Alicia");
    expect(playerManager.players[0].name).toBe("Alicia");
  });

  test("updatePlayerName ne doit pas mettre à jour le nom du joueur", () => {
    playerManager.addPlayer("1", "socket1", "Alice");
    playerManager.updatePlayerName("2", "Alicia");
  });

  test("updatePlayerInfos doit mettre à jour le socketId (et réassigner userId) du joueur", () => {
    playerManager.addPlayer("1", "socket1", "Alice");
    playerManager.updatePlayerInfos("1", "socketUpdated");
    expect(playerManager.players[0].socketId).toBe("socketUpdated");
    expect(playerManager.players[0].userId).toBe("1");
  });

  test("removePlayer doit retourner un tableau sans le joueur supprimé", () => {
    playerManager.addPlayer("1", "socket1", "Alice");
    playerManager.addPlayer("2", "socket2", "Bob");
    const newPlayers = playerManager.removePlayer("1");
    expect(newPlayers.length).toBe(1);
    expect(newPlayers[0].userId).toBe("2");
    expect(playerManager.players.length).toBe(2);
  });

  test("getPlayer doit retourner le joueur correspondant au socketId", () => {
    playerManager.addPlayer("1", "socket1", "Alice");
    playerManager.addPlayer("2", "socket2", "Bob");
    const player = playerManager.getPlayer("socket2");
    expect(player.userId).toBe("2");
  });

  test("getAllPlayers doit retourner tous les joueurs", () => {
    playerManager.addPlayer("1", "socket1", "Alice");
    playerManager.addPlayer("2", "socket2", "Bob");
    const players = playerManager.getAllPlayers();
    expect(players.length).toBe(2);
  });

  test("getPlayerById doit retourner le joueur correspondant au userId", () => {
    playerManager.addPlayer("1", "socket1", "Alice");
    playerManager.addPlayer("2", "socket2", "Bob");
    const player = playerManager.getPlayerById("1");
    expect(player.name).toBe("Alice");
  });

  test('doit retourner un tableau vide lorsque aucun joueur n\'a de bestScore', () => {
    playerManager.players = [
      { userId: '1', name: 'Alice', bestScore: null },
      { userId: '2', name: 'Bob', bestScore: null },
    ];
    expect(playerManager.getLeaderboard()).toEqual([]);
  });

  test('doit retourner un seul joueur lorsque seul un joueur a un bestScore non null', () => {
    const player = { userId: '1', name: 'Alice', bestScore: 50 };
    playerManager.players = [
      { userId: '2', name: 'Bob', bestScore: null },
      player,
      { userId: '3', name: 'Charlie', bestScore: null },
    ];
    expect(playerManager.getLeaderboard()).toEqual([player]);
  });

  test('doit retourner les joueurs triés par ordre décroissant de bestScore', () => {
    const player1 = { userId: '1', name: 'Alice', bestScore: 50 };
    const player2 = { userId: '2', name: 'Bob', bestScore: 100 };
    const player3 = { userId: '3', name: 'Charlie', bestScore: 75 };
    playerManager.players = [player1, player2, player3];
    const leaderboard = playerManager.getLeaderboard();
    expect(leaderboard).toEqual([player2, player3, player1]);
  });
});
