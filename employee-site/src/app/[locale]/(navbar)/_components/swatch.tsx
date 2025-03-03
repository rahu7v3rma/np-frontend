import { clsx } from 'clsx';
import { FaCheck } from 'react-icons/fa6';

export type ColorType = {
  id: string;
  bg: string;
  name: string;
};

type SwatchProps = {
  colors?: ColorType[];
  selectedItem?: ColorType | null;
  readonly?: boolean;
  onSelectionChange?: (color: ColorType) => void;
};

const defaultColors = [
  {
    id: 'a',
    bg: '#2B324C',
    name: 'red',
  },
  {
    id: 'b',
    name: 'red',
    bg: '#CFD5E5',
  },
  {
    id: 'c',
    name: 'red',
    bg: '#5C606C',
  },
  {
    id: 'd',
    name: 'red',
    bg: '#FA9A8C',
  },
  {
    id: 'e',
    name: 'red',
    bg: '#FFAC82',
  },
  {
    id: 'f',
    name: 'red',
    bg: '#B71D18',
  },
];

export default function Swatch({
  colors = defaultColors,
  readonly = false,
  selectedItem = null,
  onSelectionChange = () => {},
}: SwatchProps) {
  return (
    <div className="flex gap-2">
      {colors.map((item) => (
        <div key={item.id} className="flex justify-center items-center h-7">
          <div
            className={clsx(
              'flex justify-center items-center rounded-full',
              selectedItem && selectedItem.id === item.id
                ? 'w-7 h-7 outline outline-2 outline-[#2B324C14] shadow-[4px_4px_8px_0px_rgba(0,167,111,0.24)]'
                : 'w-5 h-5',
              readonly ? '' : 'cursor-pointer',
              selectedItem?.id !== item.id &&
                ['#ffffff', '#000000'].includes(item.id)
                ? 'outline outline-2 outline-gray-400'
                : '',
            )}
            style={{
              backgroundColor: item.bg,
            }}
            onClick={() => !readonly && onSelectionChange(item)}
          >
            {selectedItem && selectedItem.id === item.id && (
              <FaCheck
                className={`w-4 ${item.id === '#FFFFFF' ? '' : 'text-white'}`}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
