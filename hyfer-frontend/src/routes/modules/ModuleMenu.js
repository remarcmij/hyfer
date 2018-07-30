import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ConfirmationDialog from '../../components/ConfirmationDialog';

@inject('modulesStore')
@observer
export default class ModuleMenu extends React.Component {

  state = {
    confirmationDialogOpen: false,
  }

  handleDeleteClick = () => {
    this.props.onClose();
    this.setState({ confirmationDialogOpen: true });
  }

  handleEditClick = () => {
    this.props.onClose();
    this.props.onEdit();
  }

  closeConfirmationDialog = () => {
    this.setState({ confirmationDialogOpen: false });
  }

  render() {
    const {
      anchorEl,
      module,
      onClose,
    } = this.props;

    return (
      <React.Fragment>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={onClose}
        >
          <MenuItem onClick={this.handleEditClick}>
            Edit
          </MenuItem>
          <MenuItem
            onClick={this.handleDeleteClick}
            disabled={module.ref_count !== 0}
          >
            Delete
          </MenuItem>
        </Menu>
        <ConfirmationDialog
          open={this.state.confirmationDialogOpen}
          title="Delete Module"
          message="Are you sure you wish to delete this module?"
          onOk={this.props.onDelete}
          onCancel={this.closeConfirmationDialog}
        />
      </React.Fragment>
    );
  }
}

ModuleMenu.wrappedComponent.propTypes = {
  anchorEl: PropTypes.object,
  module: PropTypes.object.isRequired,
  modulesStore: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

