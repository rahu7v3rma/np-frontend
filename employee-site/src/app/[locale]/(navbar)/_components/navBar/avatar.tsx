import { Avatar as BaseAvatar } from '@nextui-org/avatar';
import { FunctionComponent, useCallback } from 'react';

type Props = {
  fullName: string;
};

const Avatar: FunctionComponent<Props> = ({ fullName }) => {
  const getInitials = useCallback((name: string) => {
    const splitName = name.split(' ');
    const firstLetters = splitName
      .map((n) => (n.length > 0 ? n[0].toUpperCase() : undefined))
      .filter((l) => l);

    if (firstLetters.length === 0) {
      return '';
    } else if (firstLetters.length === 1) {
      return firstLetters[0]!;
    } else {
      // return only the first letters of the first and last words of the
      // name
      return `${firstLetters[0]}${firstLetters[splitName.length - 1]}`;
    }
  }, []);

  if (fullName) {
    return (
      <BaseAvatar
        className="w-10 h-10 bg-avatar-background"
        classNames={{
          name: 'text-sm font-semibold text-avatar-text',
        }}
        name={fullName}
        getInitials={getInitials}
      />
    );
  } else {
    return null;
  }
};

export default Avatar;
