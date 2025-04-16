import React, { useState } from "react";
import Contributation from "./Contributation";

const MainContribution = ({ setDisableWorkSpace }) => {
  const [activeTab, setActiveTab] = useState(1);
  return (
    <div className="flex h-[100vh] flex-col justify-center items-center">
      {activeTab === 0 ? (
        <Contributation setDisableWorkSpace={setDisableWorkSpace} />
      ) : activeTab === 1 ? (
        <div>Requests</div>
      ) : (
        <div>Your contribution</div>
      )}
      <div className="absolute bg-blue-300 bottom-14 rounded-md px-3 flex gap-2 p-1">
        {["contribute", "requests", "your contribution"].map((ele, idx) => {
          return (
            <>
              <div
                onClick={() => setActiveTab(idx)}
                className={`cursor-pointer hover:bg-slate-500 hover:rounded-md p-1 ${
                  activeTab === idx && " bg-slate-500 rounded-md"
                }`}
              >
                {ele}
              </div>
              {idx != 2 && <span className="bg-black w-[1px] h-6" />}
            </>
          );
        })}
      </div>
    </div>
  );
};

export default MainContribution;
