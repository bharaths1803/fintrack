import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="pt-20 flex items-center justify-center">{children}</div>
  );
};

export default AuthLayout;
