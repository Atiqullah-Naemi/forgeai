import { NavMenu } from "@/components/nav-menu";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col h-dvh">
      <NavMenu />
      <div className="flex flex-1 justify-center items-center flex-col">
        {children}
      </div>
    </main>
  );
}
