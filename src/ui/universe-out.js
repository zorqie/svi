import { Component } from 'inferno';
import io from 'socket.io-client'

const socket = io('http://localhost:8080')
const rows = [...Array(32).keys()]
const cols = [...Array(16).keys()]

export default class UniverseOut extends Component {
	constructor() {
		super()
		this.socket = socket
		this.state = {
			inited: false,
			dmx: {}
		}
	}
	componentDidMount() {
		this.socket.on('update', this.receiveUpdate)
		this.socket.emit('request_refresh')
	}
	componentWillUnmount() {
		this.socket.removeListener('update', this.receiveUpdate)
	}

	receiveUpdate = u => {
		// console.log("U", u)
		const dmx = this.state.dmx
		if(u.byteLength) {
			// console.time("updateArray")
			const v = new DataView(u)
			console.log("V", v)
			for(let i=0, l=v.byteLength; i < l; i++) {
				dmx[i+1] = v.getUint8(i)
			}
			// console.timeEnd("updateArray")
		} else {
			// console.time("updateObject")
			for(let i in u) {
				dmx[i] = u[i]
			}			
			// console.timeEnd("updateObject")
		}
		this.setState({dmx})
		// console.timeEnd("receiveUpdate")
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
		                <td className={patched && patched[1+r*16+c] && patched[1+r*16+c].type}>{this.renderDmx(r,c)}</td>
		              ))}
		              <th>{(1+r)*16}</th>
		            </tr>
		          ) )}
		        </tbody>
        	</table>
		)
	}
}