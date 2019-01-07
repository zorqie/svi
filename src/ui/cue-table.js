import { Component, Fragment } from 'inferno'

const CueValue = ({val}) => {
	if(typeof val === 'object') {
		return <Fragment>
			<td>{val.to}</td>
			<td>{val.fade || ''}</td>
			<td>{val.delay || ''}</td>
		</Fragment>
	} else {
		return <Fragment><td>{val}</td><td></td><td></td></Fragment>
	}
}

const CueHeader = ({heads, patched, ch}) => {
	const ph = patched && patched[ch]
	const h = ph && heads.find(e => e.id===ph.head) //TODO include head name in patched
	return <th><b>{h && h.name}</b> {ph && ph.type} <span>{ch}</span></th>
}

export default class CueView extends Component {
	componentDidMount() {
		console.log("Monty")
	}

	componentWillUnmount() {
		console.log("Dismonty")
	}

	render() {
		const { cue, ...others } = this.props
		console.log("CUE>", cue)
		return (
			<table className="cue">
				<caption>Cue <b>{cue.label || cue.id}</b></caption>
				<thead>
					<tr>
						<th>Head <span>Ch</span></th>
						<td>Val</td>
						<td>Fade</td>
						<td>Dlay</td>
					</tr>
				</thead>
				<tbody>
				{Object.keys(cue.values).map(v => 
					<tr key={v}>
						<CueHeader {...others} ch={v} />
						<CueValue val={cue.values[v]} />
					</tr>
				)}
				</tbody>
			</table>
		)
	}
}