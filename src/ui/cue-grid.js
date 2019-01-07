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

	cueListener = (cue, action, result) => console.log(action, " cue:", cue, "->", result)

	renderCue = (r, c) => {
		const { active, cues } = this.props
		const p = cues && cues[r*8+c]
		if (p) {
			const a = active && active.cue && active.cue.id === p.id
			return a ? <b>{p.label}</b> : p.label
		} else {
			return null
		}
	}

	execCue = (r, c, e) => {
		const { cpu, cues, socket } = this.props
		const { rec, set } = cpu
		const { altKey, ctrlKey/*, shiftKey*/ } = e
		const index = r*8+c
		const cue = cues[index]
		console.log("Exec'ing", cue, e)
		if(cue) {
			if(rec === 'started') {
				const nueCue = cpu.getPreset(cue)
				socket.emit('cue', nueCue, 'update')
				
			} else if(set === 'started') {
				console.log("setting.", cue.id)        
			} else {
				if(ctrlKey) {
					console.log("Releasing", cue)
					socket.emit('release', cue, 'programmer')
				} else if(altKey) {
					this.setState({cue})
				} else {
					console.log("Executing", cue)
					socket.emit('execute', cue, 'programmer')
				}
			}
		} else {
			if(altKey) {
				this.setState({cue})
			}
			if(rec === 'started') {
				const nueCue = cpu.getPreset({id: 'p'+index, label: 'p'+index})
				socket.emit('cue', nueCue, 'add')
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