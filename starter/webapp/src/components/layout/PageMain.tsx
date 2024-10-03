import { FC, ReactNode } from "react";

interface PageMainProps {
  children: ReactNode;
}

const PageMain: FC<PageMainProps> = ({ children }) => {
  return (
    <main>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
};

export default PageMain;
