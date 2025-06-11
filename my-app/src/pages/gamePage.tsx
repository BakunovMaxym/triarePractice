import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';


const SocketGameTester: React.FC = () => {
const [latestToken, setLatestToken] = useState<string | null>(null);
const [game, setGame] = useState<any>(null);
const [currentUser, setCurrentUser] = useState<any>(null);
const [invoices, setInvoices] = useState<any[]>([]);
const [pendingInvoice, setPendingInvoice] = useState<any>(null);
const [myTurn, setMyTurn] = useState(false);

// для флагів та socket'а краще використати useRef
const hasReconnectedWithToken = useRef(false);
const socketRef = useRef<Socket | null>(null);







  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1>Socket.IO Тестер Гри</h1>

      <p>game Id:</p>
      <button onClick={() => copyText('gameId')}>copyId</button>
      <p id="gameId"></p>

      <p>UserId:</p>
      <button onClick={() => copyText('UserId')}>copyId</button>
      <p id="UserId"></p>

      <p>money:</p>
      <p id="money"></p>

      <p>propertieses:</p>
      <div id="propertieses" style={flexRowStyle}></div>

      <p>Yourproperties:</p>
      <div id="Yourproperties" style={flexRowStyle}></div>

      <p>OtherUsers:</p>
      <div id="OtherUsers" style={flexRowStyle}></div>

      <div className="section">
        <h2>Підключення</h2>
        <label>
          Сервер URL:
          <input type="text" id="serverUrl" defaultValue="http://localhost:3000" />
        </label>
        <br />
        <button id="connectBtn">Підключитися</button>
      </div>

      <div className="section">
        <h2>отримати себе</h2>
        <button id="meBtn">Отримати я</button>
      </div>

      <div id="startGame">
        <CreateJoinGameSection />
      </div>

      <div id="Game" style={{ display: 'none' }}>
        <p>TurnOrder:</p>
        <p id="TurnOrder"></p>

        <p>invoices:</p>
        <div id="invoices" style={flexRowStyle}></div>

        <div id="YourTurn" style={{ display: 'none' }}>
          <h2>Дії ходу</h2>
          <button onClick={() => console.log('ThrowDice')}>throw dice</button>
          <br />
          <label>ID земельної ділянки: <input type="text" id="LandOnPropertyText" /></label>
          <button onClick={() => console.log('LandOnPropety')}>land on property</button>
          <br />
          <button onClick={() => console.log('UseGetOutofJailCard')}>get out of jail</button>
          <br />
          <button onClick={() => console.log('EndTurn')}>end turn</button>
        </div>

        <div>
          <h2>Здатися</h2>
          <button id="meBtn">give up</button>
        </div>
      </div>

      <div className="section">
        <h2>Логи</h2>
        <div id="logs" style={logStyle}></div>
      </div>
    </div>
  );
};

const CreateJoinGameSection = () => (
  <>
    <div className="section">
      <h2>Створити гру</h2>
      <label>Ім&apos;я користувача: <input type="text" id="createUsername" /></label>
      <label>ID колекції: <input type="text" id="colectionId" /></label>
      <button id="createGameBtn">Створити гру</button>
    </div>

    <div className="section">
      <h2>Приєднатися до гри</h2>
      <label>Ім&apos;я користувача: <input type="text" id="joinUsername" /></label>
      <label>ID гри: <input type="text" id="joinGameId" /></label>
      <button id="joinGameBtn">Приєднатися</button>
    </div>

    <div className="section">
      <h2>Інше</h2>
      <label>ID гравця для кіка: <input type="text" id="kickPlayerId" /></label>
      <button id="kickBtn">Кікнути гравця</button>
      <button id="leaveBtn">Вийти з гри</button>
    </div>

    <div className="section">
      <h2>Змінити налаштування гри</h2>
      <label>Time for Turn: <input type="number" id="timeForTurn" /></label>
      <label>Money for Lap: <input type="number" id="moneyForLap" /></label>
      <label>Booster Cube: <input type="checkbox" id="bosterCube" /></label>
      <label>Auction Enabled: <input type="checkbox" id="auction" /></label>
      <label>Starter Money: <input type="number" id="starterMoney" /></label>
      <button id="changeSettingsBtn">Змінити налаштування</button>
    </div>

    <div className="section">
      <h2>старт гри</h2>
      <button id="startGameBtn">старт гри</button>
    </div>
  </>
);

const flexRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  columnGap: '5px',
};

const logStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '10px',
  maxHeight: '300px',
  overflowY: 'scroll',
};

export default SocketGameTester;
