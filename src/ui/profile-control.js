import { Component } from 'inferno'

export default class ProfileControl extends Component {
	render() {
		const { profile, address, renderChannel } = this.props
		return profile && (
			<div className="profile">
				{profile.channels.map((ch, i) => renderChannel(address+i, ch))}
			</div>
		)
	}
}