import React, { useEffect, useState } from 'react';
import { GameStatuses, type PropertyDto, type UserDto, RoleType, PropertyType, GameDto, type Uuid, PropertyStatyses } from '../types/types';
import type { Invoice } from '../App';
import CreateJoinUi from './createjoinscreeen';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';


export default function GameUI({ game, currentUser, invoices, setInvoices, socket, pendingInvoice, setPendingInvoice, isDiceRoled, setIsDiceRoled, choosingProperty, setChoosingProperty, satesOfYourProperty, updateMap, pendingInvoiceRef }:
  { game: GameDto, currentUser: UserDto, invoices: Invoice[], setInvoices: (value: Invoice[]) => void, socket: any, pendingInvoice: Invoice | null, setPendingInvoice: (value: Invoice) => void, isDiceRoled: boolean, setIsDiceRoled: (value: boolean) => void, choosingProperty: boolean, setChoosingProperty: (value: boolean) => void, satesOfYourProperty: Map<string, boolean>, updateMap: (key: string, value: boolean) => void, pendingInvoiceRef: { curent: Invoice } }) {
  const [myTurn, setMyTurn] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [defeted, setDefeted] = useState<boolean>(false);

  const [sugestions, setSugestions] = useState<string[]>([]);
  const [propertyValue, setPropertyValue] = useState<string>('');



  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern API available (likely HTTPS or localhost)
      navigator.clipboard.writeText(text).catch((err) => {
        console.error("Clipboard write failed:", err);
      });
    } else {
      // Fallback for HTTP or older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";  // Prevent scrolling to bottom
      textarea.style.opacity = "0";       // Hide from view
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        document.execCommand("copy");
        console.log("Copied using fallback");
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }

      document.body.removeChild(textarea);
    }
  };
  function payInvoice(invoiceId: string, cost: number) {
    console.log('paying invoice', invoiceId, cost);
    socket.emit('PayInvoice', { invoiceId, cost })
  }

  function buncrupcy() {
    if (myTurn) {
      socket.emit('GiveUp')
      setDefeted(true)
    }
    else {
      toast.error("you can file buncrupcy only in your turn")
    }
  }

  function GetoutOfJail() {
    if (currentUser.getOutOfJailCard) {
      socket.emit('UseGetOutofJailCard');
    }
    else {
      const invoice: Invoice = {
        id: uuidv4(),
        cost: -50,
        name: 'bail out of jail',
        onCompleteMessage: `You bought your way out of jail`,
        callback: () => {
          socket.emit('GetOutofJail');
        },
      };
      setPendingInvoice(invoice);
      pendingInvoiceRef.curent = invoice;
      socket.emit('PayInvoice', { cost: invoice.cost, invoiceId: invoice.id });
    }

  }
  function SellUpgrade(propety: PropertyDto) {
    if (propety.upgradeCount > 0) {
      socket.emit('DowngradeProperty', { id: propety.id })
    }
  }

  function UpgradeProperty(propety: PropertyDto) {
    if (propety.upgradeCount < 5 && propety.propertyType === PropertyStatyses.NORMAL) {

      const invoice: Invoice = {
        id: uuidv4(),
        cost: -propety.property.upgradePrice,
        name: 'upgrade property',
        onCompleteMessage: `You upgraded your property`,
        callback: () => {
          socket.emit('UpgradeProperty', { peopertyId: propety.id });
        },
      };
      setPendingInvoice(invoice);
      pendingInvoiceRef.curent = invoice;
      socket.emit('PayInvoice', { cost: invoice.cost, invoiceId: invoice.id });

    }
  }
  function MortGage(propety: PropertyDto) {
    if (propety.propertyType === PropertyStatyses.MORTGAGE) {
      const invoice: Invoice = {
        id: uuidv4(),
        cost: -Math.round(propety.property.price * 0.55),
        name: 'Mortgage',
        onCompleteMessage: `You bought your property back`,
        callback: () => {
          socket.emit('BuyOut', { id: propety.id });
        },
      };
      socket.emit('PayInvoice', { cost: invoice.cost, invoiceId: invoice.id });
      pendingInvoiceRef.curent = invoice;
      setPendingInvoice(invoice);

    }
    else {
      if (propety.upgradeCount === 0) {
        socket.emit('Mortage', { id: propety.id });
      }
      else {
        toast('You cant mortgage property with houses')
      }
    }

  }


  function EndTurn() {
    if (invoices.length > 0) {
      toast.error('You have invoices to pay!');
    }
    else {
      socket.emit('EndTurn');
      setMyTurn(false);
    }
  }
  function ThrowDice() {
    socket.emit('ThrowDice');
    setIsDiceRoled(true);
  }
  function ChoosePeroperty() {
    let count = 0;
    sugestions.forEach((sugestion) => {
      if (sugestion.toLowerCase().includes(propertyValue.toLowerCase())) {
        count++;
      }
    })
    if (count === 0) {
      toast.error('Property not found');
      return;
    }
    else if (count > 1) {
      toast.error("there are many posible propertys")
    }
    else {
      game.propertys.forEach((property: PropertyDto) => {
        if (property.property.name === propertyValue) {
          socket.emit('LandOnProperty', { propertyId: property.id });
          setPropertyValue('');
          setIsFocused(false);
          toast.success('Property chosen successfully');
        }
      })
      setChoosingProperty(false);
    }
  }

  useEffect(() => {
    if (game && currentUser) {
      const isMyTurn = game.turnOrder[game.currentTurn % game.turnOrder.length] === currentUser.id;
      setMyTurn(isMyTurn);
    }
    const suggest = game?.propertys.map((property: PropertyDto) => {
      return property.property.name;
    })
    setSugestions(suggest)
  }, [game, currentUser]);

  function getCurrentRent(property: PropertyDto): number {
    const card = property.property;
    switch (property.upgradeCount) {
      case 1:
        return card.rentWithOneHouse;
      case 2:
        return card.rentWithTwoHouse;
      case 3:
        return card.rentWithThreeHouse;
      case 4:
        return card.rentWithFourHouse;
      case 5:
        return card.rentWithHotel;
      default:
        return card.rent;
    }
  }

  function ChangeState(id: string, e: React.MouseEvent<HTMLLIElement, MouseEvent>): void {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    updateMap(id, !satesOfYourProperty.get(id));
  }

  return ((!(game && currentUser)) ?
    (
      //not game
      <CreateJoinUi socket={socket} />
    ) :
    // game exists
    (
      (game.status === GameStatuses.WITING_PLAYERS) ?
        // waiting for players
        (<div className='game-ui'>
          {currentUser.role === RoleType.HOST && <QRCodeSVG onClick={() => (copyToClipboard(game.id))} value={import.meta.env.VITE_IP + "/?id=" + game.id} />}
          <ul className='user-list'>
            {game.users.map((user: UserDto) => (

              <li key={user.id} className={currentUser.id === user.id ? 'you' : 'not-you'}>
                <div className='credentials'>
                  <p>{user.username}</p>
                  {(user.role === RoleType.HOST) && <img className='hosticon' src='src/assets/crown.png'></img>}
                </div>

                {currentUser.role === RoleType.HOST && currentUser.id !== user.id && (
                  <button className='kickBtn' onClick={() => socket.emit('kickFromGame', { playerId: user.id })}>
                    Kick
                  </button>
                )}
              </li>)
            )
            }
          </ul>
          {currentUser.role === RoleType.HOST && (<button className='startButt' onClick={() => (socket.emit('startGame'))}>Start Game</button>)}
        </div>
        ) :
        (
          (game.status === GameStatuses.IN_PROGRESS) ?
            //in progress
            (
              <div className='game-ui'>
                <ul className='users'>
                  {game.users.map((user: UserDto) => (
                    currentUser.id !== user.id && <li key={user.id} className={(user.role === RoleType.HOST ? ' host' : '') + (game.turnOrder[game.currentTurn % game.turnOrder.length] === user.id ? ' hisTurn' : '')}>
                      <p>{user.username}</p>
                      <p>${user.money}</p>
                      <ul>
                        {user.properties?.map((property: PropertyDto) => (
                          <li key={property.id}>
                            <p>{property.property.name}</p>
                          </li>
                        ))}
                      </ul>
                      {user.JailTime !== 0 && (<img className='jailPng' src='src/assets/chains.png'></img>)}
                    </li>
                  ))

                  }
                </ul>
                <div className='br' />

                <ul className='game-properties'>
                  {game.propertys.map((property: PropertyDto) => (
                    <>
                      {property.property.type === PropertyType.STANDART && (<li key={property.id} className='property'>
                        <div className='header' style={{ backgroundColor: property.property.color }}>
                          <p>{property.property.name}</p>
                          <p>{property.property.street}</p>
                          {property.propertyType === PropertyStatyses.MORTGAGE && <img className='jailPng' src='src/assets/chains.png'></img>}

                        </div>
                        <p>${property.property.price}</p>
                        <p>Owner: {property.owner ? property.owner.username : 'None'}</p>
                        <p>Curent rent: {getCurrentRent(property)}</p>
                        <p className='small'>Rent: {property.property.rent}</p>
                        <p className='small'>1 house: {property.property.rentWithOneHouse}</p>
                        <p className='small'>2 house: {property.property.rentWithTwoHouse}</p>
                        <p className='small'>3 house: {property.property.rentWithThreeHouse}</p>
                        <p className='small'>4 house: {property.property.rentWithFourHouse}</p>
                        <p className='small'>Hotel: {property.property.rentWithHotel}</p>
                      </li>)}

                      {property.property.type === PropertyType.FOURTYPE && (<li key={property.id} className='property'>
                        <div className='header smalerRadius' style={{ backgroundColor: property.property.color }}>
                          <p>{property.property.name}</p>
                          {property.propertyType === PropertyStatyses.MORTGAGE && <img className='jailPng' src='src/assets/chains.png'></img>}

                        </div>
                        <p>${property.property.price}</p>
                        <p>Owner: {property.owner ? property.owner.username : 'None'}</p>
                        <p>Curent rent: {getCurrentRent(property)}</p>
                        <p className='small'>1 property: {property.property.rentWithOneHouse}</p>
                        <p className='small'>2 property: {property.property.rentWithTwoHouse}</p>
                        <p className='small'>3 property: {property.property.rentWithThreeHouse}</p>
                        <p className='small'>4 property: {property.property.rentWithFourHouse}</p>
                      </li>
                      )}
                    </>
                  ))}
                </ul>
                <div className='br' />
                {!defeted && <>
                  <ul className='invoices'>
                    {
                      invoices.map((invoice: Invoice) => (
                        <li key={invoice.id} className={'invoice ' + (invoice.cost > 0 ? 'positive' : 'negative')} >
                          <p>{invoice.name}</p>
                          <p>cost: {Math.abs(invoice.cost)}</p>
                          <button onClick={() => (payInvoice(invoice.id, invoice.cost))}>{invoice.cost > 0 ? 'get money' : 'pay invoice'}</button>
                        </li>
                      ))
                    }
                  </ul>
                  <div className='br' />

                  <div className='your-info'>
                    <div className='statuses'>
                      <p className='money'>${currentUser.money}</p>
                      {currentUser.inJail && <>
                        <div><p className='in-jail'>In Jail for</p>
                          <p className='in-jail'>{currentUser.JailTime} turns</p></div>
                        <button className='GetOutButt' onClick={GetoutOfJail}>get out of jail {currentUser.getOutOfJailCard ? 'card' : 'money'}</button>
                      </>}
                    </div>
                    <>
                      {/* <p>doubles count {currentUser.doublesCount}</p> */}
                      {myTurn && <>
                        {isDiceRoled && <button className='EndTurnButt' onClick={EndTurn}><img src='src/assets/flag.png' className='flagImg' /></button>}
                        {!isDiceRoled && <button className='ThrowDiceButt' onClick={ThrowDice}><img src='src/assets/dice.png' className='diceImg' /></button>}

                      </>
                      }
                    </>

                    <div className='your-properties'>
                      <ul>
                        {currentUser.properties.map((propety: PropertyDto) => (
                          <li key={propety.id} className={ (satesOfYourProperty.get(propety.id) ? ('up') : ('down'))+ (propety.property.type === PropertyType.FOURTYPE ? "four" : '') } onClick={(e) => (ChangeState(propety.id, e))} >
                            {propety.property.type === PropertyType.FOURTYPE ?
                            <div className='header' style={{ backgroundColor: propety.property.color }}>
                              <p>{propety.property.name}</p>
                              {propety.propertyType === PropertyStatyses.MORTGAGE && <img className='jailPng' src='src/assets/chains.png'></img>}
                            </div>
                          :
                          <div className='header' style={{ backgroundColor: propety.property.color }}>
                              <p>{propety.property.name}</p>
                              <p>{propety.property.street}</p>
                              {propety.propertyType === PropertyStatyses.MORTGAGE && <img className='jailPng' src='src/assets/chains.png'></img>}
                            </div>
                          }
                            <p>Curent rent: {getCurrentRent(propety)}</p>
                            <p>Upgrade count: {propety.upgradeCount}</p>
                            {propety.property.type === PropertyType.STANDART && <>
                              <button onClick={() => (UpgradeProperty(propety))} disabled={!satesOfYourProperty.get(propety.id)}>Upgrade ${propety.property.upgradePrice}</button>
                              <button onClick={() => (SellUpgrade(propety))} disabled={!satesOfYourProperty.get(propety.id)} >Downgrade ${propety.property.upgradePrice / 2}</button>
                            </>}
                            <button onClick={() => (MortGage(propety))} disabled={!satesOfYourProperty.get(propety.id)} >{propety.propertyType === PropertyStatyses.NORMAL ? ("Mortgage $" + Math.round(propety.property.price * 0.5)) : ("Buy out $" + Math.round(propety.property.price * 0.55))}</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>}
                {(choosingProperty && !currentUser.inJail) &&
                  <div className='chooseProperty'>
                    <input className='propertyInput' placeholder='Enter property you landed on' onFocus={() => (setIsFocused(true))} value={propertyValue} onChange={(e) => (setPropertyValue(e.target.value))} ></input>
                    <div className='sugestions'>{isFocused && sugestions.map((sugestion, index) => (
                      <>{(sugestion.toLowerCase().indexOf(propertyValue.toLowerCase()) > -1) &&
                        <div key={index} className='suggestion' onClick={() => { setPropertyValue(sugestion) }}>
                          <p>{sugestion}</p>
                        </div>}</>
                    ))

                    }</div>
                    <button className='choosePeropertyButt' onClick={ChoosePeroperty}>Choose property</button>
                  </div>}
                <button onClick={buncrupcy} className='crossButt'><img src='src/assets/cross.png' className='crossImg' /></button>
              </div>
            )
            // 
            : (
              <p> sdajsadj</p>
            )
        )
    )
  );

}
