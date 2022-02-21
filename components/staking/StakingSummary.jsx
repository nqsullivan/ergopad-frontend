import { Box, Grid, Typography } from '@mui/material';
import theme from '@styles/theme';

const stakingItems = [
  {
    title: 'Number of Stakers',
    value: '-',
    background: theme.palette.primary.main,
    md: 4,
  },
  {
    title: 'ErgoPad Tokens Staked',
    value: '-',
    background: theme.palette.secondary.main,
    md: 4,
  },
  {
    title: 'Current APY',
    value: '-',
    background: theme.palette.tertiary.main,
    md: 4,
  },
];

export const StakingItem = (item) => {
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
      <Grid item md={item.md} xs={12} sx={{ maxWidth: '380px' }}>
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

const StakingSummary = () => {
  return (
    <>
      <Grid
        container
        spacing={3}
        alignItems="stretch"
        justifyContent="center"
        sx={{ flexGrow: 1, mb: 3 }}
      >
        {stakingItems.map((item) => {
          return StakingItem(item);
        })}
      </Grid>
    </>
  );
};

export default StakingSummary;
