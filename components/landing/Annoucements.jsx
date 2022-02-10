import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const annoucements = [
  {
    id: 1,
    title: 'Darkpool',
    shortDescription:
      'Stylized RPG where a lone Ergonaut must struggle to survive on a remote alien moon and get back to Earth. Dig, speculate, discover and harvest the mineral ERG for energy. Discover, befriend or defend against local fauna.',
    bannerImgUrl:
      'https://s3-alpha-sig.figma.com/img/05a4/1a67/b9bd6df71f1644ad453a5280e083ccda?Expires=1645401600&Signature=CH5hz87lU45uAJDgi4av6thvnhtAnD~zSqEyizih8WTWbm-icAPsJ1I6LxszwVLM-wEddkmcur8XGiygWCNpsugKjhVg-44-7GTftkmS8Zxv7bhG82YdWXZHQAoosGdf0NQckC9FJW8f8Zgk~6fZQCFfZxlYPnKl-tbH6o4fG6SD4~2Pc0vB8eWoPL18DuPhEzlnJfAovUzMcethq8-pVuYVJmqVTNCqIBQ2qEj8eedhlMOQ01Y41SOP1uUs-U34VF-beRG-aLlbDbkMYrk2gBJSCmEdSscv7gRuyqs9pidTt-ExoEgy0JWc4NeJT2KB3r23XNPGpyW323eZKPLpsQ__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA',
  },
  {
    id: 2,
    title: 'Testing face for Nautilus Wallet',
    shortDescription:
      'Great news! We’re pleased to announce that we were invited to the testing phase for Nautilus Wallet beta. Our Developers have successfully integrated Yoroi Wallet and Nautilus Wallet to the ergopad dAPP.',
    bannerImgUrl:
      'https://s3-alpha-sig.figma.com/img/cca6/4da2/715d0bf8e1d5a5bc1258c32af28bb826?Expires=1645401600&Signature=JRCK62AU-W4BjNfCNHN2ur2rhWD0udoEjCz3xqDb7jVCMn9nQ99IanuS~XanBxOyh0LWh~H1~8zP8vjcQ4o4~oBi3t~E5SmTFqscfMjutwe6NR3fOKtTOCk9miy-i7CPkAgomtrZlEUwGEE56ApweeJPvrv3TxOXYeI16dE0JCwHqLEmP1gZUxzlW68tGAPUyFQ1lg4RPaniCXZZhJr43ycJfE-G6mZBqhqxNWvd6wWAxcLsb5yxEolcn4It-QU3aPi3TqBnKNxmJ2yGWeRUvVskcl~E5alF~~SPUkaO~43ChQauCUfN9fwue~RtqEmMnRqASNTW1oxkHODCivE5uQ__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA',
  },
];

const Annoucements = () => {
  const mtheme = useTheme();
  const matches = useMediaQuery(mtheme.breakpoints.up('md'));
  const annoucementCard = (annoucement) => {
    return (
      <Grid item xs={12} sm={6} md={6} key={annoucement.id}>
        <Card
          sx={{
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent',
          }}
        >
          <CardActionArea>
            <CardMedia
              component="img"
              alt=""
              height={matches ? '300' : '200'}
              image={annoucement.bannerImgUrl}
            />
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                sx={{ my: 3 }}
              >
                {annoucement.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {annoucement.shortDescription}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: '768px',
          }}
        >
          <Typography variant="h2">Annoucements</Typography>
        </Box>
      </Box>
      <Grid container spacing={3} alignItems="stretch" sx={{ mb: 6, mt: 1 }}>
        {annoucements?.map((annoucement) => annoucementCard(annoucement))}
      </Grid>
    </>
  );
};

export default Annoucements;
