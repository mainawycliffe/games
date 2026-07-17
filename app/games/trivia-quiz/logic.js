const getOptKey = (opt) => Object.keys(opt).find((k) => k !== "isCorrect" && k !== "reason");

export function score(userAnswer, currentQuestion, currentScore) {
  if (!userAnswer) return currentScore;

  const chosenOption = currentQuestion.options.find((opt) => opt[getOptKey(opt)] === userAnswer);
  return chosenOption?.isCorrect ? currentScore + 1 : currentScore;
}

export function quizCount(currentIndex, totalQuestions) {
  return `${currentIndex + 1} / ${totalQuestions}`;
}

export function btn(optionObject) {
  const textKey = getOptKey(optionObject);
  return {
    label: textKey ? textKey.replace("opt", "") : "",
    text: textKey ? optionObject[textKey] : "",
  };
}

export function timer(
  currentQuestionIndex,
  quizData,
  moveToNextQuestion,
  updateTimerDisplay,
  highlightCorrectAnswers,
) {
  let timeLeft = 15;
  let timerInterval = null;

  function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 15;
    updateTimerDisplay(`Time Left: ${timeLeft}s`);

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay(`Time Left: ${timeLeft}s`);

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeout();
      }
    }, 1000);
  }

  function handleTimeout() {
    const currentQuestion = quizData[currentQuestionIndex];
    const correctIndex = currentQuestion.options.findIndex((opt) => opt.isCorrect);

    highlightCorrectAnswers(correctIndex);

    setTimeout(moveToNextQuestion, 3000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  return { startTimer, stopTimer };
}
