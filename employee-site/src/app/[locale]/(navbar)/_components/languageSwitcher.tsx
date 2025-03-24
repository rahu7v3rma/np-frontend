'use client';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import Image from 'next/image';

import { useChangeLocale, useCurrentLocale } from '@/locales/client';

export default function LanguageSwitcher() {
  const changeLocale = useChangeLocale({ preserveSearchParams: true });
  const currentLocale = useCurrentLocale();

  return (
    <>
      <Dropdown
        placement={currentLocale === 'en' ? 'bottom-end' : 'bottom-start'}
        className={`min-w-40 p-0 mt-5 relative z-[1] shadow-dropdown bg-white ${currentLocale === 'en' ? 'before:right-[10px]' : 'before:left-[10px]'} before:absolute before:content-[''] before:w-[15px] before:h-[15px] before:rounded-[4px] before:top-[-5px] before:bg-white/100 before:shadow-dropdown before:rotate-45 before:z-[-1] z-[1]`}
      >
        <DropdownTrigger>
          <Image
            src={`${currentLocale === 'en' ? '/us-flag.svg' : '/israel-flag.svg'}`}
            alt="US or Israel Flag"
            width={28}
            height={20}
            className="cursor-pointer hover:opacity-90"
          />
        </DropdownTrigger>
        <DropdownMenu
          variant="flat"
          className="before:content-[''] before:w-[80px] before:h-[80px] before:absolute before:bg-[#FF56301F] before:rounded-full before:blur-[27px] before:bottom-[-25px] before:left-[-25px] overflow-hidden p-1 after:content-[''] after:absolute after:bg-[#CFD5E51F] after:rounded-full after:blur-[27px] after:top-[-10px] after:right-[-10px] after:w-[80px] after:h-[80px] z-[1] before:z-[-1] after:z-[-1] rounded-large bg-white"
          selectionMode="single"
          selectedKeys={[currentLocale]}
          onSelectionChange={(keys) =>
            changeLocale(Array.from(keys)[0] as 'en' | 'he')
          }
          hideSelectedIcon
          disallowEmptySelection
          autoFocus
          itemClasses={{
            base: ['data-[hover=true]:bg-[#BDBDBD29]'],
          }}
        >
          <DropdownItem key="en">
            <div className="flex">
              <Image
                src="/us-flag.svg"
                alt="US Flag"
                width={28}
                height={20}
                className={`${currentLocale === 'en' ? 'mr-2' : 'ml-2'}`}
              />
              <span>English</span>
            </div>
          </DropdownItem>
          <DropdownItem key="he">
            <div className="flex">
              <Image
                src="/israel-flag.svg"
                alt="Israel Flag"
                width={28}
                height={20}
                className={`${currentLocale === 'he' ? 'mr-2' : 'ml-2'}`}
              />
              <span>עברית</span>
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
}
