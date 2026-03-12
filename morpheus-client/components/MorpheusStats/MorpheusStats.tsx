const MorpheusStats = () => {
  return (
    <div className="mt-[90px] flex flex-row items-center bg-[#252238] rounded-lg p-12 max-md:max-w-full max-md:flex-col">
      <div className="flex-1 flex flex-col items-end justify-center pr-[72px] max-md:pr-0 max-md:pb-6 max-md:items-center">
        <div className="flex flex-col items-center justify-center">
          <p className="headline-3 accent">50.000+</p>
          <p className="body-2 white">Images rendered</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-[241px] max-w-[241px] border-l border-r border-[#312E47] max-md:py-6 max-md:w-full max-md:border-l-0 max-md:border-r-0 max-md:border-t max-md:border-b">
        <div className="flex flex-col items-center justify-center">
          <p className="headline-3 accent">300+</p>
          <p className="body-2 white">Users</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-start justify-center pl-[72px] max-md:pl-0 max-md:pt-6 max-md:items-center">
        <div className="flex flex-col items-center justify-center">
          <p className="headline-3 accent">6</p>
          <p className="body-2 white">Awards</p>
        </div>
      </div>
    </div>
  );
};

export default MorpheusStats;
