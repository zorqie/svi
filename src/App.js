import { version, Component } from 'inferno';
import './App.css';

import io from 'socket.io-client'

import BigClock from './ui/big-clock'
import ChannelSlider from './ui/channel-slider'
// import CommandLine from './ui/command-line'
import CueGrid from './ui/cue-grid'
import CueView from './ui/cue-view'
import Grid from './ui/grid'
import Programmer from './ui/programmer'
import ProgrammerView from './ui/programmer-view'
import ProfileControl from './ui/profile-control'
import { Question } from './ui/dialogs'
import UniverseOut from './ui/universe-out'

import CPU from './cpu'

const socket = io('http://localhost:8080')

const dmx = val => val > 255 ? 255 : val < 0 ? 0 : val

const cpu = new CPU() // BAAD

class App extends Component {
  constructor() {
    super()
    this.state = {
      inited: false,
      dmx: {},
      active: {},
      visible: {},
      cpu: {},
      status: '',
    }
    cpu.on('cleared', () => this.setState({cleared: true, status: ''}))
    cpu.on('cpu', this.setCpuStatus)
  }

  componentDidMount() {
    socket.on('init', this.init)
    socket.on('update', this.receiveUpdate)
    socket.on('disconnect', () => this.setState({connected: false}))
    socket.on('connect', () => this.setState({connected: true}))
    socket.on('question', this.receiveQuestion)
    socket.on('executed', this.receiveExec)
    socket.on('warn', (message, what) => {
      console.log("WARN", message, what)
      this.setState({status: message})
    })
  }

  componentWillUnmount() {
    socket.removeListener('init', this.init)
    socket.removeListener('update', this.receiveUpdate)
    socket.removeListener('question', this.receiveQuestion)
    socket.removeListener('executed', this.receiveExec)
  }

  init = msg => {
    const { profiles, programCue, blindCue, setup, dmx } = msg
    const patched = {}
    for(let d in setup.heads) {
      const { address, type, id } = setup.heads[d]
      const profile = profiles[type]
      for(let c in profile.channels) {
        patched[address + 1*c] = {head: id, type: profile.channels[c]}
      }
      patched[address].start = ' from'
    }   
    this.setState({inited: true, patched, profiles, dmx, programCue, blindCue, ...setup })
    console.log("Initialized.", this)
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

  setRecStatus = status => {
    this.setState({rec: status, status})
  }
  setCpuStatus = (which, status) => {
    const msg = `${which} ${status}`
    this.setState({cpu:{...this.state.cpu, [which]: status}, status: msg})
  }

  renderCue = (r, c) => {
    const { active, cues } = this.state
    const p = cues && cues[r*8+c]
    if(p) {
      const a = active && active.cue && active.cue.id === p.id
      return a ? <b>{p.label}</b> : p.label
    } else {
      return null
    }
  }

  execCue = (r, c) => {
    const { cues } = this.state
    const { rec, set } = this.state.cpu
    const index = r*8+c
    const cue = cues[index]
    if(cue) {
      if(rec === 'started') {
        const nueCue = cpu.getPreset(cue)
        const question = {
          message: `Overwrite cue '${cue.label}'`,
          onCancel: e => { this.setState({question: {}})},
          onOk: e => {
            socket.emit('cue', nueCue, 'update')
            cpu.endRec('successful. Updated cue ' + cue.label)
            this.setState({question: {}})
          }
        }
        this.setState({question})
      } else if(set === 'started') {
        console.log("setting.", cue.id)        
      } else {
        console.log("Executing", cue)
        cpu.include(cue)
        this.setState({active: {...this.state.active, cue}})
        requestAnimationFrame(() => socket.emit('update', cue.values))
      }
    } else {
      if(rec === 'started') {
        const nueCue = cpu.getPreset({id: 'p'+index, label: 'p'+index})
        cues[index] = nueCue
        socket.emit('cue', nueCue, 'add')
        cpu.endRec('successful. Created cue ' + nueCue.label)
        // requestAnimationFrame(() => this.setState({cues}))
      }
    }
    
  }

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


  getOne(channel) {
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

  inc(channel, delta, e) {
    const d = e && e.shiftKey ? 10 : 1
    if (Array.isArray(channel)) {
      const u = {}
      for(var c=0; c < channel.length; c++) {
        const oldVal = 1*this.state.dmx[channel[c]] || 0
        const newVal = dmx(oldVal + d * delta)
        if(oldVal !== newVal) {
          u[channel[c]] = newVal
        }
      }
      // cpu.update(u)
      // socket.emit('update', u)
      socket.emit('exec', u)
    } else {
      const oldVal = 1*this.state.dmx[channel] || 0
      var newVal = dmx(oldVal + d * delta)
      if(oldVal !== newVal) {
        const u = {}
        u[channel] = newVal
        // cpu.update(u)
        // socket.emit('update', u)
        socket.emit('exec', u)
      }
    } 
  }
  stepper = channel => {
    if (Array.isArray(channel)) {
    } else {
      const oldVal = 1*this.state.dmx[channel] || 0
      const newVal = oldVal < 255 ? oldVal < 127 ? 127 : 255 : 0
      // cpu.update({[channel]: newVal})
      // socket.emit('update', {[channel]: newVal})
      socket.emit('exec', {[channel]: newVal})
    }
  }

  renderSlider = (channel, label) => <ChannelSlider 
    key={channel}
    label={label}
    value={this.getOne(channel) || 0} 
    inc={this.inc.bind(this, channel, 1)} 
    dec={this.inc.bind(this, channel, -1)}
    exec={this.stepper.bind(this, channel)}
  />

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
    const { active, connected, heads, question, visible, profiles, patched } = this.state
    // console.log("Active", active)
    return (
      <div className="App" >
        <header>
          <span className={`title ${connected}`}>Ze Desk</span>
          {this.renderToggle('DMX', 'dmx')}
          {this.renderToggle('PGM', 'pgm')}

          <span>
            &nbsp;Grid:
            {this.renderToggle('CUES', 'cue')}
            {this.renderToggle('PRES', 'pre')} 
            {this.renderToggle('HEAD', 'grp')}
          </span>
          <BigClock />
        </header>
        {visible.cue && <CueGrid cues={this.state.cues} active={active} cpu={cpu} socket={socket} heads={heads} patched={patched} />}
        {/*visible.pgm && <CueView cue={this.state.programCue} heads={this.state.heads} patched={patched} />*/}
        {visible.pgm && <ProgrammerView cueId='programCue' socket={socket} heads={heads} patched={patched} />}
        {visible.pre && <Grid key='presets' caption='Presets' renderItem={this.renderCue} exec={this.execCue}/>}
        {visible.grp && <Grid key='heads' caption='Heads' renderItem={this.renderHead} exec={this.execHead} />}
        <div className='status'>
          <input value={this.state.status} disabled />
        </div>
        <Programmer cpu={cpu} {...this.state.cpu}/>
        {active.head 
          && <ProfileControl 
            profile={profiles[active.head.type]} 
            address={active.head.address}
            renderChannel={this.renderSlider}
            />
        }
        {visible.dmx && <UniverseOut patched={patched}/>}
        <footer>{`On Inferno ${version}`}</footer>
        <Question {...question} />
      </div>
    )
  }
}

export default App;
