import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import GridContainer from '../../components/GridContainer';
import MarkdownViewer from '../../components/MarkdownViewer';

async function fetchText(path) {
  const headers = { 'Content-Type': 'text/plain' };
  const res = await fetch(path, headers);
  return res.status === 200 ? res.text() : undefined;
}

@inject('currentModule', 'currentUser', 'notification')
@observer
export default class AboutPage extends React.Component {
  state = {
    markdown: null,
  }

  componentDidMount() {
    fetchText('./content/about.md')
      .then(markdown => this.setState({ markdown }))
      .catch(this.props.notification.reportError);
  }

  render() {
    const { markdown } = this.state;
    if (markdown == null) {
      return null;
    }

    return (
      <GridContainer>
        <MarkdownViewer markdown={markdown} />
      </GridContainer>
    );
  }
}

AboutPage.wrappedComponent.propTypes = {
  notification: PropTypes.object.isRequired,
};
