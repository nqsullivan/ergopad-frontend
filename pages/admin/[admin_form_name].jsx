import { Grid } from '@mui/material';
import Sidenav from '@components/admin/Sidenav';
import CenterTitle from '@components/CenterTitle';
import { useRouter } from 'next/router';
import CreateProjectForm from '@components/admin/CreateProjectForm';
import EditProjectForm from '../../components/admin/EditProjectForm';
import DeleteProjectForm from '../../components/admin/DeleteProjectForm';
import EditUserForm from '../../components/admin/EditUserForm';

const AdminForm = () => {
  const JWT_TOKEN =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('jwt_token_login_422')
      : null;
  const router = useRouter();
  const { admin_form_name } = router.query;

  const formMapper = {
    create_project: <CreateProjectForm />,
    edit_project: <EditProjectForm />,
    delete_project: <DeleteProjectForm />,
    edit_user: <EditUserForm />,
  };

  return (
    <>
      {JWT_TOKEN ? (
        <Grid
          container
          maxWidth="lg"
          sx={{
            mx: 'auto',
            flexDirection: 'row-reverse',
            px: { xs: 2, md: 3 },
          }}
        >
          {formMapper[admin_form_name] ? (
            <Grid item md={8} xs={12}>
              {formMapper[admin_form_name]}
            </Grid>
          ) : (
            <Grid item md={8} xs={12}>
              <CenterTitle
                title="Not Found"
                subtitle="Looks like the form you are looking for is under construction..."
                main={true}
              />
            </Grid>
          )}
          <Sidenav />
        </Grid>
      ) : (
        <CenterTitle
          title="Oops..."
          subtitle="Looks like you do not have admin access"
          main={true}
        />
      )}
    </>
  );
};

export default AdminForm;
