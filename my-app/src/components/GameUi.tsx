import React, { useEffect, useState } from 'react';

export default function GameUI({ game, currentUser, invoices, socket }) {
  const [myTurn, setMyTurn] = useState(false);

  useEffect(() => {
    if (game && currentUser) {
      const isMyTurn = game.turnOrder[game.currentTurn % game.turnOrder.length] === currentUser.id;
      setMyTurn(isMyTurn);
    }
  }, [game, currentUser]);

  const handleUpgrade = (property) => {
    socket.emit('UpgradeProperty', { propertyId: property.id });
  };

  const handlePayInvoice = (invoice) => {
    socket.emit('PayInvoice', { cost: invoice.cost, invoiceId: invoice.id });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Game and User Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold">Game Info</h2>
          <p>Game ID: {game?.id}</p>
          <p>User ID: {currentUser?.id}</p>
          <p>Money: {currentUser?.money}</p>
        </div>

        {/* Turn Indicator */}
        {myTurn && <div id="YourTurn" className="text-green-600 font-bold">Your Turn!</div>}
      </div>

      {/* Other Users */}
      <div>
        <h2 className="text-xl font-bold">Other Users</h2>
        {game?.users?.map((user) => (
          <div key={user.id} className="border p-2 rounded mb-2">
            <button onClick={() => navigator.clipboard.writeText(user.id)}>Copy ID</button>
            <p>name: {user.username}</p>
            <p>money: {user.money}</p>
            <p>role: {user.role}</p>
            <p>in jail: {user.inJail.toString()}</p>
            <p>getOutOfJail: {user.getOutOfJailCard}</p>
            <p>jailTime: {user.JailTime}</p>
            <ul>
              {user.properties?.map((prop, idx) => (
                <li key={idx}>{prop.property.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Turn Order */}
      <div>
        <h2 className="text-xl font-bold">Turn Order</h2>
        <p>{game?.turnOrder?.join(', ')}</p>
      </div>

      {/* All Properties */}
      <div>
        <h2 className="text-xl font-bold">All Properties</h2>
        {game?.propertys?.map((property) => (
          <div key={property.id} className="border p-2 rounded mb-2">
            <button onClick={() => navigator.clipboard.writeText(property.id)}>Copy ID</button>
            <p>name: {property.property.name}</p>
            {property.owner && <p>owner: {property.owner.username}</p>}
            <p>type: {property.property.type}</p>
            <p>status: {property.propertyType}</p>
            <p>upgradeCount: {property.upgradeCount}</p>
            <p>price: {property.property.price}</p>
            <p>street: {property.property.street}</p>
            <p>upgradePrice: {property.property.upgradePrice}</p>
            <p>rent: {property.property.rent}</p>
            <p>rentAllStreet: {property.property.rentAllStreet}</p>
            <p>rentWithOneHouse: {property.property.rentWithOneHouse}</p>
            <p>rentWithTwoHouse: {property.property.rentWithTwoHouse}</p>
            <p>rentWithThreeHouse: {property.property.rentWithThreeHouse}</p>
            <p>rentWithFourHouse: {property.property.rentWithFourHouse}</p>
            <p>rentWithHotel: {property.property.rentWithHotel}</p>
          </div>
        ))}
      </div>

      {}
      <div>
        <h2 className="text-xl font-bold">Your Properties</h2>
        {currentUser?.properties?.map((property) => (
          <div key={property.id} className="border p-2 rounded mb-2">
            <button onClick={() => navigator.clipboard.writeText(property.id)}>Copy ID</button>
            <p>name: {property.property.name}</p>
            <p>type: {property.property.type}</p>
            <p>status: {property.propertyType}</p>
            <p>upgradeCount: {property.upgradeCount}</p>
            <p>price: {property.property.price}</p>
            <p>street: {property.property.street}</p>
            <p>upgradePrice: {property.property.upgradePrice}</p>
            <p>rent: {property.property.rent}</p>
            <p>rentAllStreet: {property.property.rentAllStreet}</p>
            <p>rentWithOneHouse: {property.property.rentWithOneHouse}</p>
            <p>rentWithTwoHouse: {property.property.rentWithTwoHouse}</p>
            <p>rentWithThreeHouse: {property.property.rentWithThreeHouse}</p>
            <p>rentWithFourHouse: {property.property.rentWithFourHouse}</p>
            <p>rentWithHotel: {property.property.rentWithHotel}</p>
            <button onClick={() => handleUpgrade(property)}>Upgrade</button>
          </div>
        ))}
      </div>

      {/* Invoices */}
      <div>
        <h2 className="text-xl font-bold">Invoices</h2>
        {invoices.map((invoice) => (
          <div key={invoice.id} className="border p-2 rounded mb-2">
            <button onClick={() => navigator.clipboard.writeText(invoice.id)}>Copy ID</button>
            <p>id: {invoice.id}</p>
            <p>name: {invoice.name}</p>
            <p>cost: {invoice.cost}</p>
            <button onClick={() => handlePayInvoice(invoice)}>
              {invoice.cost > 0 ? 'getMoney' : 'pay up'}
            </button>
          </div>
        ))}
      </div>

      {/* Game Status UI */}
      {game?.status === 'waiting_players' ? (
        <div id="startGame" className="text-yellow-600 font-bold">Waiting for players...</div>
      ) : (
        <div id="Game">Game is active</div>
      )}
    </div>
  );
}
