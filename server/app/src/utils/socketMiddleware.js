module.exports = (socket, io, gameManager, playerManager) => {
    socket.use((packet, next) => {
        const eventName = packet[0];
        const params = packet.slice(1);
      
        switch (eventName) {
          case "setUsername": {
            const [userId, username] = params;
            if (!userId || typeof userId !== "string") {
              return next(new Error("userId invalide pour setUsername"));
            }
            if (!username || typeof username !== "string") {
              return next(new Error("username invalide pour setUsername"));
            }
            break;
          }
          case "checkUserID": {
            const [userId] = params;
            if (!userId || typeof userId !== "string") {
              return next(new Error("userId invalide pour checkUserID"));
            }
            break;
          }
          case "joinGame": {
            const [roomId, username, userId] = params;
            if (!roomId || typeof roomId !== "string") {
              return next(new Error("roomId invalide pour joinGame"));
            }
            if (!username || typeof username !== "string") {
              return next(new Error("username invalide pour joinGame"));
            }
            if (!userId || typeof userId !== "string") {
              return next(new Error("userId invalide pour joinGame"));
            }
            break;
          }
          case "movePiece": {
            const [roomId, userId, direction] = params;
            if (!roomId || typeof roomId !== "string") {
              return next(new Error("roomId invalide pour movePiece"));
            }
            if (!userId || typeof userId !== "string") {
              return next(new Error("userId invalide pour movePiece"));
            }
            const validDirections = ["left", "right", "down", "rotate", "hardDown"];
            if (!direction || typeof direction !== "string" || !validDirections.includes(direction)) {
              return next(new Error("direction invalide pour movePiece"));
            }
            break;
          }
          case "startGame": {
            const [roomId, mode] = params;
            if (!roomId || typeof roomId !== "string") {
              return next(new Error("roomId invalide pour startGame"));
            }
            if (mode === undefined) {
              return next(new Error("mode requis pour startGame"));
            }
            break;
          }
          case "getInfos": {
            const [roomId] = params;
            if (!roomId || typeof roomId !== "string") {
              return next(new Error("roomId invalide pour getInfos"));
            }
            break;
          }
          case "restartGame": {
            const [roomId] = params;
            if (!roomId || typeof roomId !== "string") {
              return next(new Error("roomId invalide pour restartGame"));
            }
            break;
          }
          case "leaveGame": {
            const [roomId, uuid] = params;
            if (!roomId || typeof roomId !== "string") {
              return next(new Error("roomId invalide pour leaveGame"));
            }
            if (!uuid || typeof uuid !== "string") {
              return next(new Error("uuid invalide pour leaveGame"));
            }
            break;
          }
          case "updateScore": {
            const [userId, score] = params;
            if (!userId || typeof userId !== "string") {
              return next(new Error("userId invalide pour updateScore"));
            }
            if (typeof score !== "number") {
              return next(new Error("score invalide pour updateScore"));
            }
            break;
          }
          case "getLeaderboard": {
            if (params.length > 0) {
              return next(new Error("getLeaderboard ne doit pas recevoir de paramètres"));
            }
            break;
          }
          default:
            break;
        }
        next();
    });
      
    socket.on("setUsername", (userId, username) => {
      const players = playerManager.getAllPlayers();
      if (
        !players.some((player) => player.userId === userId) &&
        !players.some((player) => player.socketId === socket.id)
      ) {
        playerManager.addPlayer(userId, socket.id, username);
        io.to(socket.id).emit("usernameAccepted");
      } else {
        playerManager.updatePlayerInfos(userId, socket.id);
        io.to(socket.id).emit("usernameInUse", "Ce nom est déjà pris.");
      }
    });
  
    socket.on("checkUserID", (userId) => {
      const player = playerManager.getPlayerById(userId);
      io.to(socket.id).emit("userExists", player);
    });
  
    socket.on("createGame", () => {
      const player = playerManager.getPlayer(socket.id);
      if (!player) return;
      if (gameManager.checkGamesForPlayer(player)) return;
      const game = gameManager.createGame(player);
      if (game) {
        socket.join(game.roomId);
        io.to(socket.id).emit("gameWaiting", { roomId: game.roomId });
      }
    });
  
    socket.on("joinRandomGame", () => {
      const player = playerManager.getPlayer(socket.id);
      if (player) {
        if (gameManager.checkGamesForPlayer(player)) return;
        const game = gameManager.getRandomGame();
        if (game) {
          gameManager.joinGame(player, game.roomId);
          io.to(player.socketId).emit("gameFound", { roomId: game.roomId });
        } else {
          io.to(player.socketId).emit("noGameFound");
        }
      }
    });
  
    socket.on("joinGame", (roomId, username, userId) => {
      const player = playerManager.getPlayerById(userId);
      if (player) {
        playerManager.updatePlayerSocket(player.userId, socket.id);
        playerManager.updatePlayerName(player.userId, username);
        const game = gameManager.getGame(roomId);
        if (game) {
          if (gameManager.returningPlayer(player, game)) {
            gameManager.updatePlayerSocket(player, roomId);
          } else {
            if (gameManager.checkGamesForPlayer(player)) return;
            gameManager.joinGame(player, roomId);
          }
          socket.join(roomId);
          if (game.player2) {
            io.to(roomId).emit("gameJoined", {
              userIdPlayer1: game.player1.userId,
              userIdPlayer2: game.player2.userId,
              gameRoomId: game.roomId,
            });
          } else {
            io.to(roomId).emit("gameJoined", {
              userIdPlayer1: game.player1.userId,
              userIdPlayer2: null,
              gameRoomId: game.roomId,
            });
          }
        }
      }
    });
  
    socket.on("movePiece", (roomId, userId, direction) => {
      const game = gameManager.getGame(roomId);
      if (game) {
        const tetris = gameManager.getTetris(game, playerManager.getPlayerById(userId));
        if (direction === "left") tetris.movePiece(-1, 0);
        if (direction === "right") tetris.movePiece(1, 0);
        if (direction === "down") tetris.movePiece(0, 1);
        if (direction === "rotate") tetris.rotatePiece();
        if (direction === "hardDown") tetris.hardDown();
        if (!game.player2) {
          io.to(roomId).emit("gameState", {
            tetris1: {
              playerName: game.player1.name,
              playerId: game.player1.userId,
              grid: game.tetris1.grid,
              nextPiece: game.tetris1.nextPiece,
            },
            tetris2: {
              playerName: null,
              playerId: null,
              grid: game.tetris2.grid,
              nextPiece: game.tetris2.nextPiece,
            },
          });
        } else {
          io.to(roomId).emit("gameState", {
            tetris1: {
              playerName: game.player1.name,
              playerId: game.player1.userId,
              grid: game.tetris1.grid,
              nextPiece: game.tetris1.nextPiece,
            },
            tetris2: {
              playerName: game.player2.name,
              playerId: game.player2.userId,
              grid: game.tetris2.grid,
              nextPiece: game.tetris2.nextPiece,
            },
          });
        }
      }
    });
  
    socket.on("startGame", (roomId, mode) => {
      const game = gameManager.getGame(roomId);
      if (game) {
        if (game.status === "Waiting") {
          game.startGame(mode);
          game.on("gameOver", ({ roomId, winner }) => {
            io.to(roomId).emit("gameOver", { winner });
            clearInterval(game.interval);
          });
          game.on("gameState", () => {
            if (!game.player2) {
              io.to(roomId).emit("gameState", {
                tetris1: {
                  playerName: game.player1.name,
                  playerId: game.player1.userId,
                  grid: game.tetris1.grid,
                  nextPiece: game.tetris1.nextPiece,
                },
                tetris2: {
                  playerName: null,
                  playerId: null,
                  grid: game.tetris2.grid,
                  nextPiece: game.tetris2.nextPiece,
                },
              });
            } else {
              io.to(roomId).emit("gameState", {
                tetris1: {
                  playerName: game.player1.name,
                  playerId: game.player1.userId,
                  grid: game.tetris1.grid,
                  nextPiece: game.tetris1.nextPiece,
                },
                tetris2: {
                  playerName: game.player2.name,
                  playerId: game.player2.userId,
                  grid: game.tetris2.grid,
                  nextPiece: game.tetris2.nextPiece,
                },
              });
            }
          });
        } else {
          io.to(roomId).emit("restart");
          if (game.player2) {
            io.to(roomId).emit("gamePlayers", {
              player1: game.player1.userId,
              player2: game.player2.userId,
            });
          } else {
            io.to(roomId).emit("gamePlayers", {
              player1: game.player1.userId,
              player2: null,
            });
          }
          game.endGame();
          game.clearGame();
          game.startGame(game.getGameMode());
        }
      }
    });
  
    socket.on("getInfos", (roomId) => {
      const game = gameManager.getGame(roomId);
      if (game) {
        io.to(socket.id).emit("gameInfos", { infos: game.player1.userId });
      } else {
        io.to(socket.id).emit("gameInfos", { infos: null });
      }
    });
  
    socket.on("restartGame", (roomId) => {
      const game = gameManager.getGame(roomId);
      if (game) {
        io.to(roomId).emit("restart");
        if (game.player2) {
          io.to(roomId).emit("gamePlayers", {
            player1: game.player1.userId,
            player2: game.player2.userId,
          });
        } else {
          io.to(roomId).emit("gamePlayers", {
            player1: game.player1.userId,
            player2: null,
          });
        }
        game.endGame();
        game.clearGame();
        game.startGame(game.getGameMode());
      }
    });
  
    socket.on("leaveGame", (roomId, uuid) => {
      const game = gameManager.getGame(roomId);
      if (game) {
        const player = game.getPlayerByUuid(uuid);
        if (player) {
          game.on("gameOver", ({ winner }) => {
            io.to(roomId).emit("gameOver", { winner });
          });
          game.on("deleteGame", () => {
            return gameManager.deleteGame(roomId);
          });
          game.on("updateInfosGame", (leaver) => {
            io.to(roomId).emit("gameInfosQuit", leaver);
          });
          game.updatePlayers(player);
          io.to(roomId).emit("gameInfos", { infos: game.player1.userId });
        }
      }
    });
  
    socket.on("updateScore", (userId, score) => {
      const player = playerManager.getPlayerById(userId);
      if (player) {
        if (!player.getBestScore() || player.getBestScore() < score) {
          player.setBestScore(score);
          io.emit("leaderboardInfos", { infos: playerManager.getLeaderboard() });
        }
      }
    });
  
    socket.on("getLeaderboard", () => {
      io.emit("leaderboardInfos", { infos: playerManager.getLeaderboard() });
    });
  
    socket.on("disconnect", (userId) => {
      playerManager.removePlayer(userId, socket.id);
      io.emit("updatePlayers", playerManager.getAllPlayers());
    });
  };
  
  // npm test -- --coverage test/utils/socketMiddleware.test.jsx