import { Icon } from '@iconify/react/dist/iconify.js';
import { Input as UiInput } from '@nextui-org/react';
import { ComponentProps } from 'react';

import Error from './_components/error';

function Input({
  isInvalid,
  value,
  errorMessage,
  ...props
}: ComponentProps<typeof UiInput>) {
  return (
    <div className="flex-1">
      <UiInput
        value={value}
        isInvalid={isInvalid}
        labelPlacement={'outside'}
        classNames={{
          base: '!mt-0',
          input: `${isInvalid ? '!text-[#363829] group-focus-within:!text-[#363839]' : 'text-[#363839]'}`,
          inputWrapper: `[&>div]:h-[22px] border-1 py-4 px-[14px] text-[14px] font-[400] h-auto ${isInvalid ? '!border-[#FF5630] group-focus-within:!border-[#363839] border-2' : 'border-[#BDBDBD7A]'} ${value ? 'border-[#363839] text-[#363839]' : 'border-[#BDBDBD7A]'} group-focus-within:${value ? 'border-1' : 'border-2'} group-hover:border-[#363839]`,
          label: `!text-[#BDBDBD] text-[14px] leading-[12px] font-[400] bg-white w-max ${!value ? 'group-focus-within:!text-[#363839]' : ''} group-focus-within:text-[12px] group-focus-within:mt-[6px] group-focus-within:ml-[11px] group-focus-within:px-[3px] ${value ? '!text-category-default ml-[11px] px-[3px] text-[12px] font-[600] leading-[12px] mt-[6px]' : ''} group-focus-within:font-[600] ${isInvalid ? '!text-[#FF5630] group-focus-within:!text-[#363839]' : ''}`,
        }}
        {...props}
      />
      {errorMessage && typeof errorMessage === 'string' && (
        <Error error={errorMessage} />
      )}
    </div>
  );
}

export default Input;
