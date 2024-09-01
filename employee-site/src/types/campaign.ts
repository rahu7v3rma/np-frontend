export interface CampaignDetailsType {
  name: string;
  is_active: boolean;
  code: number;
  organization_name: string;
  organization_logo_image: string | null;
  login_page_title: string;
  login_page_subtitle: string;
  main_page_first_banner_title: string;
  main_page_first_banner_subtitle: string;
  main_page_first_banner_image: string;
  main_page_first_banner_mobile_image: string;
  main_page_second_banner_title: string;
  main_page_second_banner_subtitle: string;
  main_page_second_banner_background_color: string;
  main_page_second_banner_text_color: 'BLACK' | 'WHITE';
  delivery_location: string;
  office_delivery_address: string | null;
  displayed_currency: 'CURRENCY' | 'COINS';
  product_selection_mode: 'SINGLE' | 'MULTIPLE';
  budget_per_employee: number;
  employee_order_reference: number | null;
  employee_name: string;
  login_page_image: string;
  login_page_mobile_image: string;
}
