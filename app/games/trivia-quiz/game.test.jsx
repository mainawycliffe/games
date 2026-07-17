import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuizPage from "./page";
import { score, quizCount, btn } from "./logic";

//Since our data has more than 10 questions, we have decided to choose two questions from the data.js and do mocking for the trivial quiz app
// The reason is that since the questions are ordered, incase someone changes the order, our component testing will fail.
// The other reason is that incase  of  a typo error in the data.js, it could cause an unexpected behavior thus a need for mocking

vi.mock("./data", () => ({
  quizData: [
    {
      id: 1,
      topic: "Human Body Myths",
      question: "How much of our brains do humans actually use?",
      options: [
        { optA: "10%", isCorrect: false, reason: "Incorrect." },
        { optB: "100%", isCorrect: true, reason: "Correct!" },
      ],
    },
    {
      id: 2,
      topic: "Space Myths",
      question: "What color is the Sun when viewed from space?",
      options: [
        { optA: "White", isCorrect: true, reason: "Correct!" },
        { optB: "Yellow", isCorrect: false, reason: "Incorrect." },
      ],
    },
  ],
}));

// below we are mocking the timer. Since the timer in page.jsx is set to 15 seconds, 
// it is affecting the test and timing out before the whole testing is complete that is the 
// reason why we need to mock the timer to stop the timing out that will cause our code to crush before it finishes. 

vi.mock("./logic", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    timer: () => ({
      startTimer: () => {},
      stopTimer: () => {}
    })
  };
});

describe("trivia quiz logic", () => {
  const mockQuestion = {
    options: [
      { optA: "10%", isCorrect: false },
      { optB: "100%", isCorrect: true },
    ],
  };

  it("increments score correctly on a right answer choice", () => {
    expect(score("100%", mockQuestion, 0)).toBe(1);
  });

  it("keeps score stagnant on a wrong answer choice", () => {
    expect(score("10%", mockQuestion, 3)).toBe(3);
  });

  it("ignores score updates when no option is chosen", () => {
    expect(score("", mockQuestion, 5)).toBe(5);
  });

  it("formats the quiz progress string correctly", () => {
    expect(quizCount(0, 5)).toBe("1 / 5");
    expect(quizCount(2, 3)).toBe("3 / 3");
  });

  it("extracts clean labels and clean text strings from dynamic properties", () => {
    const optionObj = { optB: "100%", isCorrect: true };
    const result = btn(optionObj);
    expect(result.label).toBe("B");
    expect(result.text).toBe("100%");
  });
});

describe("<QuizPage />", () => {

  it("plays a game where a user clicks a correct answer and advances safely", async () => {
    const user = userEvent.setup();
    render(<QuizPage />);

    expect(screen.getByText("How much of our brains do humans actually use?")).toBeInTheDocument();
    
    const wrongOption = screen.getByRole("button", { name: /10%/ });
    const correctOption = screen.getByRole("button", { name: /100%/ });
    const nextButton = screen.getByRole("button", { name: /Next/i });

    expect(nextButton).toBeDisabled();

    await user.click(correctOption);

    expect(nextButton).not.toBeDisabled();
    expect(correctOption).toHaveClass("bg-emerald-500");
    
    await user.click(wrongOption);
    expect(wrongOption).not.toHaveClass("bg-destructive");

    await user.click(nextButton);
    expect(screen.getByText("What color is the Sun when viewed from space?")).toBeInTheDocument();
  });
});

