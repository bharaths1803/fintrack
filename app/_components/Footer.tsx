const Footer = () => {
  return (
    <footer className="bg-white border-gray-100 border-t w-full">
      <div className="mx-auto pb-6 pt-4 px-4 sm:px-6 lg:px-8 ">
        <div className="text-gray-500 text-sm text-center">
          @ {new Date().getFullYear()} FinTrack. All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
