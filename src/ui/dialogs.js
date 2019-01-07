import { Component } from 'inferno'

const Question = ({ message, okLabel= 'OK', cancelLabel= 'Cancel', onOk, onCancel }) =>
		(
			message && <div className={`dialog ${message ? 'visible' : 'hidden'}`}>
				<p>{message}</p>
				<div className="buttons">
					<button className="primary" onClick={onOk}>{okLabel}</button>
					<button onClick={onCancel}>{cancelLabel}</button>
				</div>
			</div>
		)

export { Question }