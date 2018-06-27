import React, { Component } from 'react'

class Link extends Component {
  render() {
    console.log("f->", this.props.link)
    return (
      <Text>
        <Text style={{ marginTop: 60 }}>
          {this.props.link.FirstName} ({this.props.link.LastName})
        </Text>
      </Text>
    )
  }

  _voteForLink = async () => {
    // ... you'll implement this in chapter 6
  }
}

export default Link