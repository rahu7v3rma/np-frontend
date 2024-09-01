import Image from 'next/image';

export default function IconBtn({
  background = 'bg-slate-900',
  value,
  src,
  textColor = 'text-white',
  onClick,
  iconClassName = '',
}: any) {
  return (
    <div
      onClick={onClick}
      className={`${background} flex w-auto justify-center items-center border-2 rounded-lg border-slate-200 h-12 mx-0.5 md:mx-2 px-2 md:px-4`}
    >
      <Image
        src={src}
        alt="Icon"
        width={24}
        height={24}
        className={`w-4 h-4 md:w-6 md:h-6 object-contain ${iconClassName}`}
      />
      <div className="w-2" />
      <p className={`${textColor} font-bold text-sm `}>{value}</p>
    </div>
  );
}
