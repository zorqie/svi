import { version, Component } from 'inferno';
import './App.css';

import io from 'socket.io-client'

import BigClock from './ui/big-clock'
import ChannelSlider from './ui/channel-slider'
import CommandLine from './ui/command-line'
import Grid from './ui/grid'
import Programmer from './ui/programmer'
import ProfileControl from './ui/profile-control'
import UniverseOut from './ui/universe-out'

// import CPU from './cpu'

const socket = io('http://localhost:8080')

const dmx = val => val > 255 ? 255 : val < 0 ? 0 : val

// const cpu = new CPU()

class App extends Component {
  constructor() {
    super()
    this.state = {
      inited: false,
      dmx: {},
      active: {},
      visible: {},
      // cpu: cpu,
    }
    // cpu.on('cleared', () => this.setState({cleared: true}))
    // cpu.on('rec', status => this.setState({rec: status}))
  }
  componentDidMount() {
    socket.on('init', this.init)
    socket.on('update', this.receiveUpdate)
  }
  componentWillUnmount() {
    socket.removeListener('init', this.init)
    socket.removeListener('update', this.receiveUpdate)
  }
  init = msg => {
    const { profiles, setup, dmx } = msg
    const patched = {}
    for(let d in setup.devices) {
      const { address, type } = setup.devices[d]
      const profile = profiles[type]
      for(let c in profile.channels) {
        patched[address + 1*c] = profile.channels[c]
      }
      patched[address] += ' from'
    }   
    this.setState({inited: true, patched, profiles, dmx, ...setup })
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

  renderPreset = (r, c) => {
    const { presets } = this.state
    return presets && presets[r*8+c] ? presets[r*8+c].label : null
  }

  execPreset = (r, c) => {
    const { presets, rec } = this.state
    const preset = presets[r*8+c]
    if(rec === 'started') {
      if(preset) {
      } else {
        const newPreset = {
          id: r*8+c,
          label: r*8+c,
          // values: cpu.get()
        }
        console.log("Pre-set", newPreset)
        presets[r*8+c] = newPreset
        // cpu.endRec()
        // this.setState({presets})
      }
    } else {
      if(preset) {
        // cpu.include(preset)
        requestAnimationFrame(() => socket.emit('update', preset.values))
      }
    }
  }

  renderHead = (r, c) => {
    const { active, devices } = this.state
    const d = devices && devices[r*8+c]
    if(d) {
      const a = active && active.head && active.head.id === d.id
      return d && a ? <b>{d.name}</b> : d.name
    } else {
      return null
    }
  }

  execHead = (r, c) => {
    const { devices } = this.state
    const head = devices[r*8+c]
    if(head) {
      this.setState({active: {...this.state.active, head}})
    }
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
      socket.emit('update', u)
    } else {
      const oldVal = 1*this.state.dmx[channel] || 0
      var newVal = dmx(oldVal + d * delta)
      if(oldVal !== newVal) {
        const u = {}
        u[channel] = newVal
        // cpu.update(u)
        socket.emit('update', u)
      }
    } 
  }
  stepper = channel => {
    if (Array.isArray(channel)) {
    } else {
      const oldVal = 1*this.state.dmx[channel] || 0
      const newVal = oldVal < 255 ? oldVal < 127 ? 127 : 255 : 0
      // cpu.update({[channel]: newVal})
      socket.emit('update', {[channel]: newVal})
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

  toggleDMX = () => {
    const { visible } = this.state
    this.setState({visible: {...visible, dmx: !visible.dmx}})
  }

  toggle = what => {
    const { visible } = this.state
    const v = visible && visible[what]
    this.setState({visible: {...visible, [what]: !v}})
  }
  renderToggle = (label, what) =>
    <button 
      className={`toggle ${this.state.visible[what]}`} 
      onClick={this.toggle.bind(this, what)}>
      {label}
    </button>

  render() {
    const { active, visible, profiles, patched } = this.state
    console.log("Presets", this.state.presets)
    return (
      <div className="App" >
        <header>
          <span className="title">Ze Desk</span>
          {this.renderToggle('DMX', 'dmx')}
          <BigClock />
        </header>
        {/*
        <Programmer cpu={cpu} rec={rec}/>
      */}
        <Grid key='presets' caption='Presets' renderItem={this.renderPreset} exec={this.execPreset} />
        <Grid key='heads' caption='Heads' renderItem={this.renderHead} exec={this.execHead} />
        <CommandLine />
        {/*this.renderSlider(active.head && active.head.address, "Dimmer")*/}
        {visible.dmx && <UniverseOut patched={patched}/>}
        {active.head 
          && <ProfileControl 
            profile={profiles[active.head.type]} 
            address={active.head.address}
            renderChannel={this.renderSlider}
            />
        }
        <footer>{`On Inferno ${version}`}</footer>
      </div>
    );
  }
}

export default App;
