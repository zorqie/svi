import { Component } from 'inferno';
import io from 'socket.io-client'

const socket = io('http://localhost:8080')
const rows = [...Array(16).keys()]
const cols = [...Array(16).keys()]

export default class UniverseOut extends Component {
	constructor() {
		super()
		this.socket = socket
		this.state = {
			inited: false,
			patched: {},
			dmx: {}
		}
	}
	componentDidMount() {
		this.socket.on('init', this.init)
		this.socket.on('update', this.receiveUpdate)
		this.socket.emit('request_refresh')
	}
	componentWillUnmount() {
		this.socket.removeListener('init', this.init)
		this.socket.removeListener('update', this.receiveUpdate)
	}

	receiveUpdate = u => {
		// console.time("receiveUpdate")
		console.log("U", u)
		const dmx = this.state.dmx
		if(u.byteLength) {
			const v = new DataView(u)
		console.log("V", v)
			for(let i=0, l=v.byteLength; i < l; i++) {
				dmx[i+1] = v.getUint8(i)
			}
		} else {
			for(let i in u) {
				dmx[i] = u[i]
			}			
		}
		this.setState({inited: true, dmx})
		// console.timeEnd("receiveUpdate")
	}

	init = msg => {
		const { profiles, setup, dmx } = msg
		const patched = {}
		for(let d in setup.devices) {
			console.log("patching", d)
			const { address, type } = setup.devices[d]
			const profile = profiles[type]
			for(let c in profile.channels) {
				patched[address + 1*c] = profile.channels[c]
			}
			patched[address] += ' from'
		}		
		this.setState({inited: true, patched, profiles, dmx, ...setup })
		console.log("thus", this)
	}

	renderDmx = (i, j) => {
		const { dmx } = this.state
		return dmx ? dmx[1+i*16+j] : 0
	}

	render() {
		const { patched } = this.props
		return (
			<table className='dmx-grid' onSelectStart={e => e.preventDefault()}>
		        <tbody>
		          {rows.map(r => (
		            <tr>
		              <th>{1+r*16}</th>
		              {cols.map(c => (
		                <td className={patched && patched[1+r*16+c]}>{this.renderDmx(r,c)}</td>
		              ))}
		            </tr>
		          ) )}
		        </tbody>
        	</table>
		)
	}
}