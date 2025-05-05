import React from "react";
import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ErrorPage from "../../../src/views/Error/Error";

describe("ErrorPage", () => {
  beforeEach(() => {
    delete window.location;
    window.location = { reload: jest.fn() };
  });

  test("affiche le message d'erreur et le lien vers le menu", () => {
    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
    );

    expect(screen.getByText("404 - Page introuvable")).toBeInTheDocument();
    expect(screen.getByText("Cette page n'existe pas....")).toBeInTheDocument();
    const linkElement = screen.getByRole("link", { name: /Retourner au menu/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "/");
  });
});
