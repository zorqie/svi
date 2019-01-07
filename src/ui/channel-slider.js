import { Component } from 'inferno'

const option = (ranges, value) => {
	if(ranges && ranges.options) {
		for(let o in ranges.options) {
			const op = ranges.options[o]
			if(op.min !== undefined && value >= op.min && op.max && value <= op.max) {
				return op.label
			}
		}
	}
}

export default class ChannelSlider extends Component {	
	handleWheel = e => {
		e.preventDefault()
		// console.log("W", e.deltaX, e.deltaY, e.deltaZ)
		const { inc, dec } = this.props
		if(e.deltaY < 0) 
			inc(e)
		else 
			dec(e)
	}
	render() {
		const { label, value, ranges, inc, dec, exec } = this.props
		// console.log("Ranging", ranges)
		return (
			<div className="slider">
				<span>{label}</span>
				<label>{option(ranges, value)}</label>
				<button onMouseDown={dec} className="dec">&nbsp;</button>
				<button 
					onMouseWheel={this.handleWheel} 
					onWheel={this.handleWheel} 
					onClick={exec}
					style={{width: '4em', textAlign: 'right'}}
				>
					{value}
				</button>
				<button onMouseDown={inc} className="inc">&nbsp;</button>
			</div>
		)
	}

}