import { useRouter } from 'next/router';
import { Container, Typography, IconButton, Divider, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import PageTitle from '@components/PageTitle';
import Link from '@components/MuiNextLink';
import CenterTitle from '@components/CenterTitle';
import RelatedLinks from '@components/RelatedLinks/RelatedLinks';
import TelegramIcon from '@mui/icons-material/Telegram';
import ShareIcon from '@mui/icons-material/Share';
import theme from '../../styles/theme';
import CopyToClipboard from '../../components/CopyToClipboard';
import { useEffect, useState } from 'react';
import axios from 'axios';

const relatedLinkList = [
  {
    id: 0,
    title: 'Documentation',
    caption: 'Read about how Ergopad Works',
    icon: 'auto_stories',
    href: 'https://github.com/ergo-pad/ergopad/blob/main/docs/README.md',
    background: theme.palette.primary.main,
  },
  {
    id: 1,
    title: 'About',
    caption: 'Learn more about who we are',
    icon: 'emoji_people',
    href: '/about',
    background: theme.palette.secondary.main,
  },
  {
    id: 2,
    title: 'Apply for IDO',
    caption: 'Submit your own project proposal',
    icon: 'chat',
    href: '/apply',
    background: theme.palette.tertiary.main,
  },
];

const Project = () => {
  const router = useRouter();
  const { project_id } = router.query;
  const [isLoading, setLoading] = useState(true);
  const [project, setProject] = useState({});

  useEffect(() => {
    const getProject = async () => {
      try {
        const res = await axios.get(
          `${process.env.API_URL}/projects/${project_id}`
        );
        setProject(res.data);
      } catch {
        setProject(null);
      }
      setLoading(false);
    };

    if (project_id) getProject();
  }, [project_id]);

  return (
    <>
      {project ? (
        <>
          {isLoading && (
            <Container sx={{ mb: '3rem' }}>
              <CircularProgress
                size={24}
                sx={{
                  position: 'relative',
                  left: '50%',
                  marginLeft: '-12px',
                  marginTop: '120px',
                }}
              />
            </Container>
          )}
          {!isLoading && (
            <Container maxWidth="760px" sx={{ maxWidth: '760px', mx: 'auto' }}>
              <img
                src={project.bannerImgUrl}
                alt={project.name}
                height="50%"
                width="100%"
              />
              <Box sx={{ mt: '-5rem' }}>
                <PageTitle title={project.name} />
              </Box>
              {/* <Typography variant="h4">Summary:</Typography> */}
              <Typography variant="h5">{project.shortDescription}</Typography>
              <Typography variant="h4">
                Funds raised:{' '}
                {project.fundsRaised ? project.fundsRaised : 'N/A'}
              </Typography>
              <Divider sx={{ width: '100%', mb: '1.5rem' }} />
              <Typography variant="h4">Description</Typography>
              <Typography variant="p">
                {project.description
                  ? project.description
                  : 'Update project description for content in this section.'}
              </Typography>
              <Divider sx={{ width: '100%', mb: '1.5rem' }} />
              <Typography variant="h4">Meet the team</Typography>
              {/* todo: Add rendering for team */}
              <Typography variant="p">
                Update team description for content in this section.
              </Typography>
              {project.teamTelegramHandle ? (
                <Link
                  href={project.teamTelegramHandle}
                  aria-label="Telegram"
                  title="Telegram"
                  rel="noreferrer"
                  target="_blank"
                >
                  <IconButton aria-label="telegram">
                    <TelegramIcon />
                  </IconButton>
                </Link>
              ) : null}
              <CopyToClipboard>
                {({ copy }) => (
                  <IconButton
                    aria-label="share"
                    onClick={() => copy(window.location)}
                  >
                    <ShareIcon />
                  </IconButton>
                )}
              </CopyToClipboard>
            </Container>
          )}
        </>
      ) : (
        <CenterTitle
          title="Oops..."
          subtitle="Looks like the project you are looking for doesn't exist."
          main={true}
        />
      )}
      <RelatedLinks title="Learn More" subtitle="" links={relatedLinkList} />
    </>
  );
};

export default Project;
