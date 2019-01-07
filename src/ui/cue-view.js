import { Component, Fragment } from 'inferno'

const CueValue = ({val}) => {
	if(typeof val === 'object') {
		return <dd>
			<b>{val.to}</b>
			<b>fade: {val.fade}</b>
			<b>{val.delay ? 'delay: ' + val.delay : ' '}</b>
		</dd>
	} else {
		return <dd><b>{val}</b></dd>
	}
}

const CueHeader = ({heads, patched, ch}) => {
	const ph = patched && patched[ch]
	const h = ph && heads.find(e => e.id===ph.head) //TODO include head name in patched
	// if(h) {
		return <dt>{h && h.name} {ph && ph.type} <span>{ch}</span></dt>
	// } else {
		// return <dt><span>{ch}</span></dt>
	// }
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
			<div className="cue">
				<h3>Cue {cue.label || cue.id}</h3>
				<dl className="cue">
				{Object.keys(cue.values).map(v => 
					<Fragment key={v}>
						<CueHeader {...others} ch={v} />
						<CueValue val={cue.values[v]} />
					</Fragment>
				)}
				</dl>
			</div>
		)
	}
}