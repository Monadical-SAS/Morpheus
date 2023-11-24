import React from "react";
export const LoadingContext = React.createContext({
  loading: false,
  setLoading: (loading: boolean) => {},
});

export const LoadingProvider = ({ children }: any) => {
    const [loading, setLoading] = React.useState(false);
    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
        {children}
        </LoadingContext.Provider>
    );
    }
