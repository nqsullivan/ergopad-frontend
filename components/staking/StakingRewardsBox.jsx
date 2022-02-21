import { Box, Button, Typography } from '@mui/material';
import theme from '@styles/theme';

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

const StakingRewardsBox = () => {
  return (
    <>
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
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
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
    </>
  );
};

export default StakingRewardsBox;
