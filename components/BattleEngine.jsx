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

  const setFlexPercent = (value) => {
    const leftDiv = document.getElementById('LeftSide');
    const rightDiv = document.getElementById('RightSide');
    if (!leftDiv || !rightDiv) return;

    const parent = leftDiv.parentElement;
    const parentStyle = parent ? getComputedStyle(parent) : null;
    const isColumn = parentStyle?.flexDirection?.startsWith('column');

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
  };

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

    setLeft(leftChar);
    setRight(rightChar);
    setResult(null);
    setPercent(0);
    setShowingResult(false);

    setTimeout(() => {
      updateSide('LeftSide', leftChar);
      updateSide('RightSide', rightChar);
      setFlexPercent(50);
      setSideName('LeftSide', leftChar.name);
      setSideName('RightSide', rightChar.name);
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
    if (nameEl) nameEl.textContent = character.name || 'Loading...';
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
            clearInlineSizing();
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
    if (deathTimeoutRef.current) {
      clearTimeout(deathTimeoutRef.current);
      deathTimeoutRef.current = null;
    }

    const leftPower = left.powerlevel;
    const rightPower = right.powerlevel;
    const leftPercent = calculatePercent(leftPower, rightPower);
    const rightPercent = 100 - leftPercent;

    const winner = leftPower >= rightPower ? 'left' : 'right';
    setResult(winner);

    let current = 50;
    const target = side === 'left' ? leftPercent : rightPercent;
    setAnimating(true);

    // replace names with starting percents
    setSidePercent('LeftSide', 50);
    setSidePercent('RightSide', 50);

    // replace this animIntervalRef.current = setInterval(...) block inside handlePick
    const direction = target > 50 ? 1 : -1;
    animIntervalRef.current = setInterval(() => {
      // continue moving current toward target in either direction
      if ((direction === 1 && current < target) || (direction === -1 && current > target)) {
        current += direction;
        setPercent(current);
        const visualLeft = side === 'left' ? current : 100 - current;
        setFlexPercent(visualLeft);

        const leftDisplay = side === 'left' ? current : 100 - current;
        const rightDisplay = 100 - leftDisplay;
        setSidePercent('LeftSide', leftDisplay);
        setSidePercent('RightSide', rightDisplay);
      } else {
        // reached target (or target was on the other side); ensure final sizing is applied
        clearInterval(animIntervalRef.current);
        animIntervalRef.current = null;

        setPercent(target);
        const finalLeft = side === 'left' ? target : 100 - target;
        const finalRight = 100 - finalLeft;

        // make sure the visual sizing is applied for the final state
        setFlexPercent(finalLeft);
        setSidePercent('LeftSide', finalLeft);
        setSidePercent('RightSide', finalRight);

        setShowingResult(true);
        setAnimating(false);

        // if user picked the weaker side, show Death dialog after 4s
        if (side !== winner) {
          deathTimeoutRef.current = setTimeout(() => {
            if (typeof window.Death === 'function') window.Death();
            deathTimeoutRef.current = null;
          }, 4000);
        }

        // schedule next battle after 10s regardless
        nextTimeoutRef.current = setTimeout(() => {
          nextBattle();
        }, 10000);
      }
    }, 10);

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
