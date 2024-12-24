import { useState, useEffect } from 'react'
import "./Player.css"
import { PlayerProps, PlayerModel, Hand, Game } from "./Models"

const createListView = (handHistory: Map<number, Hand>) => {
    let score = 0;

    return Array.from(handHistory).map((value) => {
        let color = "black"
        const bid = value[1]?.bid
        const taken = value[1]?.taken

        if(bid != undefined && taken != undefined) {
            if(bid == taken) {
                if(bid == 0) {
                    score+=5
                }
                else {
                    score+=(10+bid)
                }
                color = "green"
            }
            else {
                score-=Math.max(bid, taken)
                color = "red"
            }
        }

        return <div style={{ "display" : "flex", "justifyContent" : "center", "height" : "65px", "color" : color}}>
            <div style={{"fontSize" : "26px", "paddingRight" : "8px"}}>{bid != undefined ? bid : "-"}</div>
            {taken != undefined ? score : "-"}
        </div>
    })
}


function Player(props: PlayerProps) {
    const calculateScore = (player: PlayerModel) => {
        let score = player.startScore
        player.handHistory.forEach(hand => {
            if(hand.bid != undefined && hand.taken != undefined) {
                if(hand.bid == hand.taken) {
                    if(hand.bid == 0) {
                        score +=5
                    }
                    else {
                        score+=(10+hand.bid)
                    }
                }
                else {
                    score-=Math.max(hand.bid, hand.taken)
                }
            }
        })

        if(score > props.game.maxScore) {
            props.game.maxScore = score
            props.setGame(props.game)
        }

        return score
    }

  const [score, setScore] = useState(0)
  const [currentBid, setCurrentBid] = useState("-");
  const [currentTaken, setCurrentTaken] = useState("-");


  useEffect(() => {
    if(props.game) {
        setScore(calculateScore(props.playerModel[props.index]))
        const currentHand = props.playerModel[props.index].handHistory.get(props.game.currentHand)
        setCurrentBid(currentHand && currentHand.bid != undefined ? currentHand.bid.toString() : "-")
        setCurrentTaken(currentHand && currentHand.taken != undefined ? currentHand.taken.toString() : "-")
    }
  }, [props.playerModel, props.index])

  return (
    <div className="Player">
        <div className="PlayerText" style={score >= props.game.maxScore ? {"color" : "red"} : {}}>
          {props.playerModel[props.index].name}
        </div>
        { props.gameView == "Score" && <>
            <div className="PlayerText">
            {score}
            </div>
            <div className="PlayerText">
            {currentBid}
            </div>
            <div className="PlayerText">
            {currentTaken}
            </div>
        </>}
        { props.gameView == "List" && <>
            {createListView(props.playerModel[props.index].handHistory)}
        </>}
    </div>
  );
}

export default Player;
