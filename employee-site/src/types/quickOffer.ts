export interface Tag {
  name: string;
}

export interface QuickOfferDetailsType {
  id: number;
  tags: Tag[];
  name: string;
  code: number;
  quick_offer_type: 'EVENT';
  ship_to: 'TO_OFFICE' | 'TO_EMPLOYEES';
  status: 'PENDING' | 'OFFER' | 'ACTIVE' | 'FINISHED';
  login_page_title: string;
  login_page_subtitle: string;
  main_page_first_banner_title: string | null;
  main_page_first_banner_subtitle: string | null;
  main_page_first_banner_image: string;
  main_page_first_banner_mobile_image: string | null;
  main_page_second_banner_title: string;
  main_page_second_banner_subtitle: string | null;
  main_page_second_banner_background_color: string;
  main_page_second_banner_text_color: 'BLACK' | 'WHITE';
  sms_sender_name: string;
  sms_welcome_text: string;
  email_welcome_text: string;
  login_page_image: string | null;
  login_page_mobile_image: string | null;
  auth_method: 'EMAIL' | 'PHONE_NUMBER' | 'AUTH_ID';
  phone_number: string | null;
  email: string | null;
  nicklas_status:
    | 'WAITING_TO_CLIENT'
    | 'CLIENT_WAIT_TO_ORDER'
    | 'NEGOTIATION_ON_PRICES'
    | 'WAITING_TO_NEW_PRODUCTS'
    | 'OFFER_APPROVED';
  client_status:
    | 'READY_TO_CHECK'
    | 'CLIENT_ADDED_TO_LIST'
    | 'LIST_CHANGED_AFTER_APPROVE';
  last_login: string | null;
  selected_products: string[];
  organization_name: string;
  organization_logo_image: string;
  campaign_type?: string;
  is_active: boolean;
}
