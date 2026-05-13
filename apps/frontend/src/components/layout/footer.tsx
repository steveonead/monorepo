import { Home01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@tanstack/react-router';

const today = new Date();

export default function Footer() {
  'use memo';

  return (
    <footer className="mt-auto border-t bg-black/80 p-4 text-white">
      <nav className="mb-2 flex justify-center gap-4 text-sm text-gray-300">
        <Link
          to="/"
          className="flex items-center gap-1 hover:text-gray-100"
        >
          <HugeiconsIcon
            icon={Home01Icon}
            size={16}
          />
          Home
        </Link>
        <Link
          to="/about"
          className="flex items-center gap-1 hover:text-gray-100"
        >
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={16}
          />
          About
        </Link>
      </nav>
      <p className="text-center text-sm text-gray-400">
        &copy; {today.getFullYear()} Ito. All rights reserved.
      </p>
    </footer>
  );
}
