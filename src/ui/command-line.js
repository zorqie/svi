import { Component } from 'inferno';
import request from 'request'
import debounce from 'lodash.debounce'

//FIXME
import io from 'socket.io-client'
const socket = io('http://localhost:8080')

export default class CommandInput extends Component {
	constructor() {
		super()
		this.state = {
			command: ''
		}
		this.emitCommand = debounce(()=>socket.emit('cmd', this.state.command), 250)
	}
	handleChange = e => {
		const { value } = e.target
		this.setState({command: value})
		this.emitCommand()
	}
	handleSubmit = e => {
		e.preventDefault()
		const { command } = this.state
		request.post('http://localhost:8080/console', {form: { command }})
		this.setState({command: ''})
	}
	render() {
		const { command } = this.state
		return (
			<form onSubmit={this.handleSubmit} className='command'> 
				<input
					value={command}
					onInput={this.handleChange}
				/>
			</form>
		)
	}
}