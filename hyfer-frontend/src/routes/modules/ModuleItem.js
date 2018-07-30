import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Resizable from 're-resizable';
import { withStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Typography from '@material-ui/core/Typography';
import EditModuleDialog from './EditModuleDialog';
import ModuleMenu from './ModuleMenu';
import { inject, observer } from 'mobx-react';

const styles = (theme) => ({
  moduleItem: {
    // padding: '0.5em 0',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    color: 'white',
  },
  moduleItemContent: {
    display: 'flex',
    alignItems: 'center',
  },
  moduleName: {
    color: 'white',
    paddingRight: theme.spacing.unit,
  },
  menuButton: {
    opacity: 0.25,
    '&:hover': {
      opacity: 1,
    },
    [`@media(max-width: ${theme.breakpoints.values.sm}px)`]: {
      opacity: 1,
    },
  },
});

const resizableEnable = {
  top: false,
  right: true,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
};

const maxWeeks = 6;

@inject('modulesStore')
@observer
class ModuleItem extends Component {
  state = {
    anchorEl: null,
    dialogOpen: false,
  };

  componentDidMount() {
    this.setState({ duration: this.props.module.default_duration });
  }

  handleMenuShowClick = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  }

  handleMenuClose = () => {
    this.setState({
      anchorEl: null,
    });
  }

  handleModuleEdit = () => {
    this.setState({
      menuOpen: false,
      dialogOpen: true,
    });
  }

  handleDialogClose = () => {
    this.setState({
      dialogOpen: false,
    });
  };

  handleModuleUpdate = (module) => {
    const newModules = this.props.modulesStore.modules.map(mod => mod.id === module.id ? module : { ...mod });
    this.props.modulesStore.setModules(newModules);
  };

  handleModuleDelete = () => {
    this.props.modulesStore.deleteModule(this.props.module);
  };

  handleResizeStart = (event) => {
    event.stopPropagation();
  }

  handleResizeStop = (event, direction, refToElement, delta) => {
    const module = this.props.module;
    const newDuration = module.default_duration + Math.round(delta.width / this.props.weekWidth);
    const newModules = this.props.modulesStore.modules.map(mod => {
      return mod.id === module.id
        ? { ...module, default_duration: newDuration }
        : mod;
    });
    this.props.modulesStore.setModules(newModules);
  }

  render() {
    const { classes, module } = this.props;
    const moduleWidth = module.default_duration * this.props.weekWidth;

    return (
      <React.Fragment>
        <Resizable
          style={{ backgroundColor: module.color }}
          className={classes.moduleItem}
          size={{ width: moduleWidth }}
          enable={resizableEnable}
          grid={[this.props.weekWidth, 1]}
          minWidth={this.props.weekWidth}
          maxWidth={this.props.weekWidth * maxWeeks}
          onResizeStart={this.handleResizeStart}
          onResizeStop={this.handleResizeStop}
        >
          <div className={classes.moduleItemContent}>
            <IconButton
              onClick={this.handleMenuShowClick}
              className={classes.menuButton}
            >
              <MoreVertIcon color="action" />
            </IconButton>
            <Typography
              variant="subheading"
              title={module.module_name}
              className={classes.moduleName}
              noWrap
            >
              {module.module_name}
              {module.optional === 1 ? '*' : ''}
            </Typography>
          </div>
        </Resizable>
        <ModuleMenu
          module={module}
          anchorEl={this.state.anchorEl}
          onEdit={this.handleModuleEdit}
          onDelete={this.handleModuleDelete}
          onClose={this.handleMenuClose}
        />
        <EditModuleDialog
          module={module}
          action="Update"
          open={this.state.dialogOpen}
          onClose={this.handleDialogClose}
          onSave={this.handleModuleUpdate}
        />
      </React.Fragment>
    );
  }
}

ModuleItem.wrappedComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  module: PropTypes.object.isRequired,
  modulesStore: PropTypes.object.isRequired,
  weekWidth: PropTypes.number.isRequired,
};

export default withStyles(styles)(ModuleItem);
