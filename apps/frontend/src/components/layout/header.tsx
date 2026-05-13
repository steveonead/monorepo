import { Link } from '@tanstack/react-router';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

export default function Header() {
  'use memo';

  const frameworks = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'] as const;

  return (
    <div className="flex gap-2 p-2 text-2xl">
      <Link
        to="/"
        activeProps={{
          className: 'font-bold',
        }}
        activeOptions={{ exact: true }}
        data-test="home-link"
      >
        Home
      </Link>
      <Link
        to="/about"
        activeProps={{
          className: 'font-bold',
        }}
        data-test="about-link"
      >
        About
      </Link>
      <Combobox items={frameworks}>
        <ComboboxInput
          placeholder="Select a framework"
          className="has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot][aria-invalid=true]]:ring-2"
        />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem
                key={item as string}
                value={item as string}
              >
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
