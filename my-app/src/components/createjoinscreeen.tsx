import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function CreateJoinUi({socket}) {
  const [join, setJoin] = useState(false);
  const [username, setUsername] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [GameJoinId, setGameJoinId] = useState('');
  function createGame() {
    const payload = { username, colectionId: collectionId };
    socket.emit('createGame', payload);
  }

  function joinGame() {
    const payload = { username, gameId: GameJoinId };
    socket.emit('joinGame', payload);
  }
  return (
    <div className='create-join-ui'>
      

      {!join ? (
        <div>
          <h2>Створити гру</h2>
          <div className='username-form'>
            <p>Ім'я користувача:</p> 
            <input type="text" onChange={(e) => setUsername(e.target.value)} />
          </div>
          <br />
          <div className='id-form'>
            <p>ID колекції: </p>
            <input type="text" onChange={(e) => setCollectionId(e.target.value)} />
          </div>
          <br />
          <button onClick={createGame}>Створити гру</button>
          <p onClick={() => (setJoin(true))}>Приєднатися</p>
        </div>
      ) : (
        <div>
          <h2>Приєднатися до гри</h2>
          <div className='username-form'>
            <p>Ім'я користувача:</p>
            <input type="text" onChange={(e) => setUsername(e.target.value)} />
          </div>
          <br />
          <div className='id-form'>
            <p>ID гри:</p>
            <input type="text" onChange={(e) => setGameJoinId(e.target.value)} />
          </div>
          <br />
          <button onClick={joinGame}>Приєднатися</button>
          <p onClick={() => (setJoin(false))}>Створити гру</p>

        </div>
      )}
    </div>
  );
}
