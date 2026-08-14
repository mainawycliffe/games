"use client";
import "./minesweeper.css";
import { Button } from "@/components/ui/button";
import { useState,useEffect  } from "react";

import { mineLayout, calculateFloodReveal} from "./logic";
import { AlignCenter } from "lucide-react";



export default function Minesweeper(){

const [seconds, setSeconds] = useState(0);
const [isActive , setIsActive] = useState(false);
const[gameOver, setGameOVer] = useState(false);
const[openedSquares, setOpenedSquares]= useState(Array(81).fill(false));
const [mines] =useState(mineLayout());
const [flaggedSquares, setFlaggedSquares] = useState(Array(81).fill(false)); 
const [gameWon, setGameWon] = useState(false);

useEffect(()=> {
  if(!isActive) return;
    
   const interval = setInterval(()=> {
      setSeconds((prev)=> prev+1 );
    },1000);
  return () => clearInterval(interval);

}, [isActive]);

const flipped = (index) => {
  if(gameOver)return;
  if (gameOver || gameWon || openedSquares[index] || flaggedSquares[index]) return;

  if(!isActive && seconds===0) setIsActive(true);

  

  const updatedBoard = calculateFloodReveal(index, openedSquares,mines);
  setOpenedSquares(updatedBoard);

  if(mines[index] === "💣"){
    updatedBoard[index]= true;
    setOpenedSquares(updatedBoard);
    setIsActive(false);
    setGameOVer(true);
    return;
  }

  const finalRevealedGrid = calculateFloodReveal(index, openedSquares, mines); 
  setOpenedSquares(finalRevealedGrid);
  const openCount = finalRevealedGrid.filter((isOpen) => isOpen === true).length;
  if (openCount === 71) { 
    setIsActive(false);
    setGameWon(true); 
  }


};

const minutes = Math.floor(seconds/60);
const remainingSeconds = seconds%60;

useEffect(() => {
  const elements = document.getElementsByClassName("grid");
  
  openedSquares.forEach((isOpen, index) => {
    if (elements[index]) {
      if (isOpen) {
        elements[index].style.backgroundColor = "#4c1d95"; 
        elements[index].style.color = "#ffffff";

      } else {
        elements[index].style.backgroundColor = "#ffffff"; 
         
        


      }
    }
  });
}, [openedSquares]);




  return (
    <div className="gameContainer">
      <div className="mainbody">
        <h1 className="title">MINESWEEPER</h1>
        <div className="navigation">
          <button className="restartButton" onClick={
            () => setIsActive(true)
          }> Start Game</button>
          <div className="timer"> {minutes<10 ? "0": ""}{minutes}: {remainingSeconds<10? "0": ""} {remainingSeconds}</div>
        </div>
        <div className="gameBody">
          <div className="grid" onClick={()=> flipped(0)} >{openedSquares[0] ? mines[0]: ""} </div>
          <div className="grid" onClick={()=> flipped(1)}>{openedSquares[1]? mines[1]: ""}</div>
          <div className="grid" onClick={()=> flipped(2)}>{openedSquares[2]? mines[2]: ""}</div>
          <div className="grid" onClick={()=> flipped(3)}>{openedSquares[3]? mines[3]: ""}</div>
          <div className="grid" onClick={()=> flipped(4)}>{openedSquares[4]? mines[4]: ""}</div>
          <div className="grid" onClick={()=> flipped(5)}>{openedSquares[5]? mines[5]: ""}</div>
          <div className="grid" onClick={()=> flipped(6)}>{openedSquares[6]? mines[6]: ""}</div>
          <div className="grid" onClick={()=> flipped(7)}>{openedSquares[7]? mines[7]: ""}</div>
          <div className="grid" onClick={()=> flipped(8)}>{openedSquares[8]? mines[8]: ""}</div>
          <div className="grid" onClick={()=> flipped(9)}>{openedSquares[9]? mines[9]: ""}</div>
          <div className="grid" onClick={()=> flipped(10)}>{openedSquares[10]? mines[10]: ""}</div>
          <div className="grid" onClick={()=> flipped(11)}>{openedSquares[11]? mines[11]: ""}</div>
          <div className="grid" onClick={()=> flipped(12)}>{openedSquares[12]? mines[12]: ""}</div>
          <div className="grid" onClick={()=> flipped(13)}>{openedSquares[13]? mines[13]: ""}</div>
          <div className="grid" onClick={()=> flipped(14)}>{openedSquares[14]? mines[14]: ""}</div>
          <div className="grid" onClick={()=> flipped(15)}>{openedSquares[15]? mines[15]: ""}</div>
          <div className="grid" onClick={()=> flipped(16)}>{openedSquares[16]? mines[16]: ""}</div>
          <div className="grid" onClick={()=> flipped(17)}>{openedSquares[17]? mines[17]: ""}</div>
          <div className="grid" onClick={()=> flipped(18)}>{openedSquares[18]? mines[18]: ""}</div>
          <div className="grid" onClick={()=> flipped(19)}>{openedSquares[19]? mines[19]: ""}</div>
          <div className="grid" onClick={()=> flipped(20)}>{openedSquares[20]? mines[20]: ""}</div>
          <div className="grid" onClick={()=> flipped(21)}>{openedSquares[21]? mines[21]: ""}</div>
          <div className="grid" onClick={()=> flipped(22)}>{openedSquares[22]? mines[22]: ""}</div>
          <div className="grid" onClick={()=> flipped(23)}>{openedSquares[23]? mines[23]: ""}</div>
          <div className="grid" onClick={()=> flipped(24)}>{openedSquares[24]? mines[24]: ""}</div>
          <div className="grid" onClick={()=> flipped(25)}>{openedSquares[25]? mines[25]: ""}</div>
          <div className="grid" onClick={()=> flipped(26)}>{openedSquares[26]? mines[26]: ""}</div>
          <div className="grid" onClick={()=> flipped(27)}>{openedSquares[27]? mines[27]: ""}</div>
          <div className="grid" onClick={()=> flipped(28)}>{openedSquares[28]? mines[28]: ""}</div>
          <div className="grid" onClick={()=> flipped(29)}>{openedSquares[29]? mines[29]: ""}</div>
          <div className="grid" onClick={()=> flipped(30)}>{openedSquares[30]? mines[30]: ""}</div>
          <div className="grid" onClick={()=> flipped(31)}>{openedSquares[31]? mines[31]: ""}</div>
          <div className="grid" onClick={()=> flipped(32)}>{openedSquares[32]? mines[32]: ""}</div>
          <div className="grid" onClick={()=> flipped(33)}>{openedSquares[33]? mines[33]: ""}</div>
          <div className="grid" onClick={()=> flipped(34)}>{openedSquares[34]? mines[34]: ""}</div>
          <div className="grid" onClick={()=> flipped(35)}>{openedSquares[35]? mines[35]: ""}</div>
          <div className="grid" onClick={()=> flipped(36)}>{openedSquares[36]? mines[36]: ""}</div>
          <div className="grid" onClick={()=> flipped(37)}>{openedSquares[37]? mines[37]: ""}</div>
          <div className="grid" onClick={()=> flipped(38)}>{openedSquares[38]? mines[38]: ""}</div>
          <div className="grid" onClick={()=> flipped(39)}>{openedSquares[39]? mines[39]: ""}</div>
          <div className="grid" onClick={()=> flipped(40)}>{openedSquares[40]? mines[40]: ""}</div>
          <div className="grid" onClick={()=> flipped(41)}>{openedSquares[41]? mines[41]: ""}</div>
          <div className="grid" onClick={()=> flipped(42)}>{openedSquares[42]? mines[42]: ""}</div>
          <div className="grid" onClick={()=> flipped(43)}>{openedSquares[43]? mines[43]: ""}</div>
          <div className="grid" onClick={()=> flipped(44)}>{openedSquares[44]? mines[44]: ""}</div>
          <div className="grid" onClick={()=> flipped(45)}>{openedSquares[45]? mines[45]: ""}</div>
          <div className="grid" onClick={()=> flipped(46)}>{openedSquares[46]? mines[46]: ""}</div>
          <div className="grid" onClick={()=> flipped(47)}>{openedSquares[47]? mines[47]: ""}</div>
          <div className="grid" onClick={()=> flipped(48)}>{openedSquares[48]? mines[48]: ""}</div>
          <div className="grid" onClick={()=> flipped(49)}>{openedSquares[49]? mines[49]: ""}</div>
          <div className="grid" onClick={()=> flipped(50)}>{openedSquares[50]? mines[50]: ""}</div>
          <div className="grid" onClick={()=> flipped(51)}>{openedSquares[51]? mines[51]: ""}</div>
          <div className="grid" onClick={()=> flipped(52)}>{openedSquares[52]? mines[52]: ""}</div>
          <div className="grid" onClick={()=> flipped(53)}>{openedSquares[53]? mines[53]: ""}</div>
          <div className="grid" onClick={()=> flipped(54)}>{openedSquares[54]? mines[54]: ""}</div>
          <div className="grid" onClick={()=> flipped(55)}>{openedSquares[55]? mines[55]: ""}</div>
          <div className="grid" onClick={()=> flipped(56)}>{openedSquares[56]? mines[56]: ""}</div>
          <div className="grid" onClick={()=> flipped(57)}>{openedSquares[57]? mines[57]: ""}</div>
          <div className="grid" onClick={()=> flipped(58)}>{openedSquares[58]? mines[58]: ""}</div>
          <div className="grid" onClick={()=> flipped(59)}>{openedSquares[59]? mines[59]: ""}</div>
          <div className="grid" onClick={()=> flipped(60)}>{openedSquares[60]? mines[60]: ""}</div>
          <div className="grid" onClick={()=> flipped(61)}>{openedSquares[61]? mines[61]: ""}</div>
          <div className="grid" onClick={()=> flipped(62)}>{openedSquares[62]? mines[62]: ""}</div>
          <div className="grid" onClick={()=> flipped(63)}>{openedSquares[63]? mines[63]: ""}</div>
          <div className="grid" onClick={()=> flipped(64)}>{openedSquares[64]? mines[64]: ""}</div>
          <div className="grid" onClick={()=> flipped(65)}>{openedSquares[65]? mines[65]: ""}</div>
          <div className="grid" onClick={()=> flipped(66)}>{openedSquares[66]? mines[66]: ""}</div>
          <div className="grid" onClick={()=> flipped(67)}>{openedSquares[67]? mines[67]: ""}</div>
          <div className="grid" onClick={()=> flipped(68)}>{openedSquares[68]? mines[68]: ""}</div>
          <div className="grid" onClick={()=> flipped(69)}>{openedSquares[69]? mines[69]: ""}</div>
          <div className="grid" onClick={()=> flipped(70)}>{openedSquares[70]? mines[70]: ""}</div>
          <div className="grid" onClick={()=> flipped(71)}>{openedSquares[71]? mines[71]: ""}</div>
          <div className="grid" onClick={()=> flipped(72)}>{openedSquares[72]? mines[72]: ""}</div>
          <div className="grid" onClick={()=> flipped(73)}> {openedSquares[73]? mines[73]: ""}</div>
          <div className="grid" onClick={()=> flipped(74)}>{openedSquares[74]? mines[74]: ""}</div>
          <div className="grid" onClick={()=> flipped(75)}>{openedSquares[75]? mines[75]: ""}</div>
          <div className="grid" onClick={()=> flipped(76)}>{openedSquares[76]? mines[76]: ""}</div>
          <div className="grid" onClick={()=> flipped(77)}>{openedSquares[77]? mines[77]: ""}</div>
          <div className="grid" onClick={()=> flipped(78)}>{openedSquares[78]? mines[78]: ""}</div>
          <div className="grid" onClick={()=> flipped(79)} >{openedSquares[79]? mines[79]: ""}</div>
          <div className="grid" onClick={()=> flipped(80)}>{openedSquares[80]? mines[80]: ""}</div>
         
        </div>
        <div className="footer">
          <button className="arcade" onClick={()=>window.location.assign("/")}>Back To Arcade</button>
          <button className="endGame" onClick={
            ()=> setIsActive(false)
          }> End Game</button>
        </div>
      </div> 
       
{gameOver && (
  <div className="popup-overlay">
    <div className="popup-card">
      <h2 className="popup-title"> YOU HAVE BEEN COOKED!!!!  GAME OVER</h2>
      <p className="popup-text">
        You hit a mine at {minutes < 10 ? "0" : ""}{minutes}:{remainingSeconds < 10 ? "0" : ""}{remainingSeconds}!
      </p>

      <button 
        onClick={() => window.location.reload()} 
        className="popup-button"
      >
        Play Again
      </button>
    </div>
  {gameWon && (
  <div className="popup-overlay">
    <div className="popup-card" style={{ backgroundColor: "#15803d" }}> 
      <h2 className="popup-title"> YOU SURVIVED!!!! Congratulations! Well done! </h2>
      <p className="popup-text">
        Perfect clear achieved in {minutes < 10 ? "0" : ""}{minutes}:{remainingSeconds < 10 ? "0" : ""}{remainingSeconds}!
      </p>
      <button onClick={() => window.location.reload()} className="popup-button">
        Play Again
      </button>
    </div>
  </div>
)}




  </div>
)}





    </div>
  )
}