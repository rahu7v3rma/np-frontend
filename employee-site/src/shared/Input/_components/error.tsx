import { Icon } from '@iconify/react/dist/iconify.js';
import React from 'react';

interface Props {
  error: string;
}
function Error({ error }: Props) {
  return (
    <div className="w-full mt-2 px-3 flex gap-1 items-center">
      <div>
        <Icon
          icon="ph:warning-fill"
          color="#FF5630"
          fontSize="16"
          className="cursor-pointer"
        />
      </div>
      <label className="font-normal text-xs leading-[18px] text-alert">
        {error}
      </label>
    </div>
  );
}

export default Error;
