import Image from "next/image"

export const Header = () => {
  return (
    <header className="w-full flex items-center justify-center px-4 py-3 bg-background border-b border-border">
      <div className="flex items-center gap-2">
        <Image
          src="/images/logo-ltk.png"
          alt="App Logo"
          width={32}
          height={32}
          className="object-contain"
        />
        <span className="text-lg font-bold tracking-tight">Fittly</span>
      </div>
    </header>
  )
}
