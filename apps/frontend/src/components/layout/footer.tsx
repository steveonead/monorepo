const today = new Date();

export default function Footer() {
  'use memo';

  return (
    <footer className="mt-auto border-t bg-black/80 p-4 text-white">
      <p className="text-center text-sm text-gray-400">
        &copy; {today.getFullYear()} Ito. All rights reserved.
      </p>
    </footer>
  );
}
