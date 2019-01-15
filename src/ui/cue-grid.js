import { Component } from 'inferno'

import CueTable from './cue-table'
import Grid from './grid'

export default class CueGrid extends Component {
	state = { cue: null }
	componentDidMount() {
		const { socket } = this.props
		socket.on('cue', this.cueListener)
	}

	componentWillUnmount() {
		const { socket } = this.props
		socket.removeListener('cue', this.cueListener)
	}

	cueListener = (cue, action, result) => {
		console.log(action, " cue:", cue, "->", result)
		const { socket } = this.props
		socket.emit('request_update')
	}

	renderCue = (r, c) => {
		const { cues, pgm } = this.props
		const p = cues && cues[r*8+c]
		if (p) {
			// const a = active && active.cue && active.cue.id === p.id
			const label = p.label || p.id
			const a = pgm && pgm.cues[p.id] !== undefined
			return a ? <b>{label}</b> : label
		} else {
			return null
		}
	}

	execCue = (r, c, e) => {
		const { cues, socket, locks } = this.props
		const { altKey, ctrlKey/*, shiftKey*/ } = e
		const index = r*8+c
		const cue = cues[index]
		console.log("Exec?", cue, locks)
		if(cue) {
			if(locks && locks.rec !== 'off') {
				// const nueCue = cpu.getPreset(cue)
				console.log("Updating", )
				socket.emit('cue', cue, 'update')
				
			} else {
				if(ctrlKey || (locks && locks.rel !== 'off') ) {
					console.log("Releasing", cue)
					socket.emit('release', cue, 'pgm')
				} else if(altKey) {
					this.setState({cue})
				} else {
					console.log("Executing", cue)
					socket.emit('execute', cue, 'pgm')
				}
			}
		} else {
			if(altKey) {
				this.setState({cue})
			}
			if(locks && locks.rec !== 'off') {
				// const nueCue = cpu.getPreset({id: 'p'+index, label: 'p'+index})
				console.log("Saving", {r, c})
				socket.emit('cue', {cue: 'pgm', r, c}, 'add')
			}
		}
	}

	render() {
		const { cue } = this.state
		const { heads, patched } = this.props
		return (
			<div>
				<Grid caption="Cues" renderItem={this.renderCue} exec={this.execCue} />
				{cue && <CueTable cue={cue} heads={heads} patched={patched} />}
			</div>
		)
	}
}