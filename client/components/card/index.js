import React, { PropTypes, Component } from 'react'

import style from './style'

class Card extends Component {
  static propTypes = {
    children: PropTypes.any,
    title: PropTypes.string
  }

  static defaultProps = {
    title: ''
  }

  render() {
    const { title, children } = this.props
    return (
      <div className={style.card}>
        <header>{title}</header>
        <div className={style.content}>
          {children}
        </div>
      </div>
    )
  }
}

export default Card
