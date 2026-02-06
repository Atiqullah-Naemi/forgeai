import { NavMenu } from "@/components/nav-menu";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="antialiased flex flex-col min-h-dvh h-full bg-[#fcfbf8]">
      <NavMenu />
      <div className="flex flex-1 justify-center items-center flex-col">
        {children}
      </div>
    </main>
  );
}
