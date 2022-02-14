import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  TextField,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  Grid,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import PaginatedTable from '@components/PaginatedTable';
import { useWallet } from 'utils/WalletContext';
import { useAddWallet } from 'utils/AddWalletContext';
import { Address } from 'utils/Address';
import theme from '@styles/theme';

/**
 * Note on es-lint disable line:
 *
 * Ergo dApp injector uses global variables injected from the browser,
 * es-lint will complain if we reference un defined varaibles.
 *
 * Injected variables:
 * - ergo
 * - window.ergo_check_read_access
 * - window.ergo_request_read_access
 */
export const AddWallet = () => {
  const [walletInput, setWalletInput] = useState('');
  const { addWalletOpen, setAddWalletOpen } = useAddWallet();
  const { wallet, setWallet } = useWallet();

  /**
   * dapp state
   *
   * loading: yoroi is slow so need to show a loader for yoroi
   * dAppConnected: true if permission granted (persisted in local storage)
   * dAppError: show error message
   * dAppAddresses: list available addresses from wallet
   */
  const [loading, setLoading] = useState(false);
  const [dAppConnected, setDAppConnected] = useState(false);
  const [dAppError, setDAppError] = useState(false);
  const [dAppAddresses, setDAppAddresses] = useState([]);

  useEffect(() => {
    if (localStorage.getItem('wallet_address')) {
      setWallet(localStorage.getItem('wallet_address'));
      setWalletInput(localStorage.getItem('wallet_address'));
    }
    if (localStorage.getItem('dapp_connected')) {
      setDAppConnected(localStorage.getItem('dapp_connected'));
    }
  }, []);

  const handleClose = () => {
    // reset unsaved changes
    setAddWalletOpen(false);
    setWalletInput(wallet);
    setDAppError(false);
  };

  const handleSubmitWallet = () => {
    // add read only wallet
    setAddWalletOpen(false);
    setWallet(walletInput);
    // clear dApp state
    setDAppError(false);
    setDAppConnected(false);
    setDAppAddresses([]);
    // update persisted storage
    localStorage.removeItem('dapp_connected');
    localStorage.setItem('wallet_address', walletInput);
  };

  const clearWallet = () => {
    // clear state and local storage
    setWalletInput('');
    setWallet('');
    // clear dApp state
    setDAppError(false);
    setDAppConnected(false);
    setDAppAddresses([]);
    // update persisted storage
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('dapp_connected');
  };

  const handleWalletFormChange = (e) => {
    setWalletInput(e.target.value);
  };

  /**
   * dapp connector
   */
  const dAppConnect = async () => {
    setLoading(true);
    try {
      if (await window.ergo_check_read_access()) {
        await dAppLoad();
        setLoading(false);
        return;
      } else if (await window.ergo_request_read_access()) {
        await dAppLoad();
        setLoading(false);
        return;
      }
      setDAppError(true);
    } catch (e) {
      setDAppError(true);
      console.log(e);
    }
    setLoading(false);
  };

  const dAppLoad = async () => {
    try {
      const address_used = await ergo.get_used_addresses(); // eslint-disable-line
      const address_unused = await ergo.get_unused_addresses(); // eslint-disable-line
      const addresses = [...address_used, ...address_unused];
      // use the first used address if available or the first unused one if not as default
      const address = addresses.length ? addresses[0] : '';
      setWallet(address);
      setWalletInput(address);
      // update dApp state
      setDAppConnected(true);
      setDAppError(false);
      // update local storage
      localStorage.setItem('wallet_address', address);
      localStorage.setItem('dapp_connected', true);
    } catch (e) {
      console.log(e);
      // update dApp state
      setDAppConnected(false);
      setDAppError(true);
      // update local storage
      localStorage.removeItem('dapp_connected');
    }
  };

  const changeWalletAddress = (address) => {
    setWallet(address);
    setWalletInput(address);
    localStorage.setItem('wallet_address', address);
  };

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const address_used = await ergo.get_used_addresses(); // eslint-disable-line
      const address_unused = await ergo.get_unused_addresses(); // eslint-disable-line
      const addresses = [...address_used, ...address_unused].map(
        (address, index) => {
          return { id: index, name: address };
        }
      );
      setDAppAddresses(addresses);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog open={addWalletOpen} onClose={handleClose}>
        <DialogTitle>Connect Wallet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your Ergo wallet public key. This will be used to interact
            with smart contracts and display assets on the dashboard. Your
            public key will never be stored on our server. If you are using a
            dapp wallet please make sure only one wallet is enabled. Enabling
            multiple wallet extensions will cause undefined behaviour.
          </DialogContentText>
          <Grid sx={{ py: 2 }}>
            <Button
              disabled={loading}
              onClick={dAppConnect}
              sx={{
                color: '#fff',
                fontSize: '1rem',
                py: '0.6rem',
                px: '1.6rem',
                textTransform: 'none',
                backgroundColor: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.hover,
                  boxShadow: 'none',
                },
                '&:active': {
                  backgroundColor: theme.palette.secondary.active,
                },
              }}
            >
              {dAppConnected
                ? 'dApp Connected'
                : 'Connect with Yoroi or Nautilus'}
              {loading && (
                <CircularProgress
                  sx={{ ml: 2, color: 'white' }}
                  size={'1.2rem'}
                />
              )}
            </Button>
            <FormHelperText error={true}>
              {dAppError ? 'Failed to connect to wallet. Please retry.' : ''}
            </FormHelperText>
            {dAppConnected && (
              <Accordion sx={{ mt: 1 }}>
                <AccordionSummary onClick={loadAddresses}>
                  <strong>Change Address</strong>
                </AccordionSummary>
                <AccordionDetails>
                  <PaginatedTable
                    rows={dAppAddresses}
                    onClick={(index) =>
                      changeWalletAddress(dAppAddresses[index].name)
                    }
                  />
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>
          <TextField
            disabled={dAppConnected}
            autoFocus
            margin="dense"
            id="name"
            label="Wallet address"
            type="wallet"
            fullWidth
            variant="standard"
            value={walletInput}
            onChange={handleWalletFormChange}
            error={!isAddressValid(walletInput)}
          />
          <FormHelperText error={true}>
            {!isAddressValid(walletInput) ? 'Invalid ergo address.' : ''}
          </FormHelperText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button onClick={() => clearWallet()}>Remove wallet</Button>
          <Button onClick={handleClose}>Close Window</Button>
          <Button
            onClick={handleSubmitWallet}
            disabled={!isAddressValid(walletInput) || dAppConnected}
          >
            Connect Read Only Wallet
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

function isAddressValid(address) {
  try {
    return new Address(address).isValid();
  } catch (_) {
    return false;
  }
}

export default AddWallet;
