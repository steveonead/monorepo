import { Link } from '@tanstack/react-router';

export default function Header() {
  'use memo';

  return (
    <header className="flex items-center p-2 text-2xl font-bold">
      <Link to="/">Ito</Link>
    </header>
  );
}
