// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CategorySkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <div className="flex p-4 flex-col items-center w-24 gap-2">
        <div className="h-8 w-9 bg-white" />
        <div className="h-4 w-12 bg-gray-200" />
      </div>
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <>
      <CategorySkeleton />
      <CategorySkeleton />
      <CategorySkeleton />
      <CategorySkeleton />
      <CategorySkeleton />
      <CategorySkeleton />
      <CategorySkeleton />
      <CategorySkeleton />
      <CategorySkeleton />
      <CategorySkeleton />
    </>
  );
}
