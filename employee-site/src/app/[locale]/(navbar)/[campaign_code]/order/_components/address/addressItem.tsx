type AddressItemProps = {
  label: string;
  value: string | undefined;
};

const AddressItem = ({ label, value }: AddressItemProps) => (
  <div className="flex justify-between my-4">
    <span className="font-semibold">{label}</span>
    <span className="text-primary-100">{value || ''}</span>
  </div>
);

export default AddressItem;
