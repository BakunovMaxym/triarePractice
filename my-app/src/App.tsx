import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameDto, UserDto, PropertyDto } from './types/types';
import GameUI from './components/GameUi';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
export interface Invoice {
  id: string;
  cost: number;
  name: string;
  propertyOwnwerId?: string
  onCompleteMessage?: string;
  callback?: () => void;
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState<GameDto | null>(null);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const currentUserRef = useRef<UserDto | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const invoicesRef = useRef<Invoice[]>([]);

  const [satesOfYourProperty, setSatesOfYourProperty] = useState<Map<string, boolean>>(new Map<string, boolean>);


  const [pendingInvoice, setPendingInvoice] = useState<Invoice | null>(null);
  const pendingInvoiceRef = useRef<Invoice | null>(null);

  const [choosingProperty, setChoosingProperty] = useState<boolean>(false);

  const [myTurn, setMyTurn] = useState<boolean>(false);
  const [isDiceRoled, setIsDiceRoled] = useState<boolean>(false);

  const latestToken = useRef<string | null>(null);
  const hasReconnectedWithToken = useRef<boolean>(false);

  const [locationInfo, setLocationInfo] = useState({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  });

  const queryParams = new URLSearchParams(locationInfo.search);
  let GameId = queryParams.get("id");

  const log = (message: string) => {
    console.log(message);
  };

  const updateMap = (key: string, value: boolean) => {
    setSatesOfYourProperty(map => new Map(map.set(key, value)));
  }


  useEffect(() => {
    

    latestToken.current = sessionStorage.getItem('token');
    const handleLocationChange = () => {
      setLocationInfo({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      });
    };

    window.addEventListener('popstate', handleLocationChange);
    let newSocket;
    if (latestToken.current) {
      newSocket = io(import.meta.env.VITE_SOCKET_IP, { auth: { token: latestToken.current }, transports: ['websocket'] });

    }
    else {
      newSocket = io(import.meta.env.VITE_SOCKET_IP, { transports: ['websocket'] });
    }
    console.log('GameId', GameId);



    newSocket.on('connect', () => {
      if (GameId && !latestToken.current) {
        const username = prompt('Enter your username:');
        newSocket.emit('joinGame', { username, gameId: GameId });
        console.log("kjnasjkndkjnas")
        GameId = null; // Clear GameId to prevent re-joining
        window.removeEventListener('popstate', handleLocationChange);
        log('Підключено від сервера')
      }
    });
    newSocket.on('disconnect', () => log('Відключено від сервера'));

    newSocket.on('roomJoined', async (data) => {
      log('roomJoined: ' + JSON.stringify(data));
      if (data.token?.accessToken) {
        latestToken.current = data.token.accessToken;
        if (latestToken.current) {
          sessionStorage.setItem('token', latestToken.current);
        }
      }
      if (!hasReconnectedWithToken.current) {
        log('👉 Setting auth with token: ' + latestToken.current);
        hasReconnectedWithToken.current = true;
        newSocket.auth = { token: latestToken.current };
        await newSocket.disconnect();
        log('🔄 Reconnecting with token...');
        await newSocket.connect();
      }
      console.log('game ', data.user.game)
      console.log('user ', data.user)

      setCurrentUser(data.user);
      setGame(data.user.game);

    });

    newSocket.on('gameCreated', (data) => {
      log('gameCreated: ' + JSON.stringify(data));
      setGame(data);
    });

    newSocket.on('userJoined', (data) => {
      log('userJoined: ' + JSON.stringify(data));
      if (data.curentGame) setGame(data.curentGame);
    });
    newSocket.on('jailChange', () => {
      newSocket.emit('me');
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
      if (currentUserRef.current?.id === userId) {
        latestToken.current = null;
        hasReconnectedWithToken.current = false;
        setGame(null);
        setCurrentUser(null);
        sessionStorage.removeItem('token');
        window.location.reload();
        toast.error('Youhave been kicked from the game')
      }
    });

    newSocket.on('Leave', () => {
      log('Leave');
      newSocket.disconnect();
      latestToken.current = null;
      hasReconnectedWithToken.current = false;
      setGame(null);
      setCurrentUser(null);
      sessionStorage.removeItem('token');
      window.location.reload();
      toast.error('ypu left the game')
    });

    newSocket.on('error', (data) => {
      log('Error: ' + JSON.stringify(data));
      toast(data.description);
    });
    newSocket.on('kaput', (data) => {
      log('kaput: ' + JSON.stringify(data));
      log('Leave');
      newSocket.disconnect();
      latestToken.current = null;
      hasReconnectedWithToken.current = false;
      setGame(null);
      setCurrentUser(null);
      sessionStorage.removeItem('token');
      window.location.reload();
      toast.error('Host left the game')
    });

    newSocket.on('gameStarted', (data) => {
      log('gameStarted: ' + JSON.stringify(data));
      setGame(data);
      newSocket.emit('me');
    });
    newSocket.on('gameStarted', (data) => {
      log('gameStarted: ' + JSON.stringify(data));
      newSocket.emit('me');
    });

    newSocket.on('you', (data: UserDto) => {

      data.properties = data.properties.sort((a, b) => {
        if (a.property.street < b.property.street) return -1;
        if (a.property.street > b.property.street) return 1;

        // Streets are equal, compare by name
        if (a.property.name < b.property.name) return -1;
        if (a.property.name > b.property.name) return 1;

        return 0;


      }

      )

      data.game.propertys = data.game.propertys.sort((a, b) => {
        if (a.property.street < b.property.street) return -1;
        if (a.property.street > b.property.street) return 1;

        // Streets are equal, compare by name
        if (a.property.name < b.property.name) return -1;
        if (a.property.name > b.property.name) return 1;

        return 0;


      }

      )

      setCurrentUser(data);
      setGame(data.game);


      const isMyTurn = data.game.turnOrder[data.game.currentTurn % data.game.turnOrder.length] === data.id;
      setMyTurn(isMyTurn);
      console.log('game you', data.game);
    });

    newSocket.on('YourTurn', (data) => {
      console.log('YourTurn: ' + JSON.stringify(data));
      console.log('currentUser', currentUserRef.current);
      if (currentUserRef.current) {
        if (data.user.id === currentUserRef.current.id) {
          setIsDiceRoled(false);
          setMyTurn(true);
          toast('your turn')
        } else {
          setMyTurn(false);
        }
        newSocket.emit('me');
      }
    });

    newSocket.on('GoToJail', () => {
      log('GoToJail');
      toast('You go to jail');
      newSocket.emit('me');
    });

    newSocket.on('JailTime', () => {
      log('JailTime');
      newSocket.emit('me');
    });

    newSocket.on('diceRolled', (data) => {
      log('diceRolled: ' + JSON.stringify(data));
      let message = data.user.id === currentUserRef.current?.id
        ? 'You '
        : `${data.user.username} `;
      message += `have rolled ${data.diceRoll.firstCube} and ${data.diceRoll.secondCube}`;
      if (data.diceRoll.boosterCube) {
        message += ` and ${data.diceRoll.boosterCube}`;
      }
      if (data.dable) {
        message += " — it's a double!";
      }
      toast(message);
      if (data.user.id === currentUserRef.current?.id) {
        setChoosingProperty(true);
      }
      newSocket.emit('me');
    });

    newSocket.on('Invoice', (data) => {
      log('Invoice: ' + JSON.stringify(data));
      if (data.propertyOwnwerId) {

        setInvoices(prev => [
          ...prev,
          {
            id: uuidv4(),
            propertyOwnwerId: data.propertyOwnwerId,
            cost: data.cost,
            name: data.type,
          },
        ]);
      }
      else {
        setInvoices(prev => [
          ...prev,
          {
            id: uuidv4(),

            cost: data.cost,
            name: data.type,
          },
        ]);

      }
      newSocket.emit('me');
    });

    newSocket.on('ChanceCard', (data) => {
      log('ChanceCard: ' + JSON.stringify(data));
      toast('Chance Card\n' + data.description);
    });

    newSocket.on('GetOutOfJailCard', () => {
      log('GetOutOfJailCard');
      newSocket.emit('me');
    });

    newSocket.on('GetOutOfJailCardFull', () => {
      log('GetOutOfJailCardFull');
      toast('You got the maximum number of Get Out of Jail cards!');
    });

    newSocket.on('GoToProperty', (data) => {
      log('GoToProperty: ' + JSON.stringify(data));
      toast('You move to ' + data.property);
    });

    newSocket.on('ChoseDestination', (data) => {
      log('ChoseDestination: ' + JSON.stringify(data));
      const confirmMove = confirm('Do you want to move?');
      if (confirmMove) {
        const newInvoice: Invoice = {
          id: uuidv4(),
          cost: data.property.property.cost,
          name: 'move',
          onCompleteMessage: 'You can move!',
        };
        setPendingInvoice(newInvoice);
        newSocket.emit('PayInvoice', {
          cost: newInvoice.cost,
          invoiceId: newInvoice.id,
        });
      }
    });

    newSocket.on('ComunityCard', (data) => {
      log('ComunityCard: ' + JSON.stringify(data));
      toast('Community Card\n' + data.description);
    });

    newSocket.on('CanBuy', (data) => {
      log('CanBuy: ' + JSON.stringify(data));
      const confirmBuy = confirm('Do you want to buy ' + data.property.property.name + '?');
      if (confirmBuy) {
        const invoice: Invoice = {
          id: uuidv4(),
          cost: -data.property.property.price,
          name: 'buy property',
          onCompleteMessage: `You have bought ${data.property.property.name}`,
          callback: () => {
            newSocket.emit('BuyProperty', { peopertyId: data.property.id });
          },
        };
        setPendingInvoice(invoice);
        pendingInvoiceRef.current = invoice

        newSocket.emit('PayInvoice', { cost: invoice.cost, invoiceId: invoice.id });
      }
    });

    newSocket.on('InvoiceComplete', (data) => {
      log('InvoiceComplete: ' + JSON.stringify(data));
      console.log("invoicec ref", pendingInvoiceRef.current)
      invoicesRef.current.forEach((inv: Invoice) => {
        if (inv.id === data.id && inv.propertyOwnwerId) {
          newSocket.emit('sendMoney', { id: inv.propertyOwnwerId, cost: inv.cost })
        }
      })

      setInvoices(prev => prev.filter((inv) => inv.id !== data.id));

      if (pendingInvoiceRef.current?.id === data.id) {
        toast(`${pendingInvoiceRef.current?.onCompleteMessage}\nCost: ${pendingInvoiceRef.current?.cost}`);
        if (pendingInvoiceRef.current?.callback) pendingInvoiceRef.current?.callback();
      }
      setPendingInvoice((prev) => {
        if (prev?.id === data.id) {
          return null;
        }
        return prev;
      });

      newSocket.emit('me');
    });

    newSocket.on('PropertyBought', (data) => {
      log('PropertyBought: ' + JSON.stringify(data));
      toast(data.property.owner.username + ' bought ' + data.property.property.name);
      if (data.property.owner.id === currentUserRef.current?.id) {
        updateMap(data.property.id, false)
      }
      newSocket.emit('me');
      setTimeout(() => {
        newSocket.emit('me');
      }, 100)
    });

    newSocket.on('propertyUpgraded', (data) => {
      log('propertyUpgraded: ' + JSON.stringify(data));
      toast(data.property.property.name + ' Upgraded ');
      newSocket.emit('me');
      setTimeout(() => {
        newSocket.emit('me');
      }, 100)
    });

    newSocket.on('MortgageChange', (data) => {
      log('MortgageChange: ' + JSON.stringify(data));
      newSocket.emit('me');
      setTimeout(() => {
        newSocket.emit('me');
      }, 100)
    });

    newSocket.on('UpgradeChange', (data) => {
      log('UpgradeChange: ' + JSON.stringify(data));
      newSocket.emit('me');
      setTimeout(() => {
        newSocket.emit('me');
      }, 100)
    });

    newSocket.on('userLost', (data) => {
      log('userLost: ' + JSON.stringify(data));
      toast('User lost: ' + data.user.username);
      newSocket.emit('me');
    });
    if (latestToken.current) {
      newSocket.emit('me')

    }
    setSocket(newSocket);



    return () => {
      newSocket.disconnect();
      setSocket(null);
      newSocket.removeAllListeners();
      window.removeEventListener('popstate', handleLocationChange);
    };

  }, []);

  useEffect(() => {
    // console.log('Game updated:', game);

  }, [game]);


  useEffect(() => {
    // console.log('currentUser updated:', currentUser);
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    // console.log("invoicecefect  ", invoices)
    invoicesRef.current = invoices;
  }, [invoices])


  useEffect(() => {
    // console.log("pendinvoicecefect  ", invoices)

    pendingInvoiceRef.current = pendingInvoice;
  }, [pendingInvoice])

  return (
    <div className="App">
      {socket ? (
        // <><button onClick={() => (socket.emit('me'))}>dsad</button>
        <GameUI
          socket={socket}
          game={game}
          currentUser={currentUser}
          invoices={invoices}
          setInvoices={setInvoices}
          pendingInvoice={pendingInvoice}
          setPendingInvoice={setPendingInvoice}
          isDiceRoled={isDiceRoled}
          setIsDiceRoled={setIsDiceRoled}
          setChoosingProperty={setChoosingProperty}
          choosingProperty={choosingProperty}
          satesOfYourProperty={satesOfYourProperty}
          updateMap={updateMap}
          pendingInvoiceRef={pendingInvoiceRef}
        />
        // </>

      ) : (
        <p>Loading...</p>
      )}

    </div>
  );
};

export default App;

