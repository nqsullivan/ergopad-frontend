import {
  Grid,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import { forwardRef } from 'react';
import { useEffect, useState } from 'react';
import theme from '../../styles/theme';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import FileUploadS3 from '../FileUploadS3';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const initialFormData = Object.freeze({
  url: '',
  name: '',
  shortDescription: '',
  description: '',
  fundsRaised: 0,
  teamTelegramHandle: '',
  bannerImgUrl: '',
  isLaunched: false,
  team: [],
});

const initialFormErrors = Object.freeze({
  name: false,
  shortDescription: false,
  fundsRaised: false,
  bannerImgUrl: false,
});

const EditProjectForm = () => {
  // form data is all strings
  const [formData, updateFormData] = useState(initialFormData);
  // form error object, all booleans
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  // loading spinner for submit button
  const [isLoading, setLoading] = useState(false);
  // set true to disable submit button
  const [buttonDisabled, setbuttonDisabled] = useState(false);
  // open error snackbar
  const [openError, setOpenError] = useState(false);
  // open success modal
  const [openSuccess, setOpenSuccess] = useState(false);
  // change error message for error snackbar
  const [errorMessage, setErrorMessage] = useState(
    'Please eliminate form errors and try again'
  );

  useEffect(() => {
    if (isLoading) {
      setbuttonDisabled(true);
    } else {
      setbuttonDisabled(false);
    }
  }, [isLoading]);

  // snackbar for error reporting
  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  // modal for success message
  const handleCloseSuccess = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSuccess(false);
  };

  const handleChange = (e) => {
    if (
      e.target.value == '' &&
      Object.hasOwnProperty.call(formErrors, e.target.name)
    ) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: true,
      });
    } else if (Object.hasOwnProperty.call(formErrors, e.target.name)) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: false,
      });
    }

    if (e.target.name == 'fundsRaised') {
      if (isNaN(parseFloat(e.target.value))) {
        setFormErrors({
          ...formErrors,
          fundsRaised: true,
        });
      } else {
        setFormErrors({
          ...formErrors,
          fundsRaised: false,
        });
      }
    }

    updateFormData({
      ...formData,
      // Trimming any whitespace
      [e.target.name]:
        e.target.name === 'isLaunched'
          ? e.target.checked
          : e.target.value.trim(),
    });
  };

  const fetchDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOpenError(false);
    try {
      const parsedUrl = formData.url.split('/');
      const projectId = parsedUrl[parsedUrl.length - 1];
      const res = await axios.get(
        `${process.env.API_URL}/projects/${projectId}`
      );
      updateFormData({ ...formData, ...res.data });
    } catch (e) {
      setErrorMessage('Project not found');
      setOpenError(true);
    }
    setLoading(false);
  };

  const handleImageUpload = (res) => {
    if (res.status === 'success') {
      updateFormData({ ...formData, bannerImgUrl: res.image_url });
      setFormErrors({ ...formErrors, bannerImgUrl: false });
    } else {
      setErrorMessage('Image upload failed');
      setOpenError(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOpenError(false);
    setLoading(true);
    const errorCheck = Object.values(formErrors).every((v) => v === false);
    if (errorCheck) {
      const parsedUrl = formData.url.split('/');
      const projectId = parsedUrl[parsedUrl.length - 1];
      const defaultOptions = {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem(
            'jwt_token_login_422'
          )}`,
        },
      };
      const data = { ...formData };
      try {
        await axios.put(
          `${process.env.API_URL}/projects/${projectId}`,
          data,
          defaultOptions
        );
        setOpenSuccess(true);
        updateFormData(initialFormData);
      } catch {
        setErrorMessage('Invalid credentials or form data');
        setOpenError(true);
      }
    } else {
      let updateErrors = {};
      Object.entries(formData).forEach((entry) => {
        const [key, value] = entry;
        if (value == '' && Object.hasOwnProperty.call(formErrors, key)) {
          let newEntry = { [key]: true };
          updateErrors = { ...updateErrors, ...newEntry };
        }
      });
      setFormErrors({
        ...formErrors,
        ...updateErrors,
      });
      setErrorMessage('Please eliminate form errors and try again');
      setOpenError(true);
    }
    setLoading(false);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h4" sx={{ mt: 10, mb: 2, fontWeight: '700' }}>
          Edit Project
        </Typography>
        <Grid container spacing={2} />
        <Grid item xs={12}>
          <Typography color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            Enter the url of the project to edit. Eg.
            https://ergopad.io/projects/project_id and press FETCH PROJECT
            DETAILS to prefill form
          </Typography>
          <TextField
            InputProps={{ disableUnderline: true }}
            required
            fullWidth
            id="url"
            label="Project Url"
            name="url"
            variant="filled"
            value={formData.url}
            onChange={handleChange}
          />
        </Grid>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Button
            onClick={fetchDetails}
            disabled={buttonDisabled}
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Fetch Project Details
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
        <Grid item xs={12}>
          <TextField
            InputProps={{ disableUnderline: true }}
            required
            fullWidth
            id="name"
            label="Project Name"
            name="name"
            variant="filled"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            helperText={formErrors.name && 'Enter the project name'}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            A short summary for the project.
          </Typography>
          <TextField
            InputProps={{ disableUnderline: true }}
            required
            fullWidth
            id="shortDescription"
            label="Project Short Description"
            name="shortDescription"
            variant="filled"
            value={formData.shortDescription}
            onChange={handleChange}
            error={formErrors.shortDescription}
            helperText={
              formErrors.shortDescription && 'Enter the project summary'
            }
          />
        </Grid>
        <Grid item xs={12} sx={{ mt: 2 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            required
            disabled
            fullWidth
            id="bannerImgUrl"
            label="Banner Image Url"
            name="bannerImgUrl"
            variant="filled"
            value={formData.bannerImgUrl}
            onChange={handleChange}
            error={formErrors.bannerImgUrl}
            helperText={formErrors.bannerImgUrl && 'Banner image is required'}
          />
        </Grid>
        <Box sx={{ position: 'relative', my: 2 }}>
          <FileUploadS3 onUpload={handleImageUpload} />
        </Box>
        <Grid item xs={12}>
          <Typography color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            Detailed description and project deliverables.
          </Typography>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            multiline
            id="description"
            label="Project Description"
            name="description"
            variant="filled"
            value={formData.description}
            onChange={handleChange}
            rows={6}
          />
        </Grid>
        <Grid item xs={12} sx={{ mt: 1 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            required
            fullWidth
            id="fundsRaised"
            label="Funds Raised in USD"
            name="fundsRaised"
            variant="filled"
            value={formData.fundsRaised}
            onChange={handleChange}
            error={formErrors.fundsRaised}
            helperText={
              formErrors.fundsRaised && 'Funds should be a valid number'
            }
          />
        </Grid>
        <Grid item xs={12} sx={{ mt: 1 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            id="teamTelegramHandle"
            label="Team Telegram Handle"
            name="teamTelegramHandle"
            variant="filled"
            value={formData.teamTelegramHandle}
            onChange={handleChange}
          />
        </Grid>
        <FormControlLabel
          control={
            <Checkbox
              name="isLaunched"
              value={formData.isLaunched}
              onChange={handleChange}
            />
          }
          label="Launched?"
          sx={{ color: theme.palette.text.secondary, mb: 3 }}
        />
        <Box sx={{ position: 'relative' }}>
          <Button
            type="submit"
            disabled={buttonDisabled}
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
      </Box>
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
          Changes were saved.
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditProjectForm;
