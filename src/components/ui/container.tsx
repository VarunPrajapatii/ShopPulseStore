import React from "react";

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="mx-auto w-full px-3 sm:px-4 lg:px-6">
        {children}
    </div>
  );
};

export default Container;
