import {
  Typography,
  Grid,
  Box,
  TextField,
  Button,
  Container,
} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import TelegramIcon from '@mui/icons-material/Telegram';
import DiscordIcon from '@components/DiscordIcon';
// import FormHelperText from '@mui/material/FormHelperText';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FilledInput from '@mui/material/FilledInput';
import FormHelperText from '@mui/material/FormHelperText';
import PageTitle from '@components/PageTitle';
import theme from '@styles/theme';
import axios from 'axios';
import { useWallet } from 'utils/WalletContext';
import { useAddWallet } from 'utils/AddWalletContext';
import { useState, useEffect, forwardRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const EVENT_NAME = 'staker-paideia-202202wl';

const initialFormData = Object.freeze({
  email: '',
  ergoAddress: '',
});

const initialFormErrors = Object.freeze({
  email: false,
  ergoAddress: false,
});

const initialCheckboxState = Object.freeze({
  legal: false,
  risks: false,
  dao: false,
});

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const emailRegex = /\S+@\S+\.\S+/;

const Whitelist = () => {
  // boolean object for each checkbox
  const [checkboxState, setCheckboxState] = useState(initialCheckboxState);
  // set true to disable submit button
  const [buttonDisabled, setbuttonDisabled] = useState(true);
  // form error object, all booleans
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  // form data is all strings
  const [formData, updateFormData] = useState(initialFormData);
  // loading spinner for submit button
  const [isLoading, setLoading] = useState(false);
  // open error snackbar
  const [openError, setOpenError] = useState(false);
  // open success modal
  const [openSuccess, setOpenSuccess] = useState(false);
  // change error message for error snackbar
  const [errorMessage, setErrorMessage] = useState(
    'Please eliminate form errors and try again'
  );
  // disable form after API endpoint reports max submissions hit
  const [soldOut, setSoldOut] = useState(false);
  const [timeLock, setTimeLock] = useState(true);
  // brings wallet data from AddWallet modal component. Will load from localStorage if wallet is set
  const { wallet } = useWallet();
  // opens the modal to set wallet into localStorage
  const { setAddWalletOpen } = useAddWallet();

  const openWalletAdd = () => {
    setAddWalletOpen(true);
  };

  const apiCheck = () => {
    // call new endpoint for checking
    axios
      .get(`${process.env.API_URL}/whitelist/info/${EVENT_NAME}`, {
        ...defaultOptions,
      })
      .then((res) => {
        // only enable button for the window
        if (res.data.isBeforeSignup) {
          setTimeLock(true);
          setSoldOut(false);
        } else if (res.data.isAfterSignup || res.data.isFundingComplete) {
          setTimeLock(false);
          setSoldOut(true);
        } else {
          setTimeLock(false);
          setSoldOut(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    apiCheck();
  }, []);

  useEffect(() => {
    updateFormData({
      ...formData,
      ergoAddress: wallet,
    });
    if (wallet) {
      setFormErrors({
        ...formErrors,
        ergoAddress: false,
      });
    } else {
      setFormErrors({
        ...formErrors,
        ergoAddress: true,
      });
    }
  }, [wallet]);

  useEffect(() => {
    if (isLoading) {
      setbuttonDisabled(true);
    } else {
      setbuttonDisabled(false);
    }
  }, [isLoading]);

  const handleChange = (e) => {
    if (e.target.value == '' && e.target.name !== 'email') {
      setFormErrors({
        ...formErrors,
        [e.target.name]: true,
      });
    } else {
      setFormErrors({
        ...formErrors,
        [e.target.name]: false,
      });
    }

    if (e.target.name === 'email') {
      if (emailRegex.test(e.target.value) || e.target.value === '') {
        setFormErrors({
          ...formErrors,
          email: false,
        });
      } else {
        setFormErrors({
          ...formErrors,
          email: true,
        });
      }
    }

    updateFormData({
      ...formData,

      // Trimming any whitespace
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleChecked = (e) => {
    setCheckboxState({
      ...checkboxState,
      [e.target.name]: e.target.checked,
    });
  };

  const { legal, risks, dao } = checkboxState;
  const checkboxError = [legal, risks, dao].filter((v) => v).length !== 3;

  useEffect(() => {
    if (!checkboxError && !timeLock && !soldOut) {
      setbuttonDisabled(false);
    } else {
      setbuttonDisabled(true);
    }
  }, [checkboxError, timeLock, soldOut]);

  // snackbar for error reporting
  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  // modal for success message
  const handleCloseSuccess = () => {
    setOpenSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const emptyCheck = formData.ergoAddress !== '';
    const errorCheck = Object.values(formErrors).every((v) => v === false);

    const form = {
      name: '__anon_ergonaut',
      email: formData.email,
      sigValue: 0,
      ergoAddress: formData.ergoAddress,
      chatHandle: '__hardcoded_patch',
      chatPlatform: '__hardcoded_patch',
      socialHandle: '__hardcoded_patch',
      socialPlatform: '__hardcoded_patch',
      event: EVENT_NAME,
    };

    if (errorCheck && emptyCheck) {
      axios
        .post(`${process.env.API_URL}/whitelist/signup`, { ...form })
        .then(() => {
          setLoading(false);
          // modal for success message
          setOpenSuccess(true);
        })
        .catch((err) => {
          // snackbar for error message
          setErrorMessage(
            'Error: ' + err.response.status + ' - ' + err.response.data
          );
          setOpenError(true);
          setLoading(false);
        });
    } else {
      let updateErrors = {};
      Object.entries(formData).forEach((entry) => {
        const [key, value] = entry;
        if (value == '') {
          let newEntry = { [key]: true };
          updateErrors = { ...updateErrors, ...newEntry };
        }
      });

      setFormErrors({
        ...formErrors,
        ...updateErrors,
      });

      // snackbar for error message
      setErrorMessage('Please eliminate form errors and try again');
      setOpenError(true);

      // turn off loading spinner for submit button
      setLoading(false);
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <PageTitle
          title="Paideia Staker Whitelist"
          subtitle="Apply here for the Paideia staker round. $ERGOPAD stakers will get exclusive access to this sale."
          // main={true}
        />
      </Container>

      <Grid
        container
        maxWidth="lg"
        sx={{ mx: 'auto', flexDirection: 'row-reverse', px: { xs: 2, md: 3 } }}
      >
        <Grid item md={4} sx={{ pl: { md: 4, xs: 0 } }}>
          <Box sx={{ mt: { md: 0, xs: 4 } }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: '700', lineHeight: '1.2' }}
            >
              Join the discussion
            </Typography>
            <Typography variant="p" sx={{ fontSize: '1rem', mb: 3 }}>
              Stay updated on the latest ErgoPad annoucements and upcoming
              events.
            </Typography>
            <Box>
              <a
                href="https://t.me/ergopad_chat"
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  startIcon={<TelegramIcon />}
                  variant="contained"
                  sx={{
                    color: '#fff',
                    fontSize: '1rem',
                    py: '0.6rem',
                    px: '1.2rem',
                    mr: '1.7rem',
                    textTransform: 'none',
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.hover,
                      boxShadow: 'none',
                    },
                    '&:active': {
                      backgroundColor: theme.palette.primary.active,
                    },
                  }}
                >
                  Telegram
                </Button>
              </a>
              <a
                href="https://discord.gg/E8cHp6ThuZ"
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  startIcon={<DiscordIcon />}
                  variant="contained"
                  sx={{
                    color: '#fff',
                    fontSize: '1rem',
                    py: '0.6rem',
                    px: '1.2rem',
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
                  Discord
                </Button>
              </a>
            </Box>
          </Box>

          <Typography
            variant="h4"
            sx={{ fontWeight: '700', lineHeight: '1.2', mt: 6 }}
          >
            Details
          </Typography>
          <Typography variant="p" sx={{ fontSize: '1rem', mb: 3 }}>
            Sign up to have your address scanned for the ergopad staker round
            for Paideia. The snapshot will take place March 5th at 15:00 UTC,
            and allocation will be determined by your staking tier at that time.
          </Typography>
          <Typography variant="p" sx={{ fontSize: '1rem', mb: 3 }}>
            You may include your email address to be notified of your allocation
            and with further instructions, but it is not required.
          </Typography>
        </Grid>

        <Grid item md={8}>
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: '700' }}>
              Application Form
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  InputProps={{ disableUnderline: true }}
                  fullWidth
                  name="email"
                  label="Your Email"
                  error={formErrors.email}
                  id="email"
                  variant="filled"
                  helperText={
                    formErrors.email && 'Please enter a valid email address'
                  }
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography color="text.secondary">
                  Select your primary wallet address for whitelisting.
                </Typography>
                <FormControl
                  sx={{ mt: 1 }}
                  variant="filled"
                  fullWidth
                  required
                  error={formErrors.ergoAddress}
                >
                  <InputLabel
                    htmlFor="ergoAddress"
                    sx={{ '&.Mui-focused': { color: 'text.secondary' } }}
                  >
                    Ergo Wallet Address
                  </InputLabel>
                  <FilledInput
                    id="ergoAddress"
                    value={wallet}
                    onClick={openWalletAdd}
                    readOnly
                    disableUnderline={true}
                    name="ergoAddress"
                    sx={{
                      width: '100%',
                      border: '1px solid rgba(82,82,90,1)',
                      borderRadius: '4px',
                    }}
                  />
                  <FormHelperText>
                    Your address will be pre-approved on the whitelist
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <FormControl required error={checkboxError}>
              <FormGroup sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={legal}
                      onChange={handleChecked}
                      name="legal"
                    />
                  }
                  label="I have confirmed that I am legally entitled to invest in a cryptocurrency project of this nature in the jurisdiction in which I reside"
                  sx={{ color: theme.palette.text.secondary, mb: 3 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={risks}
                      onChange={handleChecked}
                      name="risks"
                    />
                  }
                  label="I am aware of the risks involved when investing in a project of this nature. There is always a chance an investment with this level of risk can lose all it's value, and I accept full responsiblity for my decision to invest in this project"
                  sx={{ color: theme.palette.text.secondary, mb: 3 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dao}
                      onChange={handleChecked}
                      name="dao"
                    />
                  }
                  label="I understand that the funds raised by this project will be controlled by the Paideia DAO, which has board members throughout the world. I am aware that this DAO does not fall within the jurisdiction of any one country, and accept the implications therein."
                  sx={{ color: theme.palette.text.secondary, mb: 3 }}
                />
                <FormHelperText>
                  {checkboxError && 'Please accept the terms before submitting'}
                </FormHelperText>
              </FormGroup>
            </FormControl>
            <Box sx={{ position: 'relative' }}>
              <Button
                type="submit"
                fullWidth
                disabled={buttonDisabled}
                // disabled={true}
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Submit
              </Button>
              {isLoading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-9px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
            <Typography sx={{ color: theme.palette.text.secondary }}>
              {soldOut &&
                'We apologize for the inconvenience, the pre-sale round is sold out'}
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary }}>
              {timeLock &&
                'This form is not yet active. Please check back later.'}
            </Typography>
            <Snackbar
              open={openError}
              autoHideDuration={6000}
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
              open={openSuccess}
              autoHideDuration={6000}
              onClose={handleCloseSuccess}
            >
              <Alert
                onClose={handleCloseSuccess}
                severity="success"
                sx={{ width: '100%' }}
              >
                Saved
              </Alert>
            </Snackbar>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Whitelist;
