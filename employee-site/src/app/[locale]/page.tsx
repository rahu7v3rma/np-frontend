export default async function App() {
  return (
    <div className="flex justify-center p-8">
      <div className="md:w-[600px]">
        <h1 className="text-center p-8 text-xl font-bold">
          Needs to add campaign_code in the url
        </h1>
        <ul className="text-center list-disc px-6">
          <li className="my-2">
            For login with email add{' '}
            <span className="font-bold">/your_campaign_code/e</span> in the
            current url
          </li>
          <li className="my-2">
            For login with phone number add{' '}
            <span className="font-bold">/your_campaign_code/p</span> in the
            current url
          </li>
          <li className="my-2">
            For login with auth id{' '}
            <span className="font-bold">/your_campaign_code/a</span> in the
            current url
          </li>
        </ul>
      </div>
    </div>
  );
}
