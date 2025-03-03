import { useI18n } from '@/locales/client';
import { CampaignDetailsType, DeliveryLocation } from '@/types/campaign';
import { Order } from '@/types/order';

import AddressItem from './addressItem';

interface DeliveryAddressProps {
  campaignDetails: CampaignDetailsType;
  order: Order;
}

const DeliveryAddress = ({ campaignDetails, order }: DeliveryAddressProps) => {
  const t = useI18n();
  const isHomeDelivery =
    campaignDetails?.delivery_location === DeliveryLocation.ToHome;

  const renderHomeDeliveryAddress = () => (
    <div>
      <div className="mt-4 mb-6">
        <p className="font-semibold">{t('order.homeDelivery')}</p>
      </div>
      <div className="text-sm ml-2">
        {[
          { label: t('checkout.fullName'), value: order?.full_name },
          { label: t('checkout.phone'), value: order?.phone_number },
          {
            label: t('checkout.additionalPhone'),
            value: order?.additional_phone_number,
          },
          { label: t('checkout.city'), value: order?.delivery_city },
          { label: t('checkout.street'), value: order?.delivery_street },
          { label: t('checkout.number'), value: order?.delivery_street_number },
          {
            label: t('checkout.apartment'),
            value: order?.delivery_apartment_number,
          },
          {
            label: t('checkout.moreDetails'),
            value: order?.delivery_additional_details,
          },
        ].map((item, index) => (
          <AddressItem key={index} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  );

  const renderOfficeDeliveryAddress = () => (
    <div>
      <div className="mt-4 mb-6">
        <p className="font-semibold">{t('order.officeDelivery')}</p>
      </div>
      <div className="text-sm text-primary-100 mt-2">
        <span>{campaignDetails?.office_delivery_address || ''}</span>
      </div>
    </div>
  );

  return isHomeDelivery
    ? renderHomeDeliveryAddress()
    : renderOfficeDeliveryAddress();
};

export default DeliveryAddress;
