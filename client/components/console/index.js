import React, { PropTypes, Component } from 'react'

import { LinkButton } from '../button'
import style from './style'

class Console extends Component {
  static propTypes = {
    title: PropTypes.string,
    logs: PropTypes.array,
    onClear: PropTypes.func
  }

  static defaultProps = {
    title: '',
    logs: [],
    onClear: () => {}
  }

  render() {
    const { title, logs, onClear } = this.props
    return (
    <div className={style.root}>
      <header>
        {title}
        <LinkButton label="clear" onClick={onClear}/>
      </header>
      <div 
        className={style.content}
        ref={(el) => {if (!el) {return} el.scrollTop = el.scrollHeight}}>
        <ul>
        {logs ? logs.map((log, idx) => <li key={idx}>{log.msg}</li>) : null}
        </ul>
      </div>
    </div>
    )
  }
}

export default Console
