import { Component } from 'inferno'

import CueView from './cue-view'

export default class ProgrammerView extends Component {
	state = {cue: null}
	componentDidMount() {
		const { cueId, socket } = this.props
		socket.on('state', this.receive)
		socket.emit('get', cueId)
		console.log("Monty", cueId)
	}

	componentWillUnmount() {
		const { socket } = this.props
		socket.removeListener('state', this.receive)
		console.log("Dismonty")
	}

	receive = cue => {
		console.log("Got state", cue)
		this.setState({cue})
	}

	render() {
		const { socket, ...others } = this.props
		const { cue } = this.state
		return (
			cue && <CueView cue={cue} {...others} />
		)
	}
}