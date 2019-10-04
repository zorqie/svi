import { Component } from 'inferno'

import ChannelSlider from './channel-slider'
/*
const groups = {
	intensity: 'dimmer',
	beams:  'strobe|zoom|focus|iris|gobo',
	colors: 'color|red|green|blue|white|amber|uv|cto|cyan|magenta|yellow',
	positions: 'pan|tilt|x|y'
} 

const group = channels => {
	const g = {}
	channels.forEach(
		(ch, c) => {
			let found = false
			for(let i in groups) {
				if(groups[i].includes(ch)) {
					g[i] = {...g[i], [ch]: c}
					found = true
					break;
				}
			}
			if(!found) {
				g['misc'] = {...g['misc'], [ch]: c}
			}
		}
	)
	return g
}
*/

const dmx = val => val > 255 ? 255 : val < 0 ? 0 : val

export default class GroupControl extends Component {
	state = {
		visible: {}
	}
	inc(channel, delta, e) {
		const { getDmx, exec } = this.props
		const d = e && e.shiftKey ? 10 : 1
		if (Array.isArray(channel)) {
			const u = {}
			for(var c=0; c < channel.length; c++) {
				const oldVal = getDmx(channel[c]) || 0
				const newVal = dmx(oldVal + d * delta)
				if(oldVal !== newVal) {
					u[channel[c]] = newVal
				}
			}
			// socket.emit('update', u)
			exec(u)
		} else {
			const oldVal = getDmx(channel) || 0
			var newVal = dmx(oldVal + d * delta)
			if(oldVal !== newVal) {
				const u = {}
				u[channel] = newVal
				// socket.emit('update', u)
				exec(u)
			}
		} 
	}
	stepper(channel) {
		const { getDmx, exec } = this.props
		if (Array.isArray(channel)) {
		} else {
			const oldVal = getDmx(channel) || 0
			const newVal = oldVal < 255 ? oldVal < 127 ? 127 : 255 : 0
			// cpu.update({[channel]: newVal})
			// socket.emit('update', {[channel]: newVal})
			exec({[channel]: newVal})
		}
	}

//TODO extract toggle to own class
	toggle = what => {
		const { visible } = this.state
		const v = visible && visible[what]
		this.setState({visible: {...visible, [what]: !v}})
	}
	renderToggle = (what, label) =>
		<button 
			className={`toggle ${this.state.visible[what]}`} 
			onClick={this.toggle.bind(this, what)}
			onFocus={e=>e.target.blur()}
		>
	    	{label || what.toUpperCase()}
    	</button>

	render() {
		const { caption, profiles, selected, address, getDmx } = this.props
		const profile = 
		return (
			<div className="profile">
				<div>{caption} <span>{this.renderToggle('all')}</span></div>
				
				{profile.channels.map((ch, i) => 
					<ChannelSlider 
						key={address+i}
						label={ch}
						ranges={profile.ranges[ch]}
						value={getDmx(address+i) || 0} 
						inc={this.inc.bind(this, address+i, 1)} 
						dec={this.inc.bind(this, address+i, -1)}
						exec={this.stepper.bind(this, address+i)}
					/>
				)}
			</div>
		)
	}
}