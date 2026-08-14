"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buttonVariants, Button } from "@/components/ui/button";

// Import rule configurations from logic.js
import {
  SUITS,
  createDeck,
  shuffleDeck,
  canMoveToTableau,
  canMoveToFoundation,
  revealTopCard,
} from "./logic";

export default function SolitairePage() {
  // TRACKING PILES
  const [stock, setStock] = useState([]);
  const [waste, setWaste] = useState([]);
  const [foundations, setFoundations] = useState({
    HEARTS: [],
    DIAMONDS: [],
    CLUBS: [],
    SPADES: [],
  });
  const [tableau, setTableau] = useState([[], [], [], [], [], [], []]);

  // INTERACTION MONITORS
  const [selected, setSelected] = useState(null); // Tracks mouse clicks
  const [history, setHistory] = useState([]);      // Tracks undo steps
  const [hasWon, setHasWon] = useState(false);    // Win banner trigger
  const [draggedData, setDraggedData] = useState(null); // Tracks dragging in mid-air

  // Deals a fresh board from scratch
  function startNewGame() {
    const deck = shuffleDeck(createDeck());
    const newTableau = [[], [], [], [], [], [], []];
    let pointer = 0;

    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = deck[pointer++];
        if (j === i) card.isFaceUp = true;
        newTableau[j].push(card);
      }
    }

    setTableau(newTableau);
    setStock(deck.slice(pointer));
    setWaste([]);
    setFoundations({ HEARTS: [], DIAMONDS: [], CLUBS: [], SPADES: [] });
    setSelected(null);
    setHistory([]);
    setHasWon(false);
  }

  // Pre-load a game board immediately the browser launches
  useEffect(() => {
    startNewGame();
  }, []);

  // Monitors wins
  useEffect(() => {
    const total =
      foundations.HEARTS.length +
      foundations.DIAMONDS.length +
      foundations.CLUBS.length +
      foundations.SPADES.length;
    if (total === 52) setHasWon(true);
  }, [foundations]);

    // TIMELINE BACKUPS FOR UNDO ACTIONS

  // Saves a frozen snapshot state of the entire board configuration before making a card move
  function takeSnapshot() {
    setHistory((prev) => [
      ...prev,
      {
        stock: stock.map((c) => ({ ...c })),
        waste: waste.map((c) => ({ ...c })),
        foundations: {
          HEARTS: foundations.HEARTS.map((c) => ({ ...c })),
          DIAMONDS: foundations.DIAMONDS.map((c) => ({ ...c })),
          CLUBS: foundations.CLUBS.map((c) => ({ ...c })),
          SPADES: foundations.SPADES.map((c) => ({ ...c })),
        },
        tableau: tableau.map((col) => col.map((c) => ({ ...c }))),
      },
    ]);
  }

  // Rolls back all active deck arrays to match the previous historical record turn
  function handleUndo() {
    if (history.length === 0) return; // Do nothing if the game just started
    const prev = history[history.length - 1];
    
    setStock(prev.stock);
    setWaste(prev.waste);
    setFoundations(prev.foundations);
    setTableau(prev.tableau);
    setSelected(null); // Clear selection buffers to avoid glitches
    setHistory((h) => h.slice(0, -1)); // Drop the last move off the ledger array
  }


  // DECK CYCLING ENGINE

  // Manages drawing face-up cards out of your remaining stock pile
  function handleStockClick() {
    if (hasWon) return;
    takeSnapshot();
    setSelected(null); // Clear old selected highlights before drawing

    if (stock.length === 0) {
      // If stock runs dry, recycle the waste stack face-down back into the stock pile
      setStock([...waste].reverse().map((c) => ({ ...c, isFaceUp: false })));
      setWaste([]);
    } else {
      // Pull the top card from the stock deck, flip it face-up, and send it to the waste column
      const currentStock = [...stock];
      const card = currentStock.pop();
      card.isFaceUp = true;
      setWaste((prev) => [...prev, card]);
      setStock(currentStock);
    }
  }


  // MANUAL MOUSE CLICK ROUTINES

  // Handles standard highlight selections when a user clicks card profiles manually
  function handleCardClick(clicked) {
    if (hasWon) return;

    // STEP A: If nothing is selected yet, save this card choice as your moving piece
    if (!selected) {
      let card = null;
      if (clicked.type === "waste") card = waste[waste.length - 1];
      if (clicked.type === "foundation")
        card = foundations[clicked.suit][foundations[clicked.suit].length - 1];
      if (clicked.type === "tableau") card = tableau[clicked.colIndex][clicked.cardIndex];
      
      // We only let the player select a card if it is valid and turned face-up
      if (card && card.isFaceUp) setSelected(clicked);
      return;
    }

    // STEP B: If clicking the exact same card choice twice, clear the selected target
    if (
      selected.type === clicked.type &&
      selected.colIndex === clicked.colIndex &&
      selected.suit === clicked.suit
    ) {
      setSelected(null);
      return;
    }

    // STEP C: If a card was already waiting in your clip area, attempt to process a move
    moveCards(selected, clicked);
    setSelected(null); // Clear highlight target indicators back to neutral
  }

    // CORE CARD TRANSFERS & ROUTING RULES VALIDATION

  // Moves cards from a source slot (src) to a target slot (dest)
  function moveCards(src, dest) {
    let card = null;
    
    // Find the exact card instance that the player is trying to move
    if (src.type === "waste") card = waste[waste.length - 1];
    if (src.type === "foundation") card = foundations[src.suit][foundations[src.suit].length - 1];
    if (src.type === "tableau") card = tableau[src.colIndex][src.cardIndex];

    // If no card data is discovered at the source, stop the move immediately
    if (!card) {
      setSelected(null);
      return;
    }

    // SCENARIO 1: LANDING CARDS ONTO A TABLEAU MAIN LANE COLUMN
    if (dest.type === "tableau") {
      const col = tableau[dest.colIndex];
      const target = col.length > 0 ? col[col.length - 1] : null;

      // Ask logic.js if alternating colors and decreasing rank patterns match perfectly
      if (canMoveToTableau(card, target)) {
        takeSnapshot(); // Record backup undo snapshot data
        let moving = [];

        // Scenario 1a: Shifting card arrays from another Tableau column lane (handles multiple cards!)
        if (src.type === "tableau") {
          const original = [...tableau[src.colIndex]];
          moving = original.splice(src.cardIndex); // Slice off the selected card and any cards below it

          setTableau((prev) => {
            const next = [...prev];
            next[src.colIndex] = revealTopCard(original); // Auto flip newly uncovered column end card
            next[dest.colIndex] = [...next[dest.colIndex], ...moving]; // Drop the stack onto the new column
            return next;
          });
        } 
        // Scenario 1b: Moving a single item out of the drawn face-up waste pile
        else if (src.type === "waste") {
          moving = [waste[waste.length - 1]];
          setWaste((prev) => prev.slice(0, -1));
          setTableau((prev) => {
            const next = [...prev];
            next[dest.colIndex] = [...next[dest.colIndex], ...moving];
            return next;
          });
        } 
        // Scenario 1c: Dragging an item back down from an upper foundation pile slot
        else if (src.type === "foundation") {
          moving = [foundations[src.suit][foundations[src.suit].length - 1]];
          setFoundations((prev) => ({
            ...prev,
            [src.suit]: prev[src.suit].slice(0, -1),
          }));
          setTableau((prev) => {
            const next = [...prev];
            next[dest.colIndex] = [...next[dest.colIndex], ...moving];
            return next;
          });
        }
      }
    }

    // SCENARIO 2: LANDING A CARD ONTO A FOUNDATION SCORE PILE
    if (dest.type === "foundation") {
      // You can only send a single card to a foundation. Moving a column stack here is forbidden.
      if (src.type === "tableau" && src.cardIndex !== tableau[src.colIndex].length - 1) {
        setSelected(null);
        return;
      }

      const top = foundations[dest.suit].length > 0
          ? foundations[dest.suit][foundations[dest.suit].length - 1]
          : null;

      // Ask logic.js if suits match and card values scale perfectly upwards from Ace to King
      if (card.suit === dest.suit && canMoveToFoundation(card, top)) {
        takeSnapshot(); // Record backup undo snapshot data

        // Erase the shifted item out of its historical collection area
        if (src.type === "tableau") {
          setTableau((prev) => {
            const next = [...prev];
            const colCopy = [...next[src.colIndex]];
            colCopy.pop();
            next[src.colIndex] = revealTopCard(colCopy); // Flip the newly exposed card face-up
            return next;
          });
        } else if (src.type === "waste") {
          setWaste((prev) => prev.slice(0, -1));
        } else if (src.type === "foundation") {
          setFoundations((prev) => ({
            ...prev,
            [src.suit]: prev[src.suit].slice(0, -1),
          }));
        }

        // Drop the validated item onto its target foundation category
        setFoundations((prev) => ({
          ...prev,
          [dest.suit]: [...prev[dest.suit], card],
        }));
      }
    }

    setSelected(null); // Reset track selection to zero
  }

  // NATIVE HTML5 DRAG EVENT HANDLING ROUTINES

  // Fires the exact second you hold down and lift a card element with your pointer cursor
  function handleDragStart(e, srcData) {
    if (hasWon) return;
    setDraggedData(srcData); // Save identity markers inside React memory states
    e.dataTransfer.setData("text/plain", JSON.stringify(srcData)); // Backup copy directly inside standard browser data capsule
    e.dataTransfer.effectAllowed = "move";
  }

  // Tells the browser that this element is an active location where cards are authorized to drop
  function handleDragOver(e) {
    e.preventDefault(); // Lifts default browser blocks so dropped cards register cleanly
    e.dataTransfer.dropEffect = "move";
  }

  // Triggers when you let go of your dragging card selection stack over a target lane area
  function handleDrop(e, destData) {
    e.preventDefault();
    // Locate the moving item parameter records out of active memory state or extract from browser data logs
    const source = draggedData || JSON.parse(e.dataTransfer.getData("text/plain"));
    if (!source) return;
    
    moveCards(source, destData); // Route parameters into our game rules engine
    setDraggedData(null); // Reset dragging registry indicators back to neutral
  }

   // VISUAL INTERFACE LAYOUT RENDERER
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* HEADER SECTION: Back link, Undo and New Game Buttons */}
      <div className="mb-4 flex items-center justify-between">
        <Link href="/games" className="text-muted-foreground text-sm font-medium hover:underline">
          ← Back to arcade
        </Link>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Undo
          </Button>
          <Button
            type="button"
            onClick={startNewGame}
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            New game
          </Button>
        </div>
      </div>

      {/* GAME BOARD CANVAS: The structured green card table arena */}
      <Card className="border-emerald-900 bg-emerald-800 text-white shadow-xl">
        <CardHeader className="border-b border-emerald-700 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Solitaire</CardTitle>
            {hasWon ? (
              <Badge className="bg-amber-400 font-bold text-black">🎉 Winner!</Badge>
            ) : (
              <Badge variant="secondary" className="border-none bg-emerald-700 text-white">
                Playing
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* GAME PLAYFIELD CONTAINER: Note that select-none is removed here to prevent drag freezing */}
        <CardContent className="space-y-8 pt-6">
          
          {/* TOP DECK ROW: Houses the Stock, Waste, and 4 Foundation Piles */}
          <div className="grid grid-cols-7 gap-2">
            
            {/* SLOT 1: The Face-down Draw Deck (Stock) */}
            <div className="col-span-1 flex flex-col items-center">
              <span className="mb-1 text-[10px] font-semibold text-emerald-200">Stock</span>
              <button
                type="button"
                onClick={handleStockClick}
                className={cn(
                  "relative flex aspect-[2/3] w-full items-center justify-center rounded-lg border-2 text-xl font-bold shadow-md transition-colors",
                  stock.length > 0
                    ? "border-sky-600 bg-sky-800 text-sky-100 hover:bg-sky-700"
                    : "border-dashed border-emerald-700 bg-emerald-900 text-emerald-600",
                )}
              >
                {stock.length > 0 ? "🎴" : "↺"}
              </button>
            </div>

            {/* SLOT 2: The Face-up Drawn Cards (Waste) */}
            <div className="col-span-1 flex flex-col items-center">
              <span className="mb-1 text-[10px] font-semibold text-emerald-200">Waste</span>
              {waste.length > 0 ? (
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, { type: "waste" })}
                  onClick={() => handleCardClick({ type: "waste" })}
                  className={cn(
                    "flex aspect-[2/3] w-full cursor-grab active:cursor-grabbing flex-col justify-between rounded-lg border bg-white p-1.5 font-bold shadow-md transition-all",
                    waste[waste.length - 1].color === "red"
                      ? "border-rose-200 text-rose-600"
                      : "border-slate-200 text-slate-900",
                    selected?.type === "waste" && "scale-105 ring-4 ring-amber-400",
                  )}
                >
                  <div className="text-xs">{waste[waste.length - 1].value}</div>
                  <div className="text-center text-lg">{waste[waste.length - 1].symbol}</div>
                </div>
              ) : (
                <div className="aspect-[2/3] w-full rounded-lg border-2 border-dashed border-emerald-700/60 bg-emerald-900/40" />
              )}
            </div>

            {/* SLOT 3: Empty spacer grid column layout placeholder */}
            <div className="col-span-1" />

            {/* SLOTS 4-7: Loops to build the 4 individual score slots */}
            {Object.keys(SUITS).map((suitKey) => {
              const pile = foundations[suitKey];
              const topCard = pile[pile.length - 1];
              const isSelectedFound = selected?.type === "foundation" && selected.suit === suitKey;

              return (
                <div key={suitKey} className="col-span-1 flex flex-col items-center">
                  <span className="mb-1 max-w-full truncate text-[10px] font-semibold text-emerald-200">
                    {SUITS[suitKey].label}
                  </span>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, { type: "foundation", suit: suitKey })}
                    onClick={() => {
                      if (selected) {
                        moveCards(selected, { type: "foundation", suit: suitKey });
                      } else if (topCard) {
                        handleCardClick({ type: "foundation", suit: suitKey });
                      }
                    }}
                    className={cn(
                      "flex aspect-[2/3] w-full cursor-pointer flex-col justify-between rounded-lg border p-1.5 font-bold shadow-md transition-transform",
                      topCard
                        ? "bg-white"
                        : "items-center justify-center border-2 border-emerald-700 bg-emerald-900/60 text-lg text-emerald-600",
                      topCard &&
                        (topCard.color === "red"
                          ? "border-rose-200 text-rose-600"
                          : "border-slate-200 text-slate-900"),
                      isSelectedFound && "scale-105 ring-4 ring-amber-400",
                    )}
                  >
                    {topCard ? (
                      <>
                        <div className="text-xs">{topCard.value}</div>
                        <div className="text-center text-lg">{topCard.symbol}</div>
                      </>
                    ) : (
                      SUITS[suitKey].symbol
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTTOM ROW: The 7 Playing Tableau Columns */}
          <div className="grid min-h-[400px] grid-cols-7 gap-2">
            {tableau.map((column, colIndex) => {
              const empty = column.length === 0;
              return (
                <div
                  key={colIndex}
                  className="col-span-1 flex h-full flex-col rounded bg-emerald-900/5 p-0.5 border border-transparent hover:border-emerald-700/20"
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    const targetIndex = empty ? 0 : column.length - 1;
                    handleDrop(e, { type: "tableau", colIndex, cardIndex: targetIndex });
                  }}
                  onClick={() => {
                    if (empty && selected) {
                      moveCards(selected, { type: "tableau", colIndex, cardIndex: 0 });
                    }
                  }}
                >
                  {empty ? (
                    <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg border-2 border-dashed border-emerald-700/40 bg-emerald-900/20 text-sm font-semibold text-emerald-700/60">
                      K
                    </div>
                  ) : (
                    <div className="relative flex w-full flex-col">
                      {column.map((card, cardIndex) => {
                        const active =
                          selected?.type === "tableau" &&
                          selected.colIndex === colIndex &&
                          selected.cardIndex === cardIndex;
                        return (
                          <div
                            key={card.id}
                            draggable={card.isFaceUp}
                            onDragStart={(e) => handleDragStart(e, { type: "tableau", colIndex, cardIndex })}
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                              e.stopPropagation();
                              if (cardIndex === column.length - 1) {
                                handleDrop(e, { type: "tableau", colIndex, cardIndex });
                              } else {
                                handleDrop(e, { type: "tableau", colIndex, cardIndex: column.length - 1 });
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (card.isFaceUp) {
                                handleCardClick({ type: "tableau", colIndex, cardIndex });
                              } else if (cardIndex === column.length - 1) {
                                takeSnapshot();
                                setTableau((prev) => {
                                  const next = [...prev];
                                  next[colIndex][cardIndex].isFaceUp = true;
                                  return next;
                                });
                              }
                            }}
                            className={cn(
                              "flex aspect-[2/3] w-full cursor-pointer flex-col justify-between rounded-lg border p-1.5 font-bold shadow-md transition-all",
                              card.isFaceUp
                                ? "bg-white cursor-grab active:cursor-grabbing " +
                                    (card.color === "red"
                                      ? "border-rose-200 text-rose-600"
                                      : "border-slate-200 text-slate-900")
                                : "border-sky-700 bg-gradient-to-br from-sky-800 to-sky-900 text-transparent",
                              active && "z-20 scale-105 ring-4 ring-amber-400",
                              cardIndex > 0 && "-mt-[135%]",
                            )}
                          >
                            {card.isFaceUp ? (
                              <>
                                <div className="text-xs leading-none">{card.value}</div>
                                <div className="text-center text-xl leading-none">{card.symbol}</div>
                              </>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] opacity-20">
                                🃏
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

