import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { TwitterPicker } from 'react-color';

const styles = (theme) => ({
  form: {
    minWidth: 320,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 300,
  },
  menu: {
    width: 200,
  },
  dialogContent: {
    paddingBottom: 64,
  },
  colorContainer: {
    position: 'relative',
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  colorInnerContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  swatch: {
    padding: theme.spacing.unit / 2,
    boxShadow: theme.shadows[2],
    display: 'inline-block',
    cursor: 'pointer',
    marginRight: theme.spacing.unit,
  },
  color: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 2,
    position: 'relative',
  },
  colorLabel: {
    display: 'inline-block',
  },
});

const popover = {
  position: 'absolute',
  zIndex: 2,
};

const cover = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const defaultState = {
  id: -1,
  moduleName: '',
  duration: 3,
  gitHubRepo: '',
  gitHubRepoChanged: false,
  optional: false,
  color: '#FF6900',
  showColorPicker: false,
  repoNameEdited: false,
  isDirty: false,
};

@inject('modulesStore')
@observer
class EditModuleDialog extends React.Component {
  state = {}

  componentDidMount() {
    const { module } = this.props;
    let stateUpdates = { ...defaultState };
    if (module) {
      stateUpdates = {
        ...stateUpdates,
        id: module.id,
        moduleName: module.module_name,
        gitHubRepo: module.git_repo || '',
        duration: module.default_duration,
        color: module.color,
        optional: module.optional === 1,
      };
    }
    this.setState(stateUpdates);
  }

  handleColorPickerShowClick = () => {
    this.setState({
      showColorPicker: true,
    });
  }

  handleColorChange = (color) => {
    this.setState({
      color: color.hex,
      isDirty: true,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.onClose();
    const module = {
      id: this.state.id,
      module_name: this.state.moduleName,
      git_repo: this.state.gitHubRepo,
      default_duration: this.state.duration,
      color: this.state.color,
      optional: this.state.optional ? 1 : 0,
    };
    this.props.onSave(module);
  }

  handleCloseClick = () => {
    this.props.onClose();
  }

  handleChange = (name) => (event) => {
    let { value } = event.target;
    if (typeof value === 'string') {
      value = value.trim();
    }
    const updates = {
      [name]: value,
      isDirty: true,
    };
    if (name === 'gitHubRepo') {
      updates.gitHubRepoEdited = true;
    } else if (name === 'moduleName' && !this.state.gitHubRepoEdited) {
      updates.gitHubRepo = value;
    }
    this.setState(updates);
  }

  handleToggleClick = (name) => (event, checked) => {
    this.setState({
      [name]: checked,
      isDirty: true,
    });
  }

  renderMenuItems() {
    const items = [];
    for (let i = 1; i <= this.props.modulesStore.maxDuration; i++) {
      items.push(<MenuItem key={i} value={i}>{i}</MenuItem>);
    }
    return items;
  }

  render() {
    const { classes, action, fullScreen } = this.props;
    const {
      color,
      duration,
      gitHubRepo,
      isDirty,
      moduleName,
      optional,
      showColorPicker,
    } = this.state;

    return (
      <Dialog
        fullScreen={fullScreen}
        open={this.props.open}
        onClose={this.props.onClose}
      >
        <form onSubmit={this.handleSubmit} className={classes.form}>
          <DialogTitle id="form-dialog-title">{action} Module</DialogTitle>
          <DialogContent classes={{ root: classes.dialogContent }}>
            <TextField
              autoFocus
              margin="normal"
              id="name"
              label="Module name"
              type="text"
              fullWidth
              required
              value={moduleName}
              onChange={this.handleChange('moduleName')}
            />
            <div>
              <TextField
                id="name"
                margin="normal"
                label="Repository name"
                type="text"
                fullWidth
                value={gitHubRepo}
                onChange={this.handleChange('gitHubRepo')}
              />
            </div>
            <TextField
              id="select-duration"
              select
              margin="normal"
              fullWidth
              label="Select"
              className={classes.textField}
              value={duration}
              onChange={this.handleChange('duration')}
              SelectProps={{ MenuProps: { className: classes.menu } }}
              helperText="Duration in weeks"
            >
              {this.renderMenuItems()}
            </TextField>
            <div className={classes.colorContainer}>
              <div className={classes.colorInnerContainer}>
                <div className={classes.swatch}>
                  <div
                    className={classes.color}
                    style={{ backgroundColor: color }}
                    onClick={this.handleColorPickerShowClick} />
                </div>
                <Typography
                  variant="body1"
                  classes={{ root: classes.colorLabel }}
                >
                  Module color
              </Typography>
              </div>
              {showColorPicker && (
                <div style={popover}>
                  <div style={cover} onClick={this.handleToggleClick('showColorPicker')} />
                  <TwitterPicker
                    color={color}
                    onChange={this.handleColorChange}
                  />
                </div>
              )}
            </div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={optional}
                  onChange={this.handleToggleClick('optional')}
                  color="primary"
                />
              }
              label="Optional module"
            />
          </DialogContent>
          <DialogActions>
            <Button
              color="secondary"
              onClick={this.handleCloseClick}
              aria-label="Close"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={!isDirty || moduleName === ''}
            >
              {action}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

EditModuleDialog.wrappedComponent.propTypes = {
  action: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  fullScreen: PropTypes.bool.isRequired,
  module: PropTypes.object,
  modulesStore: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default withMobileDialog()(withStyles(styles)(EditModuleDialog));
