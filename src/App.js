import './App.css';
import React, { Component } from "react";
import Confetti from 'react-dom-confetti';
import styled from "styled-components";

const Button = styled.button`
  font-size: 16px;
  font-weight: bold;
  background-color: ${(props) => theme[props.theme].default};
  color: white;
  padding: 5px 70px;
  text-transform: uppercase;
  margin: 10px 0px;
  cursor: pointer;
  transition: ease background-color 250ms;
  &:hover {
    background-color: ${(props) => theme[props.theme].hover};
  }
`;

const theme = {
  blue: {
    default: "#3f51b5",
    hover: "#283593"
  }
};

Button.defaultProps = {
  theme: "blue"
};

const config = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: "200",
  dragFriction: 0.12,
  duration: "10000",
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

const playerRed = "Red";
const playerYellow = "Yellow";

const rows = 6;
const columns = 7;

// Need to make coordinates a state instead of const and add its values from setGame() instead of hard coding them
const coordinates = ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5", "0-6", "1-0", "1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "2-0", "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "3-0", "3-1", "3-2", "3-3", "3-4", "3-5", "3-6", "4-0", "4-1", "4-2", "4-3", "4-4", "4-5", "4-6", "5-0", "5-1", "5-2", "5-3", "5-4", "5-5", "5-6"];

class App extends Component {
  constructor() {
    super();

    this.board = [];
    this.currColumns = [];

    this.state = { currPlayer: playerRed, gameOver: false, gameOverByWin: false, gameOverByTie: false, winner: null };
    this.setGame = this.setGame.bind(this);
    this.setPiece = this.setPiece.bind(this);
    this.checkWinner = this.checkWinner.bind(this);
    this.setWinner = this.setWinner.bind(this);

    this.setGame();
  }

  setGame() {
    // Populate a 2d array that will represent the board and keep track of which tiles have pieces on them
    this.board = [];
    // The gravity array
    this.currColumns = [5, 5, 5, 5, 5, 5, 5];

    for (let r = 0; r < rows; r++) {
      let row = [];
      for (let c = 0; c < columns; c++) {
        row.push(' ');
      }
      this.board.push(row);
    }
  }

  setTiles(htmlIDs) {
    var divs = [];
    htmlIDs.forEach(currID => {
      divs.push(<div id={currID} class="tile" onClick={this.setPiece}></div>);
    });

  }

  setPiece(e) {
    // If the game is over don't allow the board to change
    if (this.state.gameOver) {
      return;
    }

    // Get the coordinates of the tile clicked on from the id
    let coords = e.target.id.split("-"); // "0-0" -> ["0", "0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    // Use the gravity array to place the piece at the first available row from the bottom of the column up
    r = this.currColumns[c];
    if (r < 0) {
      return;
    }

    // Set the index in the array representing the board from ' ' to the current player
    this.board[r][c] = this.state.currPlayer;

    // Update the board visually
    let tile = document.getElementById(r.toString() + "-" + c.toString());
    // If the current player is red set the tile to red, change the current player to yellow, and let the user know its their turn
    if (this.state.currPlayer === playerRed) {
      tile.classList.add("red-piece");
      this.setState({ currPlayer: playerYellow });
    }
    // If the current player is red set the tile to yellow, change the current player to red, and let the user know its their turn
    else {
      tile.classList.add("yellow-piece");
      this.setState({ currPlayer: playerRed });
    }

    r -= 1; // Updating the row height for the column
    this.currColumns[c] = r; // Update the array (of the gravity array)

    // Check for a winner or tie before starting the next turn
    this.checkTie();
    this.checkWinner();
  }

  checkWinner() {
    // Check the board horizontally for wins
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns - 3; c++) {
        if (this.board[r][c] !== ' ') {
          if (this.board[r][c] === this.board[r][c + 1] && this.board[r][c + 1] === this.board[r][c + 2] && this.board[r][c + 2] === this.board[r][c + 3]) {
            this.setWinner(r, c);
            return;
          }
        }
      }
    }

    // Check the board vertically for wins
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows - 3; r++) {
        if (this.board[r][c] !== ' ') {
          if (this.board[r][c] === this.board[r + 1][c] && this.board[r + 1][c] === this.board[r + 2][c] && this.board[r + 2][c] === this.board[r + 3][c]) {
            this.setWinner(r, c);
            return;
          }
        }
      }
    }

    // Check the board left to right diagonally for wins
    for (let r = 3; r < rows; r++) {
      for (let c = 0; c < columns - 3; c++) {
        if (this.board[r][c] !== ' ') {
          if (this.board[r][c] === this.board[r - 1][c + 1] && this.board[r - 1][c + 1] === this.board[r - 2][c + 2] && this.board[r - 2][c + 2] === this.board[r - 3][c + 3]) {
            this.setWinner(r, c);
            return;
          }
        }
      }
    }

    // Check the board right to left (or anti) diagonally for wins
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns - 3; c++) {
        if (this.board[r][c] !== ' ') {
          if (this.board[r][c] === this.board[r + 1][c + 1] && this.board[r + 1][c + 1] === this.board[r + 2][c + 2] && this.board[r + 2][c + 2] === this.board[r + 3][c + 3]) {
            this.setWinner(r, c);
            return;
          }
        }
      }
    }
  }

  setWinner(r, c) {
    // If the tile passed in had a red piece on it that means red wins
    if (this.board[r][c] === playerRed) {
      this.setState({ winner: playerRed });
    }
    // Else if the tile passed in had a yellow piece on it that means yellow wins
    else {
      this.setState({ winner: playerYellow });
    }

    // Dont allow players to keep playing until resettng the board
    this.setState({ gameOver: true });
    this.setState({ gameOverByWin: true });
  }

  checkBoardFull() {
      // Look for an empty space
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          if (this.board[r][c] === ' ') {
            return;
          }
        }
      }
     // If no empty spaces were found so end the game without setting a winner
     this.setState({ gameOver: true });
     this.setState({ gameOverByTie: true });
  }

  // Check all possible runs of 4-in-a-row on the board, horizontal, vertical and diagonal. If all of them contain at least one A and at least one B then it's going to be a tie. If there is even one that is made up of a combination of empty and A or empty and B (assuming there are no rows of 4-in-a-row A or 4-in-a-row B, in which case you already have a win), then a win by A or B is still possible.

  // You probably already have code to check for a win, so just adapt it to check for 4-in-a-row of A or empty, or 4-in-a-row of B or empty instead of 4-in-a-row of A, or 4-in-a-row of B. If it fails to detect a possible win then a tie is inevitable.
  
  checkTie() {
    // Start by checking if the board is full
      this.checkBoardFull();

    // Check the board horizontally for ties
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns - 3; c++) {
        if ((this.board[r][c] === playerRed || ' ') && (this.board[r][c + 1] === playerRed || ' ') && (this.board[r][c + 2] === playerRed || ' ') && (this.board[r][c + 3] === playerRed || ' ') ) {
          return;
        }
        else if ((this.board[r][c] === playerYellow || ' ') && (this.board[r][c + 1] === playerYellow || ' ') && (this.board[r][c + 2] === playerYellow || ' ') && (this.board[r][c + 3] === playerYellow || ' ') ) {
          return;
         }
      }
    }

    // Check the board vertically for ties
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows - 3; r++) {
        if ((this.board[r][c] === playerRed || ' ') && (this.board[r + 1][c] === playerRed || ' ') && (this.board[r + 2][c] === playerRed || ' ') && (this.board[r + 3][c] === playerRed || ' ')) {
          return;
        }
        else if ((this.board[r][c] === playerYellow || ' ') && (this.board[r + 1][c] === playerYellow || ' ') && (this.board[r + 2][c] === playerYellow || ' ') && (this.board[r + 3][c] === playerYellow || ' ')) {
          return;
        }
      }
    }

    // Check the board left to right diagonally for ties
    for (let r = 3; r < rows; r++) {
      for (let c = 0; c < columns - 3; c++) {
        if ((this.board[r][c] === playerRed || ' ') && (this.board[r - 1][c + 1] === playerRed || ' ') && (this.board[r - 2][c + 2] === playerRed || ' ') && (this.board[r - 3][c + 3] === playerRed || ' ')) {
          return;
        }
        else if ((this.board[r][c] === playerYellow || ' ') && (this.board[r - 1][c + 1] === playerYellow || ' ') && (this.board[r - 2][c + 2] === playerYellow || ' ') && (this.board[r - 3][c + 3] === playerYellow || ' ')) {
          return;
        }
      }
    }

    // Check the board right to left (or anti) diagonally for ties
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns - 3; c++) {
        if ((this.board[r][c] === playerRed || ' ') && (this.board[r + 1][c + 1] === playerRed || ' ') && (this.board[r + 2][c + 2] === playerRed || ' ') && (this.board[r + 3][c + 3] === playerRed || ' ')) {
          return;
        }
        else if ((this.board[r][c] === playerYellow || ' ') && (this.board[r + 1][c + 1] === playerYellow || ' ') && (this.board[r + 2][c + 2] === playerYellow || ' ') && (this.board[r + 3][c + 3] === playerYellow || ' ')) {
          return;
        }
      }
    }

    // No potentials wins were found so end the game without setting a winner
    this.setState({ gameOver: true });
    this.setState({ gameOverByTie: true });
  }

  resetBoard() {
    window.location.reload();
  }

  render() {
    const drawCoordinates = coordinates.map((coordinate) => {
      return <div id={coordinate} class="tile" onClick={this.setPiece}></div>
    });

    return (
      <body>
        <div class="confetti">
          <Confetti active={this.state.gameOverByWin} config={config} />
        </div>
        <h1>Connect 4</h1>
        <h2 id="showTie" hidden={!this.state.gameOverByTie}>
          <text style={{ color: "red" }}>{playerRed} </text>
          <text>and</text>
          <text style={{ color: "yellow" }}> {playerYellow} </text>
          <text>draws. Play again?</text>
        </h2>
        <h2 id="showWinner" hidden={!this.state.gameOverByWin}>
          <text style={{ color: this.state.winner === playerRed ? "red" : "yellow" }}>{this.state.winner} </text>
          <text>wins! Play again?</text>
        </h2>
        <h2 id="showTurn" hidden={this.state.gameOver}>
          <text>Your turn,</text>
          <text style={{ color: this.state.currPlayer === playerRed ? "red" : "yellow" }}> {this.state.currPlayer}</text>
          <text>!</text>
        </h2>
        <Button hidden={!this.state.gameOver} onClick={this.resetBoard}>Reset Board</Button>
        <div id="board">
          {/* The tiles need to be created with a map because of the unique IDs*/}
          {drawCoordinates}
        </div>
      </body>
    );
  }
}

export default App;
