import { Skeleton } from '@nextui-org/react';

const OrderDetailsSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-[400px] space-y-5">
        <Skeleton className="rounded-lg">
          <div className="h-12 rounded-lg bg-secondary"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-48 rounded-lg bg-secondary"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-48 rounded-lg bg-secondary"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-12 rounded-lg bg-secondary"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-12 rounded-lg bg-secondary"></div>
        </Skeleton>
      </div>
    </div>
  );
};

export default OrderDetailsSkeleton;
