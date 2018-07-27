import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

export default function GridContainer(props) {

  const { children, ...other } = props;

  return (
    <div {...other}>
      <Grid container justify="center" spacing={24}>
        <Grid item xs={12} sm={8} lg={6} xl={4}>
          {children}
        </Grid>
      </Grid>
    </div>
  );
}

GridContainer.propTypes = {
  children: PropTypes.element.isRequired,
};
