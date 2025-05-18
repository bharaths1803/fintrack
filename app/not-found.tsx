export const dynamic = "force-dynamic";

import Link from "next/link";

const notfound = () => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center mx-20">
      <p className="text-white">Sorry, this page isn't available.</p>
      <p className="text-white">
        <Link className="cursor-pointer" href={"/"}>
          Go back to FinTrack
        </Link>
      </p>
    </div>
  );
};

export default notfound;
