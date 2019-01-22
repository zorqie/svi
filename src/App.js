import { version, Component } from 'inferno';
import './App.css';

import io from 'socket.io-client'

import BigClock from './ui/big-clock'
// import ChannelSlider from './ui/channel-slider'
// import CommandLine from './ui/command-line'
import CueGrid from './ui/cue-grid'
import Grid from './ui/grid'
import GroupGrid from './ui/group-grid'
import Programmer from './ui/programmer'
import ProgrammerView from './ui/programmer-view'
import ProfileControl from './ui/profile-control'
import { Question } from './ui/dialogs'
import UniverseOut from './ui/universe-out'

// import CPU from './cpu'

const socket = io('http://localhost:8080')

// const dmx = val => val > 255 ? 255 : val < 0 ? 0 : val

// const cpu = new CPU() // BAAD

class App extends Component {
  constructor() {
    super()
    this.state = {
      inited: false,
      dmx: {},
      active: {},
      visible: {},
      locks: {
        rel: 'off',
        set: 'off',
        inc: 'off',
        rec: 'off',
      },
      // cpu: {},
      status: '',
    }
    // cpu.on('cleared', () => this.setState({cleared: true, status: ''}))
    // cpu.on('cpu', this.setCpuStatus)
  }

  componentDidMount() {
    socket.on('init', this.init)
    socket.on('update', this.receiveUpdate)
    socket.on('disconnect', () => this.setState({connected: false}))
    socket.on('connect', () => this.setState({connected: true}))
    socket.on('question', this.receiveQuestion)

    socket.on('executed', this.requestState)
    socket.on('released', this.requestState)
    socket.on('state', this.receiveState)

    socket.on('warn', (message, what) => {
      console.log("WARN", message, what)
      this.setState({status: message})
    })
    document.addEventListener('keydown', this.presser)
    document.addEventListener('keyup', this.keyup)
  }

  componentWillUnmount() {
    socket.removeListener('init', this.init)
    socket.removeListener('update', this.receiveUpdate)
    socket.removeListener('question', this.receiveQuestion)
    socket.removeListener('executed', this.requestState)
    socket.removeListener('released', this.requestState)
    socket.removeListener('state', this.receiveState)
    document.removeEvemtListener('keydown', this.presser)
    document.removeEvemtListener('keyup', this.keyup)
  }

  keyup = e => e.key==='Control' && this.setState({locks: {...this.state.locks, rel:'off'}})
  // TODO move this to dialogs. No need to listen all the time
  presser = e => {
    const { question } = this.state
    if(e.key==='Control') {
      const { rel } = this.state.locks
      if(rel !== 'on') {
        this.setState({locks: {...this.state.locks, rel:'on'}})
      }
    }
    if(question && question.message) {
      switch(e.key) {
        case 'Enter':
          console.log("Confirm")
          question.onOk()
          break;
        case 'Escape':
          console.log("Cancel")
          question.onCancel()
          break
        default:
          // no-op
      }
    }
  }

  init = msg => {
    const { profiles, setup, dmx } = msg
    const patched = {}
    for(let d in setup.heads) {
      const { address, type, id } = setup.heads[d]
      const profile = profiles[type]
      for(let c in profile.channels) {
        patched[address + 1*c] = {head: id, type: profile.channels[c]}
      }
      patched[address].start = ' from'
    }   
    this.setState({inited: true, patched, profiles, dmx, ...setup })
    console.log("Initialized.", this)
  }

  requestState = (item, cueName) => { 
      socket.emit('get', cueName)
  }

  receiveState = cue => {
    console.log("App got cue", cue)
    this.setState({cue})
  }

  receiveUpdate = u => {
    // console.time("receiveUpdate")
    const dmx = this.state.dmx
    for(var i in u) {
      dmx[i] = u[i]
    }
    this.setState({dmx})
    // console.timeEnd("receiveUpdate")
  }

  clearQuestion = () => this.setState({question: {}})

  receiveQuestion = (msg) => {
    const { text, onOk, onCancel } = msg
    const cancelHandler = onCancel 
      ? e => {
        socket.emit(onCancel.event, onCancel.params)
        this.clearQuestion()
      }
      : this.clearQuestion
    const question = {
      message: text,
      onCancel: cancelHandler,
      onOk: e => {
        socket.emit(onOk.event, onOk.params)
        this.clearQuestion()
      }
    }
    this.setState({question})
  } 

  receiveExec = (what, target) => {
    console.log("EXECUTED.", what, target)
  }
  execUpdate(u) {
    socket.emit('execute', u)
  }

  setRecStatus = status => {
    this.setState({rec: status, status})
  }
  // setCpuStatus = (which, status) => {
  //   const msg = `${which} ${status}`
  //   this.setState({cpu:{...this.state.cpu, [which]: status}, status: msg})
  // }

  renderHead = (r, c) => {
    const { active, heads } = this.state
    const d = heads && heads[r*8+c]
    if(d) {
      const a = active && active.head && active.head.id === d.id
      return a ? <b>{d.name}</b> : d.name
    } else {
      return null
    }
  }

  execHead = (r, c) => {
    const { heads } = this.state
    const head = heads[r*8+c]
    this.setState({active: {...this.state.active, head}})
  }

  execGroup = (r, c) => {
    const { groups } = this.state
    const group = groups[r*8+c]
    console.log("Activated group", group)
  }

  getOne = (channel) => {
    if (Array.isArray(channel)) {
      const val = this.state.dmx[channel[0]]
      var same = true
      for(var c of channel) {
        if(this.state.dmx[c] !== val) {
          same = false;
          break;
        }
      }
      return same ? val : '///'
    } else {
      return this.state.dmx[channel]
    }
  }

  lock = (what, check = ()=>true, e) => {
    if(check()) {
      const { locks } = this.state
      const last = locks && locks[what] === 'off'
      const on = last ? e.shiftKey ? 'locked' : 'on' : 'off'
      this.setState({locks: {...locks, [what]: on}})
        
    }
  }
  Lock = ({label, what, check, ...others}) => 
    <button 
      className={`lock ${what} ${this.state.locks[what]||''}`}
      onClick={this.lock.bind(this, what, check)}
      onFocus={e=>e.target.blur()}
    >
      {label || what}
    </button>

  toggle = what => {
    const { visible } = this.state
    const v = visible && visible[what]
    this.setState({visible: {...visible, [what]: !v}})
  }
  renderToggle = (label, what) =>
    <button 
      className={`toggle ${this.state.visible[what]}`} 
      onClick={this.toggle.bind(this, what)}
      onFocus={e=>e.target.blur()}
    >
      {label}
    </button>

  render() {
    const { active, connected, heads, locks, visible, profiles, patched } = this.state
    // console.log("\nCUE\n", this.state.cue)
    return (
      <div className={`App ${locks.rel}`} >
        <header>
          <span className={`title ${connected}`}>Ze Desk</span>
          {this.renderToggle('DMX', 'dmx')}
          {this.renderToggle('PGM', 'pgm')}

          <span>
            {this.renderToggle('CUES', 'cue')}
            {this.renderToggle('HEAD', 'head')}
            {this.renderToggle('GRP', 'grp')}
          </span>
          <BigClock />
        </header>
        <div id="locks">
          <this.Lock what='rel' check={()=>this.state.locks.rec==='off'}/>
          <this.Lock what='set' />
          <this.Lock what='rec' />
        </div>
        {visible.cue 
          && <CueGrid 
            cues={this.state.cues} 
            active={active} 
            socket={socket} 
            heads={heads} 
            patched={patched} 
            locks={locks}
            pgm={this.state.cue}
            />}
        {visible.pgm 
          && <ProgrammerView 
                cueId='pgm' 
                socket={socket} 
                locks={locks}
                heads={heads} 
                patched={patched}
              />}
        {visible.head 
          && <Grid key='heads' caption='Heads' renderItem={this.renderHead} exec={this.execHead} />}
        {visible.grp 
          && <GroupGrid key='groups' groups={this.state.groups} locks={locks} socket={socket} exec={this.execGroup} />}
        {active.head 
          && <ProfileControl 
            caption={active.head.name}
            profile={profiles[active.head.type]} 
            address={active.head.address}
            getDmx={this.getOne}
            exec={this.execUpdate}
            />
        }
        <div className='status'>
          <input value={this.state.status} disabled />
        </div>
        <Programmer />
        {visible.dmx && <UniverseOut patched={patched}/>}
        <footer>{`On Inferno ${version}`}</footer>
        <Question {...this.state.question} />
      </div>
    )
  }
}

export default App;
