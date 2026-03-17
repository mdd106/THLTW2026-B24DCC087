import React, { useState, useEffect } from 'react';

const GuessGame = () => {
  const [randomNumber, setRandomNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Hãy thử đoán một số từ 1 đến 100!');
  const [attempts, setAttempts] = useState(10);
  const [gameOver, setGameOver] = useState(false);

  // Khởi tạo số ngẫu nhiên khi bắt đầu
  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    setRandomNumber(Math.floor(Math.random() * 100) + 1);
    setAttempts(10);
    setMessage('Hãy thử đoán một số từ 1 đến 100!');
    setGameOver(false);
    setGuess('');
  };

  const handleGuess = () => {
    const numGuess = parseInt(guess);

    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      setMessage('Vui lòng nhập một số hợp lệ từ 1 đến 100!');
      return;
    }

    const newAttempts = attempts - 1;
    setAttempts(newAttempts);

    if (numGuess === randomNumber) {
      setMessage('Chúc mừng! Bạn đã đoán đúng!');
      setGameOver(true);
    } else if (newAttempts === 0) {
      setMessage(`Bạn đã hết lượt! Số đúng là ${randomNumber}.`);
      setGameOver(true);
    } else if (numGuess < randomNumber) {
      setMessage('Bạn đoán quá thấp!');
    } else {
      setMessage('Bạn đoán quá cao!');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Trò chơi Đoán Số</h2>
      <p>Số lượt còn lại: <strong>{attempts}</strong></p>
      <p>{message}</p>
      
      {!gameOver ? (
        <div>
          <input 
            type="number" 
            value={guess} 
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Nhập số của bạn..."
          />
          <button onClick={handleGuess} style={{ marginLeft: '10px' }}>Đoán</button>
        </div>
      ) : (
        <button onClick={initGame}>Chơi lại</button>
      )}
    </div>
  );
};

export default GuessGame;