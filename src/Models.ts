// Hands are going to be stored in the game object in the array, the index in the array
// is the key in the players hand history map

export interface Game {
    hands: number[], // Index is hand number, number is the array is number of cards dealt
    currentHand: number, // Index of which hand we are on
    currentPlayer: number,
    isBid: boolean,
    maxScore: number,
}

export interface PlayerModel {
    name: string,
    handHistory: Map<number, Hand>,
    startScore: number,
}

export interface Hand {
    bid?: number,
    taken?: number,
}

export interface PlayerProps {
    playerModel: PlayerModel[]
    index: number
    game: Game
    setGame: (newValue: Game) => void
    gameView: string
}