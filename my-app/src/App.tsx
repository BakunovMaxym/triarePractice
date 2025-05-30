import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameDto, UserDto, PropertyDto } from './types/types';
import GameUI from './components/GameUi';

interface Invoice {
  id: string;
  cost: number;
  name: string;
  onCompleteMessage?: string;
  callback?: () => void;
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState<GameDto | null>(null);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pendingInvoice, setPendingInvoice] = useState<Invoice | null>(null);
  const [myTurn, setMyTurn] = useState<boolean>(false);
  const latestToken = useRef<string | null>(null);
  const hasReconnectedWithToken = useRef<boolean>(false);

  

  const log = (message: string) => {
    console.log(message);
    // Тут можна додати у UI логів, якщо потрібно
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3000'); // твій URL
    setSocket(newSocket);

    // Підписка на події
    newSocket.on('connect', () => log('Підключено до сервера'));
    newSocket.on('disconnect', () => log('Відключено від сервера'));

    newSocket.on('roomJoined', (data) => {
      log('roomJoined: ' + JSON.stringify(data));
      if (data.token?.accessToken) {
        latestToken.current = data.token.accessToken;
        sessionStorage.setItem('token', latestToken.current);
      }
      if (!hasReconnectedWithToken.current) {
        log('👉 Setting auth with token: ' + latestToken.current);
        hasReconnectedWithToken.current = true;
        newSocket.auth = { token: latestToken.current };
        newSocket.disconnect().connect();
        log('🔄 Reconnecting with token...');
      }
      setCurrentUser(data.user);
      setGame((prevGame) => data.curentGame ?? prevGame);
    });

    newSocket.on('gameCreated', (data) => {
      log('gameCreated: ' + JSON.stringify(data));
      setGame(data);
    });

    newSocket.on('userJoined', (data) => {
      log('userJoined: ' + JSON.stringify(data));
      if (data.curentGame) setGame(data.curentGame);
    });

    newSocket.on('userLeft', (userId: string) => {
      log('userLeft: ' + userId);
      setGame((prevGame) => {
        if (!prevGame) return prevGame;
        return {
          ...prevGame,
          users: prevGame.users.filter((u) => u.id !== userId),
        };
      });
    });

    newSocket.on('Kicked', (userId: string) => {
      log('Kicked: ' + userId);
      setGame((prevGame) => {
        if (!prevGame) return prevGame;
        return {
          ...prevGame,
          users: prevGame.users.filter((u) => u.id !== userId),
        };
      });
      if (currentUser?.id === userId) {
        latestToken.current = null;
        hasReconnectedWithToken.current = false;
        setGame(null);
        setCurrentUser(null);
      }
    });

    newSocket.on('Leave', () => {
      log('Leave');
      newSocket.disconnect();
      latestToken.current = null;
      hasReconnectedWithToken.current = false;
      setGame(null);
      setCurrentUser(null);
    });

    newSocket.on('error', (data) => {
      log('Error: ' + JSON.stringify(data));
      alert(data.description);
    });

    newSocket.on('gameStarted', (data) => {
      log('gameStarted: ' + JSON.stringify(data));
      setGame(data);
      newSocket.emit('me');
    });

    newSocket.on('you', (data) => {
      log('you: ' + JSON.stringify(data));
      setCurrentUser(data);
      setGame(data.game);
    });

    newSocket.on('YourTurn', (data) => {
      log('YourTurn: ' + JSON.stringify(data));
      if (data.user.id === currentUser?.id) {
        setMyTurn(true);
        alert('Your turn');
      } else {
        setMyTurn(false);
      }
      newSocket.emit('me');
    });

    newSocket.on('diceRolled', (data) => {
      log('diceRolled: ' + JSON.stringify(data));
      let message = '';
      if (data.user.id === currentUser?.id) {
        message += 'You ';
      } else {
        message += `${data.user.username} `;
      }
      message += `have rolled ${data.diceRoll.firstCube} and ${data.diceRoll.secondCube} `;
      if (data.diceRoll.boosterCube) {
        message += `and ${data.diceRoll.boosterCube} `;
      }
      if (data.dable) {
        message += "it's double ";
      }
      alert(message);
    });

    newSocket.on('Invoice', (data) => {
      log('Invoice: ' + JSON.stringify(data));
      setInvoices((prev) => [...prev, { id: crypto.randomUUID(), cost: data.cost, name: data.type }]);
      newSocket.emit('me');
    });

    newSocket.on('InvoiceComplete', (data) => {
      log('InvoiceComplete: ' + JSON.stringify(data));
      if (pendingInvoice && data.id === pendingInvoice.id) {
        alert(`${pendingInvoice.onCompleteMessage}\nCost: ${pendingInvoice.cost}`);
        if (pendingInvoice.callback) pendingInvoice.callback();
        setPendingInvoice(null);
      }
      setInvoices((prev) => prev.filter((inv) => inv.id !== data.id));
    });

    newSocket.on('CanBuy', (data) => {
      log('CanBuy: ' + JSON.stringify(data));
      const wantsToBuy = window.confirm(`Do you want to buy ${data.property.property.name}?`);
      if (wantsToBuy) {
        const newInvoice: Invoice = {
          id: crypto.randomUUID(),
          cost: -1 * data.property.property.price,
          name: 'buy property',
          onCompleteMessage: `You have bought ${data.property.property.name}`,
          callback: () => {
            newSocket.emit("BuyProperty", { peopertyId: data.property.id });
          }
        };
        setPendingInvoice(newInvoice);
        newSocket.emit('PayInvoice', { cost: newInvoice.cost, invoiceId: newInvoice.id });
      }
    });

    

    return () => {
      newSocket.disconnect();
    };
  }, []);

  

  return (
    <div className="App">
      {socket && game && currentUser ? (
        <GameUI
          socket={socket}
          game={game}
          currentUser={currentUser}
          invoices={invoices}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default App;
