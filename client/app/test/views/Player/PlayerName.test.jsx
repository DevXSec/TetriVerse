import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import '@testing-library/jest-dom';
import PlayerName from '../../../src/views/Player/PlayerName';
import SocketService from '../../../src/services/SocketService';
import { render, screen, fireEvent } from '@testing-library/react';


jest.mock('uuid', () => ({
  v4: jest.fn(() => 'fixed-uuid'),
}));

jest.mock('../../../src/services/SocketService', () => ({
  connect: jest.fn(),
}));

describe('PlayerName', () => {
  test('affiche l’input et le bouton "Confirmer"', () => {
    const onConfirm = jest.fn();
    render(<PlayerName onConfirm={onConfirm} />);
    
    expect(screen.getByPlaceholderText('Entrez votre pseudo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmer/i })).toBeInTheDocument();
  });

  test('ne fait rien si le nom est vide', () => {
    const onConfirm = jest.fn();
    render(<PlayerName onConfirm={onConfirm} />);
    
    const input = screen.getByPlaceholderText('Entrez votre pseudo');
    const button = screen.getByRole('button', { name: /Confirmer/i });
    
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(button);
    
    expect(SocketService.connect).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('appelle SocketService.connect et onConfirm lors d’un clic sur le bouton avec un nom valide', () => {
    const onConfirm = jest.fn();
    render(<PlayerName onConfirm={onConfirm} />);
    
    const input = screen.getByPlaceholderText('Entrez votre pseudo');
    const button = screen.getByRole('button', { name: /Confirmer/i });
    
    fireEvent.change(input, { target: { value: 'John' } });
    fireEvent.click(button);
    expect(SocketService.connect).toHaveBeenCalledWith('fixed-uuid', 'John');
    expect(onConfirm).toHaveBeenCalledWith('John');
  });

  test('appelle SocketService.connect et onConfirm lors d’une pression sur Enter avec un nom valide', () => {
    const onConfirm = jest.fn();
    render(<PlayerName onConfirm={onConfirm} />);
    
    const input = screen.getByPlaceholderText('Entrez votre pseudo');
    
    fireEvent.change(input, { target: { value: 'Alice' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    expect(SocketService.connect).toHaveBeenCalledWith('fixed-uuid', 'Alice');
    expect(onConfirm).toHaveBeenCalledWith('Alice');
  });
});
