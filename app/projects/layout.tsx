export default function PorjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="relative antialiased flex flex-col w-full h-dvh justify-center items-center
    bg-[#fcfbf8] overflow-hidden
    "
    >
      {children}
    </main>
  );
}
