import { Component } from 'inferno'

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
		const { label, value, inc, dec, exec } = this.props
		return (
			<div className="slider">
				<span>{label}</span>
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