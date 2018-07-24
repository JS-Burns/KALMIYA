import * as React from 'react'
import * as SDK from 'microsoft-speech-browser-sdk'
import * as SpeechService from './services/speechRecognizer'
import * as vision from './services/vision'
import { intent, Intents } from './services/intent'
import * as util from './utilities'
import * as uuid from 'uuid/v4'
import './App.css'

enum UserType {
  User,
  Bot
}

interface ISnapshot {
  id: string
  dataUri: string
  analyzeResult: vision.IAnalyzeResult
  ocrResult: vision.IOcr
}

interface IMessage {
  id: string
  text: string
  userType: UserType
  data: { [x: string]: string }
}

interface State {
  isMicrophoneActive: boolean,
  hypothesis: string,
  messages: IMessage[]
  snapshots: ISnapshot[]
}

class App extends React.Component<{}, State> {
  videoRef = React.createRef<HTMLVideoElement>()
  canvasRef = React.createRef<HTMLCanvasElement>()

  recognizer: SDK.Recognizer = SpeechService.setup(SDK.RecognitionMode.Interactive, "en-US", SDK.SpeechResultFormat.Simple, "8e9795ad8f3e4e61a2a67498600d3922")
  state: State = {
    isMicrophoneActive: false,
    hypothesis: '',
    messages: [],
    snapshots: []
  }

  // TODO: Simulate webcam input from video being drawn to canvas
  componentDidMount() {
    const canvas = this.canvasRef.current!
    canvas.width = window.innerWidth
    canvas.height= window.innerHeight

    const image = new Image()
    image.onload = () => {
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
    }
    image.src = "/seattle.jpg"
  }

  onClickTalk = () => {
    SpeechService.start(this.recognizer, this.onEvent, this.onComplete, this.onError)
  }

  onComplete = () => {
    this.setState({
      isMicrophoneActive: false,
      hypothesis: ''
    })
  }

  onError = (error: Error) => {
    console.error(error)
    this.setState({
      isMicrophoneActive: false
    })
  }

  onEvent = (event: SDK.SpeechRecognitionEvent) => {
    if (event instanceof SDK.RecognitionTriggeredEvent) {
      console.debug(`RecognitionTriggeredEvent: `)
      console.debug(JSON.stringify(event, null, 2))
    }
    else if (event instanceof SDK.ListeningStartedEvent) {
      console.debug(`ListeningStartedEvent: `)
      console.debug(JSON.stringify(event, null, 2))
      this.setState({
        isMicrophoneActive: true
      })
    }
    else if (event instanceof SDK.RecognitionStartedEvent) {
      console.debug(`RecognitionStartedEvent: `)
      console.debug(JSON.stringify(event, null, 2))
    }
    else if (event instanceof SDK.SpeechStartDetectedEvent) {
      console.debug(`SpeechStartDetectedEvent: `)
      console.debug(JSON.stringify(event.Result, null, 2))
    }
    else if (event instanceof SDK.SpeechHypothesisEvent) {
      console.debug(`SpeechHypothesisEvent: `)
      console.debug(JSON.stringify(event.Result, null, 2))
      this.setState({
        hypothesis: event.Result.Text
      })
    }
    else if (event instanceof SDK.SpeechFragmentEvent) {
      // Doesn't occur?
      console.debug(`SpeechFragmentEvent: `)
      console.debug(JSON.stringify(event.Result, null, 2))
    }
    else if (event instanceof SDK.SpeechEndDetectedEvent) {
      console.debug(`SpeechEndDetectedEvent: `)
      console.debug(JSON.stringify(event.Result, null, 2))
    }
    else if (event instanceof SDK.SpeechSimplePhraseEvent) {
      console.debug(`SpeechSimplePhraseEvent: `)
      console.debug(JSON.stringify(event.Result, null, 2))

      const text = event.Result.DisplayText
      this.addMessage(text, UserType.User)

      if (intent(text).intent === Intents.Analyze) {
        this.onAnalyze()
      }
    }
    else if (event instanceof SDK.SpeechDetailedPhraseEvent) {
      console.debug(`SpeechDetailedPhraseEvent: `)
      console.debug(JSON.stringify(event.Result, null, 2))
    }
    else if (event instanceof SDK.RecognitionEndedEvent) {
      console.debug(`RecognitionEndedEvent: `)
      this.onComplete()
    }
  }

  onAnalyze = async () => {
    console.log(`Analyze`)

    const canvasElement = this.canvasRef.current!
    const context = canvasElement.getContext('2d')!

    const blob = await util.canvasToBlob(canvasElement)
    const { analyze, ocr } = await vision.all(blob)

    const snapshot: ISnapshot = {
      id: uuid(),
      dataUri: canvasElement.toDataURL(),
      analyzeResult: analyze,
      ocrResult: ocr
    }

    this.setState(prevState => ({
        snapshots: [...prevState.snapshots, snapshot]
    }))

    if (analyze.description.captions.length > 0) {
      const caption = analyze.description.captions[0]
      this.addMessage(caption.text, UserType.Bot)
    }

    ocr.regions.map(region => {
      const [x1,y1,width,height] = region.boundingBox.split(',').map(s => parseInt(s, 10))
      context.rect(x1,y1,width,height)
      context.lineWidth = 4
      context.strokeStyle = "#FFFFFF"
      context.stroke()
    })
  }

  addMessage = (text: string, userType: UserType) => {
    this.setState(prevState => {
      const newMessage = {
        id: uuid(),
        text,
        userType,
        data: {}
      }
      const nextMessages = [...prevState.messages]
      nextMessages.push(newMessage)

      if (nextMessages.length > 10) {
        nextMessages.shift()
      }
      
      return {
        messages: nextMessages
      }
    }, () => {
      if (userType === UserType.Bot) {
        const utterance = new SpeechSynthesisUtterance(text)
        self.speechSynthesis.speak(utterance)
      }
    })
  }

  onDebugAddMessage = () => {
    this.addMessage(`test-${uuid().slice(0, 4)}`, UserType.User)
  }

  onClickClear = () => {
    this.setState({
      messages: []
    })
  }

  render() {
    return (
      <div className="kl-app">
        <video autoPlay className="kl-video" ref={this.videoRef}></video>
        <canvas width="800px" height="800px" className="kl-canvas" ref={this.canvasRef}></canvas>

        <div className="kl-talk">
          <button className={`kl-button-talk ${this.state.isMicrophoneActive ? 'kl-button-talk--active' : ''}`} onClick={this.onClickTalk}>
            <i className="material-icons">mic</i>
          </button>
          {this.state.isMicrophoneActive
            ? <div>Recording...</div>
            : <div>Push To Talk</div>}
        </div>

        <div className="kl-chat">
          {this.state.messages.map(message =>
            message.userType === UserType.User
              ? <div className="kl-chat_user" key={message.id}>
              <div className="kl-chat_text kl-chat_text--user">
                {message.text}
              </div>
            </div>
              : <div className="kl-chat_bot" key={message.id}>
              <div className="kl-chat_text kl-chat_text--bot">
                {message.text}
              </div>
            </div>
          )}
          {this.state.hypothesis.length > 0 
            && <div className="kl-chat_user">
            <div className="kl-chat_text kl-chat_text--user">
              {this.state.hypothesis}
            </div>
          </div>}

          <div>
            <div className="kl-clear-button" onClick={this.onClickClear}>
              <div>Clear</div>
              <i className="material-icons">clear</i>
            </div>
          </div>
        </div>

        <div className="kl-debug">
          <div>Debug:</div>
          <button className="kl-button" onClick={this.onAnalyze}>Analyze</button>
          <button className="kl-button" onClick={this.onDebugAddMessage}>Add Message</button>
        </div>
      </div>
    );
  }
}

export default App
