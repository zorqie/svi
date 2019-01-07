import { Component } from 'inferno'
import request from 'request'

export default class Programmer extends Component {
	constructor() {
		super()
		this.state = {
			command: ''
		}
	}

	handleChange = e => {
		const { value } = e.target
		this.setState({command: value})
	}

	handleSubmit = e => {
		e.preventDefault()
		const { command } = this.state
		const { cpu, set, rec } = this.props
		if(set === 'started') {
			cpu.emit('cpu', 'command', command)
		} else {
			request.post('http://localhost:8080/console', {form: { command }})
		}
		this.setState({command: ''})
	}

	handleSet = e => {
		e.preventDefault()
		this.props.cpu.toggleSet(this.state.command)
	}

	render() {
		const { cpu, rec, set } = this.props
		const { command } = this.state
		const empty = cpu && cpu.isEmpty() 
		// const rec = cpu && cpu.isRecording()

		// console.log("Rec: ", rec)
		return (
			<div id="programmer">
{/*
				<button id="include">Inc</button>
				<button id="update">Upd</button>
*/}
				<form onSubmit={this.handleSubmit} className='command'> 
					<input
						value={command}
						onInput={this.handleChange}
					/>
				</form>
				<button id="rec" onClick={cpu.toggleRec} className={rec}>Rec</button>
				<button id="clear" onClick={cpu.clear} className={!empty}>
					Clear
				</button>
				<button id="set" onClick={this.handleSet} className={set}>Name</button>
			</div>
		)
	}
}