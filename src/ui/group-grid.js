import { Component } from 'inferno'

import Grid from './grid'

export default class CueGrid extends Component {
	state = { group: null }
	componentDidMount() {
		// const { socket } = this.props
	}

	componentWillUnmount() {
		// const { socket } = this.props
	}

	renderGroup = (r, c) => {
		const { groups, pgm } = this.props
		const p = groups && groups[r*8+c]
		if (p) {
			// const a = active && active.group && active.group.id === p.id
			const label = p.label || p.id
			const a = pgm && pgm.groups[p.id] !== undefined
			return a ? <b>{label}</b> : label
		} else {
			return null
		}
	}

	execGroup = (r, c, e) => {
		const { groups, /*socket,*/ locks, exec } = this.props
		const { altKey, ctrlKey/*, shiftKey*/ } = e
		const index = r*8+c
		const group = groups[index]
		console.log("Exec?", group, locks)
		if(group) {
			if(locks && locks.rec !== 'off') {
				// const nueGroup = cpu.getPreset(group)
				console.log("Updating", )
				// socket.emit('group', group, 'update')
				
			} else {
				if(ctrlKey || (locks && locks.rel !== 'off') ) {
					console.log("Releasing", group)
					// socket.emit('release', group, 'pgm')
				} else if(altKey) {
					this.setState({group})
				} else {
					console.log("Executing", group, exec)
					// socket.emit('execute', group, 'pgm')
				}
			}
		} else {
			if(altKey) {
				this.setState({group})
			}
			if(locks && locks.rec !== 'off') {
				// const nueGroup = cpu.getPreset({id: 'p'+index, label: 'p'+index})
				console.log("Saving", {r, c})
				// socket.emit('group', {group: 'pgm', r, c}, 'add')
			}
		}
	}

	render() {
		const { rows = 6, cols = 6 } = this.props
		return (
			<div>
				<Grid caption="Groups" rows={rows} cols={cols} renderItem={this.renderGroup} exec={this.execGroup} />
			</div>
		)
	}
}