// OnlineGameController.test.js
import OnlineGameController from "../../src/controllers/OnlineGameController";
import SocketService from "../../src/services/SocketService";

// On mocke les méthodes de SocketService pour pouvoir vérifier les appels
jest.mock("../../src/services/SocketService", () => ({
  createGame: jest.fn(),
  joinRandomGame: jest.fn(),
  sendMove: jest.fn(),
  startGame: jest.fn(),
  restartGame: jest.fn(),
}));

describe("OnlineGameController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createGame appelle SocketService.createGame", () => {
    const controller = new OnlineGameController();
    controller.createGame();
    expect(SocketService.createGame).toHaveBeenCalled();
  });

  test("joinRandomGame appelle SocketService.joinRandomGame", () => {
    const controller = new OnlineGameController();
    controller.joinRandomGame();
    expect(SocketService.joinRandomGame).toHaveBeenCalled();
  });

  test("sendMove appelle SocketService.sendMove si roomId et userId sont définis", () => {
    const controller = new OnlineGameController("room3", "user3");
    controller.sendMove("left");
    expect(SocketService.sendMove).toHaveBeenCalledWith("room3", "user3", "left");
  });

  test("sendMove n'appelle pas SocketService.sendMove si roomId ou userId est manquant", () => {
    const controller1 = new OnlineGameController(null, "user3");
    controller1.sendMove("right");
    expect(SocketService.sendMove).not.toHaveBeenCalled();

    jest.clearAllMocks();

    const controller2 = new OnlineGameController("room3", null);
    controller2.sendMove("right");
    expect(SocketService.sendMove).not.toHaveBeenCalled();
  });

  test("startGame appelle SocketService.startGame si roomId est défini", () => {
    const controller = new OnlineGameController("room4", "user4");
    controller.startGame();
    expect(SocketService.startGame).toHaveBeenCalledWith("room4");
  });

  test("startGame n'appelle pas SocketService.startGame si roomId est manquant", () => {
    const controller = new OnlineGameController(null, "user4");
    controller.startGame();
    expect(SocketService.startGame).not.toHaveBeenCalled();
  });

  test("restartGame appelle SocketService.restartGame si roomId est défini", () => {
    const controller = new OnlineGameController("room5", "user5");
    controller.restartGame();
    expect(SocketService.restartGame).toHaveBeenCalledWith("room5");
  });

  test("restartGame n'appelle pas SocketService.restartGame si roomId est manquant", () => {
    const controller = new OnlineGameController(null, "user5");
    controller.restartGame();
    expect(SocketService.restartGame).not.toHaveBeenCalled();
  });
});