import { useState, useEffect, useRef } from 'react'
import './App.css';
import { Game, Hand, PlayerModel } from './Models';
import Player from './Player';


function App() {
  const [players, setPlayers] = useState<PlayerModel[]>([])
  const [name, setName] = useState("") 
  const [gameLength, setGameLength] = useState("") 
  const [startAtTop, setStartAtTop] = useState(false) 
  const [totalBid, setTotalBid] = useState("") 
  const [input, setInput] = useState("") 
  const [game, setGame] = useState<Game>()
  const [leadOffset, setLeadOffset] = useState(0)
  const [leadPlayer, setLeadPlayer] = useState("")
  const [lastKeyPress, setLastKeyPress] = useState<KeyboardEvent>()
  const [gameView, setGameView] = useState("List")
  const addedHandeler = useRef(false)

  useEffect(() => {
    if(!addedHandeler.current) {
      window.addEventListener("keydown", (event) => {setLastKeyPress(event)})
      addedHandeler.current = true
    }
  },[])

  useEffect(() => {
    if(lastKeyPress){
      const number = Number(lastKeyPress.key)
      if(number+1 && game) {
        const player = players[game.currentPlayer]
        if(player.handHistory.has(game.currentHand)) {
          if(game.isBid) {
            (player.handHistory.get(game.currentHand) as Hand).bid = number
          }
          else {
            (player.handHistory.get(game.currentHand) as Hand).taken = number
          }
        }
        else {
          player.handHistory.set(game.currentHand, {bid: game.isBid ? number : undefined, taken: game.isBid ? undefined : number})
        }

        players[game.currentPlayer] = player

        game.currentPlayer+=1
        if(game.currentPlayer >= players.length) {
          game.currentPlayer = 0
          if(!game.isBid) {

            let total = 0
            players.forEach((player) => {
              if(player.handHistory.has(game.currentHand)) {
                const taken = (player.handHistory.get(game.currentHand) as Hand).taken
                total+= taken ? taken : 0
              }
            })

            if(total!=game.hands[game.currentHand]){
              alert("Number of tricks taken is wrong " + total + " tricks were taken out of " +game.hands[game.currentHand] + " tricks, you can use backspace to clear the last input")
            }

            game.currentHand+=1

            
            // Add a check to write the current players and game to a txt file then when the user opens the program give them the option to either make a new game or load from file
          }
          game.isBid = !game.isBid
        }

        game.maxScore = 0
        setGame(game)
        setPlayers([...players])      
      }

      if(lastKeyPress.key == "s") {
        setGameView("List")
      }

      if(lastKeyPress.key == "a") {
        setGameView("Score")
      }

      if(lastKeyPress.key == "Backspace" && game) {
        console.log("delete the last thing")
        if(game.currentPlayer > 0) {
          game.currentPlayer-=1

          remove(game.isBid, players[game.currentPlayer], game.currentHand)
        }
        else {
          if(game.currentHand > 0 || !game.isBid){
            // Maybe add alert to check if you want to delete the hand could be a good place to check again to make sure not too much data is lsot
            if(game.isBid) {
              game.currentHand = game.currentHand-1
            }
            game.isBid = !game.isBid
            game.currentPlayer = players.length-1

            remove(game.isBid, players[game.currentPlayer], game.currentHand)

          }
        }
        setGame(game)
        setPlayers([...players])   
      }

    }
  }, [lastKeyPress])

  const remove = (isBid: boolean, player: PlayerModel, currentHand: number) => {
    if(isBid && player.handHistory.has(currentHand)) {
      (player.handHistory.get(currentHand) as Hand).bid = undefined
    }
    else if(player.handHistory.has(currentHand)) {
      (player.handHistory.get(currentHand) as Hand).taken = undefined
    }
  }

  const handelAddPlayer = () => {
    if(name && !players.find(player => player.name == name)){
      const handHistory1 = new Map<number, Hand>()
      handHistory1.set(2, {taken: 1, bid: 1})

      setPlayers(players.concat([{
        name: name,
        handHistory: handHistory1,
        startScore: 0,
      }
      ]))

      setName("")
    }
    else {
      alert("Please input a name that does not already exist")
    }
  }

  // window.addEventListener("close" ,(_) => {alert("Are you sure you want to close the scorecrad?")}) Make this work when I can google

  const startGame = () => {
    const gameLengthNumber: number = Number(gameLength)
    players.forEach(player => player.handHistory = new Map<number, Hand>())
    setPlayers([...players])

    const hands: number[] = []

    if(gameLengthNumber && gameLengthNumber > 1 && players.length > 0){
      if(startAtTop) {
        addHands(1, -1, gameLengthNumber, hands)
        addHands(gameLengthNumber+1, 1, 1, hands)
      }
      else {
        addHands(gameLengthNumber, 1, 1, hands)
        addHands(0, -1, gameLengthNumber, hands)
      }
      const game: Game = {
        hands: hands,
        currentHand: 0, 
        currentPlayer: 0,
        isBid: true,
        maxScore: 0,
      }

      setGame(game)
      setLeadOffset(Math.floor(Math.random() * (players.length + 1)))
    }
    else {
      alert("Error, please input a number that is greater than 2, for example input 10, also make sure there is at least 1 player in the game")
    }
  }

  const addHands = (limit: number, direction: number, start: number, list: number[]) => {
    let index = start
    while(index != limit) {
      list.push(index)
      index = index + direction
    }
  }

  useEffect(() => {

    if(game?.isBid) {
      setTotalBid("")
    }
    else {
      let total = 0
      players.forEach((player) => {
        if(game && player.handHistory.has(game.currentHand)) {
          const bid = (player.handHistory.get(game.currentHand) as Hand).bid
          total+= bid ? bid : 0
        }
      })

      const length = game?.hands[game?.currentHand]

      if(length) {
        setTotalBid(total > length ? "Overbid by " + (total-length).toString() + " tricks" :
          total==length ? "Everyone can be happy" : "Underbid by " + (length-total).toString() + " tricks"
        )
      }
    }

    if(game) {
      setInput(
        "Input " +
        players[game.currentPlayer].name +
        "'s" + 
        (game.isBid ? " bid" : " tricks taken")
      )
    }
  }, [players])

  useEffect(() => {
    if(game && players && players.length > 0) {
      setLeadPlayer(
        players[(game.currentHand+leadOffset) % players.length]?.name
      );
    }
  }, [game, players])

  return (
    <div className="App">
      {!game &&
        <>
          <div className="StartSection">
            Enter player name to add:
            <input className="InputField" onChange={e => setName(e.target.value)} value={name} placeholder="Enter player name"/>
            <button onClick={handelAddPlayer}>Add Player</button>
            <div className="PlayerList">
              <div><b>Players in game:</b></div>
              {players.map((player) => {
                return <div>{player.name}</div>
              })}
            </div>
          </div>

          <div className="StartSection">
            Max number of cards:
            <input className="InputField" onChange={e => setGameLength(e.target.value)} value={gameLength} placeholder="Max number of cards"/>
            <button onClick={startGame}>Start Game</button>
            
            <div style={{ marginTop: "8px" }}>
              <div style={{ display: "inline-block" }}>Check to start at top</div>
              <input style={{ paddingTop: "4px", display: "inline-block" }} type="checkbox" checked={startAtTop} onClick={() => {setStartAtTop(!startAtTop)}}/>
            </div>
          </div>
        </>
      }
      {game &&
        <>
          <div className="Game">
            <div className="Headers">
            <div className="HeaderSection">Name</div>
            {gameView == "Score" && <>
              <div className="HeaderSection">Score</div>
              <div className="HeaderSection">Bid</div>
              <div className="HeaderSection">Taken</div>
            </>
            }
            {gameView == "List" && <>
              {game.hands.map(hand => {
                return <div className="ListSection">{hand}</div>
              })}
            </>
            }
            </div>
            {players.map((_, index) => {
              return <Player
              playerModel={players}
              index={index}
              game={game}
              setGame={setGame}
              gameView={gameView}
              />
            })}
          </div>
          <div className="LabelText">Cards: {game.hands[game.currentHand]}</div>
          {totalBid && <div className="LabelText">{totalBid}</div> }
          {leadPlayer && <div className="LabelText">{leadPlayer + " goes first"}</div> }
          <div className="LabelText">{input}</div>

        </>
      }
    </div>
  );
}

export default App;
