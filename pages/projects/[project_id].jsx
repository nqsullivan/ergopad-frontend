import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  IconButton,
  Divider,
  Box,
  Grid,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@components/MuiNextLink';
import CenterTitle from '@components/CenterTitle';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import PublicIcon from '@mui/icons-material/Public';
import ShareIcon from '@mui/icons-material/Share';
import CopyToClipboard from '@components/CopyToClipboard';
import DiscordIcon from '@components/DiscordIcon';
import { useEffect, useState } from 'react';
import axios from 'axios';

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

  const MultilineProjectDescription = ({ description }) => {
    return (
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <Typography variant="h4" {...props} />,
          h2: ({ node, ...props }) => <Typography variant="h5" {...props} />,
          h3: ({ node, ...props }) => <Typography variant="h6" {...props} />,
          p: ({ node, ...props }) => <Typography variant="p" {...props} />,
        }}
        remarkPlugins={[remarkGfm]}
      >
        {description}
      </ReactMarkdown>
    );
  };

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
              <Box sx={{ mt: '6rem', mb: '3rem' }}>
                <img
                  src={project.bannerImgUrl}
                  alt={project.name}
                  width="100%"
                />
              </Box>
              <Typography variant="h2">{project.name}</Typography>
              <Typography variant="p">{project.shortDescription}</Typography>

              <Divider sx={{ width: '2rem', mb: '1.5rem' }} />

              {project.description && (
                <>
                  <Typography variant="h4" sx={{ mt: '2rem' }}>
                    Description
                  </Typography>
                  <MultilineProjectDescription
                    description={project.description}
                  />
                </>
              )}
              {/* <Typography variant="h4">Meet the team</Typography>
              {/* todo: Add rendering for team 
              <Typography variant="p">
                Update team description for content in this section.
              </Typography> */}
              {/* socials go here */}
              <Grid container>
                {project?.socials?.discord ? (
                  <Link
                    sx={{ display: 'flex', justifyContent: 'center' }}
                    href={project.socials.discord}
                    aria-label="discord"
                    title="Discord"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <IconButton aria-label="discord">
                      <DiscordIcon />
                    </IconButton>
                  </Link>
                ) : null}
                {project?.socials?.github ? (
                  <Link
                    sx={{ display: 'flex', justifyContent: 'center' }}
                    href={project.socials.github}
                    aria-label="github"
                    title="GitHub"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <IconButton aria-label="github">
                      <GitHubIcon />
                    </IconButton>
                  </Link>
                ) : null}
                {project?.socials?.telegram ? (
                  <Link
                    sx={{ display: 'flex', justifyContent: 'center' }}
                    href={project.socials.telegram}
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
                {project?.socials?.twitter ? (
                  <Link
                    sx={{ display: 'flex', justifyContent: 'center' }}
                    href={project.socials.twitter}
                    aria-label="twitter"
                    title="Twitter"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <IconButton aria-label="twitter">
                      <TwitterIcon />
                    </IconButton>
                  </Link>
                ) : null}
                {project?.socials?.website ? (
                  <Link
                    sx={{ display: 'flex', justifyContent: 'center' }}
                    href={project.socials.website}
                    aria-label="website"
                    title="Web"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <IconButton aria-label="website">
                      <PublicIcon />
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
              </Grid>
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
    </>
  );
};

export default Project;
