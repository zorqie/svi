import { Component, Fragment } from 'inferno'

import Editable from './editable-hoc'

const save = (ch) => (par, val) => console.log(ch, '.', par, '=', val)

const CueValue = ({val, onSave}) => {
	if(typeof val === 'object') {
		return <Fragment>
			<Editable initialValue={val.to} onSave={onSave.bind(null, 'to')}/>
			<Editable initialValue={val.fade || ''} onSave={onSave.bind(null, 'fade')}/>
			<Editable initialValue={val.delay || ''} onSave={onSave.bind(null, 'delay')}/>
		</Fragment>
	} else {
		return <Fragment><Editable initialValue={val} onSave={onSave}/><td></td><td></td></Fragment>
	}
}

const CueHeader = ({heads, patched, ch}) => {
	const ph = patched && patched[ch]
	const h = ph && heads.find(e => e.id===ph.head) //TODO include head name in patched
	return <th><b>{h && h.name}</b> {ph && ph.type} <span>{ch}</span></th>
}

export default class CueView extends Component {

	render() {
		const { cue, caption, onClick=()=>{}, ...others } = this.props
		return (
			<table className="cue" >
				<caption>{caption || cue.label || cue.id}</caption>
				<thead>
					{cue.cues && Object.keys(cue.cues).map(i => 
						<tr>
							<td>{cue.cues[i].id}</td>
						</tr>
					)}
					<tr>
						<th>Head <span>Ch</span></th>
						<td>Val</td>
						<td>Fade</td>
						<td>Dlay</td>
					</tr>
				</thead>
				<tbody>
				{Object.keys(cue.values).map(v => 
					<tr key={v} onClick={onClick.bind(null, {[v]:cue.values[v]})}>
						<CueHeader {...others} ch={v} />
						<CueValue val={cue.values[v]} {...others} onSave={save(cue.values[v])}/>
					</tr>
				)}
				</tbody>
			</table>
		)
	}
}