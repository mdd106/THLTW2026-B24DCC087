import React, { useState } from 'react';

const OanTuTi = () => {
  const [userChoice, setUserChoice] = useState<string>('');
  const [computerChoice, setComputerChoice] = useState<string>('');
  const [result, setResult] = useState<string>('Chọn một cái đi!');
  const [history, setHistory] = useState<string[]>([]);

  const choices = ['Kéo', 'Búa', 'Bao'];

  const play = (choice: string) => {
    const computer = choices[Math.floor(Math.random() * 3)];
    setUserChoice(choice);
    setComputerChoice(computer);

    let res = "";
    if (choice === computer) {
      res = "Hòa rồi!";
    } else if (
      (choice === 'Kéo' && computer === 'Bao') ||
      (choice === 'Búa' && computer === 'Kéo') ||
      (choice === 'Bao' && computer === 'Búa')
    ) {
      res = "Bạn Thắng! 🎉";
    } else {
      res = "Bạn Thua rồi... 💀";
    }

    setResult(res);
    setHistory([`Bạn: ${choice} - Máy: ${computer} => ${res}`, ...history]);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Trò chơi Oẳn Tù Tì</h1>
      <div style={{ marginBottom: '20px' }}>
        {choices.map((c) => (
          <button 
            key={c} 
            onClick={() => play(c)}
            style={{ margin: '0 10px', padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
        {userChoice && `Bạn chọn: ${userChoice} | Máy chọn: ${computerChoice}`}
        <p>{result}</p>
      </div>

      <hr />
      <h3>Lịch sử đấu:</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {history.map((item, index) => (
          <li key={index} style={{ padding: '5px', borderBottom: '1px solid #eee' }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OanTuTi;