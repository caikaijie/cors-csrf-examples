import React, { PropTypes, Component } from 'react'
import cx from 'classnames'

import style from './style'

class Button extends Component {
  static propTypes = {
    label: PropTypes.string,
    ghost: PropTypes.bool
  }

  static defaultProps = {
    label: ''
  }

  render() {
    const { label, ghost, ...others } = this.props
    return (
      <button className={cx(style.button, { [style.ghost]: ghost })} {...others}>
        {label}
      </button>
    )
  }
}

class LinkButton extends Component {
  static propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func
  }

  static defaultProps = {
    label: '',
    onClick: () => {}
  }

  render() {
    const { label, onClick, ...others } = this.props
    return (
      <a 
        className={cx(style.linkbutton)}
        onClick={(e) => { e.preventDefault(); onClick() }}
        {...others}>
        {label}
      </a>
    )
  }
}

export {
  Button,
  LinkButton
}
