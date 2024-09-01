import Image from 'next/image';

// NOTE: this is an example shared component

export default function Logo() {
  return (
    <Image
      className="relative"
      src="/logo.png"
      alt="App Logo"
      width={48}
      height={48}
      priority
    />
  );
}
