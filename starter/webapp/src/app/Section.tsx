import { FC, ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
}

const Section: FC<SectionProps> = ({ children }) => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
      <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
        {children}
      </div>
    </div>
  );
};

export default Section;
