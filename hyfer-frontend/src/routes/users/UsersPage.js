import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import UserCard from '../../components/UserCard';

const styles = (theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    backgroundColor: theme.palette.background.default,
    margin: theme.spacing.unit,
  },
  toolbar: {
    display: 'flex',
  },
  filler: {
    flexGrow: 1,
  },
  formLabel: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
});

@inject('users', 'currentUser', 'ui', 'notification')
@observer
class UsersPage extends React.Component {

  state = {
    category: 'active',
    filter: '',
    isSyncing: false,
  }

  componentDidMount = async () => {
    await this.props.users.loadUsers();
  };

  renderUsers() {
    let { users } = this.props.users;
    const { category, filter } = this.state;

    switch (category) {
      case 'active':
        users = users.filter(user => user.archived === 0 || user.role === 'teacher');
        break;
      case 'teachers':
        users = users.filter(user => user.role === 'teacher');
        break;
    }

    if (filter !== '') {
      const regex = new RegExp(filter, 'i');
      users = users.filter((user) => {
        const { username, full_name } = user;
        const email = user.email || '';
        return username.match(regex) || full_name.match(regex) || email.match(regex);
      });
    }

    return users.map(user => (
      <UserCard
        key={user.id}
        user={user}
      />
    ));
  }

  handleCategoryChange = (e) => {
    this.setState({ category: e.target.value });
  }

  handleFilterChange = (e) => {
    this.setState({ filter: e.target.value.trim() });
  }

  handleSyncClick = async () => {
    this.setState({ isSyncing: true });
    try {
      await this.props.users.syncUsers(this.props.currentUser.userName);
      this.props.users.loadUsers();
      this.props.notification.reportSuccess('Successfully synchronized');
      this.setState({ isSyncing: false });
    } catch (err) {
      this.props.notification.reportError(err);
      this.setState({ isSyncing: false });
    }
  }

  render() {
    const { classes } = this.props;
    const { isTeacher } = this.props.currentUser;
    const { showAdmin } = this.props.ui;

    return (
      <div>
        <Paper className={classes.toolbarContainer} elevation={2}>
          <Toolbar className={classes.toolbar}>
            <FormLabel classes={{ root: classes.formLabel }}>Users:</FormLabel>
            <Select
              value={this.state.category}
              onChange={this.handleCategoryChange}
              MenuProps={{ PaperProps: { style: { transform: 'translate3d(0, 0, 0)' } } }}
            >
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='active'>Current</MenuItem>
              <MenuItem value='teachers'>Teachers</MenuItem>
            </Select>
            <FormLabel classes={{ root: classes.formLabel }}>Filter:</FormLabel>
            <TextField value={this.state.filter} onChange={this.handleFilterChange} />
            <span className={classes.filler} />
            {showAdmin && isTeacher && (
              <Button onClick={this.handleSyncClick} color="secondary" disabled={this.state.isSyncing}>
                Sync users with Github
              </Button>
            )}
          </Toolbar>
        </Paper>

        <div className={classes.container}>
          {this.renderUsers()}
        </div>
      </div >
    );
  }
}

UsersPage.wrappedComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired,
};

export default withStyles(styles)(UsersPage);
