import { Component } from 'inferno';
import request from 'request'

export default class CommandInput extends Component {
	constructor() {
		super()
		this.state = {
			command: ''
		}
	}
	handleChange = e => {
		console.log("E", e)
		const { value } = e.target
		this.setState({command: value})
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