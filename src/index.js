import "@babel/polyfill";
// import react et reactDOM sont des imports a faire dans chaque index.js en react
 //(importés de node module)
import React from "react";
//on importe react-dom uniquement dans le index.js
import ReactDOM from "react-dom";
// on importe les composants de l’app
import SelectStep from "./SelectStep";
import ScoreBoard from "./ScoreBoard";
import RoundResult from "./RoundResult";
import axios from "axios";
//on exporte les constantes dont on va se servir dans d’autres composants de l’app
export const PIERRE = "p";
export const FEUILLE = "f";
export const CISEAU = "c";
const MANCHES_VICTORIEUSES = 3;

export const GAME_STATES = {
    WAITING: 0,
    WIN: 1,
    LOSE: 2,
    TIE: 3,
    END_WIN: 4,
    END_LOSE: 5
}
//Chaque composant react est constitué d’une const ou d'une fonction qui commence par une 
//majuscule,avec une fonction anonyme, et ca crée le squelette du composant
const App = () => {

     //Use state initialise un point de depart (ici à 0). Les usestate sont appelés “hook”
    //qui sont des états du composant (ici App)
    //A ce stade, useState renvoit 0 a scoreJoueuse, on ne se sert pas
    //encore de setScore joueuse puisque setscore joueuse mettra a jour le prochain score.
    // A chaque modification de score, setScoreJoueuse se met à jour et renvoit la nouvelle valeur a
    //usestate, et ensuite usestate met à jour le score. Et donc l’état de depart change (ce n’est plus 0)
    //en fonction du score du moment de la joueuse.
    const [scoreJoueuse, setScoreJoueuse] = React.useState(0);
    const [scoreOrdi, setScoreOrdi] = React.useState(0);
    const [gameState, setGameState] = React.useState(GAME_STATES.WAITING);

    function resetRound () {
        if (gameState === GAME_STATES.END_LOSE
            || gameState === GAME_STATES.END_WIN) {
            setScoreJoueuse(0)
            setScoreOrdi(0)
        }
// Ca c’est pour ne pas rester bloqué sur l’ecran win ou loose,
//ca revient à “choisis bien= ecran waiting”
        if (gameState !== GAME_STATES.WAITING) {
            setGameState(GAME_STATES.WAITING);
        }
    }

    async function jouer(coup) {
        let response = await axios.post("/api/jouer", { coup });
        let resultatManche = response.data;
        console.log(response.data);

        if (resultatManche === "GAGNE") {
            // la joueuse a gagné
            //Pour pouvoir mettre à jour le score, il faut passer par setScoreJoueuse qui prend
            //en parametre la variable nouveauScore qui ajoute 1 au score
            let nouveauScore = scoreJoueuse + 1;
            setScoreJoueuse(nouveauScore);
             //Ce if correspond a la victoire d’une manche (partie) (nouveau score =3)
            if (nouveauScore === MANCHES_VICTORIEUSES) {
                setGameState(GAME_STATES.END_WIN)
                   //Ce else correspond a la victoire d’un coup
            } else {
                setGameState(GAME_STATES.WIN);
            }
        } else if (resultatManche === "PERDU") {
            // la joueuse a perdu (meme principe que plus haut, sauf que la 
            //les victoires sont pour l'ordi)
            let nouveauScore = scoreOrdi + 1;
            setScoreOrdi(nouveauScore);

            if (nouveauScore === MANCHES_VICTORIEUSES) {
                setGameState(GAME_STATES.END_LOSE)
            } else {
                setGameState(GAME_STATES.LOSE)
            }
        } else {
             //Si ce n’est ni gagané ni perdu, c’est égalité
            setGameState(GAME_STATES.TIE)
        }
    }

    const blockGame = (gameState === GAME_STATES.WAITING) ?
        <SelectStep jouer={jouer} /> :
        <RoundResult gameState={gameState} />;

    return (
        <div onClick={resetRound}>
            <style jsx>{`
                div {
                    background-color: #D3CFFF;
                    height: 100%;
                }
            `}
            </style>
            <ScoreBoard scoreJoueuse={scoreJoueuse} scoreOrdi={scoreOrdi} />
            {blockGame}
        </div>
    );
}
// lien au html pour pouvoir afficher le rendu de l’App
ReactDOM.render(<App/>, document.getElementById("react-app"));

jouer();

