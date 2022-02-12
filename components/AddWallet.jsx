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
} from '@mui/material';
import { useWallet } from 'utils/WalletContext';
import { useAddWallet } from 'utils/AddWalletContext';
import { Address } from 'utils/Address';
import theme from '@styles/theme';

export const AddWallet = () => {
  const [walletInput, setWalletInput] = useState('');
  const { addWalletOpen, setAddWalletOpen } = useAddWallet();
  const { wallet, setWallet } = useWallet();

  /**
   * dapp state
   */
  const [dAppConnected, setDAppConnected] = useState(false);
  const [dAppError, setDAppError] = useState(false);

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
    setAddWalletOpen(false);
    setWalletInput(wallet);
    setDAppError(false);
  };

  const handleWalletFormChange = (e) => {
    setWalletInput(e.target.value);
  };

  const handleSubmitWallet = () => {
    // add read only wallet
    setAddWalletOpen(false);
    setWallet(walletInput);
    setDAppError(false);
    setDAppConnected(false);
    localStorage.removeItem('dapp_connected');
    localStorage.setItem('wallet_address', walletInput);
  };

  const clearWallet = () => {
    setWalletInput('');
    setWallet('');
    setDAppError(false);
    setDAppConnected(false);
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('dapp_connected');
  };

  /**
   * dapp connector
   */
  const dAppConnect = async () => {
    try {
      if (await window.ergo_check_read_access()) {
        dAppLoad();
        return;
      } else if (await window.ergo_request_read_access()) {
        dAppLoad();
        return;
      }
      setDAppError(true);
    } catch (e) {
      setDAppError(true);
      console.log(e);
    }
  };

  const dAppLoad = async () => {
    try {
      const address_used = await ergo.get_used_addresses(); // eslint-disable-line
      const address_unused = await ergo.get_unused_addresses(); // eslint-disable-line
      const addresses = [...address_used, ...address_unused];
      // use the first used address if available or the first unused one if not
      const address = addresses[0];
      setWallet(address);
      setWalletInput(address);
      setDAppConnected(true);
      setDAppError(false);
      localStorage.setItem('wallet_address', address);
      localStorage.setItem('dapp_connected', true);
    } catch (e) {
      console.log(e);
      setDAppConnected(false);
      localStorage.removeItem('dapp_connected');
    }
  };

  return (
    <>
      <Dialog open={addWalletOpen} onClose={handleClose}>
        <DialogTitle>Connect Wallet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your Ergo wallet public key. This will be used to interact
            with smart contracts and display assets on the dashboard. Your
            public key will never be stored on our server.
          </DialogContentText>
          <Grid sx={{ py: 2 }}>
            <Button
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
            </Button>
            <FormHelperText error={true}>
              {dAppError ? 'Failed to connect to wallet. Please retry.' : ''}
            </FormHelperText>
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
