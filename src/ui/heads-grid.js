import { Component } from 'inferno'

import Grid from './grid'

export default class HeadsGrid extends Component {
	renderHead = activeIds => (r, c) => {
		const { heads } = this.props
		const d = heads && heads[r*8+c]
		
		if(d) {
			// const a = active && active.head && active.head.id === d.id
			const a = activeIds.includes(d.id)
			return <b className={a ? 'active':''}>{d.name}</b>
		} else {
			return null
		}
	}

	execHead = (r, c, e) => {
		const { heads, select } = this.props
		const head = heads[r*8+c]
		if(head) {
			e.preventDefault()
			const { shiftKey, ctrlKey, altKey } = e
			if(shiftKey) {
				select({add: head})
			} else if(ctrlKey) {
				select({remove: head})
			} else {
				select(head)
			}
		}
	}

	render() {
		const { active } = this.props
		const activeIds = active && active.heads && active.heads.map(h=>h.id) || []
		console.log("Active.heads:", activeIds)
		return (
			<Grid caption='Heads' renderItem={this.renderHead(activeIds)} exec={this.execHead} />
		)

	}
}