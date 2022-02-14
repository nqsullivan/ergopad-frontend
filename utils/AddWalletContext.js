import { createContext, useContext, useState } from 'react';

// The Context
const AddWalletContext = createContext();

// Template Provider
const AddWalletProvider = ({ children }) => {
  const [addWalletOpen, setAddWalletOpenRaw] = useState(false);

  const setAddWalletOpen = (newState) => {
    /**
     * wrapper for setAddWalletOpen to refresh dApp connection
     */
    setAddWalletOpenRaw(newState);
    if (newState) {
      try {
        // refresh connection
        if (localStorage.getItem('dapp_connected')) {
          window.ergo_check_read_access().then((res) => {
            if (!res) window.ergo_request_read_access();
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  // Context values passed to consumer
  const value = {
    addWalletOpen, // <------ Expose Value to Consumer
    setAddWalletOpen, // <------ Expose Setter to Consumer
  };

  return (
    <AddWalletContext.Provider value={value}>
      {children}
    </AddWalletContext.Provider>
  );
};

// Template Consumer
const AddWalletConsumer = ({ children }) => {
  return (
    <AddWalletContext.Consumer>
      {(context) => {
        if (context === undefined) {
          throw new Error(
            'AddWalletConsumer must be used within AddWalletProvider'
          );
        }
        return children(context);
      }}
    </AddWalletContext.Consumer>
  );
};

// useTemplate Hook
const useAddWallet = () => {
  const context = useContext(AddWalletContext);
  if (context === undefined)
    throw new Error('useAddWallet must be used within AddWalletProvider');
  return context;
};

export { AddWalletProvider, AddWalletConsumer, useAddWallet };
