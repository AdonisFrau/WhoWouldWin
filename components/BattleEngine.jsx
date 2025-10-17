'use client';
import { useEffect, useRef, useState } from 'react';
import charactersData from './Characters.json';

export default function BattleEngine({ allowedTypes }) {
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  const [result, setResult] = useState(null);
  const [percent, setPercent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [showingResult, setShowingResult] = useState(false);

  const animIntervalRef = useRef(null);
  const nextTimeoutRef = useRef(null);
  const deathTimeoutRef = useRef(null);
  const animFrameRef = useRef(null);

  // helper: set width (row) or height (column) percent with a transition
  const setFlexPercent = (value) => {
    const leftDiv = document.getElementById('LeftSide');
    const rightDiv = document.getElementById('RightSide');
    if (!leftDiv || !rightDiv) return;

    const parent = leftDiv.parentElement;
    const parentStyle = parent ? getComputedStyle(parent) : null;
    const isColumn = parentStyle?.flexDirection?.startsWith('column');

    // add animating class so CSS can apply text pulsing, etc.
    leftDiv.classList.add('animating');
    rightDiv.classList.add('animating');

    const trans = 'width 220ms ease, height 220ms ease';
    leftDiv.style.transition = trans;
    rightDiv.style.transition = trans;

    if (isColumn) {
      if (parent) parent.style.height = parent.style.height || '100vh';
      leftDiv.style.flex = `0 0 ${value}%`;
      rightDiv.style.flex = `0 0 ${100 - value}%`;
      leftDiv.style.height = `${value}%`;
      rightDiv.style.height = `${100 - value}%`;
      leftDiv.style.width = '';
      rightDiv.style.width = '';
    } else {
      leftDiv.style.flex = `0 0 ${value}%`;
      rightDiv.style.flex = `0 0 ${100 - value}%`;
      leftDiv.style.width = `${value}%`;
      rightDiv.style.width = `${100 - value}%`;
      leftDiv.style.height = '';
      rightDiv.style.height = '';
      if (parent) parent.style.height = '';
    }

    // remove the animating class after the transition completes
    window.clearTimeout(leftDiv.__animTimeout);
    leftDiv.__animTimeout = window.setTimeout(() => {
      leftDiv.classList.remove('animating');
      rightDiv.classList.remove('animating');
    }, 420);
  };

  // helper to mark winner/loser visuals
  const applyVisualState = (finalLeftPercent) => {
    const leftDiv = document.getElementById('LeftSide');
    const rightDiv = document.getElementById('RightSide');
    if (!leftDiv || !rightDiv) return;

    // remove previous states
    leftDiv.classList.remove('winner', 'loser');
    rightDiv.classList.remove('winner', 'loser');

    if (finalLeftPercent > 50) {
      leftDiv.classList.add('winner');
      rightDiv.classList.add('loser');
    } else if (finalLeftPercent < 50) {
      leftDiv.classList.add('loser');
      rightDiv.classList.add('winner');
    } // exact 50 -> no winner class
  };

  // cleanup function to remove inline sizing and transitions
  const clearInlineSizing = () => {
    const leftDiv = document.getElementById('LeftSide');
    const rightDiv = document.getElementById('RightSide');
    const parent = leftDiv?.parentElement;
    if (leftDiv) {
      leftDiv.style.transition = '';
      leftDiv.style.width = '';
      leftDiv.style.height = '';
      leftDiv.style.flex = '';
      leftDiv.classList.remove('animating', 'winner', 'loser');
      window.clearTimeout(leftDiv.__animTimeout);
    }
    if (rightDiv) {
      rightDiv.style.transition = '';
      rightDiv.style.width = '';
      rightDiv.style.height = '';
      rightDiv.style.flex = '';
      rightDiv.classList.remove('animating', 'winner', 'loser');
      window.clearTimeout(rightDiv.__animTimeout);
    }
    if (parent) {
      parent.style.height = '';
      parent.style.minHeight = '';
    }
  };

  const setSideName = (id, name) => {
    const container = document.getElementById(id);
    if (!container) return;
    const p = container.querySelector('p');
    if (p) p.textContent = name ?? '';
  };

  const setSidePercent = (id, value) => {
    const container = document.getElementById(id);
    if (!container) return;
    const p = container.querySelector('p');
    if (p) p.textContent = `${Math.round(value)}%`;
  };

  const pickCharacters = () => {
    const filtered = charactersData.filter(
      (c) => allowedTypes.has(c.type) || allowedTypes.has('Everything')
    );

    if (filtered.length < 2) return;

    let leftChar = filtered[Math.floor(Math.random() * filtered.length)];
    let rightChar;
    do {
      rightChar = filtered[Math.floor(Math.random() * filtered.length)];
    } while (rightChar.name === leftChar.name);

    // apply mutation logic based on power levels
    const [mutLeft, mutRight] = applyMutationIfNeeded(leftChar, rightChar);
    setLeft(mutLeft);
    setRight(mutRight);
    setResult(null);
    setPercent(0);
    setShowingResult(false);

    setTimeout(() => {
      updateSide('LeftSide', mutLeft);
      updateSide('RightSide', mutRight);
      setFlexPercent(50);

      const leftDisplayName = mutLeft.mutatedCount
        ? `${mutLeft.mutatedCount} of ${mutLeft.name}'s`
        : mutLeft.name;
      const rightDisplayName = mutRight.mutatedCount
        ? `${mutRight.mutatedCount} of ${mutRight.name}'s`
        : mutRight.name;

      setSideName('LeftSide', leftDisplayName);
      setSideName('RightSide', rightDisplayName);
    }, 30);
  };

  const updateSide = (id, character) => {
    const container = document.getElementById(id);
    if (!container) return;

    const img = container.querySelector('img');
    if (img) {
      img.src = character.img || '/img/Placeholder.png';
      img.onerror = () => {
        console.error(`Failed to load ${character.name}, using placeholder.`);
        img.src = '/img/Placeholder.png';
      };
    }

    const nameEl = container.querySelector('p');
    if (nameEl) {
      if (character.mutatedCount) {
        nameEl.textContent = `${character.mutatedCount} of ${character.name}'s`;
      } else {
        nameEl.textContent = character.name || 'Loading...';
      }
    }
  };

  useEffect(() => {
    pickCharacters();
    window.nextBattle = nextBattle;
    return () => {
      try {
        delete window.nextBattle;
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedTypes]);

  useEffect(() => {
    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      if (deathTimeoutRef.current) clearTimeout(deathTimeoutRef.current);
      clearInlineSizing();
    };
  }, []);

  const calculatePercent = (a, b) => {
    const total = a + b;
    return Math.max(2, Math.round((a / total) * 100));
  };

  function nextBattle() {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      animIntervalRef.current = null;
    }
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }
    if (deathTimeoutRef.current) {
      clearTimeout(deathTimeoutRef.current);
      deathTimeoutRef.current = null;
    }

    const leftDiv = document.getElementById('LeftSide');
    const parent = leftDiv?.parentElement;
    const start = percent || (showingResult ? percent : 50);
    const target = 50;
    let current = start;
    const step = 2;
    setAnimating(true);

    const parentStyle = parent ? getComputedStyle(parent) : null;
    const isColumn = parentStyle?.flexDirection?.startsWith('column');
    if (isColumn && parent) parent.style.height = parent.style.height || '100vh';

    animIntervalRef.current = setInterval(() => {
      if (Math.abs(current - target) <= step) {
        current = target;
        setPercent(current);
        setFlexPercent(current);
        setSidePercent('LeftSide', current);
        setSidePercent('RightSide', 100 - current);
        clearInterval(animIntervalRef.current);
        animIntervalRef.current = null;
        setTimeout(() => {
          pickCharacters();
          setAnimating(false);
          setPercent(0);
          setTimeout(() => {
            clearInlineSizing(); // this now also removes winner/loser classes
          }, 80);
        }, 200);
      } else {
        current += current < target ? step : -step;
        setPercent(current);
        setFlexPercent(current);
        setSidePercent('LeftSide', current);
        setSidePercent('RightSide', 100 - current);
      }
    }, 12);
  }

  const handlePick = (side) => {
    if (!left || !right) return;

    // clear pending timers for a fresh pick
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      animIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (deathTimeoutRef.current) {
      clearTimeout(deathTimeoutRef.current);
      deathTimeoutRef.current = null;
    }

    const leftPower = left?.effectivePower ?? left?.powerlevel ?? 0;
    const rightPower = right?.effectivePower ?? right?.powerlevel ?? 0;
    const leftPercent = calculatePercent(leftPower, rightPower);
    const rightPercent = 100 - leftPercent;

    const winner = leftPower >= rightPower ? 'left' : 'right';
    setResult(winner);

    const startPercent = 50;
    const target = side === 'left' ? leftPercent : rightPercent;
    setAnimating(true);

    // replace names with starting percents
    setSidePercent('LeftSide', 50);
    setSidePercent('RightSide', 50);

    // easing helper - exponential easeOut
    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const duration = 700; // ms, adjust for faster/slower overall feel
    let startTime = null;

    const step = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutExpo(t);
      // interpolate from startPercent -> target using eased value
      const current = startPercent + (target - startPercent) * eased;
      setPercent(Math.round(current));
      const visualLeft = side === 'left' ? current : 100 - current;
      setFlexPercent(visualLeft);
      const leftDisplay = Math.round(side === 'left' ? current : 100 - current);
      const rightDisplay = 100 - leftDisplay;
      setSidePercent('LeftSide', leftDisplay);
      setSidePercent('RightSide', rightDisplay);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // finished
        animFrameRef.current = null;
        setPercent(target);
        const finalLeft = side === 'left' ? target : 100 - target;
        const finalRight = 100 - finalLeft;
        setFlexPercent(finalLeft);
        setSidePercent('LeftSide', finalLeft);
        setSidePercent('RightSide', finalRight);
        applyVisualState(finalLeft);
        setShowingResult(true);
        setAnimating(false);

        if (side !== winner) {
          deathTimeoutRef.current = setTimeout(() => {
            if (typeof window.Death === 'function') window.Death();
            deathTimeoutRef.current = null;
          }, 4000);
        }

        nextTimeoutRef.current = setTimeout(() => {
          nextBattle();
        }, 10000);
      }
    };

    // start RAF animation
    animFrameRef.current = requestAnimationFrame(step);

    // do NOT call Death immediately here; it's scheduled above after result
    if (side !== winner) {
      console.log('You picked the weaker one!');
    } else {
      console.log('You won!');
    }
  };

  useEffect(() => {
    const leftDiv = document.getElementById('LeftSide');
    const rightDiv = document.getElementById('RightSide');

    const leftClick = () => handlePick('left');
    const rightClick = () => handlePick('right');

    leftDiv?.addEventListener('click', leftClick);
    rightDiv?.addEventListener('click', rightClick);

    return () => {
      leftDiv?.removeEventListener('click', leftClick);
      rightDiv?.removeEventListener('click', rightClick);
    };
  }, [left, right]);

  // no central overlay anymore — percentages are shown inside each side
  return null;
}

// Helper: given two powers, maybe mutate the weaker side into many copies
const applyMutationIfNeeded = (aChar, bChar) => {
  const A = { ...aChar };
  const B = { ...bChar };

  const a = Number(A.powerlevel) || 0;
  const b = Number(B.powerlevel) || 0;
  const THRESHOLD = 1000;

  const niceRound = (n) => {
    const bases = [1, 2, 5];
    const mags = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000];
    let best = 1;
    let bestDiff = Infinity;
    for (const m of mags) {
      for (const b of bases) {
        const candidate = b * m;
        const diff = Math.abs(candidate - n);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = candidate;
        }
      }
    }
    return best;
  };

  if (a >= b * THRESHOLD) {
    const rawMultiplier = a / Math.max(1, b);
    const multiplier = niceRound(rawMultiplier);
    B.effectivePower = B.powerlevel * multiplier;
    B.mutatedCount = multiplier;
    A.effectivePower = A.powerlevel;
    return [A, B];
  }

  if (b >= a * THRESHOLD) {
    const rawMultiplier = b / Math.max(1, a);
    const multiplier = niceRound(rawMultiplier);
    A.effectivePower = A.powerlevel * multiplier;
    A.mutatedCount = multiplier;
    B.effectivePower = B.powerlevel;
    return [A, B];
  }

  A.effectivePower = A.powerlevel;
  B.effectivePower = B.powerlevel;
  return [A, B];
};
