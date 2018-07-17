/* eslint react/prop-types: error */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import moment from 'moment';

import TimelineModule from './TimelineModule';
import EmptyWeekModule from './EmptyWeekModule';


export function getWeeksBeforeAndAfter(allWeeks, modules) {
  // starting date of the first module of a class
  const firstModuleStartingDate = moment.min(modules.map(week => week.starting_date));
  // the ending date of the last module of a class
  const lastModuleEndingDate = moment.max(modules.map(week => week.ending_date));
  // get an array with all the weeks before the start of this class
  const weeksBefore = allWeeks.filter(week => week[0].isBefore(firstModuleStartingDate));
  // get an array with all the weeks after the course has ended
  const weeksAfter = allWeeks.filter(week => week[1].isAfter(lastModuleEndingDate));

  return {
    weeksBefore,
    weeksAfter,
  };
}

@inject('timeline')
@observer
export default class TimelineRow extends Component {
  renderAllTaskComps = () => {
    const { allWeeks, items } = this.props.timeline;
    const { width, height, groupName } = this.props;
    const { modules } = items[groupName];
    const { weeksBefore, weeksAfter } = getWeeksBeforeAndAfter(allWeeks, modules);

    let rowCells = weeksBefore.map(week => <EmptyWeekModule key={week} week={week} width={width} height={height} />);

    const taskRowItems = modules.map((item, index) => {
      return (
        <TimelineModule
          key={item.running_module_id}
          item={item}
          width={width}
          height={height}
          isLast={index === modules.length - 1}
        />
      );
    });

    rowCells = [...rowCells, ...taskRowItems];
    if (weeksAfter.length === 0) return rowCells;

    const cellsAfter = weeksAfter.map(week => (
      <EmptyWeekModule key={week} width={width} height={height} />
    ));

    return [...rowCells, ...cellsAfter];
  };
  render() {
    return <Fragment>{this.renderAllTaskComps()}</Fragment>;
  }
}

TimelineRow.wrappedComponent.propTypes = {
  timeline: PropTypes.object.isRequired,
  groupName: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};