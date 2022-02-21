import {
  Typography,
  Container,
  Box,
  Grid,
  Button,
  Paper,
  Checkbox,
  Modal,
  FormControl,
  InputLabel,
  FilledInput,
  FormHelperText,
  TextField,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CenterTitle from '@components/CenterTitle';
import { StakingItem } from '@components/staking/StakingSummary';
import StakingSummary from '@components/staking/StakingSummary';
import StakingRewardsBox from '@components/staking/StakingRewardsBox';
import StakingTiers from '@components/staking/StakingTiers';
import UnstakingFeesTable from '@components/staking/UnstakingFeesTable';
import UnstakingTable from '@components/staking/UnstakingTable';
import MuiNextLink from '@components/MuiNextLink';
import theme from '@styles/theme';
import { useWallet } from 'utils/WalletContext';
import { forwardRef, useEffect, useState } from 'react';
import axios from 'axios';

// todo: change to ergopad after testing
const STAKE_TOKEN_ID =
  '000e21f8e51ad4a3d3bdde9ac34d19eb2c24c92d2022260af6f99148cbc021d1';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const initStakingForm = Object.freeze({
  wallet: '',
  tokenAmount: 0,
});

const initStakingFormErrors = Object.freeze({
  wallet: false,
  tokenAmount: false,
});

const initUnstakingForm = Object.freeze({
  tokenAmount: 0,
});

const initUnstakingFormErrors = Object.freeze({
  wallet: false,
  tokenAmount: false,
});

const initStaked = Object.freeze({
  totalStaked: 0,
  addresses: {},
});

const initUnstaked = Object.freeze({
  boxId: '',
  stakeKeyId: '',
  stakeAmount: 0,
});

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const Staking = () => {
  const checkSmall = useMediaQuery((theme) => theme.breakpoints.up('md'));
  // wallet
  const { wallet, dAppWallet } = useWallet();
  // stake modal
  const [openModal, setOpenModal] = useState(false);
  const [stakingForm, setStakingForm] = useState(initStakingForm);
  const [stakingFormErrors, setStakingFormErrors] = useState(
    initStakingFormErrors
  );
  const [stakeLoading, setStakeLoading] = useState(false);
  // unstake table
  const [unstakeTableLoading, setUnstakeTableLoading] = useState(false);
  const [stakedData, setStakedData] = useState(initStaked);
  // unstake modal
  const [openUnstakeModal, setOpenUnstakeModal] = useState(false);
  const [unstakeModalLoading, setUnstakeModalLoading] = useState(false);
  const [unstakeModalData, setUnstakeModalData] = useState(initUnstaked);
  const [unstakingForm, setUnstakingForm] = useState(initUnstakingForm);
  const [unstakingFormErrors, setUnstakingFormErrors] = useState(
    initStakingFormErrors
  );
  const [unstakePenalty, setUnstakePenalty] = useState(-1);
  // error snackbar
  const [openError, setOpenError] = useState(false);
  const [errorMessage] = useState('Something went wrong');
  // success snackbar
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successMessageSnackbar] = useState('Form submitted');
  const [checkBox, setCheckBox] = useState(false);
  const stakeButtonEnabled = checkBox && true; // use other conditions to enable this

  useEffect(() => {
    // load staked tokens for primary wallet address
    const getStaked = async () => {
      setUnstakeTableLoading(true);
      try {
        const request = {
          addresses: [wallet],
        };
        const res = await axios.post(
          `${process.env.API_URL}/staking/staked/`,
          request,
          { ...defaultOptions }
        );
        setStakedData(res.data);
      } catch (e) {
        console.log('ERROR FETCHING: ', e);
      }
      setUnstakeTableLoading(false);
    };

    getStaked();
  }, [wallet]);

  useEffect(() => {
    // reset staking Form on wallet change
    setStakingForm({ ...initStakingForm, wallet: wallet });
  }, [wallet]);

  useEffect(() => {
    setStakingFormErrors({
      ...initStakingFormErrors,
      wallet: !dAppWallet.connected,
    });
    setUnstakingFormErrors({
      ...initUnstakingFormErrors,
      wallet: !dAppWallet.connected,
    });
  }, [dAppWallet.connected]);

  const stake = async (e) => {
    e.preventDefault();
    setStakeLoading(true);
    try {
      const tokenAmount = Math.round(stakingForm.tokenAmount * 100);
      // prettier-ignore
      const tokens = await ergo.get_utxos(tokenAmount.toString(), STAKE_TOKEN_ID); // eslint-disable-line
      // prettier-ignore
      const fees = await ergo.get_utxos('3000000'); // eslint-disable-line
      const utxos = Array.from(
        new Set([...tokens, ...fees].map((x) => x.boxId))
      );
      const request = {
        wallet: stakingForm.wallet,
        amount: tokenAmount / 100,
        utxos: utxos,
        txFormat: 'eip-12',
      };
      const res = await axios.post(
        `${process.env.API_URL}/staking/stake/`,
        request,
        { ...defaultOptions }
      );
      const unsignedtx = res.data;
      const signedtx = await ergo.sign_tx(unsignedtx); // eslint-disable-line
      await ergo.submit_tx(signedtx); // eslint-disable-line
      setOpenSuccessSnackbar(true);
    } catch (e) {
      console.log(e);
      setOpenError(true);
    }
    setStakeLoading(false);
  };

  const initUnstake = () => {
    setUnstakePenalty(-1);
    setUnstakingForm(initUnstakingForm);
    setUnstakingFormErrors({
      tokenAmount: false,
      wallet: !dAppWallet.connected,
    });
  };

  const unstake = async (e) => {
    e.preventDefault();
    setUnstakeModalLoading(true);
    try {
      const tokenAmount = unstakingForm.tokenAmount * 100;
      const stakeKey = unstakeModalData.stakeKeyId;
      // prettier-ignore
      const tokens = await ergo.get_utxos('1', stakeKey); // eslint-disable-line
      // prettier-ignore
      const fees = await ergo.get_utxos('2000000'); // eslint-disable-line
      const utxos = Array.from(
        new Set([...tokens, ...fees].map((x) => x.boxId))
      );
      const request = {
        stakeBox: unstakeModalData.boxId,
        amount: tokenAmount / 100,
        utxos: utxos,
        txFormat: 'eip-12',
      };
      const res = await axios.post(
        `${process.env.API_URL}/staking/unstake/`,
        request,
        { ...defaultOptions }
      );
      // const res = {
      //   data: {
      //     penalty: 5,
      //     unsignedTX: {},
      //   },
      // };
      const penalty = res.data.penalty;
      setUnstakePenalty(penalty);
      const unsignedtx = res.data.unsignedTX;
      const signedtx = await ergo.sign_tx(unsignedtx); // eslint-disable-line
      await ergo.submit_tx(signedtx); // eslint-disable-line
      setOpenSuccessSnackbar(true);
    } catch (e) {
      console.log(e);
      setOpenError(true);
    }
    initUnstake();
    setUnstakeModalLoading(false);
  };

  // snackbar for error reporting
  const handleCloseError = (e, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  // snackbar for success
  const handleCloseSuccessSnackbar = (e, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSuccessSnackbar(false);
  };

  const handleStakingFormChange = (e) => {
    if (e.target.name === 'stakingAmount') {
      const amount = Number(e.target.value);
      if (amount > 0.0) {
        setStakingFormErrors({
          ...stakingFormErrors,
          tokenAmount: false,
        });
        setStakingForm({
          ...stakingForm,
          tokenAmount: e.target.value,
        });
      } else {
        setStakingFormErrors({
          ...stakingFormErrors,
          tokenAmount: true,
        });
        setStakingForm({
          ...stakingForm,
          tokenAmount: e.target.value,
        });
      }
    }
  };

  const handleUnstakingFormChange = (e) => {
    if (e.target.name === 'unstakingAmount') {
      const amount = Number(e.target.value);
      if (amount > 0 && amount <= unstakeModalData.stakeAmount) {
        setUnstakingFormErrors({
          ...unstakingFormErrors,
          tokenAmount: false,
        });
        setUnstakingForm({
          ...unstakingForm,
          tokenAmount: e.target.value,
        });
      } else {
        setUnstakingFormErrors({
          ...unstakingFormErrors,
          tokenAmount: true,
        });
        setUnstakingForm({
          ...unstakingForm,
          tokenAmount: e.target.value,
        });
      }
    }
  };

  return (
    <>
      <Container sx={{ mb: '3rem' }}>
        <CenterTitle
          title="Stake Your Tokens"
          subtitle="Connect your wallet and stake your tokens to receive staking rewards and early access to upcoming IDOs"
          main={true}
        />
      </Container>
      <Container maxWidth="lg">
        <StakingSummary />
        <Grid
          container
          spacing={3}
          sx={{
            mt: 8,
            justifyContent: 'space-between',
            flexDirection: { xs: 'column-reverse', md: 'row' },
          }}
        >
          <Grid item xs={12} md={8} sx={{ pr: { lg: 12, xs: 0 } }}>
            <Typography variant="h3">Instructions</Typography>
            <Typography variant="p">
              Stake your tokens by first connecting your wallet above, then
              click on the Stake button. There, enter the number of tokens
              you&apos;d like to stake, and the dApp will generate a contract
              for you to send the tokens to. Send the exact number of tokens
              (and Erg to cover fees) that is given. If you make a mistake and
              the contract doesn&apos;t work, it will refund you. If you send
              too much but the contract goes through, the leftover amount can be
              skimmed from the network by bots. Please follow the instructions
              carefully and send the correct amount!
            </Typography>
            <Typography variant="p">
              Once staked, you will earn rewards based on the Current APY, which
              will be automatically compounded for you. When you decide to
              unstake, use the withdrawal button and follow the instructions. As
              with staking, please get the exact values correct when you make
              the transaction. You must cover the transaction fees to initiate
              the withdrawal contract. Luckily, this is not ETH, and the fees
              are very low.
            </Typography>
            <Typography variant="p">
              Please note, if you choose to unstake early, there will be a fee
              as outlined to the right. Those fees will be burned, one of the
              deflationary mechanisms in place to control the ErgoPad token
              supply.
            </Typography>
            <Typography variant="p">
              When new IDOs are announced on ErgoPad, we will also announce a
              snapshot date and time. If you are staking during that time, you
              will be eligible to receive an allocation of the IDO tokens at a
              reduced price. This will be weighted based on your staking tier.
              You&apos;ll be able to check your allocation on this website and
              interact with the sales contract.
            </Typography>
            <Typography variant="p" sx={{ textAlign: 'center' }}>
              <Checkbox
                color="primary"
                checked={checkBox}
                onChange={(e, checked) => setCheckBox(checked)}
              />{' '}
              I have read and agree to the staking{' '}
              <MuiNextLink href="/terms">Terms and Conditions</MuiNextLink>
            </Typography>
            <Box
              sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <Button
                variant="contained"
                disabled={!stakeButtonEnabled}
                sx={{
                  color: '#fff',
                  fontSize: '1rem',
                  py: '0.6rem',
                  px: '1.2rem',
                  textTransform: 'none',
                  background: theme.palette.tertiary.main,
                  '&:hover': {
                    background: theme.palette.tertiary.hover,
                    boxShadow: 'none',
                  },
                  '&:active': {
                    background: theme.palette.tertiary.active,
                  },
                }}
                onClick={() => setOpenModal(true)}
              >
                Stake Now
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <StakingRewardsBox />
            <UnstakingFeesTable />
          </Grid>
        </Grid>
      </Container>
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
          <StakingTiers />
        </Paper>
      </Container>
      <Container id="withdraw" maxWidth="lg" sx={{ mt: 6 }}>
        <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: '700' }}>
            Withdraw
          </Typography>
          {unstakeTableLoading ? (
            <CircularProgress color="inherit" />
          ) : (
            <UnstakingTable
              data={stakedData}
              unstake={(boxId, stakeKeyId, stakeAmount) => {
                initUnstake();
                setOpenUnstakeModal(true);
                setUnstakeModalData({ boxId, stakeKeyId, stakeAmount });
              }}
            />
          )}
        </Paper>
      </Container>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={checkSmall ? modalStyle : { ...modalStyle, width: '85vw' }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Stake Tokens
          </Typography>
          <Typography variant="p" sx={{ fontSize: '1rem', mb: 2 }}>
            Once you click submit you will be prompted by your wallet to approve
            the transaction. Make sure you verify token amounts before approving
            it.
          </Typography>
          <Box component="form" noValidate onSubmit={stake}>
            <TextField
              InputProps={{ disableUnderline: true }}
              required
              fullWidth
              id="stakingAmount"
              label={`Enter the token amount you are staking`}
              name="stakingAmount"
              variant="filled"
              sx={{ mb: 2 }}
              onChange={handleStakingFormChange}
              value={stakingForm.tokenAmount}
              error={stakingFormErrors.tokenAmount}
              helperText={
                stakingFormErrors.tokenAmount && 'Enter a valid token amount'
              }
            />
            <FormControl
              variant="filled"
              fullWidth
              required
              name="wallet"
              error={stakingFormErrors.wallet}
            >
              <InputLabel
                htmlFor="ergoAddress"
                sx={{ '&.Mui-focused': { color: 'text.secondary' } }}
              >
                Primary Ergo Wallet Address
              </InputLabel>
              <FilledInput
                id="ergoAddress"
                value={stakingForm.wallet}
                disabled
                disableUnderline={true}
                name="wallet"
                type="ergoAddress"
                sx={{
                  width: '100%',
                  border: '1px solid rgba(82,82,90,1)',
                  borderRadius: '4px',
                }}
              />
              <FormHelperText>
                {stakingFormErrors.wallet &&
                  'Please connect with yoroi or nautilus to proceed'}
              </FormHelperText>
            </FormControl>
            <Button
              variant="contained"
              sx={{
                color: '#fff',
                fontSize: '1rem',
                mt: 2,
                py: '0.6rem',
                px: '1.2rem',
                textTransform: 'none',
                background: theme.palette.tertiary.main,
                '&:hover': {
                  background: theme.palette.tertiary.hover,
                  boxShadow: 'none',
                },
                '&:active': {
                  background: theme.palette.tertiary.active,
                },
              }}
              type="submit"
            >
              Submit
              {stakeLoading && (
                <CircularProgress
                  sx={{ ml: 2, color: 'white' }}
                  size={'1.2rem'}
                />
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openUnstakeModal}
        onClose={() => setOpenUnstakeModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={checkSmall ? modalStyle : { ...modalStyle, width: '85vw' }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Unstake Tokens
          </Typography>
          <Typography variant="p" sx={{ fontSize: '1rem', mb: 2 }}>
            Once you click submit you will be prompted by your wallet to approve
            the transaction. There may be a penalty associated with early
            unstaking. The penalty will be calculated after submitting this
            form. Please note the unstaking penalty before approving the
            transaction in your wallet.
          </Typography>
          <Grid
            container
            spacing={3}
            alignItems="stretch"
            justifyContent="center"
            sx={{ flexGrow: 1, mb: 3 }}
          >
            {[
              {
                title: 'Staked in Box',
                value: unstakeModalData.stakeAmount,
                background: theme.palette.background.default,
                md: 6,
              },
              {
                title: 'Penalty',
                value: unstakePenalty === -1 ? '-' : unstakePenalty,
                background: theme.palette.background.default,
                md: 6,
              },
            ].map((item) => {
              return StakingItem(item);
            })}
          </Grid>
          <Box component="form" noValidate onSubmit={unstake}>
            <TextField
              InputProps={{ disableUnderline: true }}
              required
              fullWidth
              id="unstakingAmount"
              label={`Enter the token amount you are unstaking`}
              name="unstakingAmount"
              variant="filled"
              sx={{ mb: 2 }}
              onChange={handleUnstakingFormChange}
              value={unstakingForm.tokenAmount}
              error={unstakingFormErrors.tokenAmount}
              helperText={
                unstakingFormErrors.tokenAmount && 'Enter a valid token amount'
              }
            />
            <FormHelperText>
              {unstakingFormErrors.wallet
                ? 'Please connect with yoroi or nautilus to proceed'
                : 'Submit to calculate unstaking penalty (if any)'}
            </FormHelperText>
            <Button
              variant="contained"
              disabled={unstakingFormErrors.wallet}
              sx={{
                color: '#fff',
                fontSize: '1rem',
                mt: 2,
                py: '0.6rem',
                px: '1.2rem',
                textTransform: 'none',
                background: theme.palette.secondary.main,
                '&:hover': {
                  background: theme.palette.secondary.hover,
                  boxShadow: 'none',
                },
                '&:active': {
                  background: theme.palette.secondary.active,
                },
              }}
              type="submit"
            >
              Submit
              {unstakeModalLoading && (
                <CircularProgress
                  sx={{ ml: 2, color: 'white' }}
                  size={'1.2rem'}
                />
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={openError}
        autoHideDuration={4500}
        onClose={handleCloseError}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={4500}
        onClose={handleCloseSuccessSnackbar}
      >
        <Alert
          onClose={handleCloseSuccessSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessageSnackbar}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Staking;
