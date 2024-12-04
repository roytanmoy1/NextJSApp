'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams,useRouter,usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathName = usePathname(); // ${pathname} is the current path, in your case, "/dashboard/invoices".
  const { replace } = useRouter();

  // The above hooks are used to create the dynamic URL for our request

  // Params will come like - ?page=1&query=a
  // this useDebouncedCallback - will wait for the user to finish typing then search for that param in the database
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    term ? params.set('query', term) : params.delete('query');
    replace(`${pathName}?${params.toString()}`);
    // replace(${pathname}?${params.toString()}) updates the URL with the user's search data. For example, /dashboard/invoices?query=lee if the user searches for "Lee".

    // Now we have created the dynamic url using nextjs client side navigation and some nextjs hooks
  },300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()}
        // As the user types into the search bar, params.toString() translates this input into a URL-friendly format.
      />
        
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
