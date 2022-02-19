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
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CenterTitle from '@components/CenterTitle';
import theme from '@styles/theme';
import useMediaQuery from '@mui/material/useMediaQuery';
import MuiNextLink from '@components/MuiNextLink';
import { useWallet } from 'utils/WalletContext';
import { forwardRef, useEffect, useState } from 'react';
import axios from 'axios';

const STAKE_TOKEN_ID =
  '000e21f8e51ad4a3d3bdde9ac34d19eb2c24c92d2022260af6f99148cbc021d1';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const stakingItem = (item) => {
  const extraStyles = {
    background: item.background,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    py: '1rem',
    color: '#fff',
    borderRadius: 2,
    textDecoration: 'none',
    '&:hover': {},
  };

  return (
    <>
      <Grid item md={4} xs={12} sx={{ maxWidth: '380px' }}>
        <Box sx={extraStyles}>
          <Typography variant="h5" sx={{ fontWeight: '700', my: 1 }}>
            {item.title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: '800', my: 1 }}>
            {item.value}
          </Typography>
        </Box>
      </Grid>
    </>
  );
};

const stakedHeading = {
  boxId: 'Box Id',
  stakeAmount: 'Number of Tokens',
  penaltyPct: 'Penalty %',
  penaltyEndTime: 'Penalty End',
  unstake: '',
};

const sampleData = Object.freeze({
  totalStaked: 14140410,
  addresses: {
    '9eZ77otC8nncPcph58K4wDTuaebnRT5ahLMFdXFWtCQyqkvnkrC': {
      totalStaked: 14140410,
      stakeBoxes: [
        {
          boxId:
            'fc4f69c99fb13fd43d23529bd1aeea678a16ba16061fdfd1a67be2d892939255',
          stakeKeyId:
            'ab14a7caa142ceb5a71026ae9b0f83157e0fba9ec584fe5c1972895704879ccb',
          stakeAmount: 1000,
          penaltyPct: 25,
          penaltyEndTime: 1649856211862,
        },
        {
          boxId:
            '290a2656634835820f68938914875973a91fbb63edbc3c3e8fd35c58fbb27c55',
          stakeKeyId:
            '984c24667bba40d090cd133b7f7096f4095d31f5e1f70f6e8e8196246f6ff7f7',
          stakeAmount: 14134566,
          penaltyPct: 25,
          penaltyEndTime: 1649763635216,
        },
        {
          boxId:
            'faa88b752725c61bcb1c8de9c95422ea9d940270ea8f5b21e6c91335404ddd55',
          stakeKeyId:
            '97b58c64ae6ebc1f5efd8d2e2bbce1274ec2c5530d023ca7fe32eda7dcd92677',
          stakeAmount: 1211,
          penaltyPct: 25,
          penaltyEndTime: 1649795587634,
        },
        {
          boxId:
            '63886183bc439a42136267c59142c2a07dc4352b0c792e32ea2d8861edcf8d07',
          stakeKeyId:
            'e8c46216d87ffdb16d60676a32e893fa70059f41ead869a690ee711210e909ee',
          stakeAmount: 1211,
          penaltyPct: 25,
          penaltyEndTime: 1649796900027,
        },
        {
          boxId:
            '8629d1de7c65955143773f6ac72bbf532f5a5d61b69419a9a27c77ba642adc08',
          stakeKeyId:
            '81dcd6114092f799d26d973c39d781b89e096f65ec6ff35058567805f6c9fd7e',
          stakeAmount: 1211,
          penaltyPct: 25,
          penaltyEndTime: 1649797138402,
        },
        {
          boxId:
            '84b73fd5bf5cd83d3a075857e07995f63b8fd8ffc5a28e4418cbfbb82d3468fa',
          stakeKeyId:
            '8f70a6d96fc957e343506800459118f3665fd8ae226af69292107f2171f458cd',
          stakeAmount: 1211,
          penaltyPct: 25,
          penaltyEndTime: 1649834685912,
        },
      ],
    },
  },
});

const friendlyAddress = (addr, tot = 15) => {
  if (addr === undefined || addr.slice === undefined) return '';
  if (addr.length < 30) return addr;
  return addr.slice(0, tot) + '...' + addr.slice(-tot);
};

const UnStakingTable = ({ data, unstake }) => {
  const checkSmall = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const stakeObject = { ...data };

  if (stakeObject.totalStaked === 0) {
    return (
      <>
        <Box>
          <Typography
            variant="p"
            color="text.primary"
            sx={{ fontWeight: '400', fontSize: '1rem', mb: 1, pl: 1 }}
          >
            Looks like you do not have any staked tokens associated with your
            this address. This page only shows tokens for the selected address.
            For overall wallet summary visit the dashboard.
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Box>
        <Typography variant="h6" color="text.primary" sx={{ mb: 1, pl: 1 }}>
          Total Staked Tokens: {stakeObject.totalStaked}
        </Typography>
        <Typography
          variant="p"
          sx={{ fontWeight: '400', fontSize: '1rem', mb: 1, pl: 1 }}
        >
          Note: You may have staked tokens associated with other addresses in
          your wallet. This page only shows tokens for the selected address. For
          overall wallet summary visit the dashboard.
        </Typography>
      </Box>
      {Object.keys(stakeObject.addresses).map((address) => (
        <Box sx={{ mt: 4 }} key={address}>
          <Typography
            variant="p"
            color="text.primary"
            sx={{ fontWeight: '600', fontSize: '1rem', mb: 1, pl: 1 }}
          >
            Address:{' '}
            <Typography
              variant="span"
              color="text.secondary"
              sx={{ textTransform: 'capitalize', fontWeight: '400' }}
            >
              {checkSmall ? address : friendlyAddress(address)}
            </Typography>
          </Typography>
          <Typography
            variant="p"
            color="text.primary"
            sx={{ fontWeight: '600', fontSize: '1rem', mb: 1, pl: 1 }}
          >
            Total Staked:{' '}
            <Typography
              variant="span"
              color="text.secondary"
              sx={{ textTransform: 'capitalize', fontWeight: '400' }}
            >
              {stakeObject.addresses[address].totalStaked}
            </Typography>
          </Typography>
          {checkSmall ? (
            <Table sx={{ mb: 3 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: '600' }}>
                    {stakedHeading.boxId}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>
                    {stakedHeading.stakeAmount}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>
                    {stakedHeading.penaltyPct}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>
                    {stakedHeading.penaltyEndTime}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>
                    {stakedHeading.unstake}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stakeObject.addresses[address].stakeBoxes.map((stake) => {
                  return (
                    <TableRow key={stake.boxId}>
                      <TableCell sx={{ color: theme.palette.text.secondary }}>
                        {stake.boxId}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary }}>
                        {stake.stakeAmount}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary }}>
                        {stake.penaltyPct}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary }}>
                        {new Date(stake.penaltyEndTime)
                          .toISOString()
                          .slice(0, 10)}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary }}>
                        <a>
                          <Button
                            sx={{
                              color: '#fff',
                              py: '0.6rem',
                              px: '1.2rem',
                              textTransform: 'none',
                              '&:hover': {
                                background: 'transparent',
                                boxShadow: 'none',
                              },
                            }}
                            onClick={() =>
                              unstake(
                                stake.boxId,
                                stake.stakeKeyId,
                                stake.stakeAmount
                              )
                            }
                          >
                            Unstake
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Table sx={{ p: 0 }}>
              {stakeObject.addresses[address].stakeBoxes.map((stake) => {
                return (
                  <>
                    <TableRow sx={{ borderTop: `1px solid #444` }}>
                      <TableCell
                        sx={{
                          color: theme.palette.text.secondary,
                          border: 'none',
                          p: 1,
                          pt: 2,
                        }}
                      >
                        {stakedHeading.stakeAmount}
                      </TableCell>
                      <TableCell sx={{ border: 'none', p: 1, pt: 2 }}>
                        {stake.stakeAmount}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: theme.palette.text.secondary,
                          border: 'none',
                          p: 1,
                        }}
                      >
                        {stakedHeading.penaltyPct}
                      </TableCell>
                      <TableCell sx={{ border: 'none', p: 1 }}>
                        {stake.penaltyPct}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: theme.palette.text.secondary,
                          border: 'none',
                          p: 1,
                        }}
                      >
                        {stakedHeading.penaltyEndTime}
                      </TableCell>
                      <TableCell sx={{ border: 'none', p: 1 }}>
                        {new Date(stake.penaltyEndTime)
                          .toISOString()
                          .slice(0, 10)}
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
            </Table>
          )}
        </Box>
      ))}
    </>
  );
};

const stakingItems = [
  {
    title: 'Number of Stakers',
    value: '-',
    background: theme.palette.primary.main,
  },
  {
    title: 'ErgoPad Tokens Staked',
    value: '-',
    background: theme.palette.secondary.main,
  },
  {
    title: 'Current APY',
    value: '-',
    background: theme.palette.tertiary.main,
  },
];

const gridBox = {
  background: 'rgba(35, 35, 39, 0.7)',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  textAlign: 'center',
  p: 4,
  color: '#fff',
  borderRadius: 2,
  border: 1,
  borderColor: 'rgba(46,46,51,1)',
  width: '100%',
  minWidth: '240px',
  maxWidth: '380px',
};

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

const unstakeFees = [
  {
    fee: '25%',
    time: 'Less than 2 weeks',
  },
  {
    fee: '20%',
    time: 'Between 2 and 4 weeks',
  },
  {
    fee: '12.5%',
    time: 'Between 4 and 6 weeks',
  },
  {
    fee: '5%',
    time: 'Between 6 and 8 weeks',
  },
  {
    fee: '0%',
    time: 'More than 8 weeks',
  },
];

const stakingHeading = {
  tier: 'Tier',
  value: 'Amount',
  requirements: 'Staking Requirements',
  weight: 'Allocation Weight',
};

const stakingTiers = [
  {
    tier: '(A) Alpha',
    value: '25000',
    requirements: 'Twitter like, retweet',
    weight: '10',
  },
  {
    tier: '(B) Beta',
    value: '50000',
    requirements: 'Twitter like, retweet',
    weight: '24',
  },
  {
    tier: '(Γ) Gamma',
    value: '100000',
    requirements: 'Twitter like, retweet',
    weight: '58',
  },
  {
    tier: '(Ω) Omega',
    value: '250000',
    requirements: 'Twitter like',
    weight: '175',
  },
  {
    tier: '(Φ) Phi',
    value: '500000',
    requirements: 'Twitter like',
    weight: '420',
  },
  {
    tier: '(Σ) SIgma',
    value: '1500000',
    requirements: 'none',
    weight: '1500',
  },
];

const StakingTiers = () => {
  const checkSmall = useMediaQuery((theme) => theme.breakpoints.up('md'));
  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: '700' }}>
        Staking Tiers
      </Typography>
      {checkSmall ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: '800' }}>Tier</TableCell>
              <TableCell sx={{ fontWeight: '800' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: '800' }}>
                Allocation Weight
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stakingTiers.map((tier) => {
              return (
                <TableRow key={tier.tier}>
                  <TableCell
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: '800',
                    }}
                  >
                    {tier.tier}
                  </TableCell>
                  <TableCell>{tier.value}</TableCell>
                  <TableCell>{tier.weight}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <Table sx={{ p: 0 }}>
          {stakingTiers.map((tier) => {
            return (
              <>
                <TableRow sx={{ borderTop: `1px solid #444` }}>
                  <TableCell
                    sx={{
                      color: theme.palette.text.secondary,
                      border: 'none',
                      p: 1,
                      pt: 2,
                    }}
                  >
                    {stakingHeading.tier}
                  </TableCell>
                  <TableCell sx={{ border: 'none', p: 1, pt: 2 }}>
                    {tier.tier}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      color: theme.palette.text.secondary,
                      border: 'none',
                      p: 1,
                    }}
                  >
                    {stakingHeading.value}
                  </TableCell>
                  <TableCell sx={{ border: 'none', p: 1 }}>
                    {tier.value}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      color: theme.palette.text.secondary,
                      border: 'none',
                      p: 1,
                      pb: 2,
                    }}
                  >
                    {stakingHeading.weight}
                  </TableCell>
                  <TableCell sx={{ border: 'none', p: 1, pb: 2 }}>
                    {tier.weight}
                  </TableCell>
                </TableRow>
              </>
            );
          })}
        </Table>
      )}
    </>
  );
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
    setUnstakeModalLoading(false);
  };

  // snackbar for error reporting
  const handleCloseError = (e, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

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
      <Container maxWidth="lg" sx={{}}>
        <Grid
          container
          spacing={3}
          alignItems="stretch"
          justifyContent="center"
          sx={{ flexGrow: 1, mb: 3 }}
        >
          {stakingItems.map((item) => {
            return stakingItem(item);
          })}
        </Grid>
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
          <Grid item xs={12} md={4} sx={{}}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: '700' }}>
                Your Holdings
              </Typography>
            </Box>
            <Box
              sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <Box sx={gridBox}>
                <Typography>ErgoPad Staked</Typography>
                <Typography variant="h3" sx={{ mb: 3 }}>
                  -
                </Typography>
                <Typography>Rewards</Typography>
                <Typography variant="h3" sx={{ mb: 3 }}>
                  -
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <a href="#withdraw">
                    <Button
                      variant="contained"
                      sx={{
                        color: '#fff',
                        fontSize: '1rem',
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
                    >
                      Withdraw
                    </Button>
                  </a>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-start' },
                flexDirection: 'column',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: '700', mt: 6 }}>
                Early Unstaking Fees
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: '800' }}>Fee</TableCell>
                    <TableCell sx={{ fontWeight: '800' }}>
                      Time staked
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unstakeFees.map((fee) => {
                    return (
                      <TableRow key={fee.fee}>
                        <TableCell
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: '800',
                          }}
                        >
                          {fee.fee}
                        </TableCell>
                        <TableCell>{fee.time}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
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
            <UnStakingTable
              data={sampleData}
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
            Staked amount in this box: {unstakeModalData.stakeAmount}
          </Typography>
          <Typography variant="p" sx={{ fontSize: '1rem', mb: 2 }}>
            Once you click submit you will be prompted by your wallet to approve
            the transaction.
          </Typography>
          <Typography variant="p" sx={{ fontSize: '1rem', mb: 2 }}>
            {unstakePenalty === -1 ? (
              'Please submit to calculate penalty...'
            ) : (
              <>Early Unstaking Penalty: {unstakePenalty}</>
            )}
          </Typography>
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
              {unstakingFormErrors.wallet &&
                'Please connect with yoroi or nautilus to proceed'}
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
