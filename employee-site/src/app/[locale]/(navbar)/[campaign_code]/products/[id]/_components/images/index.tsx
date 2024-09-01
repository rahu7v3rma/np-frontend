'use client';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { FreeMode, Navigation, Thumbs, Pagination } from 'swiper/modules';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';

import './styles.css';
import { useCurrentLocale } from '@/locales/client';
import Logo from '@/shared/Logo';
import { ProductImage } from '@/types/product';
import { sortProductImages } from '@/utils/product';

type Props = {
  images: ProductImage[] | undefined;
  brandLogo: string | undefined;
};

export default function Images({ images, brandLogo }: Props) {
  const [swiper, setSwiper] = useState<SwiperClass>();

  // Below state is used to rerender the component when swiper slide changes, to support custom pagination
  const [swiperCurrentPage, setSwiperCurrentPage] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  const sortedImages = useMemo(() => {
    if (images === undefined) {
      return undefined;
    } else {
      // sort the images array so that the main image is first
      const sortedImages = [...images];
      sortProductImages(sortedImages);

      return sortedImages;
    }
  }, [images]);

  const locale = useCurrentLocale();

  return (
    <div className="flex justify-center items-center">
      <div className="w-full">
        <Swiper
          onSwiper={setSwiper}
          onSlideChange={(swiper) =>
            setSwiperCurrentPage(swiper.activeIndex + 1)
          }
          spaceBetween={10}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[FreeMode, Navigation, Thumbs, Pagination]}
          className="mainSwiper w-full relative bg-gray-100 rounded-2xl !z-0"
        >
          {sortedImages?.map((productImg, index) => (
            <SwiperSlide key={index}>
              <div className="flex w-full h-[45vw]">
                <Image
                  src={productImg.image}
                  alt={'Product Image'}
                  layout="responsive"
                  width={0}
                  height={0}
                  loading="eager"
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
          {/* Brand Image */}
          <div className="absolute top-0 z-10 mx-2 my-2">
            {brandLogo ? (
              <Image src={brandLogo} height={22} width={80} alt="Brand Logo" />
            ) : null}
          </div>
          {!!swiper && !swiper.destroyed && (
            <div className="absolute w-full bottom-0 z-10 flex justify-end">
              <span className="inline-flex items-center gap-0.5 py-1 bg-primary text-white rounded-lg text-sm mx-2 my-2">
                <span
                  className={`px-2 cursor-pointer ${swiper.activeIndex === 0 ? 'opacity-40 pointer-events-none' : ''}`}
                  onClick={() => swiper.slideTo(swiper.activeIndex - 1)}
                >
                  {locale === 'he' ? <FaChevronRight /> : <FaChevronLeft />}
                </span>
                <span>{swiper.activeIndex + 1}</span> /
                <span>{swiper.slides.length}</span>
                <span
                  className={`px-2 cursor-pointer ${swiper.activeIndex === swiper.slides.length - 1 ? 'opacity-40 pointer-events-none' : ''}`}
                  onClick={() => swiper.slideTo(swiper.activeIndex + 1)}
                >
                  {locale === 'he' ? <FaChevronLeft /> : <FaChevronRight />}
                </span>
              </span>
            </div>
          )}
        </Swiper>
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={
            typeof window !== 'undefined' && window.innerWidth >= 768 ? 5 : 3
          }
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="childSwiper mt-4 !z-0"
        >
          {sortedImages?.map((productImg, index) => (
            <SwiperSlide key={index}>
              <Image
                src={productImg.image}
                alt={'Product Image'}
                layout="responsive"
                width={0}
                height={0}
                className="object-cover rounded-lg min-h-full min-w-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
