import { Component } from 'inferno'
import request from 'request'
// eslint-disable-next-line
import debounce from 'lodash.debounce'

//FIXME
// import io from 'socket.io-client'
// const socket = io('http://localhost:8080')

export default class Programmer extends Component {
	constructor() {
		super()
		this.state = {
			command: ''
		}
		// this.emitCommand = debounce(()=>socket.emit('cmd', this.state.command), 250)
	}

	handleChange = e => {
		const { value } = e.target
		this.setState({command: value})
		// this.emitCommand()
	}

	handleSubmit = e => {
		e.preventDefault()
		const { command } = this.state
		if(command === '') {
			return
		}
		request.post('http://localhost:8080/console', {form: { command }})
		this.setState({command: ''})
	}


	render() {
		const { command } = this.state

		return (
			<div id="programmer">
				<form onSubmit={this.handleSubmit} className='command'> 
					<input
						value={command}
						onInput={this.handleChange}
					/>
				</form>
			</div>
		)
	}
}