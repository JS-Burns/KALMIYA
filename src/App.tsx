import * as React from 'react'
import './App.css'

class App extends React.Component {
  onClickTalk() {
    console.log(`onClickTalk: `)
  }

  render() {
    return (
      <div className="kl-app">
        <div className="kl-canvas">
        </div>

        <button className="kl-button-talk" onClick={this.onClickTalk}>
          <i className="material-icons">mic</i>
        </button>
      </div>
    );
  }
}

export default App
