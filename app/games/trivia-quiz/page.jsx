"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { score, quizCount, btn, timer } from "./logic";
import { quizData } from "./data"; 

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [timerText, setTimerText] = useState("Time Left: 15s");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const timerRef = useRef(null);
  const currentQuestion = quizData[currentIndex];

  const moveToNextQuestion = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const highlightCorrectAnswers = () => {
    setHasAnswered(true);
  };

  const handleSelectOption = (optionText) => {
    if (hasAnswered) return; 
    
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }

    setSelectedAnswer(optionText);
    setHasAnswered(true);

    const newScore = score(optionText, currentQuestion, userScore);
    setUserScore(newScore);
  };

  useEffect(() => {
    const instance = timer(
      currentIndex,
      quizData,
      moveToNextQuestion,
      setTimerText,
      highlightCorrectAnswers
    );
    
    timerRef.current = instance;
    instance.startTimer();

    return () => {
      if (timerRef.current) timerRef.current.stopTimer();
    };
  }, [currentIndex]);


  return (
    <div className="mx-auto max-w-md py-12  relative">
       <Card 
        className="quizcard bg-cover bg-center relative overflow-hidden text-white" 
        style={{ backgroundImage: "url('/quiz-bg.jpg')" }}
      >
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>The Science Myths</CardTitle>
            <div className="timer text-sm font-semibold tracking-wider text-destructive">
              {timerText}
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10 ">
            <Badge 
            variant="outline" 
            className="text-zinc-200 border-zinc-600 bg-white/5 backdrop-blur-sm"
            >
              Topic: {currentQuestion?.topic}
            </Badge>
            <span className="text-xs text-zinc-300 font-mono">
              Progress: {quizCount(currentIndex, quizData.length)}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="text-muted-foreground space-y-4 text-sm">
          <main className="main-content space-y-6">
            <div className="question text-base font-semibold text-white tracking-wide">
              {currentQuestion?.question}
            </div>

            <div className="answers grid gap-2">
              {currentQuestion?.options.map((optionObj, idx) => {
                const { label, text } = btn(optionObj);
                const isThisSelected = selectedAnswer === text;
                const isThisCorrect = optionObj.isCorrect;
                
                let buttonStyle = "border p-3 rounded-lg text-left text-white transition-all w-full flex items-center gap-3 ";
                
                if (hasAnswered) {
                  if (isThisCorrect) {
                    buttonStyle += "bg-emerald-900 text-white border-emerald-500 font-medium";
                  } else if (isThisSelected && !isThisCorrect) {
                    buttonStyle += "bg-destructive text-destructive-foreground border-destructive";
                  } else {
                    buttonStyle += "bg-zinc-900/80 text-zinc-300 border-white/5 cursor-not-allowed ";
                  }
                } else {
                  buttonStyle += "hover:bg-slate-900/90 hover:border-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:scale-[1.01] cursor-pointer  ";
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnswered}
                    onClick={() => handleSelectOption(text)}
                    className={buttonStyle}
                  >
                    <span className="bg-muted px-2 py-0.5 rounded text-xs font-bold text-muted-foreground">
                      {label}
                    </span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>

            {hasAnswered && selectedAnswer && (
              <div className="p-3 bg-slate-950/70 border border-white/10 rounded-md text-xs italic text-zinc-200 shadow-inner transition-all">
                <strong>Explanation:</strong> {currentQuestion?.options.find(o => btn(o).text === selectedAnswer)?.reason}
              </div>
            )}

            <div className="next-btn pt-4 flex justify-end">
              <button 
                onClick={moveToNextQuestion}
                disabled={!hasAnswered}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next ➡️
              </button>
            </div>
          </main>
        </CardContent>
      </Card>

      {isQuizComplete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-lg border text-center p-6 space-y-4">
            <div className="text-3xl"> Congratulations </div>
            <CardTitle className="text-xl font-bold">Quiz Complete!</CardTitle>
            <p className="text-muted-foreground text-sm">
              You scored <span className="font-bold text-foreground text-base">{userScore}</span> out of <span className="font-bold text-foreground text-base">{quizData.length}</span> questions.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 p-2.5 rounded-md font-medium text-sm transition-all"
            >
              Play Again 🔄
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}
