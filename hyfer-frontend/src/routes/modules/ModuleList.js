import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ModuleItem from './ModuleItem';

const styles = () => ({

  draggableContent: {
    width: 1,
    overflow: 'visible',
    margin: '1vh 0',
  },
  draggableItem: {
    padding: 0,
    margin: 0,
    '&:focus': {
      outline: 'none',
    },
  },
});

@inject('modulesStore')
@observer
class ModuleList extends Component {

  handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const { modules, setModules } = this.props.modulesStore;
    const newModules = [...modules];
    const [removed] = newModules.splice(result.source.index, 1);
    newModules.splice(result.destination.index, 0, removed);
    setModules(newModules);
  }

  render() {
    const { classes } = this.props;
    const { modules } = this.props.modulesStore;
    return (
      <DragDropContext onDragEnd={this.handleDragEnd}>
        <Droppable droppableId="droppable">
          {provided => (
            <div ref={provided.innerRef} className={classes.draggable}>
              {modules.map((module, index) => (
                <Draggable key={module.id} draggableId={module.id} index={index}>
                  {provided => (
                    <div className={classes.draggableContent}>
                      <div
                        className={classes.draggableItem}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ModuleItem
                          module={module}
                          weekWidth={this.props.weekWidth}
                        />
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

ModuleList.wrappedComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  modulesStore: PropTypes.object.isRequired,
  weekWidth: PropTypes.number.isRequired,
};

export default withStyles(styles)(ModuleList);
