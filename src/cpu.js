import { EventEmitter } from 'events'

export default class CPU extends EventEmitter {
	channels = []
	rec = false
	clear = () => {
		this.channels = []
		this.emit('cpu', 'rec', 'canceled')
		this.emit('cleared')
	}
	include = what => {
		if(what) {
			if(what.values) {
				this.update(what.values)
			} else {
				this.channels = [...this.channels, what]
			}
			this.emit('included', what)
		}
	}
	update = u => {
		for(let ch in u) {
			if(this.channels.length) {
				let found = false
				for(let i in this.channels) {
					const  c = this.channels[i]
					if(c[ch]!==undefined) {
						this.channels[i] = {[ch]:u[ch]}
						found = true
						break;
					}
				}
				if(!found) {
					this.channels.push({[ch]:u[ch]})
				}
			} else {
				this.channels.push({[ch]:u[ch]})
			}
		}
	}
	get = () => this.channels
	getPreset = ({id, label}) => {
		const newPreset = {
          id,
          label,
          values: {}
        }
        for(let i=0; i<this.channels.length; i++) {
          newPreset.values = {...newPreset.values, ...this.channels[i]}
        }
        return newPreset
	}
	toggleRec = () => {
		if(this.rec === 'started') {
			this.rec = 'canceled'
			this.emit('cpu', 'rec', this.rec)
		} else {
			if(!this.isEmpty()) {
				this.rec = 'started'
				this.emit('cpu', 'rec', this.rec)
			}
		}
	}
	toggle = which => () => {
		console.log("Toggling", which, this[which])
		if(this[which] === 'started') {
			this[which] = 'canceled'
			this.emit('cpu', which, this[which])
		} else {
			this[which] = 'started'
			this.emit('cpu', which, this[which])
		}	
	}
	toggleSet = this.toggle('set')
	toggleMov = this.toggle('mov')

	endRec = (reason = 'complete') => {
		this.rec = reason
		this.emit('cpu', 'rec', reason)
	}
	isEmpty = () => this.channels && this.channels.length === 0
	isRecording = () => !this.isEmpty() && this.rec
}