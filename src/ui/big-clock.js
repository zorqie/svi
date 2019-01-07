import { Component } from 'inferno'

let ticker
function time(seconds=true) {
	const date = new Date()
	let h = date.getHours() // 0 - 23
	let m = date.getMinutes() // 0 - 59
	let session = "a"
	
	if(h === 0) {
		h = 12
	} else if(h > 12) {
		h = h - 12
		session = "p"
	}
	
	// h = (h < 10) ? "0" + h : h
	m = (m < 10) ? "0" + m : m
	var time = h + ":" + m 
	if(seconds) {
		let s = date.getSeconds() // 0 - 59
		s = (s < 10) ? "0" + s : s
		time += ":" + s 
	}
	
	return time + session
}

export default class BigClock extends Component {
	state = {seconds: true}

	componentDidMount() {
		ticker = setInterval(() => { this.forceUpdate() }, 1000)
	}

	componentWillUnmount() {
		if (ticker) {
			clearInterval(ticker) 
		}
	}
	
	toggleSeconds = () => this.setState({seconds: !this.state.seconds})

	render() {
		const { seconds } = this.state
		return (
			<span id="BigClock" onClick={this.toggleSeconds}>
				{time(seconds)}
			</span>
		)
	}
}