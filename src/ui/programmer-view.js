import { Component } from 'inferno'

import CueTable from './cue-table'

export default class ProgrammerView extends Component {
	state = {cue: null}
	componentDidMount() {
		const { cueId, socket } = this.props
		socket.on('state', this.receive)
		// socket.on('released', this.requestState)
		// socket.on('executed', this.requestState)
		socket.emit('get', cueId)
	}


	componentWillUnmount() {
		const { socket } = this.props
		socket.removeListener('state', this.receive)
		// socket.removeListener('released', this.requestState)
		// socket.removeListener('executed', this.requestState)
	}

	requestState = (item, cue) => { 
		const { cueId, socket } = this.props
		console.log('probably executed', item, 'on', cue)
		if (cue === cueId) {
			socket.emit('get', cueId)
		}
	}

	receive = cue => {
		// console.log("Got state", cue)
		this.setState({cue})
	}

	handleClick = (what, e) => {
		const { cueId, socket, locks } = this.props
		if(locks.rel!=='off') {
			socket.emit('release', what, cueId)
		}
		console.log("Clacked", what, e)
	}

	render() {
		const { socket, ...others } = this.props
		const { cue } = this.state
		return (
			cue && <CueTable caption="Programmer" cue={cue} {...others} onClick={this.handleClick}/>
		)
	}
}