import { Component } from 'inferno'

let tickTimer
function time() {
	const date = new Date()
	var h = date.getHours() // 0 - 23
	var m = date.getMinutes() // 0 - 59
	var s = date.getSeconds() // 0 - 59
	var session = "a"
	
	if(h === 0) {
		h = 12
	} else if(h > 12) {
		h = h - 12
		session = "p"
	}
	
	h = (h < 10) ? "0" + h : h
	m = (m < 10) ? "0" + m : m
	s = (s < 10) ? "0" + s : s
	
	var time = h + ":" + m + ":" + s + session
	return time
}

export default class BigClock extends Component {
	componentDidMount() {
		tickTimer = setInterval(() => { this.forceUpdate() }, 1000)
	}

	componentWillUnmount() {
		if (tickTimer) {
			clearInterval(tickTimer) 
		}
	}
	
	render() {
		return (
			<span id="BigClock">
				{time()}
			</span>
		)
	}
}