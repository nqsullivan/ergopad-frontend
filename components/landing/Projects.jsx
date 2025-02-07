import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import theme from '@styles/theme';

const Projects = () => {
  const router = useRouter();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const getProjects = async () => {
      try {
        const res = await axios.get(`${process.env.API_URL}/projects/`);
        setProjects(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    getProjects();
  }, []);

  const upcomingProjects = projects
    .filter((project) => !project.isLaunched)
    .slice(0, 3);

  const projectCard = (project) => {
    return (
      <Grid item xs={12} sm={6} md={4} key={project.id}>
        <Box
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
          <CardActionArea
            onClick={() => {
              router.push(
                '/projects/' +
                  project.name
                    .toLowerCase()
                    .replaceAll(' ', '')
                    .replaceAll(/[^a-zA-Z0-9]/g, '')
              );
            }}
          >
            <CardContent>
              <Box
                component="img"
                alt=""
                height={324}
                width={324}
                sx={{
                  borderRadius: '50%',
                  margin: 'auto',
                  display: 'block',
                  objectFit: 'cover',
                }}
                src={project.bannerImgUrl}
              />
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                align="center"
                sx={{ my: 3 }}
              >
                {project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {project.shortDescription}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Box>
      </Grid>
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: '768px',
          }}
        >
          <Typography variant="h2">Upcoming Projects</Typography>
        </Box>
      </Box>
      <Grid container spacing={3} alignItems="stretch" sx={{ mb: 6, mt: 3 }}>
        {upcomingProjects?.map((project) => projectCard(project))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: '768px',
          }}
        >
          <Button
            onClick={() => router.push('/projects')}
            variant="contained"
            sx={{
              color: '#fff',
              fontSize: '1rem',
              mb: 6,
              py: '0.6rem',
              px: '1.6rem',
              textTransform: 'none',
              backgroundColor: theme.palette.tertiary.main,
              '&:hover': {
                backgroundColor: theme.palette.tertiary.hover,
                boxShadow: 'none',
              },
              '&:active': {
                backgroundColor: theme.palette.tertiary.active,
              },
            }}
          >
            More projects
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Projects;
