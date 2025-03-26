interface SpotifySearchFormProps {
  defaultSearchQuery: string;
}

export function SpotifySearchForm({
  defaultSearchQuery,
}: SpotifySearchFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="border h-[40px] border-neutral-700 flex rounded-lg overflow-hidden"
    >
      <input
        type="text"
        defaultValue={defaultSearchQuery}
        key={defaultSearchQuery}
        className="h-full flex-1 bg-neutral-800 px-3 ring-1 ring-neutral-700"
      />
      <button
        type="submit"
        className="cursor-pointer active:outline-4 outline-neutral-600 bg-neutral-800 hover:brightness-115 w-max px-3 ring-1 ring-neutral-700"
      >
        Send
      </button>
    </form>
  );
}
