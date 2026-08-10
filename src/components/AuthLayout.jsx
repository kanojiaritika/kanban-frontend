import React from "react";
import KanbanIllustration from "./KanbanIllustration";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex bg-[#FAF9F6]">
      {/* Illustration panel — hidden on small screens to keep mobile focused on the form */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#160D2B] to-[#3B1D5E] items-center justify-center p-12">
        <KanbanIllustration />
        <div className="absolute bottom-12 left-12 right-12 text-[#FAF9F6]">
          <p className="font-['Space_Grotesk'] text-2xl font-semibold tracking-tight">
            Plan, organize, and get work done.
          </p>
          <p className="mt-2 text-md text-[#97A3C4] max-w-sm">
            Manage projects, track tasks, and collaborate with your team in one place.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#14B8A6]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FBBF24]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FB7367]" />
            </div>
            <h1 className="font-['Space_Grotesk'] text-3xl font-semibold text-[#16213A]">
              {title}
            </h1>
            <p className="mt-2 text-md text-[#5B6579]">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;