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