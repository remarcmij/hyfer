import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ModuleList from './ModuleList';
import EditModuleDialog from './EditModuleDialog';
import GridContainer from '../../components/GridContainer';

const styles = (theme) => ({
  editor: {
    paddingTop: theme.spacing.unit,
  },
  toolbarContainer: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  toolbar: {
    display: 'flex',
  },
  filler: {
    flex: 1,
  },
  moduleContainer: {
    margin: 'auto',
    width: '80%',
  },
  moduleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '5vh 0',
    '& div': {
      ...theme.typography.body2,
      flexGrow: 1,
      flexBasis: 0,
      textAlign: 'center',
      borderRight: 'solid 2px #999',
      lineHeight: '40px',
    },
    '&:first-child': {
      borderLeft: 'solid 2px #999',
    },
  },
});

const weekLabels = [
  '1 week',
  '2 weeks',
  '3 weeks',
  '4 weeks',
  '5 weeks',
  '6 weeks',
];

@inject('modulesStore', 'notification')
@observer
class ModulesPage extends React.Component {

  state = {
    dialogOpen: false,
    weekWidth: 0,
  }

  async componentDidMount() {
    await this.props.modulesStore.getModules();
    window.addEventListener('resize', this.computeWeekWidth);
    this.computeWeekWidth();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.computeWeekWidth);
  }

  computeWeekWidth = () => {
    const week_element = document.querySelector('.week_element');
    if (week_element != null) {
      this.setState({ weekWidth: week_element.clientWidth });
    }
  }

  handleModuleSave = (module) => {
    this.handleCloseDialog();
    this.props.modulesStore.addModule(module);
  }

  handleOpenDialogClick = () => {
    this.setState({
      dialogOpen: true,
    });
  }

  handleCloseDialog = () => {
    this.setState({
      dialogOpen: false,
    });
  }

  renderHeader() {
    const { classes } = this.props;
    return (
      <div className={classes.moduleHeader}>
        {weekLabels.map((item, index) => (
          <div key={index} className="week_element">
            {item}
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { classes } = this.props;
    const { weekWidth } = this.state;
    const { modules, isChanged } = this.props.modulesStore;

    if (modules.length === 0) {
      return null;
    }

    return (
      <GridContainer>
        <React.Fragment>
          {this.renderHeader()}

          <ModuleList weekWidth={weekWidth} />

          <Typography variant="body1" color="textSecondary">* Optional modules</Typography>

          <Paper className={classes.toolbarContainer}>
            <Toolbar className={classes.toolbar} variant="dense" disableGutters>
              <Button
                color="secondary"
                className={classes.button}
                onClick={this.handleOpenDialogClick}
              >
                Add module
              </Button>
              <div className={classes.filler} />
              <Button
                color="primary"
                className={classes.button}
                onClick={this.props.modulesStore.undoChanges}
                disabled={!isChanged}
              >
                Undo changes
              </Button>
              <Button
                color="primary"
                className={classes.button}
                onClick={this.props.modulesStore.saveChanges}
                disabled={!isChanged}
              >
                Save changes
              </Button>
            </Toolbar>
            <EditModuleDialog
              action="Add"
              onClose={() => this.setState({ dialogOpen: false })}
              onSave={this.handleModuleSave}
              open={this.state.dialogOpen}
            />
          </Paper>
        </React.Fragment>
      </GridContainer>
    );
  }
}

ModulesPage.wrappedComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  modulesStore: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,

};

export default withStyles(styles)(ModulesPage);
