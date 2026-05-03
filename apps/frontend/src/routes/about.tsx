import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  const [isClicked, setIsClicked] = useState(false);
  const ref = useRef(0);

  function myFn() {
    console.log(123);
  }

  useEffect(() => {
    if (isClicked) {
      myFn();
      ref.current += 1;
    }
  }, [isClicked]);

  return (
    <div className={cn('m-10 bg-amber-50 p-2 text-red-500', isClicked && 'text-blue-500')}>
      <h3>About</h3>
      <button
        type="button"
        onClick={() => setIsClicked((prev) => !prev)}
      >
        click
      </button>
    </div>
  );
}
