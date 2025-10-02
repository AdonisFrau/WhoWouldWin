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

  // helper: set width (row) or height (column) percent with a transition
  const setFlexPercent = (value) => {
    const leftDiv = document.getElementById('LeftSide');
    const rightDiv = document.getElementById('RightSide');
    if (!leftDiv || !rightDiv) return;

    const parent = leftDiv.parentElement;
    const parentStyle = parent ? getComputedStyle(parent) : null;
    const isColumn = parentStyle?.flexDirection?.startsWith('column');

    // smooth transition
    const trans = 'width 220ms ease, height 220ms ease';
    leftDiv.style.transition = trans;
    rightDiv.style.transition = trans;

    if (isColumn) {
      if (parent) parent.style.height = parent.style.height || '100vh';
      // lock flex so height is respected
      leftDiv.style.flex = `0 0 ${value}%`;
      rightDiv.style.flex = `0 0 ${100 - value}%`;
      leftDiv.style.height = `${value}%`;
      rightDiv.style.height = `${100 - value}%`;
      leftDiv.style.width = '';
      rightDiv.style.width = '';
    } else {
      // row layout -> control widths AND lock flex so flex:1 doesn't override
      leftDiv.style.flex = `0 0 ${value}%`;
      rightDiv.style.flex = `0 0 ${100 - value}%`;
      leftDiv.style.width = `${value}%`;
      rightDiv.style.width = `${100 - value}%`;
      leftDiv.style.height = '';
      rightDiv.style.height = '';
      if (parent) parent.style.height = '';
    }
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
    }
    if (rightDiv) {
      rightDiv.style.transition = '';
      rightDiv.style.width = '';
      rightDiv.style.height = '';
      rightDiv.style.flex = '';
    }
    if (parent) {
      parent.style.height = '';
      parent.style.minHeight = '';
    }
  };

  // pick two characters based on allowed types
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

    setLeft(leftChar);
    setRight(rightChar);
    setResult(null);
    setPercent(0);
    setShowingResult(false);

    // small delay to ensure DOM nodes exist (BattleEngine can mount before page nodes)
    setTimeout(() => {
      updateSide('LeftSide', leftChar);
      updateSide('RightSide', rightChar);
      // visual start 50/50
      setFlexPercent(50);
    }, 30);
  };

  // update the existing divs
  const updateSide = (id, character) => {
    const container = document.getElementById(id);
    if (!container) return;

    // update image
    const img = container.querySelector('img');
    if (img) {
      img.src = character.img || '/img/Placeholder.png';
      img.onerror = () => {
        console.error(`Failed to load ${character.name}, using placeholder.`);
        img.src = '/img/Placeholder.png';
      };
    }

    // update name
    const nameEl = container.querySelector('p');
    if (nameEl) nameEl.textContent = character.name || 'Loading...';
  };

  useEffect(() => {
    pickCharacters();
    // expose nextBattle for debugging/test from console
    window.nextBattle = nextBattle;
    return () => {
      try {
        delete window.nextBattle;
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedTypes]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      clearInlineSizing();
    };
  }, []);

  const calculatePercent = (a, b) => {
    const total = a + b;
    return Math.max(2, Math.round((a / total) * 100));
  };

  // nextBattle: animate back to 50/50 then load new pair
  function nextBattle() {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      animIntervalRef.current = null;
    }
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }

    const leftDiv = document.getElementById('LeftSide');
    const parent = leftDiv?.parentElement;
    const start = percent || (showingResult ? percent : 50);
    const target = 50;
    let current = start;
    const step = 2; // percent per tick
    setAnimating(true);

    // ensure a height anchor for column layout
    const parentStyle = parent ? getComputedStyle(parent) : null;
    const isColumn = parentStyle?.flexDirection?.startsWith('column');
    if (isColumn && parent) parent.style.height = parent.style.height || '100vh';

    animIntervalRef.current = setInterval(() => {
      if (Math.abs(current - target) <= step) {
        current = target;
        setPercent(current);
        setFlexPercent(current);
        clearInterval(animIntervalRef.current);
        animIntervalRef.current = null;
        // short pause then pick new characters
        setTimeout(() => {
          pickCharacters();
          setAnimating(false);
          setPercent(0);
          // restore responsiveness after small delay
          setTimeout(clearInlineSizing, 80);
        }, 200);
      } else {
        current += current < target ? step : -step;
        setPercent(current);
        setFlexPercent(current);
      }
    }, 12);
  }

  const handlePick = (side) => {
    if (!left || !right) return;

    // clear any pending nextBattle timeout while user picks
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      animIntervalRef.current = null;
    }

    const leftPower = left.powerlevel;
    const rightPower = right.powerlevel;
    const leftPercent = calculatePercent(leftPower, rightPower);
    const rightPercent = 100 - leftPercent;

    const winner = leftPower >= rightPower ? 'left' : 'right';
    setResult(winner);

    // animate percentage overlay AND main-axis sizing towards the result
    let current = 50; // always start visual animation from 50/50
    const target = side === 'left' ? leftPercent : rightPercent;
    setAnimating(true);

    animIntervalRef.current = setInterval(() => {
      if (current < target) {
        current += 1;
        setPercent(current);
        const visualLeft = side === 'left' ? current : 100 - current;
        setFlexPercent(visualLeft);
      } else {
        clearInterval(animIntervalRef.current);
        animIntervalRef.current = null;
        // Show final result and keep layout AT final percent for user to take in
        setPercent(target);
        setShowingResult(true);
        setAnimating(false);

        // schedule nextBattle after 10s
        nextTimeoutRef.current = setTimeout(() => {
          nextBattle();
        }, 10000);
      }
    }, 10);

    // call Death if picked weaker
    if (side !== winner) {
      if (typeof window.Death === 'function') window.Death();
      console.log('You picked the weaker one!');
    } else {
      console.log('You won!');
    }
  };

  // attach click handlers to the left/right divs
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
    // left/right are dependencies so handlers update when characters change
  }, [left, right]);

  // show percent overlay while animating or when showing result
  return (animating || showingResult) ? (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      <p className="text-white text-3xl font-bold">{percent}%</p>
    </div>
  ) : null;
}
