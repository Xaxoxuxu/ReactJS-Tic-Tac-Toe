import { useState } from "react";

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [boxHistory, setBoxHistory] = useState(Array(9).fill({ row: null, col: null }));
  const [currentMoveCount, setCurrentMove] = useState(0);
  const [sortAsc, setSortAsc] = useState(true)
  const isXNext = currentMoveCount % 2 === 0;
  const currentSquares = history[currentMoveCount];

  const moves = history.map((squares, move) => {
    const row = boxHistory[move].row;
    const col = boxHistory[move].col;
    const description = move > 0 ? 'Go to move #' + move + '(row:' + row + '|col:' + col + ')' : 'Go to game start';
    return (
      <li key={move}>
        {currentMoveCount === move ?
          move === 0 ? <div>You are at game start</div> : <div>You are at move #{move}</div>
          : <button onClick={() => jumpTo(move)}>{description}</button>}
      </li>
    );
  });

  function handlePlay(nextSquares, lastSquareNumberPlayed) {
    const nextHistory = [...history.slice(0, currentMoveCount + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    const row = Math.floor(lastSquareNumberPlayed / 3);
    const col = lastSquareNumberPlayed % 3;
    const nextBoxHistory = boxHistory.slice();
    nextBoxHistory[currentMoveCount] = { row: row, col: col };
    setBoxHistory(nextBoxHistory)
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board isXNext={isXNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{sortAsc ? moves : moves.toReversed()}</ol>
        <button onClick={() => { setSortAsc(!sortAsc) }}>Sort {sortAsc ? " Descending" : " Ascending"}</button>
      </div>
    </div>
  );
}

function Board({ isXNext, squares, onPlay }) {

  function handleClick(i) {
    const lastSquareNumberPlayed = i;
    if (squares[lastSquareNumberPlayed] || calculateWinner(squares).winnerSign) {
      return;
    }

    const nextSquares = squares.slice();
    if (isXNext) {
      nextSquares[lastSquareNumberPlayed] = "X";
    }
    else {
      nextSquares[lastSquareNumberPlayed] = "O";
    }
    onPlay(nextSquares, lastSquareNumberPlayed);
  }

  const winner = calculateWinner(squares)
  const winnerSign = winner.winnerSign;
  let status;
  if (winnerSign) {
    status = "Winner: " + winnerSign;
  }
  else if (!squares.includes(null)) {
    status = "DRAW"
  }
  else {
    status = "Next player: " + (isXNext ? "X" : "O");
  }

  function renderSquare(squareNum) {
    if (squareNum < 0) { return; }
    return <Square key={squareNum}
      value={squares[squareNum]}
      onSquareClick={() => { handleClick(squareNum) }}
      isWinnerSquare={winner.winningLines?.includes(squareNum)} />;
  }

  function renderSquares(from, count) {
    if (count <= 0) { return; }
    let squares = [];
    for (let i = from; i < from + count; i++) {
      squares.push(renderSquare(i))
    }
    return squares;
  }

  function renderRows(startingSquareIndex) {
    if (startingSquareIndex < 0) { return; }
    return (
      <div className="board-row">
        {renderSquares(startingSquareIndex, 3)}
      </div>
    )
  }

  return (
    <>
      <div className="status">{status}</div>
      {renderRows(0)}
      {renderRows(3)}
      {renderRows(6)}
    </>);
}

function Square({ value, onSquareClick, isWinnerSquare }) {
  return <button className={isWinnerSquare ? "square-winner" : "square"} onClick={onSquareClick}>{value}</button>
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [x, y, z] = lines[i];
    if (squares[x] && squares[x] === squares[y] && squares[x] === squares[z]) {
      return { winningLines: lines[i], winnerSign: squares[x] };
    }
  }
  return { winningLines: null, winner: null };
}