import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import SocketService from "../../../src/services/SocketService";
import Home from "../../../src/views/Home/Home";
import { useNavigate } from 'react-router-dom';
import "@testing-library/jest-dom";
import React from "react";


jest.mock('react-router-dom', () => {
  const actualModule = jest.requireActual('react-router-dom');
  const navigateMock = jest.fn();
  global.__navigateMock = navigateMock;
  
  return {
    __esModule: true,
    ...actualModule,
    useParams: () => ({
      roomId: 'test-room',
      username: 'test-user',
    }),
    useNavigate: navigateMock,
  };
});


jest.mock("../../../src/views/Player/PlayerName", () => (props) => (
  <button onClick={() => props.onConfirm("TestUser")} data-testid="player-name-btn">
    PlayerName
  </button>
));

const socketOnHandlers = {};

jest.mock("../../../src/services/SocketService", () => ({
  checkUserID: jest.fn(),
  socket: {
    on: jest.fn((event, callback) => {
      socketOnHandlers[event] = callback;
    }),
    off: jest.fn((event) => {
      delete socketOnHandlers[event];
    }),
  },
}));


describe("Home", () => {
  beforeEach(() => {
    delete window.location;
    window.location = { reload: jest.fn() };
    localStorage.clear();
    jest.clearAllMocks();
    Object.keys(socketOnHandlers).forEach((key) => delete socketOnHandlers[key]);
  });
  
  test("redirige vers '/solo' et '/online' lors du clic sur les boutons", async () => {
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock); 

    render(<Home />);
    
    // On simule le clic sur le bouton "Jouer en solo" et on attend que la navigation soit appelée
     waitFor(() => {
      fireEvent.click(screen.getByText("Jouer en solo"));
    });
     waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/solo");
    });
  
    // On simule ensuite le clic sur le bouton "Jouer en ligne" et on attend que la navigation soit appelée
     waitFor(() => {
      fireEvent.click(screen.getByText("Jouer en ligne"));
    });
     waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/online");
    });
  });
  
  test("gère l'événement 'userExists' et affiche les boutons de sélection de mode", () => {
    localStorage.setItem("userID", "user123");
    render(<Home />);
    act(() => {
      if (socketOnHandlers["userExists"]) {
        socketOnHandlers["userExists"]({ name: "Alice" });
      }
    });
    expect(screen.getByText("Bienvenue sur Tetris Online Alice")).toBeInTheDocument();
    expect(screen.getByText("Jouer en solo")).toBeInTheDocument();
    expect(screen.getByText("Jouer en ligne")).toBeInTheDocument();
    expect(localStorage.getItem("username")).toBe("Alice");
    expect(SocketService.checkUserID).toHaveBeenCalledWith("user123");
  });

  test("gère l'événement 'usernameInUse' et affiche le message d'erreur", () => {
    render(<Home />);
    act(() => {
      if (socketOnHandlers["usernameInUse"]) {
        socketOnHandlers["usernameInUse"]("Username already in use");
      }
    });
    const errorMessage = screen.getByText("Username already in use");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveStyle({ color: "red" });
  });

  test("gère l'événement 'usernameAccepted' en affichant les boutons de mode et en effaçant le message d'erreur", () => {
    render(<Home />);
    act(() => {
      if (socketOnHandlers["usernameInUse"]) {
        socketOnHandlers["usernameInUse"]("Error");
      }
    });
    act(() => {
      if (socketOnHandlers["usernameAccepted"]) {
        socketOnHandlers["usernameAccepted"]();
      }
    });
    expect(screen.queryByText("Error")).toBeNull();
    expect(screen.getByText("Jouer en solo")).toBeInTheDocument();
    expect(screen.getByText("Jouer en ligne")).toBeInTheDocument();
  });

  test("redirige vers '/solo' et '/online' lors du clic sur les boutons", () => {
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock); 

    localStorage.setItem("userID", "user123");
    render(<Home />);
    act(() => {
      if (socketOnHandlers["userExists"]) {
        socketOnHandlers["userExists"]({ name: "Alice" });
      }
    });
    fireEvent.click(screen.getByText("Jouer en solo"));
    expect(navigateMock).toHaveBeenCalledWith("/solo");
    fireEvent.click(screen.getByText("Jouer en ligne"));
    expect(navigateMock).toHaveBeenCalledWith("/online");
  });

  test("la fonction handleConfirmation met à jour le nom d'utilisateur", () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("player-name-btn"));
    expect(screen.getByText("Bienvenue sur Tetris Online TestUser")).toBeInTheDocument();
  });
});
