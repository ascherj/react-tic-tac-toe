import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const classes = 'square' + (props.winningSquare ? ' winning-square' : '');

  return (
    <button className={classes} onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={i}
        winningSquare={this.props.winningSquares.includes(i)}
      />
    );
  }

  render() {
    let boardRows = [];

    for (let row = 0; row < 3; row++) {
      const boardRow = [];
      for (let col = 0; col < 3; col++) {
        boardRow.push(this.renderSquare(col + (row * 3)));
      }
      boardRows.push(<div className="board-row" key={row}>{boardRow}</div>);
    }

    return (
      <div>
        {boardRows}
      </div>
    );


  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        move: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      selectedOption: 'ascending',
      winningSquares: [],
      isTie: false
    };
  }

  isTie(squares) {
    const winner = calculateWinner(squares);
    return !squares.includes(null) && !winner;
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        move : getColRow(i),
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    }, () => {
      // After updating the state, check for winner or tie
      const winner = calculateWinner(squares);

      this.setState({
        winningSquares: winner ? winner.squares : [],
        isTie: this.isTie(squares)
      });
    });
  }

  jumpTo(step) {
    const squares = this.state.history[step].squares;
    const winner = calculateWinner(squares);

    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      winningSquares: winner ? winner.squares : [],
      isTie: this.isTie(squares)
    });
  }

  handleOptionChange(event) {
    this.setState({
      selectedOption: event.target.value
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        `Go to move #${move} (${step.move[0]}, ${step.move[1]})` :
        'Go to game start';

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {this.state.stepNumber === move ? <strong>{desc}</strong> : desc}
          </button>
        </li>
      );
    });

    const sortedMoves = this.state.selectedOption === 'descending' ?
      moves.slice().reverse() :
      moves.slice();

    let status;
    if (winner && winner.player) {
      status = 'Winner: ' + winner.player;
    } else if (this.state.isTie) {
      status = 'It\'s a tie!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningSquares={this.state.winningSquares}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <br></br>
          <div id="sort-buttons">
            <div>
              <input
                type="radio"
                id="ascending"
                name="sort"
                value="ascending"
                checked={this.state.selectedOption === 'ascending'}
                onChange={this.handleOptionChange.bind(this)} />
              <label htmlFor="ascending">Ascending</label>
            </div>
            <div>
              <input
                type="radio"
                id="descending"
                name="sort"
                value="descending"
                checked={this.state.selectedOption === 'descending'}
                onChange={this.handleOptionChange.bind(this)} />
              <label htmlFor="descending">Descending</label>
            </div>
          </div>
          <ul>{sortedMoves}</ul>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return ({
        player: squares[a],
        squares: [a, b, c]
      });
    }
  }
  return null;
}

function getColRow(cell) {
  let col;
  let row;

  if (cell < 0 || cell > 8) {
    return;
  }

  col = cell % 3;

  if (cell < 3) {
    row = 0;
  } else if (cell < 6) {
    row = 1;
  } else {
    row = 2;
  }

  return [col, row];
}