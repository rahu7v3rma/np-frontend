import Link from 'next/link';

export type BreadcrumbItemType = {
  label: string;
  link: string;
};

const capitalize = (str: string) =>
  `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

export default function Breadcrumbs({
  items,
}: {
  items: BreadcrumbItemType[];
}) {
  return (
    <ul className="flex items-center">
      {items.map((item, index) => {
        return (
          <li key={item.label} className="flex items-center">
            {index !== 0 && (
              <span className="inline-block mx-4 w-1 h-1 rounded bg-gray-400"></span>
            )}
            <Link
              href={item.link}
              className={
                items.length === index + 1
                  ? 'text-gray-400 pointer-events-none'
                  : 'text-primary hover:text-gray-400'
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
