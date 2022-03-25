import {
  Typography,
  Container,
  Box,
  Grid,
  Button,
  Paper,
  Checkbox,
  Modal,
  FormGroup,
  FormControl,
  FormControlLabel,
  InputLabel,
  FilledInput,
  FormHelperText,
  TextField,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import CenterTitle from '@components/CenterTitle';
import { StakingItem } from '@components/staking/StakingSummary';
import StakingSummary from '@components/staking/StakingSummary';
import StakingRewardsBox from '@components/staking/StakingRewardsBox';
import StakingTiers from '@components/staking/StakingTiers';
import UnstakingFeesTable from '@components/staking/UnstakingFeesTable';
import UnstakingTable from '@components/staking/UnstakingTable';
import TransactionSubmitted from '@components/staking/TransactionSubmitted';
import MuiNextLink from '@components/MuiNextLink';
import theme from '@styles/theme';
import { useWallet } from 'utils/WalletContext';
import { forwardRef, useEffect, useState } from 'react';
import axios from 'axios';

const STAKE_TOKEN_ID =
  'd71693c49a84fbbecd4908c94813b46514b18b67a99952dc1e6e4791556de413';

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
  penaltyPct: 25,
});

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Staking = () => {
  const checkSmall = useMediaQuery((theme) => theme.breakpoints.up('md'));
  // wallet
  const { wallet, dAppWallet } = useWallet();
  // stake modal
  const [tokenBalance, setTokenBalance] = useState(0);
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
  const [errorMessage, setErrorMessage] = useState('Something went wrong');
  // success snackbar
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successMessageSnackbar, setSuccessMessageSnackbar] =
    useState('Form submitted');
  const [checkBox, setCheckBox] = useState(false);
  const stakeButtonEnabled = checkBox && true; // use other conditions to enable this
  // transaction submitted
  const [transactionSubmitted, setTransactionSubmitted] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

    if (wallet !== '') {
      getStaked();
    }
  }, [wallet, dAppWallet.connected]);

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

  useEffect(() => {
    // get ergopad balance
    const getTokenBalance = async () => {
      try {
        if (dAppWallet.connected) {
          const balance = await ergo.get_balance(STAKE_TOKEN_ID); // eslint-disable-line
          setTokenBalance(balance / 100);
        }
      } catch (e) {
        console.log('ERROR: ', e);
      }
    };

    if (openModal) {
      getTokenBalance();
    }
  }, [dAppWallet.connected, openModal]);

  const stake = async (e) => {
    e.preventDefault();
    setStakeLoading(true);
    try {
      const tokenAmount = Math.round(stakingForm.tokenAmount * 100);
      // prettier-ignore
      const tokens = await ergo.get_utxos(tokenAmount.toString(), STAKE_TOKEN_ID); // eslint-disable-line
      // prettier-ignore
      const fees = await ergo.get_utxos('30000000'); // eslint-disable-line
      const utxos = Array.from(
        new Set([...fees, ...tokens].map((x) => x.boxId))
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
      const ok = await ergo.submit_tx(signedtx); // eslint-disable-line
      setSuccessMessageSnackbar('Transaction Submitted: ' + ok);
      setTransactionSubmitted(ok);
      setOpenSuccessSnackbar(true);
    } catch (e) {
      if (e.response) {
        setErrorMessage(
          'Error: ' + e.response.status + ' - ' + e.response.data
        );
      } else {
        setErrorMessage('Error: Failed to build transaction');
      }
      setOpenError(true);
    }
    setStakeLoading(false);
  };

  const initUnstake = () => {
    setTransactionSubmitted(null);
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
      const fees = await ergo.get_utxos('20000000'); // eslint-disable-line
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
      const penalty = res.data.penalty;
      setUnstakePenalty(penalty);
      const unsignedtx = res.data.unsignedTX;
      const signedtx = await ergo.sign_tx(unsignedtx); // eslint-disable-line
      const ok = await ergo.submit_tx(signedtx); // eslint-disable-line
      setSuccessMessageSnackbar('Transaction Submitted: ' + ok);
      setTransactionSubmitted(ok);
      setOpenSuccessSnackbar(true);
    } catch (e) {
      if (e.response) {
        setErrorMessage(
          'Error: ' + e.response.status + ' - ' + e.response.data
        );
      } else {
        setErrorMessage('Error: Failed to build transaction');
      }
      initUnstake();
      setOpenError(true);
    }
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
      if (amount > 0.0 && amount <= tokenBalance) {
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
    const calcPenalty = (value, penaltyPct) => {
      return Math.round(value * penaltyPct) / 100;
    };
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
        const penalty = calcPenalty(amount, unstakeModalData.penaltyPct);
        setUnstakePenalty(penalty);
      } else {
        setUnstakingFormErrors({
          ...unstakingFormErrors,
          tokenAmount: true,
        });
        setUnstakingForm({
          ...unstakingForm,
          tokenAmount: e.target.value,
        });
        setUnstakePenalty(-1);
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
          <Grid item xs={12} md={8} sx={{ pr: { lg: 1, xs: 0 } }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Stake" {...a11yProps(0)} />
                  <Tab label="Unstake" {...a11yProps(1)} />
                  <Tab label="Tiers" {...a11yProps(2)} />
                </Tabs>
              </Box>
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h4">Staking Info</Typography>
                <Typography variant="p">
                  Staking your tokens will generate new tokens daily based on
                  the APY percentage above. If you stake in one of the{' '}
                  <a
                    onClick={() => {
                      setTabValue(2);
                    }}
                    style={{
                      cursor: 'pointer',
                      color: theme.palette.primary.main,
                    }}
                  >
                    tiers
                  </a>
                  , it also makes you eligible for early contribution rounds to
                  IDOs of projects launched on Ergopad.
                </Typography>
                <Typography variant="p">
                  Be aware of the unstaking fees, as outlined in the table.
                  These fees are in place to prevent someone from staking right
                  before a tier snapshot, then unstaking immediately after.
                  Unstaking fees are burned and will no longer be in
                  circulation, reducing the total supply of Ergopad tokens.
                </Typography>
                <Typography variant="p">
                  Note: Please stake a minimum of 10 ergopad tokens, fewer will not work. 
                </Typography>
                <Typography variant="h4">Terms &amp; Conditions</Typography>
                <Typography variant="p">
                  By using this website to stake tokens on the Ergo blockchain,
                  you accept that you are interacting with a smart contract
                  that this website has no control over. The operators of this
                  website accept no liability whatsoever in relation to your use
                  of these smart contracts. By using this website to stake, you
                  also have read and agree to the{' '}
                  <MuiNextLink href="/terms">Terms and Conditions</MuiNextLink>.
                </Typography>
                <FormGroup
                  sx={{
                    marginBottom: '1rem',
                    mt: '-1rem',
                    color: theme.palette.text.secondary,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={checkBox}
                        onChange={(e, checked) => setCheckBox(checked)}
                      />
                    }
                    sx={{ label: { fontSize: '1.125rem' } }}
                    label="I have read and accept the terms described above. "
                  />
                </FormGroup>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
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
                      background: theme.palette.primary.main,
                      '&:hover': {
                        background: theme.palette.primary.hover,
                        boxShadow: 'none',
                      },
                      '&:active': {
                        background: theme.palette.primary.active,
                      },
                    }}
                    onClick={() => {
                      setOpenModal(true);
                      setTransactionSubmitted(null);
                    }}
                  >
                    Stake Now
                  </Button>
                </Box>
              </TabPanel>
              <TabPanel value={tabValue} index={1} id="withdraw">
                <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: '700' }}>
                    Withdraw
                  </Typography>
                  {unstakeTableLoading ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    <UnstakingTable
                      data={stakedData}
                      unstake={(boxId, stakeKeyId, stakeAmount, penaltyPct) => {
                        initUnstake();
                        setOpenUnstakeModal(true);
                        setUnstakeModalData({
                          boxId,
                          stakeKeyId,
                          stakeAmount,
                          penaltyPct,
                        });
                      }}
                    />
                  )}
                </Paper>
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
                  <StakingTiers />
                </Paper>
              </TabPanel>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <StakingRewardsBox
              loading={unstakeTableLoading}
              totalStaked={stakedData.totalStaked}
              setTabValue={setTabValue}
            />
            <UnstakingFeesTable />
          </Grid>
        </Grid>
      </Container>

      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setTransactionSubmitted(null);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={checkSmall ? modalStyle : { ...modalStyle, width: '85vw' }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Stake Tokens
          </Typography>
          {transactionSubmitted ? (
            <TransactionSubmitted transaction={transactionSubmitted} />
          ) : (
            <>
              <Typography variant="p" sx={{ fontSize: '1rem', mb: 2 }}>
                Once you click submit you will be prompted by your wallet to
                approve the transaction. Make sure you verify token amounts
                before approving it.
              </Typography>
              <Box component="form" noValidate onSubmit={stake}>
                {dAppWallet.connected && (
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    You have {tokenBalance} ergopad tokens.
                  </Typography>
                )}
                <Grid container sx={{mb: 2}} justifyContent={'space-between'} alignItems={'flex-start'} >
                  <Grid container item md={9} xs={8} sx={{ minWidth: 0 }}>
                    <TextField
                      InputProps={{ disableUnderline: true }}
                      required
                      fullWidth
                      id="stakingAmount"
                      label={`Token amount to stake`}
                      name="stakingAmount"
                      variant="filled"
                      onChange={handleStakingFormChange}
                      value={stakingForm.tokenAmount}
                      error={stakingFormErrors.tokenAmount}
                      helperText={
                          stakingFormErrors.tokenAmount && (dAppWallet.connected ? 'Enter a valid token amount' : 'Please connect with yoroi or nautilus to use MaxAmount')
                      }
                    />
                  </Grid>
                  <Grid container item md={2} xs={3} justifyContent="flex-end" sx={{ minWidth: '4.5rem', maxWidth: '4.5rem' }}>
                    <Button
                        sx={{ p: '0.25rem',  minWidth: '4.5rem', maxWidth: '4.5rem' }}
                        onClick={() => {
                          handleStakingFormChange({
                            target: {
                              name: 'stakingAmount',
                              value: tokenBalance,
                            },
                          });
                        }}
                    >
                      Max Amount
                    </Button>
                  </Grid>
                </Grid>
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
                <Grid container justifyContent= "space-between">
                  <Grid container item md={6} xs={6} justifyContent="flex-start">
                    <Button
                        item
                        variant="contained"
                        disabled={stakeLoading || stakingFormErrors.wallet}
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
                  </Grid>
                  <Grid container item md={6} xs={6} justifyContent="flex-end">
                    <Button
                        item
                        sx={{
                          minWidth: 0,
                          fontSize: '1rem',
                          mt: 2,
                          py: '0.6rem',
                          px: '1.2rem',
                          textTransform: 'none'}}
                        onClick={() => {
                          setOpenModal(false);
                          setTransactionSubmitted(null);
                        }}
                    >
                      Close Window
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </Box>
      </Modal>
      <Modal
        open={openUnstakeModal}
        onClose={() => {
          setOpenUnstakeModal(false);
          setTransactionSubmitted(null);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={checkSmall ? modalStyle : { ...modalStyle, width: '85vw' }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Unstake Tokens
          </Typography>
          {transactionSubmitted ? (
            <TransactionSubmitted transaction={transactionSubmitted} />
          ) : (
            <>
              <Typography variant="p" sx={{ fontSize: '1rem', mb: 2 }}>
                Once you click submit you will be prompted by your wallet to
                approve the transaction. There may be a penalty associated with
                early unstaking. The final penalty will be calculated after
                submitting this form. Please note the unstaking penalty before
                approving the transaction in your wallet.
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
                  },
                  {
                    title: 'Penalty',
                    value: unstakePenalty === -1 ? '-' : unstakePenalty,
                    background: theme.palette.background.default,
                  },
                ].map((item) => {
                  return StakingItem(item, 6);
                })}
              </Grid>
              <Box component="form" noValidate onSubmit={unstake}>
                <Grid
                  container
                  spacing={3}
                  alignItems="stretch"
                  justifyContent="center"
                  sx={{ flexGrow: 1 }}
                >
                  <Grid item md={10} xs={9}>
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
                        unstakingFormErrors.tokenAmount &&
                        'Enter a valid token amount'
                      }
                    />
                  </Grid>
                  <Grid item md={2} xs={3}>
                    <Button
                      onClick={() => {
                        handleUnstakingFormChange({
                          target: {
                            name: 'unstakingAmount',
                            value: unstakeModalData.stakeAmount,
                          },
                        });
                      }}
                    >
                      Max Amount
                    </Button>
                  </Grid>
                </Grid>
                <FormHelperText>
                  {unstakingFormErrors.wallet
                    ? 'Please connect with yoroi or nautilus to proceed'
                    : 'Submit to calculate unstaking penalty (if any)'}
                </FormHelperText>
                <Button
                  variant="contained"
                  disabled={unstakeModalLoading || unstakingFormErrors.wallet}
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
            </>
          )}
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
        autoHideDuration={10000}
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
