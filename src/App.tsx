import * as React from 'react'
import * as SDK from 'microsoft-speech-browser-sdk'
import * as SpeechService from './services/speechRecognizer'
import './App.css'

interface State {
  isMicrophoneActive: boolean
}

class App extends React.Component<{}, State> {
  recognizer: SDK.Recognizer
  state = {
    isMicrophoneActive: false
  }

  constructor(p: any) {
    super(p)

    this.recognizer = SpeechService.setup(SDK.RecognitionMode.Interactive, "en-US", SDK.SpeechResultFormat.Simple, "8e9795ad8f3e4e61a2a67498600d3922")
  }

  onClickTalk = () => {
    console.log(`onClickTalk: `)
    SpeechService.start(this.recognizer, this.onEvent, this.onComplete, this.onError)
  }

  onComplete = () => {
    console.log(`onComplete`)
  }

  onError = (error: Error) => {
    console.error(error)
    this.setState({
      isMicrophoneActive: false
    })
  }

  onEvent = (event: SDK.SpeechRecognitionEvent) => {
    if (event instanceof SDK.RecognitionTriggeredEvent) {
      console.log(`RecognitionTriggeredEvent: `)
    }
    else if (event instanceof SDK.ListeningStartedEvent) {
      console.log(`ListeningStartedEvent: `)
      this.setState({
        isMicrophoneActive: true
      })
    }
    else if (event instanceof SDK.RecognitionStartedEvent) {
      console.log(`RecognitionStartedEvent: `)
    }
    else if (event instanceof SDK.SpeechStartDetectedEvent) {
      console.log(`SpeechStartDetectedEvent: `)
    }
    else if (event instanceof SDK.SpeechHypothesisEvent) {
      console.log(`SpeechHypothesisEvent: `)
    }
    else if (event instanceof SDK.SpeechFragmentEvent) {
      console.log(`SpeechFragmentEvent: `)
      console.log(JSON.stringify(event.Result, null, 2))
    }
    else if (event instanceof SDK.SpeechEndDetectedEvent) {
      console.log(`SpeechEndDetectedEvent: `)
      console.log(JSON.stringify(event.Result, null, 2))
    }
    else if (event instanceof SDK.SpeechSimplePhraseEvent) {
      console.log(`SpeechSimplePhraseEvent: `)
      console.log(JSON.stringify(event.Result, null, 2))
    }
    else if (event instanceof SDK.SpeechDetailedPhraseEvent) {
      console.log(`SpeechDetailedPhraseEvent: `)
      console.log(JSON.stringify(event.Result, null, 2))
    }
    else if (event instanceof SDK.RecognitionEndedEvent) {
      console.log(`RecognitionEndedEvent: `)
      this.setState({
        isMicrophoneActive: false
      })
    }
  }

  render() {
    return (
      <div className="kl-app">
        <div className="kl-canvas">
        </div>

        <div className="kl-talk">
          <button className={`kl-button-talk ${this.state.isMicrophoneActive ? 'kl-button-talk--active' : ''}`} onClick={this.onClickTalk}>
            <i className="material-icons">mic</i>
          </button>
          {this.state.isMicrophoneActive
            ? <div>Recording...</div>
            : <div>Push To Talk</div>}
        </div>
      </div>
    );
  }
}

export default App
