import {
  Button,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import theme from '@styles/theme';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const mtheme = useTheme();
  const matches = useMediaQuery(mtheme.breakpoints.up('md'));
  const router = useRouter();

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} sx={{ mb: { md: 10, sx: 6 } }}>
          <Image
            src="/landing-dashboard.png"
            alt="ErgoPad Dashboard"
            layout="fixed"
            width={matches ? '500' : '320'}
            height={matches ? '500' : '320'}
            priority={true}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mb: 10 }}>
          <Typography variant="h2">Dashboard</Typography>
          <Typography variant="p">
            In sit amet mauris in metus accumsan cursus. Etiam ut aliquet ante,
            vitae consectetur metus. Aliquam erat volutpat. Aliquam semper nunc
            sit amet pulvinar commodo. Sed ultrices sem quis tincidunt
            fermentum. Quisque fermentum efficitur risus, ac condimentum sem
            elementum ac. Nulla dui odio, rhoncus quis ex eu, auctor ultricies
            sem. Vestibulum venenatis hendrerit felis ac laoreet. Aliquam mattis
            ultrices augue eget dictum. Etiam sollicitudin, mi vel malesuada
            interdum, neque nisl tempus mauris, lobortis tempus orci purus sit
            amet mauris. Integer molestie at purus eget luctus. Cras sapien
            libero, vehicula quis pretium quis, gravida non nibh. Vivamus
            fringilla finibus convallis.
          </Typography>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="contained"
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
            Explore dashboard
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
