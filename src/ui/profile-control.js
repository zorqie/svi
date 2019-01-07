import { Component } from 'inferno'

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
export default class ProfileControl extends Component {
	render() {
		const { profile, address, renderChannel } = this.props
		return profile && (
			<div className="profile">
				{profile.channels.map((ch, i) => renderChannel(address+i, ch))}
			</div>
		)
	}
}