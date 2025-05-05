import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RestartButton from "../../../src/views/GameOnline/RestartButton";
import "@testing-library/jest-dom";

describe("RestartButton", () => {
  test("affiche le bouton avec le texte 'Restart Game' et la classe 'restart-button'", () => {
    const onRestart = jest.fn();
    render(<RestartButton onRestart={onRestart} />);
    
    const button = screen.getByRole("button", { name: /Restart Game/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("restart-button");
  });

  test("appelle onRestart lors d'un clic sur le bouton", () => {
    const onRestart = jest.fn();
    render(<RestartButton onRestart={onRestart} />);
    
    const button = screen.getByRole("button", { name: /Restart Game/i });
    fireEvent.click(button);
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
