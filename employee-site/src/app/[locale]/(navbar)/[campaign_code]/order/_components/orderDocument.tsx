/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable prettier/prettier */
'use client';

import { Page, Text, View, Document, Image, Font } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

import { useI18n } from '@/locales/client';

Font.register({
  family: 'Assistant',
  fonts: [
    {
      fontWeight: 400,
      src: '/fonts/assistant/Assistant-Regular.ttf',
    },
    {
      fontWeight: 600,
      src: '/fonts/assistant/Assistant-SemiBold.ttf',
    },
    {
      fontWeight: 700,
      src: '/fonts/assistant/Assistant-Bold.ttf',
    }
  ]
})

export default function OrderDocument({ locale }: { locale: string}) {
  const t = useI18n();
  const tw = createTw({
    theme: {
      extend: {
        colors: {
          primary: "#363839",
        },
      },
    },
  });

  const products = [
    {
      quantity: 1,
      image: '/kitchen-icon.svg',
      name: 'Product name',
      description: 'Lorem ipsum dolor sit amet, consectetur',
    },
  ];

  return (
    <Document>
      <Page size="A4" style={[tw('p-12 leading-6'), locale === 'he' ? { fontFamily: 'Assistant' } : {}]}>
        <View style={tw('flex flex-col items-center')}>
          <Text style={tw('text-3xl font-bold leading-6')}>
            {t('order.greeting')}
          </Text>
          <Text style={tw('text-3xl font-bold leading-6')}>1234</Text>
          <View style={tw('flex flex-col justify-center items-center my-5')}>
            <Image
              src="http://localhost:3000/logo.png"
              style={{ height: 64, width: 64 }}
            ></Image>
            <Text style={tw('mt-2')}>{t('order.scancode')}</Text>
          </View>
          <Text style={tw('my-6 text-lg leading-6 text-center')}>
            {t('order.greetingDescription')}
          </Text>
          <View style={tw('w-3/5')}>
            <View
              style={tw('p-6 bg-white rounded-xl border border-slate-200')}
            >
              <View>
                {products.map((product) => (
                  <View style={tw('mb-4')} key={product.name}>
                    <Text
                      style={tw('text-primary font-bold')}
                    >
                      {product?.quantity} {t('common.item')}
                    </Text>
                    <View style={tw('flex flex-row gap-4 items-center mt-6')}>
                      <View style={tw('bg-gray-100 p-4 rounded-lg')}>
                        <Image
                          src={'http://localhost:3000/logo.png'}
                          style={{ height: 64, width: 64 }}
                        ></Image>
                      </View>
                      <Text style={tw('flex-1 text-primary-100 text-sm mr-4')}>
                        {product?.name} - {product?.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View
                style={tw('my-6 border-dashed border-t-2 border-slate-200')}
              />
              <View
                style={tw('flex flex-row justify-between font-semibold')}
              >
                <Text>{t('common.total')}</Text>
                <Text>{t('currencySymbol')} 384</Text>
              </View>
              <View
                style={tw('my-6 border-dashed border-t-2 border-slate-200')}
              />
              <View style={tw('mb-4')}>
                <Text style={tw('font-semibold')}>{t('order.officeDelivery')}</Text>
                <Text style={tw('text-sm text-primary-100 mt-2')}>
                  {t('order.officeDeliveryDescription')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
